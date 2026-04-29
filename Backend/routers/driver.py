# routers/driver.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import date, datetime
import os
import shutil
import uuid

import models
# 🌟 IMPORT GET_DB DARI PUSAT KOMANDO!
from dependencies import get_db, get_current_user

# Prefix kita buat /api/driver biar sinkron sama useDriverappFlow.ts di Frontend
router = APIRouter(prefix="/api/driver", tags=["Driver App"])

# Lokasi penyimpanan foto lokal (Local Storage)
UPLOAD_DIR = "static/uploads/epod"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==========================================
# 🌟 1. AMBIL RUTE TUGAS SAYA (MY ROUTE)
# ==========================================
@router.get("/my-route")
def get_my_route(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Cari profile supir berdasarkan User ID yang sedang login
    driver = db.query(models.HRDriver).filter(models.HRDriver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Profil supir tidak ditemukan di database HR!")

    # Cari rencana rute hari ini untuk supir ini
    today = date.today()
    plan = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.driver_id == driver.driver_id,
        models.TMSRoutePlan.planning_date == today
    ).first()

    # Kalau belum ada rute hari ini, balikin data kosong yang rapi (biar UI ngga crash)
    if not plan:
        return {
            "truck_id": "-",
            "driver_name": driver.name,
            "total_stops": 0,
            "completed_stops": 0,
            "total_distance": 0,
            "stops": []
        }

    # Ambil semua titik pemberhentian (stops) dan urutkan sesuai sequence
    stops_data = []
    completed_count = 0
    
    lines = db.query(models.TMSRouteLine).filter(
        models.TMSRouteLine.route_id == plan.route_id
    ).order_by(models.TMSRouteLine.sequence).all()

    for line in lines:
        order = line.order
        # Translasi Status dari DB (Enum) ke format yang dimau Frontend (String)
        status_fe = "pending"
        if order.status == models.DOStatus.delivered_success:
            status_fe = "completed"
            completed_count += 1
        elif order.status == models.DOStatus.do_assigned_to_route:
            # Jika sequence 1, kita anggap dia yang aktif duluan
            status_fe = "active" if line.sequence == 1 else "pending"

        stops_data.append({
            "id": line.line_id,
            "sequence": line.sequence,
            "customerName": order.customer_name,
            "address": order.customer.address if order.customer else "Alamat tidak tersedia",
            "timeWindow": f"{line.est_arrival.strftime('%H:%M')} WIB" if line.est_arrival else "-",
            "weight": f"{order.weight_total} KG",
            "status": status_fe,
            "latitude": float(order.latitude) if order.latitude else 0,
            "longitude": float(order.longitude) if order.longitude else 0
        })

    return {
        "truck_id": plan.vehicle.license_plate if plan.vehicle else "B ???? JAPFA",
        "driver_name": driver.name,
        "total_stops": len(stops_data),
        "completed_stops": completed_count,
        "total_distance": plan.total_distance_km or 0,
        "stops": stops_data
    }

# ==========================================
# 🌟 2. UPDATE STATUS STOP (SAYA SUDAH TIBA)
# ==========================================
@router.post("/stops/{line_id}/status")
def update_stop_status(
    line_id: int,
    payload: dict,
    db: Session = Depends(get_db)
):
    line = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.line_id == line_id).first()
    if not line:
        raise HTTPException(status_code=404, detail="ID rute tidak valid!")
    
    db.commit()
    return {"status": "success", "message": f"Status rute {line_id} berhasil diupdate."}

# ==========================================
# 🌟 3. SUBMIT E-POD (UPLOAD FOTO BUKTI)
# ==========================================
@router.post("/stops/{line_id}/epod")
async def submit_epod(
    line_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Cek validitas rute
    line = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.line_id == line_id).first()
    if not line:
        raise HTTPException(status_code=404, detail="Data rute tidak ditemukan!")

    # 2. Proses Simpan Foto ke Folder static/uploads/epod
    file_ext = file.filename.split(".")[-1]
    # Bikin nama file unik pake UUID biar ngga bentrok
    filename = f"POD_{line.order_id}_{uuid.uuid4().hex}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Simpan record di tabel tms_epod_history
    new_pod = models.TMSEpodHistory(
        line_id=line_id,
        status=models.DOStatus.delivered_success,
        timestamp=datetime.now(),
        photo_url=f"/static/uploads/epod/{filename}",
        gps_location_lat=line.order.latitude,
        gps_location_lon=line.order.longitude
    )
    db.add(new_pod)

    # 4. Update status Delivery Order menjadi SUCCESS
    line.order.status = models.DOStatus.delivered_success
    
    db.commit()
    return {"status": "success", "url": new_pod.photo_url}