# Backend/routers/vrp.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import datetime
import json
import math
import os
import uuid
import logging

from database import SessionLocal
import models
import schemas
from services import vrp_service 
from services import map_service
from dependencies import get_db, get_settings, get_current_user, require_role
from services import traffic_validator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["VRP & Route Planning"])

VRP_JOBS = {}

# ==========================================
# 1. BARISTA NYEDUH KOPI (FUNGSI BACKGROUND VRP UTAMA)
# ==========================================
def run_vrp_optimization_task(job_id: str, preview: bool):
    """Heavy lifting jalan di Pipeline VRP GLOBAL murni!"""
    db = SessionLocal() 
    try:
        VRP_JOBS[job_id]["phase"] = "zoning"
        VRP_JOBS[job_id]["progress"] = 20
        
        settings = get_settings()
        pending_orders = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.status == models.DOStatus.do_verified).all()
        if not pending_orders: raise Exception("Tidak ada Delivery Order terverifikasi!")

        vehicles = db.query(models.FleetVehicle).filter(models.FleetVehicle.status == "Available").all()
        if not vehicles: raise Exception("Armada tidak tersedia!")

        # 🌟 KABEL BARU 1: Siapin bahan baku buat VRP Global
        vrp_input = vrp_service.VRPService.prepare_vrp_data(pending_orders, vehicles, settings)
        
        # OSRM butuh list of dict, jadi kita konversi format koordinatnya
        locs = [{"lat": lat, "lon": lon} for lat, lon in vrp_input["coordinates"]]
        dist_mat, time_mat = map_service.build_osrm_matrix(locs)
        if not dist_mat:
            dist_mat, time_mat = map_service.build_haversine_matrix(locs)

        # 🌟 KABEL BARU 2: Panggil Otak AI VRP Global
        hasil = vrp_service.VRPService.solve_and_format(vrp_input, dist_mat, time_mat, settings)

        formatted_routes = []
        spillover = []

        if hasil:
            from utils.helpers import menit_ke_jam
            
            # Jahit hasil rute mentah AI jadi format cakep buat Frontend & DB
            for route in hasil["routes"]:
                truck_idx = route["truck_index"]
                assigned_vehicle = vehicles[truck_idx]
                node_seq = route["node_sequence"]

                manifest = []
                current_time = 420 # 07:00 Pagi keberangkatan dari depo
                prev_node = 0
                total_jarak_m = 0
                total_berat = 0

                for step, node_idx in enumerate(node_seq):
                    seg_m = dist_mat[prev_node][node_idx] if step != 0 else 0
                    seg_km = round(seg_m / 1000.0, 1)

                    if node_idx == 0:
                        if step != 0: current_time += time_mat[prev_node][node_idx]
                        manifest.append({
                            "urutan": step, "lokasi": "📍 GUDANG JAPFA",
                            "jam": str(menit_ke_jam(current_time)),
                            "keterangan": "Start" if step == 0 else "Finish",
                            "lat": settings.depo_lat, "lon": settings.depo_lon,
                            "distance_from_prev_km": seg_km
                        })
                    else:
                        order_id = vrp_input["order_mapping"][node_idx]
                        order = next(o for o in pending_orders if o.order_id == order_id)

                        is_mall = vrp_input["is_mall_list"][node_idx]
                        base_time = 60 if is_mall else 15
                        var_time = (float(order.weight_total) / 10.0) * 1.0
                        service_time = base_time + var_time

                        current_time += time_mat[prev_node][node_idx]

                        store_name = order.customer.store_name if hasattr(order, 'customer') and order.customer else (order.customer_name if hasattr(order, 'customer_name') else "Toko")

                        manifest.append({
                            "urutan": step,
                            "nomor_do": order.order_id,
                            "nama_toko": store_name,
                            "turun_barang_kg": round(float(order.weight_total), 2),
                            "jam_tiba": str(menit_ke_jam(current_time)),
                            "lat": float(order.latitude), "lon": float(order.longitude),
                            "distance_from_prev_km": seg_km
                        })

                        current_time += service_time
                        total_berat += float(order.weight_total)

                    total_jarak_m += seg_m
                    prev_node = node_idx

                route_geometry = map_service.get_road_geometry(node_seq, locs)

                formatted_routes.append({
                    "route_id": f"RP-{datetime.datetime.now().strftime('%Y%m%d')}-T{truck_idx+1}",
                    "color_index": truck_idx,
                    "armada": assigned_vehicle.license_plate,
                    "driver_id": assigned_vehicle.default_driver_id,
                    "helper_id": assigned_vehicle.co_driver_id,
                    "total_muatan_kg": total_berat,
                    "total_jarak_km": round(total_jarak_m / 1000.0, 1),
                    "detail_perjalanan": manifest,
                    "garis_aspal": route_geometry
                })

            # Format dropped nodes buat masuk ke Keranjang Merah
            for dropped_id in hasil["dropped_node_ids"]:
                order = next(o for o in pending_orders if o.order_id == dropped_id)
                store_name = order.customer.store_name if hasattr(order, 'customer') and order.customer else (order.customer_name if hasattr(order, 'customer_name') else "Toko")
                spillover.append({
                    "nama_toko": store_name,
                    "berat_kg": float(order.weight_total),
                    "alasan": "Drop VRP Global (Kapasitas Maksimal / Waktu Lembur Habis)",
                    "lat": float(order.latitude),
                    "lon": float(order.longitude)
                })

        VRP_JOBS[job_id]["phase"] = "done"
        VRP_JOBS[job_id]["progress"] = 100

        today = datetime.datetime.now().date()
        
        # Simpan ke DB sementara (kalau bukan preview)
        if not preview:
            rute_lama = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).all()
            for rute in rute_lama:
                db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).delete()
            db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).delete()
            db.commit()

        # Lempar hasil ke Job RAM biar bisa ditangkep Frontend
        VRP_JOBS[job_id] = {
            "status": "completed",
            "phase": "done",
            "progress": 100,
            "data": {
                "message": f"[PREVIEW] {len(formatted_routes)} rute berhasil dibuat.",
                "total_trucks": len(formatted_routes), 
                "total_orders": len(pending_orders), 
                "dropped_count": len(spillover),
                "jadwal_truk_internal": formatted_routes, 
                "dropped_nodes_peta": spillover
            }
        }

    except Exception as e:
        db.rollback()
        logger.error(f"🚨 [VRP BACKGROUND TASK ERROR]: {str(e)}", exc_info=True)
        VRP_JOBS[job_id] = {"status": "failed", "message": str(e)}
    finally:
        db.close() 

# ==========================================
# 2. ENDPOINT MINTA TIKET & POLLING VRP
# ==========================================
@router.post("/routes/optimize/start")
def start_optimize_routes(
    background_tasks: BackgroundTasks,
    preview: bool = False,
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    job_id = str(uuid.uuid4())
    VRP_JOBS[job_id] = {
        "status": "processing",
        "phase": "init",
        "progress": 5,
        "message": "Memulai inisialisasi AI Pipeline...",
        "data": None
    }
    background_tasks.add_task(run_vrp_optimization_task, job_id, preview)
    return {"status": "success", "job_id": job_id}

@router.get("/routes/optimize/status/{job_id}")
def check_optimization_status(job_id: str):
    job_info = VRP_JOBS.get(job_id)
    if not job_info: raise HTTPException(status_code=404, detail="Job ID tidak ditemukan.")
    return job_info

# ==========================================
# 3. ENDPOINT RESEQUENCE (TSP) SETELAH MANUAL OVERRIDE
# ==========================================
@router.post("/routes/resequence")
def resequence_routes(payload: dict, db: Session = Depends(get_db)):
    from utils.helpers import time_str_to_minutes, menit_ke_jam
    try:
        settings = get_settings()
        DEPO_LAT = settings.depo_lat
        DEPO_LON = settings.depo_lon
        START_MINUTE = time_str_to_minutes(settings.vrp_start_time)
        BASE_DROP = settings.vrp_base_drop_time_mins
        VAR_DROP = settings.vrp_var_drop_time_mins
        
        jadwal = payload.get("jadwal_truk_internal", [])
        
        for truk in jadwal:
            stops = truk.get("detail_perjalanan", [])
            customers = [s for s in stops if str(s.get("keterangan", "")).lower() not in ["start", "finish"] and s.get("urutan", 0) != 0]
            
            if len(customers) < 2:
                continue 
                
            locations = [{"lat": DEPO_LAT, "lon": DEPO_LON}]
            demands = [0]
            customer_map = {} 
            
            for idx, c in enumerate(customers):
                locations.append({"lat": float(c["lat"]), "lon": float(c["lon"])})
                berat = float(c.get("turun_barang_kg", 0) or c.get("berat_kg", 0))
                demands.append(int(berat))
                customer_map[idx + 1] = c
            
            dist_mat, time_mat = map_service.build_osrm_matrix(locations)
            if not dist_mat:
                dist_mat, time_mat = map_service.build_haversine_matrix(locations)
            
            matrix_km = [[int(d / 1000) for d in row] for row in dist_mat]
            
            best_indices = list(range(len(locations)))
            caps = [sum(demands) + 9999]
            is_mall = [False] * len(locations)
            time_windows = [(0, 1440)] * len(locations)
            
            from services import vrp_solver
            hasil_tsp = vrp_solver.solve_vrp(
                matrix_km, time_mat, demands, 1, caps, is_mall, time_windows, BASE_DROP, VAR_DROP
            )
            
            if hasil_tsp and hasil_tsp['routes'] and len(hasil_tsp['routes'][0]) > 0:
                best_indices = hasil_tsp['routes'][0]
            
            new_manifest = []
            current_time = START_MINUTE
            prev_node = 0
            total_jarak_m = 0
            
            for step, node_idx in enumerate(best_indices):
                seg_km = round((dist_mat[prev_node][node_idx] if step != 0 else 0) / 1000.0, 1)
                if step != 0:
                    current_time += time_mat[prev_node][node_idx]
                    total_jarak_m += dist_mat[prev_node][node_idx]
                    
                if node_idx == 0:
                    new_manifest.append({
                        "urutan": step, "lokasi": "📍 GUDANG JAPFA", 
                        "jam": str(menit_ke_jam(current_time)),
                        "keterangan": "Start", "lat": DEPO_LAT, "lon": DEPO_LON, "distance_from_prev_km": seg_km
                    })
                else:
                    cust = customer_map[node_idx]
                    est_arrival = menit_ke_jam(current_time)
                    
                    cust["urutan"] = step
                    cust["jam_tiba"] = str(est_arrival)
                    cust["distance_from_prev_km"] = seg_km
                    new_manifest.append(cust)
                    
                    service_time = BASE_DROP + (demands[node_idx] * VAR_DROP / 10.0)
                    current_time += service_time
                    
                prev_node = node_idx
            
            est_finish_m = dist_mat[prev_node][0] if dist_mat else 0
            est_finish_km = round(est_finish_m / 1000.0, 1)
            
            current_time += (time_mat[prev_node][0] if time_mat else 0)
            total_jarak_m += est_finish_m
            
            new_manifest.append({
                "urutan": len(best_indices), "lokasi": "📍 GUDANG JAPFA", 
                "jam": str(menit_ke_jam(current_time)),
                "keterangan": "Finish", "lat": DEPO_LAT, "lon": DEPO_LON, "distance_from_prev_km": est_finish_km
            })
                
            route_geometry = map_service.get_road_geometry(best_indices + [0], locations)
            truk["garis_aspal"] = route_geometry
            truk["detail_perjalanan"] = new_manifest
            truk["total_jarak_km"] = round(total_jarak_m / 1000.0, 1)

        return payload

    except Exception as e:
        logger.error(f"🚨 [RESEQUENCE ERROR]: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Gagal menghitung ulang urutan rute.")


# ==========================================
# 4. ENDPOINT GET & CONFIRM ROUTES (FIX DISPATCHING)
# ==========================================
@router.get("/routes", response_model=schemas.GetRoutesResponse)
def get_routes(
    date: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.TMSRoutePlan)
    if date:
        try: query = query.filter(models.TMSRoutePlan.planning_date == datetime.datetime.strptime(date, "%Y-%m-%d").date())
        except: raise HTTPException(status_code=400, detail="Format tanggal salah!")

    zona_dummy = ["Bekasi/Cikarang", "Kelapa Gading", "Kembangan/Jakbar", "Serpong/BSD", "Pusat/Selatan", "Bogor", "Tigaraksa"]
    settings = get_settings()

    hasil = []
    routes = query.all()

    is_route_empty = len(routes) == 0

    for rute in routes:
        lines = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).order_by(models.TMSRouteLine.sequence).all()
        detail_rute = []
        for line in lines:
            order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == line.order_id).first()
            if order:
                items = json.loads(order.service_type) if order.service_type and order.service_type.startswith('[') else []
                nama_toko_asli = order.customer.store_name if hasattr(order, 'customer') and order.customer else (order.customer_name if hasattr(order, 'customer_name') else "Toko")
                
                detail_rute.append({
                    "urutan": line.sequence, 
                    "nama_toko": nama_toko_asli, 
                    "latitude": float(order.latitude) if order.latitude else 0.0,
                    "longitude": float(order.longitude) if order.longitude else 0.0, 
                    "berat_kg": order.weight_total,
                    "jam_tiba": str(line.est_arrival), 
                    "distance_from_prev_km": line.distance_from_prev_km or 0.0, 
                    "items": items
                })

        garis_aspal = []
        try:
            with open(f"route_geometries/{rute.route_id}.json", "r") as f: garis_aspal = json.load(f)
        except: pass

        idx_zona = int(rute.route_id[-1]) % len(zona_dummy) if rute.route_id[-1].isdigit() else 0
        transport_cost = round((rute.total_distance_km or 0) * (settings.cost_fuel_per_liter / settings.cost_avg_km_per_liter))

        hasil.append({
            "route_id": rute.route_id, "tanggal": str(rute.planning_date), "driver_name": rute.driver.name if rute.driver else "-",
            "kendaraan": rute.vehicle.license_plate if rute.vehicle else "-", "jenis": rute.vehicle.type if rute.vehicle else "-",
            "destinasi_jumlah": len(detail_rute), "total_berat": rute.total_weight, "total_distance_km": rute.total_distance_km,
            "transport_cost": transport_cost, "status": "Aktif", "zone": zona_dummy[idx_zona], "detail_rute": detail_rute, "garis_aspal": garis_aspal
        })

    dropped_nodes_response = []
    
    if not is_route_empty:
        unassigned = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.status == models.DOStatus.do_verified).all()
        dropped_nodes_response = [{
            "nama_toko": o.customer.store_name if hasattr(o, 'customer') and o.customer else (o.customer_name if hasattr(o, 'customer_name') else "Toko"), 
            "berat_kg": o.weight_total, 
            "alasan": "Drop AI (Overcapacity)", 
            "lat": float(o.latitude) if o.latitude else 0.0, 
            "lon": float(o.longitude) if o.longitude else 0.0
        } for o in unassigned]

    return {
        "routes": hasil, 
        "dropped_nodes": dropped_nodes_response
    }

@router.post("/routes/confirm", response_model=schemas.ConfirmRouteResponse)
def confirm_routes(payload: dict, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))):
    try:
        today = datetime.datetime.now().date()
        for rute in db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).all():
            db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).delete()
        db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).delete()

        jadwal = payload.get("jadwal_truk_internal", [])
        for idx, truk in enumerate(jadwal):
            nopol = truk.get("armada")
            vehicle = db.query(models.FleetVehicle).filter(models.FleetVehicle.license_plate == nopol).first()
            if not vehicle: continue

            drv_id = truk.get("driver_id")
            hlp_id = truk.get("helper_id")

            if not drv_id:
                raise HTTPException(status_code=400, detail=f"Truk {nopol} belum diassign Supir!")

            new_plan = models.TMSRoutePlan(
                route_id=truk["route_id"], planning_date=today, vehicle_id=vehicle.vehicle_id,
                driver_id=drv_id, helper_id=hlp_id, 
                total_weight=truk.get("total_muatan_kg", 0), total_distance_km=truk.get("total_jarak_km", 0)
            )
            db.add(new_plan)

            for stop in truk.get("detail_perjalanan", []):
                nomor_do = stop.get("nomor_do") or stop.get("order_id") or stop.get("id")
                if not nomor_do: continue
                try: jam_est = datetime.time(hour=int(str(stop["jam_tiba"]).split(":")[0]), minute=int(str(stop["jam_tiba"]).split(":")[1]))
                except: jam_est = datetime.time(hour=12, minute=0)

                db.add(models.TMSRouteLine(route_id=truk["route_id"], order_id=nomor_do, sequence=stop.get("urutan", 0), est_arrival=jam_est, distance_from_prev_km=stop.get("distance_from_prev_km", 0)))
                
                order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == nomor_do).first()
                if order: order.status = models.DOStatus.do_assigned_to_route

        db.commit()
        return {"message": f"Sukses! {len(jadwal)} rute dikonfirmasi.", "status": "success"}
    
    except Exception as e:
        db.rollback()
        logger.error(f"🚨 [CONFIRM ROUTES ERROR]: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan internal saat mengonfirmasi rute.")

@router.get("/routes/{route_id}/loadplan", response_model=schemas.LoadPlanResponse)
def get_load_plan(route_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from py3dbp import Packer, Bin, Item
    route_plan = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.route_id == route_id).first()
    if not route_plan: raise HTTPException(status_code=404, detail="Rute tidak ditemukan")
    vehicle = db.query(models.FleetVehicle).filter(models.FleetVehicle.vehicle_id == route_plan.vehicle_id).first()
    if not vehicle: raise HTTPException(status_code=404, detail="Armada tidak ditemukan")

    route_lines = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == route_id).order_by(models.TMSRouteLine.sequence.asc()).all()

    packer = Packer()
    truck_w, truck_h, truck_d = vehicle.box_length_cm or 400, vehicle.box_width_cm or 200, vehicle.box_height_cm or 200
    packer.add_bin(Bin(vehicle.license_plate, truck_w, truck_h, truck_d, float(vehicle.capacity_kg)))

    for line in route_lines[::-1]:
        if not line.order_id: continue
        order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == line.order_id).first()
        if not order: continue

        berat = float(order.weight_total)
        jml_keranjang = math.ceil(berat / 25.0)
        for i in range(jml_keranjang):
            packer.add_item(Item(f"{order.customer.store_name if hasattr(order, 'customer') and order.customer else (order.customer_name if hasattr(order, 'customer_name') else 'Toko')} | Box {i+1}", 60, 40, 30, berat / jml_keranjang))

    packer.pack()
    result = [{"truck": b.name, "truck_dimensions": {"w": truck_w, "h": truck_h, "d": truck_d}, "total_weight_loaded": float(b.get_total_weight()), "3d_layout_data": [{"item_name": item.name, "position_xyz": [float(item.position[0]), float(item.position[1]), float(item.position[2])], "dimensions_whd": [float(item.width), float(item.height), float(item.depth)], "rotation": item.rotation_type} for item in b.items], "unfitted_items": [item.name for item in b.unfitted_items]} for b in packer.bins]
    
    return {"status": "success", "data": result}

# ==========================================
# 5. ENDPOINT VALIDASI MACET
# ==========================================
TRAFFIC_JOBS = {}

@router.post("/routes/validate-traffic/{job_id}")
def start_traffic_validation(
    job_id: str, background_tasks: BackgroundTasks,
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    vrp_result = VRP_JOBS.get(job_id)
    if not vrp_result or vrp_result["status"] != "completed":
        raise HTTPException(400, "VRP belum selesai atau job tidak ditemukan")
    
    TRAFFIC_JOBS[job_id] = {"status": "processing"}
    background_tasks.add_task(_run_traffic_validation, job_id, vrp_result)
    return {"status": "success", "message": "Traffic validation dimulai"}

def _run_traffic_validation(job_id: str, vrp_result: dict):
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    routes = vrp_result["data"]["jadwal_truk_internal"]
    all_warnings = []
    
    for route in routes:
        result = traffic_validator.validate_route_traffic(route, today)
        all_warnings.extend(result.get("warnings", []))
    
    TRAFFIC_JOBS[job_id] = {
        "status": "completed",
        "total_warnings": len(all_warnings),
        "critical_count": sum(1 for w in all_warnings if w["severity"] == "HIGH"),
        "warnings": all_warnings,
    }

@router.get("/routes/validate-traffic/{job_id}/status")
def get_traffic_validation_status(job_id: str):
    return TRAFFIC_JOBS.get(job_id, {"status": "not_found"})

# ==========================================
# 🌟 SPRINT 3: ENDPOINT SPATIAL PREVIEW (ZONING KOTAK)
# ==========================================
@router.post("/routes/spatial-preview")
def preview_spatial_zones(
    preview: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    try:
        pending_orders = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.status == models.DOStatus.do_verified).all()
        if not pending_orders:
            raise HTTPException(status_code=400, detail="Tidak ada order terverifikasi.")

        locations = []
        for order in pending_orders:
            locations.append({
                "nama_toko": order.customer.store_name if hasattr(order, 'customer') and order.customer else (order.customer_name if hasattr(order, 'customer_name') else "Toko"),
                "lat": float(order.latitude),
                "lon": float(order.longitude),
                "berat": float(order.weight_total)
            })

        zoning_data = map_service.generate_spatial_zones(locations, num_zones=7)

        return {
            "status": "success",
            "message": "Zona Spasial berhasil dibuat.",
            "data": zoning_data
        }
        
    except Exception as e:
        logger.error(f"🚨 [SPATIAL ZONING ERROR]: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))