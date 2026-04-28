# routers/vrp.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import datetime
import json
import math
import os
import requests
import time

import models
from services import vrp_solver
from database import SessionLocal
from dependencies import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["VRP & Route Planning"])

# ==========================================
# DEPENDENCY
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def get_settings(db: Session) -> models.SystemSettings:
    """Single source of truth untuk konfigurasi"""
    settings = db.query(models.SystemSettings).first()
    if not settings:
        settings = models.SystemSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def time_str_to_minutes(time_str: str) -> int:
    """'06:00' → 360"""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(total_minutes: int) -> datetime.time:
    """360 → time(6, 0)"""
    hour = int((total_minutes // 60) % 24)
    minute = int(total_minutes % 60)
    return datetime.time(hour=hour, minute=minute)

def classify_store(store_name: str) -> bool:
    """Cek apakah toko adalah Mall/Supermarket besar"""
    if not store_name:
        return False
    keywords = ['MALL', 'PLAZA', 'SQUARE', 'FOOD HALL', 'SUPERMARKET',
                'ITC', 'HYPERMART', 'AEON', 'HERO', 'TRANSMART', 'LOTTE']
    return any(kw in str(store_name).upper() for kw in keywords)

def calculate_haversine(lat1, lon1, lat2, lon2) -> int:
    """Jarak garis lurus bumi dalam meter (fallback kalau TomTom gagal)"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon/2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c * 1000)  # Meter

def build_tomtom_matrix(locations: list, api_key: str):
    """
    Bangun distance & time matrix pakai TomTom Async API.
    Return (distance_matrix, time_matrix) dalam meter & menit.
    Kalau gagal, return None, None → trigger Haversine fallback.
    """
    url = f"https://api.tomtom.com/routing/matrix/2/async?key={api_key}"
    points = [{"point": {"latitude": loc["lat"], "longitude": loc["lon"]}}
              for loc in locations]
    payload = {
        "origins": points,
        "destinations": points,
        "options": {
            "routeType": "fastest",
            "traffic": "historical",
            "travelMode": "truck"
        }
    }

    try:
        print("🗺️  Menembak TomTom Matrix API...")
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        response.raise_for_status()

        matrix_result = None

        if response.status_code == 202:
            job_id = response.json().get('jobId')
            tracking_url = f"https://api.tomtom.com/routing/matrix/2/async/{job_id}?key={api_key}"

            for _ in range(30):
                time.sleep(2)
                status_res = requests.get(tracking_url, timeout=10)
                if status_res.status_code == 200:
                    state = status_res.json().get("state", "").upper()
                    if state == "COMPLETED":
                        result_url = f"https://api.tomtom.com/routing/matrix/2/async/{job_id}/result?key={api_key}"
                        matrix_result = requests.get(result_url, timeout=15).json()
                        break
                    elif state == "FAILED":
                        raise Exception("TomTom job FAILED")
            if not matrix_result:
                raise Exception("TomTom timeout!")
        else:
            matrix_result = response.json()

        # Parse matrix result
        n = len(locations)
        distance_matrix = [[0] * n for _ in range(n)]
        time_matrix     = [[0] * n for _ in range(n)]

        if "data" in matrix_result:
            for cell in matrix_result["data"]:
                o_idx = cell.get("originIndex", 0)
                d_idx = cell.get("destinationIndex", 0)
                if "routeSummary" in cell:
                    distance_matrix[o_idx][d_idx] = cell["routeSummary"]["lengthInMeters"]
                    time_matrix[o_idx][d_idx] = int(
                        cell["routeSummary"].get("travelTimeInSeconds", 0) / 60
                    )
                else:
                    distance_matrix[o_idx][d_idx] = 999999
                    time_matrix[o_idx][d_idx] = 999

        print("✅ TomTom Matrix berhasil!")
        return distance_matrix, time_matrix

    except Exception as e:
        print(f"⚠️  TomTom gagal: {e} → Switch ke Haversine fallback")
        return None, None

def build_haversine_matrix(locations: list):
    """Fallback matrix pakai Haversine formula"""
    print("🔄 Pakai Haversine fallback...")
    n = len(locations)
    distance_matrix = [[0] * n for _ in range(n)]
    time_matrix     = [[0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i != j:
                dist = calculate_haversine(
                    locations[i]["lat"], locations[i]["lon"],
                    locations[j]["lat"], locations[j]["lon"]
                )
                distance_matrix[i][j] = dist
                time_matrix[i][j] = int(dist / 400)  # ~24 km/jam dalam kota

    return distance_matrix, time_matrix

def get_road_geometry(route_indices: list, locations: list, api_key: str) -> list:
    """Ambil polyline aspal dari TomTom Calculate Route"""
    waypoints_str = ":".join([
        f"{locations[n]['lat']},{locations[n]['lon']}"
        for n in route_indices
    ])
    try:
        url = (f"https://api.tomtom.com/routing/1/calculateRoute/"
               f"{waypoints_str}/json"
               f"?key={api_key}&routeType=fastest&travelMode=truck")
        res = requests.get(url, timeout=15)
        if res.status_code == 200:
            geometry = []
            for leg in res.json()['routes'][0]['legs']:
                for p in leg['points']:
                    geometry.append([p['latitude'], p['longitude']])
            return geometry
    except Exception as e:
        print(f"⚠️  Gagal ambil geometry: {e}")
    return []

# ==========================================
# ENDPOINT 1: OPTIMIZE ROUTES (VRP)
# ==========================================
@router.post("/routes/optimize")
def optimize_routes(
    preview: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role("admin_distribusi", "manager_logistik")
    )
):
    """
    🧠 Main VRP Engine - Hitung rute optimal semua truk.

    - **preview=true**: Hitung tapi tidak simpan ke DB (dry run)
    - **preview=false**: Hitung dan simpan permanen
    """

    # 1. Ambil konfigurasi dari DB (BUKAN hardcode!)
    settings = get_settings(db)
    TOMTOM_KEY   = settings.api_tomtom_key
    DEPO_LAT     = settings.depo_lat
    DEPO_LON     = settings.depo_lon
    START_MINUTE = time_str_to_minutes(settings.vrp_start_time)
    END_MINUTE   = time_str_to_minutes(settings.vrp_end_time)
    BASE_DROP    = settings.vrp_base_drop_time_mins
    VAR_DROP     = settings.vrp_var_drop_time_mins
    CAP_BUFFER   = settings.vrp_capacity_buffer_percent / 100.0  # 90% → 0.9

    # 2. Ambil semua DO yang sudah verified
    pending_orders = db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.status == models.DOStatus.do_verified
    ).all()

    if not pending_orders:
        raise HTTPException(
            status_code=400,
            detail="Tidak ada Delivery Order terverifikasi! Upload SAP dulu."
        )

    # 3. Ambil armada & driver
    vehicles = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.status == "Available"
    ).all()
    drivers = db.query(models.HRDriver).filter(
        models.HRDriver.status == True
    ).all()

    if not vehicles:
        raise HTTPException(status_code=500, detail="Tidak ada armada Available!")
    if not drivers:
        raise HTTPException(status_code=500, detail="Tidak ada driver aktif!")

    # 4. Dynamic Fleet Selection
    total_berat = sum(int(o.weight_total) for o in pending_orders)
    avg_capacity = 2000
    ideal_trucks = (total_berat // avg_capacity) + 2
    active_count = min(ideal_trucks, len(vehicles))

    print(f"📦 Total berat: {total_berat} KG → Butuh {ideal_trucks} truk → Pakai {active_count} truk")

    # 5. Siapkan kapasitas dengan buffer (FIX dari sebelumnya!)
    vehicle_capacities = [
        int(vehicles[i].capacity_kg * CAP_BUFFER)
        for i in range(active_count)
    ]
    num_vehicles = len(vehicle_capacities)

    # 6. Bangun node list (depot + semua toko)
    locations   = [{"lat": DEPO_LAT, "lon": DEPO_LON}]
    demands     = [0]
    is_mall     = [False]
    time_windows = [(START_MINUTE, END_MINUTE)]
    node_to_order = {}

    for idx, order in enumerate(pending_orders):
        locations.append({"lat": float(order.latitude), "lon": float(order.longitude)})
        demands.append(int(order.weight_total))
        is_mall.append(classify_store(order.customer_name))

        tw_start = order.delivery_window_start or START_MINUTE
        tw_end   = order.delivery_window_end   or END_MINUTE
        time_windows.append((tw_start, tw_end))
        node_to_order[idx + 1] = order

    # 7. Bangun Distance & Time Matrix
    distance_matrix, time_matrix = None, None

    if TOMTOM_KEY:
        distance_matrix, time_matrix = build_tomtom_matrix(locations, TOMTOM_KEY)

    if distance_matrix is None:  # Fallback Haversine
        distance_matrix, time_matrix = build_haversine_matrix(locations)

    # Convert meter → km untuk VRP solver
    matrix_km = [[int(d / 1000) for d in row] for row in distance_matrix]

    # 8. Jalankan OR-Tools VRP Solver
    print("🧠 OR-Tools VRP Solver mulai berpikir...")
    hasil_vrp = vrp_solver.solve_vrp(
        matrix_km, time_matrix, demands,
        num_vehicles, vehicle_capacities,
        is_mall, time_windows,  BASE_DROP, VAR_DROP
    )

    if not hasil_vrp:
        raise HTTPException(
            status_code=400,
            detail="VRP Solver gagal! Terlalu banyak constraint atau data tidak valid."
        )

    # 9. Hapus rute hari ini kalau bukan preview
    today = datetime.datetime.now().date()
    if not preview:
        rute_lama = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.planning_date == today
        ).all()
        for rute in rute_lama:
            db.query(models.TMSRouteLine).filter(
                models.TMSRouteLine.route_id == rute.route_id
            ).delete()
        db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.planning_date == today
        ).delete()

    # 10. Format hasil VRP
    formatted_routes = []
    assigned_nodes   = set()
    active_truck_counter = 0

    for truck_idx, route_indices in enumerate(hasil_vrp['routes']):
        # Skip rute kosong (depot → depot)
        if len(route_indices) <= 2:
            continue

        vehicle = vehicles[active_truck_counter]
        driver  = drivers[active_truck_counter] if active_truck_counter < len(drivers) else drivers[0]

        route_id = f"RP-{datetime.datetime.now().strftime('%Y%m%d')}-T{active_truck_counter + 1}"
        active_truck_counter += 1

        # Hitung total jarak real
        total_dist_m = sum(
            distance_matrix[route_indices[i]][route_indices[i + 1]]
            for i in range(len(route_indices) - 1)
        )
        total_km = round(total_dist_m / 1000.0, 1)

        # Simpan route plan ke DB (kalau bukan preview)
        new_plan = models.TMSRoutePlan(
            route_id=route_id,
            planning_date=today,
            vehicle_id=vehicle.vehicle_id,
            driver_id=driver.driver_id,
            total_weight=0,
            total_distance_km=total_km
        )
        if not preview:
            db.add(new_plan)

        # Ambil geometry aspal dari TomTom
        route_geometry = []
        if TOMTOM_KEY:
            route_geometry = get_road_geometry(route_indices, locations, TOMTOM_KEY)

        # Build manifest perjalanan
        manifest       = []
        total_muatan   = 0
        current_time   = START_MINUTE
        prev_node      = 0

        for step, node_idx in enumerate(route_indices):
            assigned_nodes.add(node_idx)
            seg_dist_m = distance_matrix[prev_node][node_idx] if step != 0 else 0
            seg_km     = round(seg_dist_m / 1000.0, 1)

            # Node 0 = Depot
            if node_idx == 0:
                if step != 0:
                    current_time += time_matrix[prev_node][node_idx]
                prev_node = node_idx
                manifest.append({
                    "urutan": step,
                    "lokasi": "📍 GUDANG JAPFA CIKUPA",
                    "jam": str(minutes_to_time(current_time)),
                    "keterangan": "Start" if step == 0 else "Finish",
                    "lat": DEPO_LAT,
                    "lon": DEPO_LON,
                    "distance_from_prev_km": seg_km
                })
                continue

            # Node toko
            order = node_to_order[node_idx]
            muatan = demands[node_idx]
            total_muatan += muatan

            current_time += time_matrix[prev_node][node_idx]

            # Tunggu kalau tiba sebelum jam buka toko
            if current_time < time_windows[node_idx][0]:
                current_time = time_windows[node_idx][0]

            # Service time (dari settings, bukan hardcode!)
            if is_mall[node_idx]:
                service_time = 60 + (muatan / 10.0)  # Mall: 60 menit base
            else:
                service_time = BASE_DROP + (muatan * VAR_DROP / 10.0)

            est_arrival = minutes_to_time(current_time)
            selesai     = current_time + service_time

            # Simpan route line ke DB
            new_line = models.TMSRouteLine(
                route_id=route_id,
                order_id=order.order_id,
                sequence=step,
                est_arrival=est_arrival,
                distance_from_prev_km=seg_km
            )
            if not preview:
                db.add(new_line)
                order.status = models.DOStatus.do_assigned_to_route

            manifest.append({
                "urutan": step,
                "nomor_do": order.order_id,
                "nama_toko": order.customer_name,
                "turun_barang_kg": round(muatan, 2),
                "jam_tiba": str(est_arrival),
                "lat": float(order.latitude),
                "lon": float(order.longitude),
                "distance_from_prev_km": seg_km
            })

            current_time = selesai
            prev_node    = node_idx

        # Update total weight di plan
        if not preview:
            new_plan.total_weight = total_muatan

        # Simpan geometry ke file
        if not preview and route_geometry:
            os.makedirs("route_geometries", exist_ok=True)
            with open(f"route_geometries/{route_id}.json", "w") as f:
                json.dump(route_geometry, f)

        formatted_routes.append({
            "route_id": route_id,
            "armada": vehicle.license_plate,
            "driver": driver.name,
            "total_muatan_kg": total_muatan,
            "total_jarak_km": total_km,
            "detail_perjalanan": manifest,
            "garis_aspal": route_geometry
        })

    # 11. Dropped nodes (toko yang tidak bisa dirouting)
    dropped = []
    for n in range(1, len(locations)):
        if n not in assigned_nodes:
            order = node_to_order[n]
            dropped.append({
                "nama_toko": order.customer_name,
                "berat_kg": order.weight_total,
                "lat": float(order.latitude),
                "lon": float(order.longitude),
                "alasan": "Kapasitas Truk Penuh / Luar Jam Kerja"
            })

    # 12. Commit atau rollback
    if preview:
        db.rollback()
        status_msg = f"[PREVIEW] {len(formatted_routes)} rute dihitung."
    else:
        db.commit()
        status_msg = (
            "Semua rute disimpan ke database!"
            if not dropped
            else f"⚠️ {len(dropped)} toko tidak bisa dirouting!"
        )

    return {
        "message": status_msg,
        "total_trucks": len(formatted_routes),
        "total_orders": len(pending_orders),
        "dropped_count": len(dropped),
        "jadwal_truk_internal": formatted_routes,
        "dropped_nodes_peta": dropped,
        "info_text": status_msg
    }

# ==========================================
# ENDPOINT 2: GET ROUTES BY DATE
# ==========================================
@router.get("/routes")
def get_routes(
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Ambil semua rute berdasarkan tanggal"""
    query = db.query(models.TMSRoutePlan)

    if date:
        try:
            tanggal = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(models.TMSRoutePlan.planning_date == tanggal)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format tanggal salah! Gunakan YYYY-MM-DD")

    hasil = []
    zona_dummy = ["CENGKARENG", "KELAPA GADING", "PONDOK INDAH",
                  "BEKASI SELATAN", "DEPOK", "BOGOR", "TANGERANG"]

    for rute in query.all():
        lines = db.query(models.TMSRouteLine).filter(
            models.TMSRouteLine.route_id == rute.route_id
        ).order_by(models.TMSRouteLine.sequence).all()

        detail_rute = []
        for line in lines:
            order = db.query(models.DeliveryOrder).filter(
                models.DeliveryOrder.order_id == line.order_id
            ).first()

            if order:
                items = []
                try:
                    if order.service_type and order.service_type.startswith('['):
                        items = json.loads(order.service_type)
                except:
                    pass

                detail_rute.append({
                    "urutan": line.sequence,
                    "nama_toko": order.customer_name,
                    "latitude": float(order.latitude) if order.latitude else 0.0,
                    "longitude": float(order.longitude) if order.longitude else 0.0,
                    "berat_kg": order.weight_total,
                    "jam_tiba": str(line.est_arrival),
                    "distance_from_prev_km": line.distance_from_prev_km or 0.0,
                    "items": items
                })

        # Load geometry dari file
        garis_aspal = []
        try:
            with open(f"route_geometries/{rute.route_id}.json", "r") as f:
                garis_aspal = json.load(f)
        except:
            pass

        idx_zona = int(rute.route_id[-1]) % len(zona_dummy) if rute.route_id[-1].isdigit() else 0

        # Hitung transport cost (dari settings)
        settings = get_settings(db)
        cost_per_km = settings.cost_fuel_per_liter / settings.cost_avg_km_per_liter
        transport_cost = round((rute.total_distance_km or 0) * cost_per_km)

        hasil.append({
            "route_id": rute.route_id,
            "tanggal": rute.planning_date.strftime("%Y-%m-%d") if rute.planning_date else "-",
            "driver_name": rute.driver.name if rute.driver else "Belum Ditentukan",
            "kendaraan": rute.vehicle.license_plate if rute.vehicle else "-",
            "jenis": rute.vehicle.type if rute.vehicle else "-",
            "destinasi_jumlah": len(detail_rute),
            "total_berat": rute.total_weight,
            "total_distance_km": rute.total_distance_km,
            "transport_cost": transport_cost,  # 🌟 REAL COST!
            "status": "Aktif",
            "zone": zona_dummy[idx_zona],
            "detail_rute": detail_rute,
            "garis_aspal": garis_aspal
        })

    unassigned = db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.status == models.DOStatus.do_verified
    ).all()

    return {
        "routes": hasil,
        "dropped_nodes": [
            {
                "nama_toko": o.customer_name,
                "berat_kg": o.weight_total,
                "alasan": "Di-drop AI (Over Capacity / Time)"
            }
            for o in unassigned
        ]
    }

# ==========================================
# ENDPOINT 3: CONFIRM & SAVE ROUTE
# ==========================================
@router.post("/routes/confirm")
def confirm_routes(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role("admin_distribusi", "manager_logistik")
    )
):
    """Konfirmasi dan simpan rute preview ke database permanen"""
    try:
        today = datetime.datetime.now().date()

        # 1. Bersihkan rute lama hari ini
        rute_lama = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.planning_date == today
        ).all()
        for rute in rute_lama:
            db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).delete()
        db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).delete()

        # 2. Ambil list supir aktif untuk dibagikan ke truk
        available_drivers = db.query(models.HRDriver).filter(models.HRDriver.status == True).all()
        if not available_drivers:
            raise HTTPException(status_code=400, detail="Gagal konfirmasi: Tidak ada supir aktif!")

        jadwal = payload.get("jadwal_truk_internal", [])

        for idx, truk in enumerate(jadwal):
            # Cari kendaraan berdasarkan plat nomor
            vehicle = db.query(models.FleetVehicle).filter(
                models.FleetVehicle.license_plate == truk.get("armada")
            ).first()
            
            if not vehicle: continue

            # 🌟 FIX: Bagi supir berdasarkan urutan truk (Round Robin)
            # Biar ngga cuma supir pertama yang kerja terus!
            driver_idx = idx % len(available_drivers)
            assigned_driver = available_drivers[driver_idx]

            # Simpan Header Rute
            new_plan = models.TMSRoutePlan(
                route_id=truk["route_id"],
                planning_date=today,
                vehicle_id=vehicle.vehicle_id,
                driver_id=assigned_driver.driver_id, # 👈 Sekarang supirnya beda-beda!
                total_weight=truk.get("total_muatan_kg", 0),
                total_distance_km=truk.get("total_jarak_km", 0)
            )
            db.add(new_plan)

            # Simpan Detail Titik Perjalanan (Route Line)
            for stop in truk.get("detail_perjalanan", []):
                nomor_do = (stop.get("nomor_do") or stop.get("order_id") or stop.get("id"))
                if not nomor_do: continue

                try:
                    h, m = map(int, str(stop["jam_tiba"]).split(":")[:2])
                    jam_est = datetime.time(hour=h, minute=m)
                except:
                    jam_est = datetime.time(hour=12, minute=0)

                new_line = models.TMSRouteLine(
                    route_id=truk["route_id"],
                    order_id=nomor_do,
                    sequence=stop.get("urutan", 0),
                    est_arrival=jam_est,
                    distance_from_prev_km=stop.get("distance_from_prev_km", 0)
                )
                db.add(new_line)

                # 🌟 UPDATE STATUS DO: Biar supir bisa liat di App
                order = db.query(models.DeliveryOrder).filter(
                    models.DeliveryOrder.order_id == nomor_do
                ).first()
                if order:
                    order.status = models.DOStatus.do_assigned_to_route

        db.commit()
        return {"message": f"Sukses! {len(jadwal)} rute telah ditugaskan ke supir.", "status": "success"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal simpan rute: {str(e)}")

# ==========================================
# ENDPOINT 4: GET LOAD PLAN (3D)
# ==========================================
@router.get("/routes/{route_id}/loadplan")
def get_load_plan(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Ambil 3D load plan untuk satu rute truk"""
    from py3dbp import Packer, Bin, Item

    route_plan = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.route_id == route_id
    ).first()

    if not route_plan:
        raise HTTPException(status_code=404, detail="Rute tidak ditemukan")

    vehicle = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.vehicle_id == route_plan.vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Armada tidak ditemukan")

    route_lines = db.query(models.TMSRouteLine).filter(
        models.TMSRouteLine.route_id == route_id
    ).order_by(models.TMSRouteLine.sequence.asc()).all()

    # Setup packer
    packer = Packer()
    truck_w = vehicle.box_length_cm or 400
    truck_h = vehicle.box_width_cm  or 200
    truck_d = vehicle.box_height_cm or 200

    packer.add_bin(Bin(
        vehicle.license_plate,
        truck_w, truck_h, truck_d,
        float(vehicle.capacity_kg)
    ))

    # LIFO: Balik urutan dari rute (toko terakhir dimuat pertama)
    loading_sequence = route_lines[::-1]

    for line in loading_sequence:
        if not line.order_id:
            continue
        order = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == line.order_id
        ).first()
        if not order:
            continue

        berat = float(order.weight_total)
        jml_keranjang = math.ceil(berat / 25.0)
        berat_per = berat / jml_keranjang

        for i in range(jml_keranjang):
            packer.add_item(Item(
                f"{order.customer_name} | Box {i+1}",
                60, 40, 30,
                berat_per
            ))

    packer.pack()

    result = []
    for b in packer.bins:
        result.append({
            "truck": b.name,
            "truck_dimensions": {"w": truck_w, "h": truck_h, "d": truck_d},
            "total_weight_loaded": float(b.get_total_weight()),
            "3d_layout_data": [
                {
                    "item_name": item.name,
                    "position_xyz": [float(item.position[0]),
                                    float(item.position[1]),
                                    float(item.position[2])],
                    "dimensions_whd": [float(item.width),
                                      float(item.height),
                                      float(item.depth)],
                    "rotation": item.rotation_type
                }
                for item in b.items
            ],
            "unfitted_items": [item.name for item in b.unfitted_items]
        })

    return {"status": "success", "data": result}