# routers/driver.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import date, datetime
import os
import shutil
import uuid

import models
import schemas # 🌟 SUNTIKAN PERTAMA: Import Kamus Pydantic Kita!
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/driver", tags=["Driver App"])

UPLOAD_DIR = "static/uploads/epod"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==========================================
# 1. AMBIL RUTE TUGAS SAYA (MY ROUTE)
# 🌟 SUNTIKAN KEDUA: response_model=schemas.DriverTripResponse
# ==========================================
@router.get("/my-route", response_model=schemas.DriverTripResponse)
def get_my_route(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    driver = db.query(models.HRDriver).filter(models.HRDriver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Profil supir tidak ditemukan di database HR!")

    today = date.today()
    plan = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.driver_id == driver.driver_id,
        models.TMSRoutePlan.planning_date == today
    ).first()

    if not plan:
        return {
            "truck_id": "-",
            "driver_name": driver.name,
            "total_stops": 0,
            "completed_stops": 0,
            "total_distance": 0,
            "stops": []
        }

    stops_data = []
    completed_count = 0
    
    lines = db.query(models.TMSRouteLine).filter(
        models.TMSRouteLine.route_id == plan.route_id
    ).order_by(models.TMSRouteLine.sequence).all()

    for line in lines:
        order = line.order
        status_fe = "pending"
        if order.status in [models.DOStatus.delivered_success, models.DOStatus.delivered_partial]:
            status_fe = "completed"
            completed_count += 1
        elif order.status == models.DOStatus.do_assigned_to_route:
            status_fe = "active" if line.sequence == 1 else "pending"

        stops_data.append({
            "id": line.line_id,
            "sequence": line.sequence,
            "customerName": order.customer_name,
            "address": order.customer.address if order.customer else "Alamat tidak tersedia",
            "timeWindow": f"{line.est_arrival.strftime('%H:%M')} WIB" if line.est_arrival else "-",
            "weight": f"{order.weight_total} KG",
            "status": status_fe,
            "latitude": float(order.latitude) if order.latitude else 0.0,
            "longitude": float(order.longitude) if order.longitude else 0.0
        })

    return {
        "truck_id": plan.vehicle.license_plate if plan.vehicle else "B ???? JAPFA",
        "driver_name": driver.name,
        "total_stops": len(stops_data),
        "completed_stops": completed_count,
        "total_distance": float(plan.total_distance_km) if plan.total_distance_km else 0.0,
        "stops": stops_data
    }

# ==========================================
# 2. UPDATE STATUS STOP (SAYA SUDAH TIBA)
# 🌟 SUNTIKAN KETIGA: response_model=schemas.GenericResponse
# ==========================================
@router.post("/stops/{line_id}/status", response_model=schemas.GenericResponse)
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
# 3. SUBMIT E-POD (SECURE UPLOAD + VALIDATION)
# ==========================================
# Konfigurasi Satpam Upload
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

@router.post("/stops/{line_id}/epod", response_model=schemas.EpodResponse)
async def submit_epod(
    line_id: int,
    file: UploadFile = File(...),
    has_return: str = Form("false"), 
    return_product: str = Form(""),
    return_qty: float = Form(0.0),
    return_reason: str = Form(""),
    db: Session = Depends(get_db)
):
    # 🛡️ SATPAM 1: Cek MIME Type (Apakah beneran gambar?)
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Format file ditolak! Hanya boleh upload gambar (JPG, PNG, WEBP).")

    # 🛡️ SATPAM 2: Cek Ukuran File
    file_content = await file.read() # Baca isi file ke memory sementara
    if len(file_content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"Ukuran foto terlalu besar! Maksimal {MAX_FILE_SIZE_MB}MB.")
    
    try:
        line = db.query(models.TMSRouteLine).filter(models.TMSRouteLine.line_id == line_id).first()
        if not line:
            raise HTTPException(status_code=404, detail="Data rute tidak ditemukan!")

        total_order_kg = line.order.weight_total or 0.0
        is_return = has_return.lower() == 'true'

        qty_delivered = total_order_kg
        qty_returned = 0.0
        qty_damaged = 0.0
        final_status = models.DOStatus.delivered_success
        driver_note = ""

        if is_return and return_qty > 0:
            qty_delivered = max(0.0, total_order_kg - return_qty)
            qty_returned = return_qty
            final_status = models.DOStatus.delivered_partial
            
            if return_product:
                driver_note = f"Produk Retur: {return_product}"

            if return_reason in ["Barang Rusak", "Packaging Bocor", "Kadaluarsa"]:
                qty_damaged = return_qty

        # 🛡️ SATPAM 1 (Lanjutan): Double Check Ekstensi
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in ["jpg", "jpeg", "png", "webp"]:
             raise HTTPException(status_code=400, detail="Ekstensi file mencurigakan!")

        filename = f"POD_{line.order_id}_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # 💾 Tulis byte yang udah dibaca tadi ke dalam disk
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

        new_pod = models.TMSEpodHistory(
            line_id=line_id,
            status=final_status,
            timestamp=datetime.now(),
            photo_url=f"/static/uploads/epod/{filename}",
            gps_location_lat=line.order.latitude,
            gps_location_lon=line.order.longitude,
            qty_delivered=qty_delivered,
            qty_return=qty_returned,
            qty_damaged=qty_damaged,
            return_reason=return_reason if is_return else None,
            driver_notes=driver_note if is_return else None
        )
        db.add(new_pod)
        line.order.status = final_status
        db.commit()
        
        return {
            "status": "success", 
            "url": new_pod.photo_url,
            "message": "POD berhasil diunggah dengan data retur!" if is_return else "POD berhasil diunggah!"
        }

    except HTTPException:
        # Biarkan pesan error spesifik (400/404) lolos ke client
        raise
    except Exception as e:
        # 🛡️ SATPAM 3: Anti-bocor exception!
        db.rollback()
        logger.error(f"🚨 [UPLOAD EPOD] Error di line_id {line_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Terjadi kesalahan internal saat menyimpan POD. Silakan hubungi admin.")