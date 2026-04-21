# main.py - BAGIAN ATAS (replace import & setup lama)
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from io import BytesIO
from dotenv import load_dotenv
import os

import shutil
import datetime
import pandas as pd
import json
import math
import requests
import time
from py3dbp import Packer, Bin, Item

load_dotenv()

# Import file lokal
from database import SessionLocal, engine, Base
import models, schemas, auth, dependencies, vrp_solver
from models import TMSRoutePlan, TMSRouteLine, FleetVehicle, HRDriver, DeliveryOrder, User, DOStatus

# 🌟 IMPORT ROUTERS BARU
from routers import auth as auth_router
from routers import settings as settings_router
from routers import orders as orders_router 
from routers import vrp as vrp_router
from routers import fleet as fleet_router
from routers import analytics as analytics_router
from routers import dashboard as dashboard_router
from routers import customers as customers_router
# main.py - TAMBAHKAN ini setelah app = FastAPI(...)

from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="TMS JAPFA - AI Engine Backend",
    version="2.0.0"
)

# 🌟 FIX SWAGGER AUTH: Tambah Bearer token support
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="TMS JAPFA - AI Engine",
        version="2.0.0",
        description="TMS Backend - Gunakan /login untuk dapat token",
        routes=app.routes,
    )

    # Tambah Bearer scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ... middleware, mount router, dll tetap sama ...

# ==========================================
# INISIALISASI APP
# ==========================================
os.makedirs("uploads/epod", exist_ok=True)
app = FastAPI(
    title="TMS JAPFA - AI Engine Backend",
    description="Transport Management System dengan CVRPTW Optimization",
    version="2.0.0"
)

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 🌟 MOUNT ROUTERS BARU
app.include_router(auth_router.router)
app.include_router(settings_router.router)
app.include_router(orders_router.router)
app.include_router(vrp_router.router)
app.include_router(fleet_router.router)
app.include_router(analytics_router.router)
app.include_router(dashboard_router.router)
app.include_router(customers_router.router)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 🌟 RUMUS BAN SEREP (JARAK GARIS LURUS BUMI)
# ==========================================
def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius bumi dalam KM
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return int((R * c) * 1000) # Meter

# ==========================================
# 🔌 API 1: UPLOAD SAP EXCEL (DETEKTIF NLP & TIME WINDOWS)
# ==========================================
@app.post("/api/orders/upload")
async def upload_sap_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    try:
        df = pd.read_csv(BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal baca file: {str(e)}")

    # 1. Normalisasi Header
    df.columns = df.columns.str.upper().str.strip()
    df = df.dropna(how='all')

    # Identifikasi Kolom (Auto-Mapping)
    col_nama = 'NAMA CUSTOMER' if 'NAMA CUSTOMER' in df.columns else df.columns[2]
    col_kode = 'KODE CUST.' if 'KODE CUST.' in df.columns else df.columns[12]
    col_desc = 'VALIDASI' if 'VALIDASI' in df.columns else df.columns[4]
    col_qty = 'QTY' if 'QTY' in df.columns else df.columns[7]
    col_ket = 'KETERANGAN' if 'KETERANGAN' in df.columns else df.columns[11]

    # 2. Obat Anti-Total (Hapus baris tanpa nama barang)
    df = df.dropna(subset=[col_desc])

    # 3. Obat Kebal Kordinat
    for col in ['LATITUDE', 'LONGITUDE']:
        if col not in df.columns: df[col] = None

    # Bersihkan DO Lama yang masih gantung
    db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.status.in_([models.DOStatus.so_waiting_verification, models.DOStatus.do_verified])
    ).delete(synchronize_session=False)

    df[col_nama] = df[col_nama].ffill()
    df[col_kode] = df[col_kode].ffill()

    orders_dict = {}
    
    for _, row in df.iterrows():
        kode_cust_val = row.get(col_kode)
        if pd.isna(kode_cust_val) or str(kode_cust_val).strip() == '': continue
        
        # 🌟 DETEKTIF NLP: BACA KETERANGAN EXCEL
        keterangan_teks = str(row.get(col_ket, '')).strip().upper()
        
        # Aturan 1: Kalau Diambil Cust, langsung lewatin (Drop dari Routing)
        if 'DIAMBIL CUST' in keterangan_teks:
            continue
            
        # Aturan 2: Time Windows (Batas Jam Pengiriman)
        # Standar operasional: 06:00 (360 mnt) sampai 20:00 (1200 mnt)
        window_start = 360 
        window_end = 1200  
        
        # 🌟 DETEKTIF NLP YANG UDAH DI-UPGRADE
        if 'PAGI' in keterangan_teks or '10' in keterangan_teks:
            window_end = 600 # Maksimal Jam 10:00
        elif '12' in keterangan_teks or 'SIANG' in keterangan_teks:
            window_end = 720 # Maksimal Jam 12:00
        elif '15' in keterangan_teks or 'SORE' in keterangan_teks:
            window_end = 900 # Maksimal Jam 15:00
        
        kode_cust = str(kode_cust_val).split('.')[0]
        nama_toko = str(row.get(col_nama, 'Unknown')).strip()
        cust_key = f"{kode_cust}_{nama_toko}"
        
        if cust_key not in orders_dict:
            orders_dict[cust_key] = {
                "kode": kode_cust, "nama": nama_toko, "lat": None, "lon": None, 
                "berat": 0.0, "items": [], "tw_start": window_start, "tw_end": window_end
            }
            
        lat_val, lon_val, qty_val, desc_val = row.get('LATITUDE'), row.get('LONGITUDE'), row.get(col_qty), row.get(col_desc)

        # 🌟 LOGIKA NGINTIP MASTER DATABASE
        if pd.notna(lat_val) and str(lat_val).strip() not in ['-', 'LATITUDE']:
            try:
                orders_dict[cust_key]["lat"] = float(str(lat_val).replace(',', '.'))
                orders_dict[cust_key]["lon"] = float(str(lon_val).replace(',', '.'))
            except: pass
            
        # Kalau di Excel kosong, coba intip tabel CustomerMaster!
        if orders_dict[cust_key]["lat"] is None or orders_dict[cust_key]["lon"] is None:
            master_data = db.query(models.CustomerMaster).filter(models.CustomerMaster.kode_customer == kode_cust).first()
            if master_data and master_data.latitude and master_data.longitude:
                orders_dict[cust_key]["lat"] = master_data.latitude
                orders_dict[cust_key]["lon"] = master_data.longitude
            
        if pd.notna(qty_val):
            try:
                str_qty = str(qty_val).replace(',', '.')
                if str_qty.count('.') > 1: str_qty = str_qty.replace('.', '', str_qty.count('.') - 1)
                q = float(str_qty)
                if q > 0:
                    orders_dict[cust_key]["items"].append({"nama_barang": str(desc_val) if pd.notna(desc_val) else "Item SAP", "qty": f"{q} KG"})
                    orders_dict[cust_key]["berat"] += q
            except: pass

    success_list, failed_list, count = [], [], 0
    
    for cust_key, data in orders_dict.items():
        if data["berat"] <= 0: continue
        
        if data["lat"] and data["lon"]:
            new_do = models.DeliveryOrder(
                order_id=f"DO-{data['kode']}-{int(time.time())}-{count}",
                customer_name=data['nama'],
                latitude=data['lat'],
                longitude=data['lon'],
                weight_total=data['berat'],
                service_type=json.dumps(data['items']),
                delivery_window_start=data['tw_start'], 
                delivery_window_end=data['tw_end'],     
                status=models.DOStatus.do_verified 
            )
            db.add(new_do)
            count += 1
            success_list.append({
                "order_id": new_do.order_id,
                "kode_customer": data['kode'],
                "nama_toko": data['nama'], 
                "berat": round(data['berat'], 2), 
                "kordinat": f"{data['lat']}, {data['lon']}", 
                "jam_maks": "10:00" if data['tw_end'] == 600 else "20:00",
                "items": data['items'] 
            })
        else:
            failed_list.append({
                "kode_customer": data['kode'],
                "nama_toko": data['nama'], 
                "berat": round(data['berat'], 2), 
                "items": data['items'],           
                "jam_maks": "10:00" if data['tw_end'] == 600 else "20:00",
                "alasan": "Koordinat GPS Kosong / Format Salah"
            })
            
    db.commit()
    return {"message": "Validasi Upload Selesai!", "success_list": success_list, "failed_list": failed_list}

def classify_store(store_name):
    if not store_name: return False
    return any(keyword in str(store_name).upper() for keyword in ['MALL', 'PLAZA', 'SQUARE', 'FOOD HALL', 'SUPERMARKET', 'ITC', 'HYPERMART', 'AEON', 'HERO'])


# ==========================================
# ⏱️ API BARU: UPDATE JAM MAKSIMAL (MANUAL OVERRIDE)
# ==========================================
class TimeUpdateParams(BaseModel):
    jam_maksimal: str  

@app.put("/api/orders/{order_id}/time")
def update_batas_waktu(order_id: str, data: TimeUpdateParams, db: Session = Depends(get_db)):
    order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == order_id).first()
    if not order: raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    
    try:
        if not data.jam_maksimal or data.jam_maksimal == "":
            order.delivery_window_end = 1200
        else:
            h, m = map(int, data.jam_maksimal.split(":"))
            total_menit = (h * 60) + m
            order.delivery_window_end = total_menit
            
        db.commit()
        return {"message": f"Batas waktu {order.customer_name} diubah jadi {data.jam_maksimal}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Format jam salah!")

# ==========================================
# 📍 API BARU: INPUT KOORDINAT MANUAL (SELF-HEALING)
# ==========================================
class CoordinateUpdateParams(BaseModel):
    latitude: float
    longitude: float
    kode_customer: str
    nama_customer: str

@app.put("/api/orders/{order_id}/coordinate")
def update_koordinat_manual(order_id: str, data: CoordinateUpdateParams, db: Session = Depends(get_db)):
    if order_id.startswith("DRAFT-"):
        master_cust = db.query(models.CustomerMaster).filter(models.CustomerMaster.kode_customer == data.kode_customer).first()
        if master_cust:
            master_cust.latitude = data.latitude
            master_cust.longitude = data.longitude
        else:
            new_master = models.CustomerMaster(
                kode_customer=data.kode_customer,
                nama_customer=data.nama_customer,
                latitude=data.latitude,
                longitude=data.longitude
            )
            db.add(new_master)
            
        db.commit()
        return {"message": "Koordinat DRAFT berhasil diselamatkan ke Master Database!"}

    order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == order_id).first()
    if not order: 
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    
    order.latitude = data.latitude
    order.longitude = data.longitude
    order.status = models.DOStatus.do_verified
    
    master_cust = db.query(models.CustomerMaster).filter(models.CustomerMaster.kode_customer == data.kode_customer).first()
    if master_cust:
        master_cust.latitude = data.latitude
        master_cust.longitude = data.longitude
    else:
        new_master = models.CustomerMaster(
            kode_customer=data.kode_customer,
            nama_customer=data.nama_customer,
            latitude=data.latitude,
            longitude=data.longitude
        )
        db.add(new_master)
        
    db.commit()
    return {"message": "Koordinat berhasil diselamatkan dan disimpan ke Master Database!"}
    
# ==========================================
# 🚚 API 2: FUSION VRP + TOMTOM MATRIX + REAL ROAD GEOMETRY
# ==========================================
@app.post("/optimize-routes")
def optimize_and_assign_routes(preview: bool = False, db: Session = Depends(get_db)):
    pending_orders = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.status == models.DOStatus.do_verified).all()
    if not pending_orders: raise HTTPException(status_code=400, detail="Tidak ada DO terverifikasi!")

    vehicles = db.query(models.FleetVehicle).all()
    drivers = db.query(models.HRDriver).filter(models.HRDriver.status == True).all()
    if not vehicles or not drivers: raise HTTPException(status_code=500, detail="Master data Truk/Supir kosong!")

    # 🌟 OBAT BARU CTO: DYNAMIC FLEET SELECTION
    total_berat_all_orders = sum(int(o.weight_total) for o in pending_orders)
    
    avg_capacity = 2000 
    ideal_truck_needed = (total_berat_all_orders // avg_capacity) + 2 
    active_vehicles_count = min(ideal_truck_needed, len(vehicles))

    vehicle_capacities = [int(vehicles[i].capacity_kg) for i in range(active_vehicles_count)]
    num_vehicles = len(vehicle_capacities)

    gudang_lat, gudang_lon = -6.207356, 106.479163
    locations = [{"lat": gudang_lat, "lon": gudang_lon}]
    demands = [0]          
    is_mall_list = [False] 
    time_windows = [(360, 1200)] 
    node_to_order = {} 
    
    for idx, order in enumerate(pending_orders):
        locations.append({"lat": float(order.latitude), "lon": float(order.longitude)})
        demands.append(int(order.weight_total)) 
        is_mall_list.append(classify_store(order.customer_name))
        tw_start = order.delivery_window_start if order.delivery_window_start else 360
        tw_end = order.delivery_window_end if order.delivery_window_end else 1200
        time_windows.append((tw_start, tw_end))
        node_to_order[idx + 1] = order

    TOMTOM_API_KEY = "xUy50YsjmbRexLalxX3ThDpmC1lOzElP"

    try:
        url = f"https://api.tomtom.com/routing/matrix/2/async?key={TOMTOM_API_KEY}"
        points = [{"point": {"latitude": loc["lat"], "longitude": loc["lon"]}} for loc in locations]
        payload = {"origins": points, "destinations": points, "options": {"routeType": "fastest", "traffic": "historical", "travelMode": "truck"}}
        
        print(f"CCTV 4: Menembak API TomTom MATRIX ASYNC...")
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        
        matrix_result = None
        if response.status_code == 202:
            job_id = response.json().get('jobId')
            tracking_url = f"https://api.tomtom.com/routing/matrix/2/async/{job_id}?key={TOMTOM_API_KEY}"
            for _ in range(30):
                time.sleep(2)
                status_res = requests.get(tracking_url)
                if status_res.status_code == 200:
                    data_tomtom = status_res.json()
                    status_pengerjaan = data_tomtom.get("state", "").upper()
                    if status_pengerjaan == "COMPLETED":
                        matrix_result = requests.get(f"https://api.tomtom.com/routing/matrix/2/async/{job_id}/result?key={TOMTOM_API_KEY}").json()
                        break
                    elif status_pengerjaan == "FAILED": raise Exception("TomTom gagal menghitung rute!")
            if not matrix_result: raise Exception("TomTom kelamaan mikir!")
        else: matrix_result = response.json()
        
        jumlah_lokasi = len(locations)
        distance_matrix, time_matrix = [[0]*jumlah_lokasi for _ in range(jumlah_lokasi)], [[0]*jumlah_lokasi for _ in range(jumlah_lokasi)]

        if "data" in matrix_result:
            for cell in matrix_result["data"]:
                o_idx, d_idx = cell.get("originIndex", 0), cell.get("destinationIndex", 0)
                if "routeSummary" in cell:
                    distance_matrix[o_idx][d_idx] = cell["routeSummary"]["lengthInMeters"]
                    time_matrix[o_idx][d_idx] = int(cell["routeSummary"].get("travelTimeInSeconds", 0) / 60)
                else: distance_matrix[o_idx][d_idx], time_matrix[o_idx][d_idx] = 999999, 999
        print("✅ CCTV 4: SUKSES MENARIK DATA TOMTOM MATRIX!")
    except Exception as e:
        print(f"⚠️ TOMTOM ERROR: {e}. SWITCH KE BAN SEREP HAVERSINE!")
        distance_matrix, time_matrix = [], []
        for i in locations:
            row, t_row = [], []
            for j in locations:
                jarak_m = calculate_haversine(float(i["lat"]), float(i["lon"]), float(j["lat"]), float(j["lon"]))
                row.append(jarak_m)
                t_row.append(int(jarak_m / 400)) 
            distance_matrix.append(row)
            time_matrix.append(t_row)

    matrix_km = [[int(jarak / 1000) for jarak in baris] for baris in distance_matrix]
    print("CCTV 5: Mesin VRP OR-Tools Sedang Berpikir...")
    hasil_vrp = vrp_solver.solve_vrp(matrix_km, time_matrix, demands, num_vehicles, vehicle_capacities, is_mall_list, time_windows)
    if not hasil_vrp: raise HTTPException(status_code=400, detail="Mesin VRP nyerah! Rute terlalu kompleks!")

    formatted_routes, assigned_nodes = [], set()
    today_date = datetime.datetime.now().date()
    
    rute_lama = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today_date).all()
    for rute in rute_lama: db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).delete()
    db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today_date).delete()
    
    def menit_ke_jam(menit_total): return datetime.time(hour=int((menit_total // 60) % 24), minute=int(menit_total % 60))

    active_truck_counter = 0 

    for truck_idx, route_indices in enumerate(hasil_vrp['routes']):
        if len(route_indices) <= 2: continue 

        vehicle_db = vehicles[active_truck_counter]
        driver_db = drivers[active_truck_counter] if active_truck_counter < len(drivers) else drivers[0]
        route_plan_id = f"RP-{datetime.datetime.now().strftime('%Y%m%d')}-T{active_truck_counter+1}"
        active_truck_counter += 1
        
        total_jarak_m = sum(distance_matrix[route_indices[i]][route_indices[i+1]] for i in range(len(route_indices)-1))
        real_total_km = round(total_jarak_m / 1000.0, 1)

        new_plan = models.TMSRoutePlan(route_id=route_plan_id, planning_date=today_date, vehicle_id=vehicle_db.vehicle_id, driver_id=driver_db.driver_id, total_weight=0, total_distance_km=real_total_km)
        db.add(new_plan)
        
        total_muatan, current_time_minutes, prev_node = 0, 360, 0
        manifest_rute = [] 
        
        route_geometry = []
        waypoints_str = ":".join([f"{locations[n]['lat']},{locations[n]['lon']}" for n in route_indices])
        try:
            calc_url = f"https://api.tomtom.com/routing/1/calculateRoute/{waypoints_str}/json?key={TOMTOM_API_KEY}&routeType=fastest&travelMode=truck"
            calc_res = requests.get(calc_url)
            if calc_res.status_code == 200:
                pts = calc_res.json()['routes'][0]['legs']
                for leg in pts:
                    for p in leg['points']:
                        route_geometry.append([p['latitude'], p['longitude']])
        except Exception as e: print(f"Gagal tarik garis aspal TomTom truk {truck_idx}: {e}")

        for step, node_idx in enumerate(route_indices):
            assigned_nodes.add(node_idx) 
            segment_jarak_m = distance_matrix[prev_node][node_idx] if step != 0 else 0
            segmen_km_real = round(segment_jarak_m / 1000.0, 1)

            if node_idx == 0:
                current_time_minutes += time_matrix[prev_node][node_idx] if step != 0 else 0
                prev_node = node_idx
                manifest_rute.append({
                    "urutan": step, "lokasi": "📍 GUDANG CIKUPA", "jam": str(menit_ke_jam(current_time_minutes)), 
                    "keterangan": "Start" if step == 0 else "Finish", "lat": gudang_lat, "lon": gudang_lon, "distance_from_prev_km": segmen_km_real 
                })
                continue 
                
            muatan_titik = demands[node_idx]
            total_muatan += muatan_titik
            current_time_minutes += time_matrix[prev_node][node_idx]
            
            if current_time_minutes < time_windows[node_idx][0]: current_time_minutes = time_windows[node_idx][0]
                
            durasi_bongkar = (60 if is_mall_list[node_idx] else 15) + (muatan_titik / 10.0)
            selesai_bongkar = current_time_minutes + durasi_bongkar
            prev_node = node_idx
            order = node_to_order[node_idx]
            
            new_line = models.TMSRouteLine(route_id=route_plan_id, order_id=order.order_id, sequence=step, est_arrival=menit_ke_jam(current_time_minutes), distance_from_prev_km=segmen_km_real)
            db.add(new_line)
            order.status = models.DOStatus.do_assigned_to_route
            
            manifest_rute.append({
                "urutan": step, "nomor_do": order.order_id, "nama_toko": order.customer_name, 
                "turun_barang_kg": round(muatan_titik, 2), "jam_tiba": str(menit_ke_jam(current_time_minutes)),
                "lat": float(order.latitude), "lon": float(order.longitude), "distance_from_prev_km": segmen_km_real
            })
            current_time_minutes = selesai_bongkar
            
        new_plan.total_weight = total_muatan
        
        if not preview:
            os.makedirs("route_geometries", exist_ok=True)
            with open(f"route_geometries/{route_plan_id}.json", "w") as f:
                json.dump(route_geometry, f)

        formatted_routes.append({
            "route_id": route_plan_id, "armada": vehicle_db.license_plate, 
            "total_muatan_kg": total_muatan, "total_jarak_km": real_total_km, 
            "detail_perjalanan": manifest_rute, "garis_aspal": route_geometry 
        })

    dropped_nodes_data = []
    unassigned = [node_to_order[n] for n in range(1, len(locations)) if n not in assigned_nodes]
    for o in unassigned:
        dropped_nodes_data.append({
            "nama_toko": o.customer_name, "berat_kg": o.weight_total, 
            "lat": float(o.latitude), "lon": float(o.longitude), "alasan": "Kapasitas Truk Penuh / Luar Jam Kerja"
        })

    toko_hilang = len(unassigned)
    pesan_info = "Seluruh rute berhasil dicetak ke Database." if toko_hilang == 0 else f"⚠️ {toko_hilang} Toko di-drop oleh AI (Over Capacity / Lewat Jam Kerja)!"

    if preview:
        db.rollback()
        pesan_info = "[PREVIEW MODE] " + pesan_info
    else: db.commit()

    return {"message": "FUSION VRP BERHASIL!", "jadwal_truk_internal": formatted_routes, "dropped_nodes_peta": dropped_nodes_data, "info_text": pesan_info}

# ==========================================
# 📋 ROUTE READERS & UTILITIES 
# ==========================================
@app.get("/api/routes")
def get_all_routes(date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.TMSRoutePlan)
    if date:
        try: 
            tanggal_asli = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(models.TMSRoutePlan.planning_date == tanggal_asli)
        except: pass
            
    hasil = []
    zona_dummy = ["CENGKARENG", "KELAPA GADING", "PONDOK INDAH", "BEKASI SELATAN", "DEPOK", "BOGOR", "TANGERANG"]
    
    for rute in query.all():
        lines = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).order_by(models.TMSRouteLine.sequence).all()
        detail_rute = []
        
        for l in lines:
            order_data = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == l.order_id).first()
            if order_data:
                items_list = []
                try:
                    if order_data.service_type:
                        items_list = json.loads(order_data.service_type)
                except: pass
                
                detail_rute.append({
                    "urutan": l.sequence, 
                    "nama_toko": order_data.customer_name, 
                    "latitude": float(order_data.latitude) if order_data.latitude else 0.0,
                    "longitude": float(order_data.longitude) if order_data.longitude else 0.0,
                    "berat_kg": order_data.weight_total, 
                    "jam_tiba": str(l.est_arrival),
                    "distance_from_prev_km": getattr(l, 'distance_from_prev_km', 0.0), 
                    "items": items_list
                })
                
        idx_zona = int(rute.route_id[-1]) % len(zona_dummy) if rute.route_id[-1].isdigit() else 0
        
        garis_aspal = []
        try:
            with open(f"route_geometries/{rute.route_id}.json", "r") as f:
                garis_aspal = json.load(f)
        except: pass

        hasil.append({
            "route_id": rute.route_id, 
            "tanggal": rute.planning_date.strftime("%Y-%m-%d") if rute.planning_date else "-",
            "driver_name": rute.driver.name if rute.driver else "Belum Ditentukan",
            "kendaraan": rute.vehicle.license_plate if rute.vehicle else "-", 
            "jenis": rute.vehicle.type if rute.vehicle else "-",
            "destinasi_jumlah": len(detail_rute), 
            "total_berat": rute.total_weight, 
            "total_distance_km": rute.total_distance_km,
            "status": "Menunggu",
            "zone": zona_dummy[idx_zona], 
            "detail_rute": detail_rute,
            "garis_aspal": garis_aspal 
        })
        
    unassigned = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.status == models.DOStatus.do_verified).all()
    return {
        "routes": hasil, 
        "dropped_nodes": [{"nama_toko": o.customer_name, "berat_kg": o.weight_total, "alasan": "Di-drop AI (Over Capacity / Time)"} for o in unassigned]
    }

@app.post("/api/routes/confirm")
def confirm_saved_routes(payload: dict, db: Session = Depends(get_db)):
    try:
        today_date = datetime.datetime.now().date()
        
        rute_lama = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today_date).all()
        for rute in rute_lama: 
            db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).delete()
        db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today_date).delete()

        jadwal = payload.get("jadwal_truk_internal", [])
        
        for truk in jadwal:
            vehicle = db.query(models.FleetVehicle).filter(models.FleetVehicle.license_plate == truk.get("armada")).first()
            if not vehicle: continue
            
            driver = db.query(models.HRDriver).filter(models.HRDriver.status == True).first()
            
            new_plan = models.TMSRoutePlan(
                route_id=truk["route_id"], planning_date=today_date, 
                vehicle_id=vehicle.vehicle_id, driver_id=driver.driver_id if driver else 1,
                total_weight=truk["total_muatan_kg"], total_distance_km=truk["total_jarak_km"]
            )
            db.add(new_plan)
            
            for stop in truk["detail_perjalanan"]:
                
                nomor_do_asli = stop.get("nomor_do") or stop.get("order_id") or stop.get("id_order") or stop.get("id")
                
                if not nomor_do_asli: 
                    continue 
                
                try:
                    h, m = map(int, str(stop["jam_tiba"]).split(":")[:2])
                    jam_est = datetime.time(hour=h, minute=m)
                except:
                    jam_est = datetime.time(hour=12, minute=0)

                new_line = models.TMSRouteLine(
                    route_id=truk["route_id"], 
                    order_id=nomor_do_asli, 
                    sequence=stop["urutan"], 
                    est_arrival=jam_est,
                    distance_from_prev_km=stop.get("distance_from_prev_km", 0) 
                )
                db.add(new_line)
                
                order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == nomor_do_asli).first() 
                if order: order.status = models.DOStatus.do_assigned_to_route

        db.commit() 
        return {"message": "Rute berhasil dikunci ke Database!"}
    except Exception as e:
        db.rollback()
        print(f"🔥 ERROR DB DETAIL: {str(e)}") 
        raise HTTPException(status_code=500, detail=f"Gagal Simpan DB: {str(e)}")

# ==========================================
# 📦 API 3: 3D LOAD PLANNING (EXTREME POINT LIFO)
# ==========================================
@app.get("/api/routes/{route_id}/loadplan")
def get_truck_load_plan(route_id: str, db: Session = Depends(get_db)):
    route_plan = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.route_id == route_id).first()
    if not route_plan:
        raise HTTPException(status_code=404, detail="Rute tidak ditemukan")

    vehicle = db.query(models.FleetVehicle).filter(models.FleetVehicle.vehicle_id == route_plan.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Truk tidak ditemukan")

    route_lines = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == route_id).order_by(models.TMSRouteLine.sequence.asc()).all()

    packer = Packer()
    
    truck_w = getattr(vehicle, 'box_length_cm', 400)
    truck_h = getattr(vehicle, 'box_width_cm', 200)
    truck_d = getattr(vehicle, 'box_height_cm', 200)
    packer.add_bin(Bin(vehicle.license_plate, truck_w, truck_h, truck_d, float(vehicle.capacity_kg)))

    loading_sequence = route_lines[::-1]

    for line in loading_sequence:
        if not line.order_id: continue

        order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == line.order_id).first()
        if not order: continue

        nama_toko = order.customer_name
        berat_total = float(order.weight_total)

        jml_keranjang = math.ceil(berat_total / 25.0)
        berat_per_keranjang = berat_total / jml_keranjang

        for i in range(jml_keranjang):
            nama_item = f"{nama_toko} | Box {i+1}"
            packer.add_item(Item(nama_item, 60, 40, 30, berat_per_keranjang))

    packer.pack()

    result = []
    for b in packer.bins:
        packed_items_json = []
        for item in b.items:
            packed_items_json.append({
                "item_name": item.name,
                "position_xyz": [float(item.position[0]), float(item.position[1]), float(item.position[2])],
                "dimensions_whd": [float(item.width), float(item.height), float(item.depth)],
                "rotation": item.rotation_type
            })

        result.append({
            "truck": b.name,
            "truck_dimensions": {"w": truck_w, "h": truck_h, "d": truck_d},
            "total_weight_loaded": float(b.get_total_weight()),
            "3d_layout_data": packed_items_json,
            "unfitted_items": [item.name for item in b.unfitted_items]
        })

    return {"status": "success", "data": result}


# ==========================================
# 🚛 API 4: MODULE FLEET MANAGEMENT 
# ==========================================
@app.get("/api/fleet")
def get_all_fleet(db: Session = Depends(get_db)):
    vehicles = db.query(models.FleetVehicle).all()
    today = datetime.datetime.now().date()
    
    if not vehicles:
        dummy_trucks = [
            models.FleetVehicle(license_plate="B 9044 JXS", type="Engkel Box", capacity_kg=2700, status="Available", box_length_cm=400, box_width_cm=200, box_height_cm=200),
            models.FleetVehicle(license_plate="B 9514 JXS", type="Engkel Box", capacity_kg=2700, status="Available", box_length_cm=400, box_width_cm=200, box_height_cm=200)
        ]
        db.add_all(dummy_trucks)
        db.commit()
        vehicles = db.query(models.FleetVehicle).all()

    result = []
    for v in vehicles:
        route_today = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.vehicle_id == v.vehicle_id,
            models.TMSRoutePlan.planning_date == today
        ).first()
        
        current_load = float(route_today.total_weight) if route_today else 0
        history = [] 

        result.append({
            "id": str(v.vehicle_id),
            "plateNumber": v.license_plate,
            "model": v.type,
            "capacity": float(v.capacity_kg),
            "currentLoad": current_load,
            "kmAwalHariIni": 15000, 
            "kmAkhirHariIni": None, 
            "status": getattr(v, 'status', 'Available'),
            "is_internal": True, 
            "history": history
        })
        
    return result

class OnCallRequest(BaseModel):
    plate_number: str
    vehicle_type: str
    capacity_kg: int

@app.post("/api/fleet/oncall")
def add_on_call_fleet(data: OnCallRequest, db: Session = Depends(get_db)):
    cek_truk = db.query(models.FleetVehicle).filter(models.FleetVehicle.license_plate == data.plate_number).first()
    if cek_truk:
        raise HTTPException(status_code=400, detail="Plat nomor sudah terdaftar!")
        
    new_truck = models.FleetVehicle(
        license_plate=data.plate_number,
        type=data.vehicle_type,
        capacity_kg=data.capacity_kg,
        status="Available"
    )
    db.add(new_truck)
    db.commit()
    return {"message": "Armada On-Call berhasil ditambahkan"}

@app.put("/api/fleet/{truck_id}/status")
def update_truck_status(truck_id: int, status: str, db: Session = Depends(get_db)):
    truck = db.query(models.FleetVehicle).filter(models.FleetVehicle.vehicle_id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truk tidak ditemukan")
        
    try:
        truck.status = status
        db.commit()
        return {"message": f"Status diubah jadi {status}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Kolom status belum ada di Database lu!")

class FuelLogRequest(BaseModel):
    km_awal: int
    km_akhir: int
    liters: float
    cost_rp: int
    station_name: str

@app.post("/api/fleet/{truck_id}/fuel")
def add_fuel_log(truck_id: int, data: FuelLogRequest, db: Session = Depends(get_db)):
    print(f"BENSIN DICATAT UNTUK TRUK {truck_id}: {data.liters} LITER DI {data.station_name}")
    return {"message": "Data bensin berhasil dicatat"}

# ==========================================
# 📊 API 5: MODULE ANALYTICS & DASHBOARD (MANAGER)
# ==========================================

@app.get("/api/analytics/kpi-summary")
def get_kpi_summary(period: str = "today", db: Session = Depends(get_db)):
    today = datetime.datetime.now().date()
    
    # 🌟 MESIN WAKTU: Mundurin tanggal sesuai filter
    if period == "7days":
        start_date = today - datetime.timedelta(days=7)
    elif period == "30days":
        start_date = today - datetime.timedelta(days=30)
    else:
        start_date = today
        
    # 1. Total Shipments (Dalam rentang waktu)
    total_do = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan, models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= today,
        models.TMSRouteLine.sequence > 0 
    ).count()

    # 2. Total KG Pesanan
    rute_berjalan = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= today
    ).all()
    total_berat_kg = sum(rute.total_weight for rute in rute_berjalan)
    
    # 3. Load Factor
    total_truk_punya = db.query(models.FleetVehicle).count() or 1
    hari_aktif = 1 if period == "today" else (7 if period == "7days" else 30)
    truk_jalan = len(rute_berjalan)
    
    kapasitas_max_trip = total_truk_punya * hari_aktif
    load_factor_persen = round((truk_jalan / kapasitas_max_trip) * 100, 1) if kapasitas_max_trip > 0 else 0
    if load_factor_persen > 100: load_factor_persen = 100

    # 🌟 Format Ganda: Support Dashboard Admin (Bawah) & Analytics Manager (Atas)
    return {
        "status": "success",
        "data": {
            "totalShipments": total_do,
            "otifRate": "94.2%", 
            "loadFactor": f"{load_factor_persen}%",
            "avgLoadingTime": f"{round(total_berat_kg, 1)} KG" # Diganti jadi berat sesuai sepakat
        },
        # Legacy support buat Dashboard
        "total_deliveries_today": total_do,
        "success_rate_percent": 94.2, 
        "load_factor_percent": load_factor_persen,
        "total_weight_kg": round(total_berat_kg, 1),
        "active_fleet_count": truk_jalan
    }

# ==========================================
# 👨‍✈️ API 6: MODULE DRIVER PERFORMANCE
# ==========================================
@app.get("/api/analytics/driver-performance") # 🌟 URL Khusus Analytics
@app.get("/api/drivers/performance")
def get_all_driver_performance(period: str = "today", db: Session = Depends(get_db)):
    today = datetime.datetime.now().date()
    if period == "7days": start_date = today - datetime.timedelta(days=7)
    elif period == "30days": start_date = today - datetime.timedelta(days=30)
    else: start_date = today
    
    drivers = db.query(models.HRDriver).all()
    hasil = []
    
    for d in drivers:
        rute_driver = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.driver_id == d.driver_id,
            models.TMSRoutePlan.planning_date >= start_date,
            models.TMSRoutePlan.planning_date <= today
        ).all()

        total_trip = len(rute_driver)
        total_do = 0
        jarak_total = 0

        for rute in rute_driver:
            jarak_total += float(rute.total_distance_km)
            garis_rute = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.route_id == rute.route_id).count() - 1
            if garis_rute > 0: total_do += garis_rute

        status_kerja = "On Route" if period == "today" and total_trip > 0 else "Offline"
        sukses_do = int(total_do * 0.8) 
        on_time = 95 if total_trip > 0 else 0
        
        # 🌟 Klasifikasi BBM Dummy Berdasarkan Jarak
        bensin = "A" if jarak_total < 100 else ("B" if jarak_total < 300 else "C")
        if total_trip == 0: bensin = "-"

        hasil.append({
            # Format Analytics Manager
            "driver_name": d.name,
            "total_trips": total_do,
            "on_time_rate": on_time,
            "fuel_rating": bensin,
            
            # Format Dashboard Admin
            "id": f"DRV-{d.driver_id:03d}",
            "name": d.name,
            "avatar": f"https://ui-avatars.com/api/?name={d.name.replace(' ', '+')}&background=0D8ABC&color=fff",
            "status": status_kerja,
            "score": 90 if total_trip > 0 else 0,
            "ontime": f"{on_time}%",
            "doSuccess": f"{sukses_do}",
            "truck": "-", 
            "distanceToday": round(jarak_total, 1),
            "doCompleted": sukses_do,
            "doTotal": total_do,
            "lastLocation": "📍 Depo",
            "lastUpdate": "Baru saja"
        })
        
    return {"status": "success", "data": hasil}

# ==========================================
# 📍 API 7: LIVE FLEET TRACKING (UNTUK MAP DASHBOARD)
# ==========================================
@app.get("/api/dashboard/live-tracking")
def get_live_tracking(db: Session = Depends(get_db)):
    today = datetime.datetime.now().date()
    
    # Ambil rute-rute yang jalan hari ini
    rute_hari_ini = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date == today
    ).all()
    
    live_trucks = []
    
    # Kalau belum ada rute hari ini, kasih dummy dulu biar Map-nya ngga kosong melompong
    if not rute_hari_ini:
        return {
            "status": "success", 
            "data": [
                { "id": "B 9044 JXS", "driver": "Budi Santoso", "lat": -6.228222, "lon": 106.828697, "status": "Menuju Titik Pertama", "isDelayed": False },
                { "id": "B 9514 JXS", "driver": "Joko Widodo", "lat": -6.250000, "lon": 106.700000, "status": "Istirahat", "isDelayed": False }
            ]
        }
        
    for rute in rute_hari_ini:
        truk = db.query(models.FleetVehicle).filter(models.FleetVehicle.vehicle_id == rute.vehicle_id).first()
        supir = db.query(models.HRDriver).filter(models.HRDriver.driver_id == rute.driver_id).first()
        
        # Ambil titik tujuan pertama dari garis rute (sequence 1, karena 0 itu gudang)
        titik_tujuan = db.query(models.TMSRouteLine).filter(
            models.TMSRouteLine.route_id == rute.route_id,
            models.TMSRouteLine.sequence == 1
        ).first()
        
        lokasi_lat = -6.207356 # Default Gudang
        lokasi_lon = 106.479163
        status_teks = "Standby di Gudang"
        
        if titik_tujuan:
            do_tujuan = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == titik_tujuan.order_id).first()
            if do_tujuan:
                # Simulasikan posisi truk di tengah jalan (geser dikit dari tujuan biar keliatan jalan)
                lokasi_lat = float(do_tujuan.latitude) + 0.005 
                lokasi_lon = float(do_tujuan.longitude) - 0.005
                status_teks = f"Menuju: {do_tujuan.customer_name}"

        live_trucks.append({
            "id": truk.license_plate if truk else "Truk Unknown",
            "driver": supir.name if supir else "Supir Unknown",
            "lat": lokasi_lat,
            "lon": lokasi_lon,
            "status": status_teks,
            "isDelayed": False # Nanti ini disambungin ke status keterlambatan aslinya
        })
        
    return {"status": "success", "data": live_trucks}

# ==========================================
# 📊 API 8: WIDGET DASHBOARD (HOURLY VOLUME & FLEET UTILIZATION)
# ==========================================

@app.get("/api/analytics/delivery-volume") # 🌟 URL Khusus Analytics
@app.get("/api/dashboard/hourly-volume")
def get_hourly_volume(period: str = "today", db: Session = Depends(get_db)):
    today = datetime.datetime.now().date()
    if period == "7days": start_date = today - datetime.timedelta(days=7)
    elif period == "30days": start_date = today - datetime.timedelta(days=30)
    else: start_date = today
    
    lines = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan, models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= today,
        models.TMSRouteLine.sequence > 0 
    ).all()

    buckets = {"08:00": 0, "10:00": 0, "12:00": 0, "14:00": 0, "16:00": 0, "18:00": 0, "20:00": 0}
    
    for l in lines:
        if l.est_arrival:
            hour = l.est_arrival.hour
            if hour < 10: buckets["08:00"] += 1
            elif hour < 12: buckets["10:00"] += 1
            elif hour < 14: buckets["12:00"] += 1
            elif hour < 16: buckets["14:00"] += 1
            elif hour < 18: buckets["16:00"] += 1
            elif hour < 20: buckets["18:00"] += 1
            else: buckets["20:00"] += 1

    # 🌟 Format Ganda (time/count buat admin, hour/orders buat analytics)
    data = [{"time": k, "count": v, "hour": k, "orders": v} for k, v in buckets.items()]
    max_count = max([v for v in buckets.values()] + [1]) 
    
    return {"status": "success", "data": data, "max": max_count}

@app.get("/api/analytics/fleet-utilization") # 🌟 URL Khusus Analytics
@app.get("/api/dashboard/fleet-utilization")
def get_fleet_utilization(period: str = "today", db: Session = Depends(get_db)):
    today = datetime.datetime.now().date()
    if period == "7days": start_date = today - datetime.timedelta(days=7)
    elif period == "30days": start_date = today - datetime.timedelta(days=30)
    else: start_date = today
    
    total_truk = db.query(models.FleetVehicle).count() or 1
    hari_aktif = 1 if period == "today" else (7 if period == "7days" else 30)
    
    # Hitung total perjalanan selama periode
    total_rute = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= today
    ).count()
    
    # Rata-rata truk jalan per hari
    avg_active = int(total_rute / hari_aktif)
    utilization_rate = int((avg_active / total_truk) * 100)
    if utilization_rate > 100: utilization_rate = 100
    
    return {
        "status": "success",
        "data": {
            "totalTrucks": total_truk,
            "activeTrucks": avg_active,
            "utilizationRate": f"{utilization_rate}%"
        },
        # Legacy support
        "active_trucks": avg_active,
        "total_trucks": total_truk,
        "utilization_rate": utilization_rate
    }

# ==========================================
# 🚨 API 9: REAL-TIME ALERTS & REJECTIONS (LAPIS 3 DASHBOARD)
# ==========================================

@app.get("/api/dashboard/rejections")
def get_rejection_reasons(db: Session = Depends(get_db)):
    # 🌟 SEMENTARA: Kita tembak data ini dari backend. 
    # Nanti kalau fitur E-POD supir udah jadi, angka ini ngitung otomatis dari tb_do_returns
    return {
        "status": "success",
        "data": [
            {"reason": "Damaged Goods", "percentage": 60, "color": "bg-red-500"},
            {"reason": "Wrong Item", "percentage": 25, "color": "bg-orange-400"},
            {"reason": "Customer Not Home", "percentage": 15, "color": "bg-slate-400"}
        ]
    }

@app.get("/api/dashboard/alerts")
def get_realtime_alerts(db: Session = Depends(get_db)):
    today = datetime.datetime.now().date()
    
    # Ambil Waktu Sekarang (Dalam Menit) buat dicocokin sama Estimasi AI
    sekarang = datetime.datetime.now().time()
    menit_sekarang = sekarang.hour * 60 + sekarang.minute
    
    alerts = []
    
    # 1. 🕵️‍♂️ SATPAM KETERLAMBATAN (System-Based Delay)
    rute_hari_ini = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).all()
    
    for rute in rute_hari_ini:
        # Intip toko pertama/selanjutnya dari truk ini
        next_stop = db.query(models.TMSRouteLine).filter(
            models.TMSRouteLine.route_id == rute.route_id,
            models.TMSRouteLine.sequence == 1 # Cek destinasi pertama dulu
        ).first()
        
        if next_stop and next_stop.est_arrival:
            est_menit = next_stop.est_arrival.hour * 60 + next_stop.est_arrival.minute
            
            # Cari tau plat nomor truknya
            truk = db.query(models.FleetVehicle).filter(models.FleetVehicle.vehicle_id == rute.vehicle_id).first()
            plat = truk.license_plate if truk else "Truk Unknown"
            
            # LOGIKA DETEKTIF: Kalau waktu sekarang udah lewat dari estimasi + 30 menit (Toleransi Macet)
            delay = menit_sekarang - est_menit
            if delay > 30:
                alerts.append({
                    "title": f"{plat} Delayed",
                    "desc": f"Terdeteksi potensi macet/keterlambatan! Delay +{delay} menit dari jadwal AI.",
                    "time": "Live",
                    "icon": "warning",
                    "iconColor": "text-orange-500",
                    "bgColor": "bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500"
                })
    
    # 2. 🌟 KONDISI AMAN (Kalau ngga ada truk yang telat)
    if not alerts:
        alerts.append({
            "title": "OTIF Target Aman",
            "desc": "Seluruh armada saat ini berjalan sesuai dengan estimasi waktu AI VRP.",
            "time": "Live",
            "icon": "check_circle",
            "iconColor": "text-green-500",
            "bgColor": "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
        })
        
    # 3. 🤖 INFO SISTEM
    alerts.append({
        "title": "Sistem AI Aktif",
        "desc": "Server Backend & Algoritma OR-Tools berjalan normal.",
        "time": "System",
        "icon": "memory",
        "iconColor": "text-blue-500",
        "bgColor": "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
    })

    return {"status": "success", "data": alerts}

# ==========================================
# ⚙️ API 10: SYSTEM SETTINGS (KONFIGURASI GLOBAL)
# ==========================================
from pydantic import BaseModel
from typing import Optional

# 1. Bikin "Keranjang" (Schema) buat nangkep data dari React
class SystemSettingsUpdate(BaseModel):
    vrp_start_time: str
    vrp_end_time: str
    vrp_base_drop_time_mins: int
    vrp_var_drop_time_mins: int
    vrp_capacity_buffer_percent: int
    
    cost_fuel_per_liter: float
    cost_avg_km_per_liter: float
    cost_driver_salary: float
    cost_overtime_rate: float
    depo_lat: float
    depo_lon: float
    
    api_tomtom_key: str
    api_gps_webhook: Optional[str] = None
    api_temp_sensor: Optional[str] = None
    sync_interval_sec: int
    
    alert_max_temp_celsius: float
    alert_delay_mins: int

# 2. JALUR BACA: Ngambil data konfigurasi ke React
@app.get("/api/settings")
def get_system_settings(db: Session = Depends(get_db)):
    # Cari konfigurasi di laci database (Cuma ada 1 baris)
    settings = db.query(models.SystemSettings).first()
    
    # Kalau ternyata lacinya masih kosong (baru pertama kali jalan)
    # CTO lu suruh Python bikinin data default otomatis!
    if not settings:
        settings = models.SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return {"status": "success", "data": settings}

# 3. JALUR TULIS: Nyimpen perubahan dari React ke Database
@app.put("/api/settings")
def update_system_settings(data: SystemSettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(models.SystemSettings).first()
    
    if not settings:
        settings = models.SystemSettings()
        db.add(settings)

    # Update semua isi database pake data baru dari manajer lu
    for key, value in data.dict().items():
        setattr(settings, key, value)

    db.commit()
    return {"status": "success", "message": "Konfigurasi sistem berhasil diperbarui!"}