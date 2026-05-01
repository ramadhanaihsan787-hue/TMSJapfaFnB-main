# routers/orders.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
import pandas as pd
import json
import time
import re

import models
import schemas # 🌟 SUNTIKAN PYDANTIC KITA!
from dependencies import get_db, get_settings, get_current_user, require_role
from utils.helpers import time_str_to_minutes

router = APIRouter(prefix="/api", tags=["Orders & Delivery"])

class TimeUpdateRequest(BaseModel):
    jam_maksimal: str  

class CoordinateUpdateRequest(BaseModel):
    latitude: float
    longitude: float
    kode_customer: str
    nama_customer: str

def parse_time_window(keterangan: str, default_start: int, default_end: int):
    if not keterangan:
        return default_start, default_end, False

    text = str(keterangan).strip().upper()

    if "DIAMBIL CUST" in text:
        return None, None, False

    window_start = default_start
    window_end   = default_end
    priority_first = False

    if "PERTAMA" in text or "FIRST" in text:
        priority_first = True

    match_hhmm = re.search(r'\b([0-2]?\d):([0-5]\d)\b', text)
    if match_hhmm:
        hour   = int(match_hhmm.group(1))
        minute = int(match_hhmm.group(2))
        if 6 <= hour <= 20:
            window_end = hour * 60 + minute
            return window_start, window_end, priority_first

    match_hour = re.search(r'\b([0-2]?\d)\b', text)
    if match_hour:
        hour = int(match_hour.group(1))
        if 6 <= hour <= 20:
            window_end = hour * 60
            return window_start, window_end, priority_first

    if "PAGI" in text:
        window_end = 600
    elif "SIANG" in text:
        window_end = 720
    elif "SORE" in text:
        window_end = 900

    return window_start, window_end, priority_first


# 🌟 SUNTIKAN RESPONSE_MODEL
@router.post("/orders/upload", response_model=schemas.UploadResponse)
async def upload_sap_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    contents = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal baca file: {str(e)}")

    df.columns = df.columns.str.upper().str.strip()
    df = df.dropna(how='all')

    col_nama = 'NAMA CUSTOMER' if 'NAMA CUSTOMER' in df.columns else df.columns[2]
    col_kode = 'KODE CUST.' if 'KODE CUST.' in df.columns else df.columns[12]
    col_desc = 'VALIDASI' if 'VALIDASI' in df.columns else df.columns[4]
    col_qty  = 'QTY' if 'QTY' in df.columns else df.columns[7]
    col_ket  = 'KETERANGAN' if 'KETERANGAN' in df.columns else df.columns[11]

    for col in ['LATITUDE', 'LONGITUDE']:
        if col not in df.columns:
            df[col] = None

    df = df.dropna(subset=[col_desc])

    settings = get_settings()
    default_start = time_str_to_minutes(settings.vrp_start_time)
    default_end   = time_str_to_minutes(settings.vrp_end_time)  

    db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.status.in_([
            models.DOStatus.so_waiting_verification,
            models.DOStatus.do_verified
        ])
    ).delete(synchronize_session=False)

    df[col_nama] = df[col_nama].ffill()
    df[col_kode] = df[col_kode].ffill()

    orders_dict = {}
    for _, row in df.iterrows():
        kode_cust_val = row.get(col_kode)
        if pd.isna(kode_cust_val) or str(kode_cust_val).strip() == '':
            continue

        keterangan_teks = str(row.get(col_ket, '')).strip().upper()
        window_start, window_end, priority_first = parse_time_window(keterangan_teks, default_start, default_end)

        if window_start is None:
            continue

        kode_cust = str(kode_cust_val).split('.')[0]
        nama_toko = str(row.get(col_nama, 'Unknown')).strip()
        cust_key  = f"{kode_cust}_{nama_toko}"

        if cust_key not in orders_dict:
            orders_dict[cust_key] = {
                "kode": kode_cust, "nama": nama_toko, "lat": None, "lon": None,
                "berat": 0.0, "items": [], "tw_start": window_start, "tw_end": window_end
            }

        lat_val = row.get('LATITUDE')
        lon_val = row.get('LONGITUDE')
        qty_val = row.get(col_qty)
        desc_val = row.get(col_desc)

        if pd.notna(lat_val) and str(lat_val).strip() not in ['-', 'LATITUDE']:
            try:
                orders_dict[cust_key]["lat"] = float(str(lat_val).replace(',', '.'))
                orders_dict[cust_key]["lon"] = float(str(lon_val).replace(',', '.'))
            except: pass

        if orders_dict[cust_key]["lat"] is None:
            master = db.query(models.MasterCustomer).filter(models.MasterCustomer.kode_customer == kode_cust).first()
            if master and master.latitude and master.longitude:
                orders_dict[cust_key]["lat"] = float(master.latitude)
                orders_dict[cust_key]["lon"] = float(master.longitude)

        if pd.notna(qty_val):
            try:
                str_qty = str(qty_val).replace(',', '.')
                if str_qty.count('.') > 1:
                    str_qty = str_qty.replace('.', '', str_qty.count('.') - 1)
                q = float(str_qty)
                if q > 0:
                    orders_dict[cust_key]["items"].append({"nama_barang": str(desc_val) if pd.notna(desc_val) else "Item SAP", "qty": f"{q} KG"})
                    orders_dict[cust_key]["berat"] += q
            except: pass

    success_list, failed_list, count = [], [], 0

    for cust_key, data in orders_dict.items():
        if data["berat"] <= 0: continue
        menit_ke_jamstr = lambda m: f"{m // 60:02d}:{m % 60:02d}"

        if data["lat"] and data["lon"]:
            new_do = models.DeliveryOrder(
                order_id=f"DO-{data['kode']}-{int(time.time())}-{count}",
                customer_name=data['nama'], latitude=data['lat'], longitude=data['lon'],
                weight_total=data['berat'], service_type=json.dumps(data['items']),
                delivery_window_start=data['tw_start'], delivery_window_end=data['tw_end'],
                status=models.DOStatus.do_verified
            )
            db.add(new_do)
            count += 1
            success_list.append({
                "order_id": new_do.order_id, "kode_customer": data['kode'], "nama_toko": data['nama'],
                "berat": round(data['berat'], 2), "kordinat": f"{data['lat']}, {data['lon']}",
                "jam_maks": menit_ke_jamstr(data['tw_end']), "items": data['items']
            })
        else:
            failed_list.append({
                "kode_customer": data['kode'], "nama_toko": data['nama'], "berat": round(data['berat'], 2),
                "items": data['items'], "jam_maks": menit_ke_jamstr(data['tw_end']), "alasan": "Koordinat GPS Kosong / Format Salah"
            })

    db.commit()
    return {"message": f"Upload selesai! {count} DO berhasil, {len(failed_list)} gagal.", "success_list": success_list, "failed_list": failed_list}

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.put("/orders/{order_id}/time", response_model=schemas.OrderActionResponse)
def update_time_window(
    order_id: str, data: TimeUpdateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == order_id).first()
    if not order: raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    try:
        if not data.jam_maksimal: order.delivery_window_end = 1200 
        else:
            h, m = map(int, data.jam_maksimal.split(":"))
            order.delivery_window_end = (h * 60) + m
        db.commit()
        return {"message": f"Batas waktu {order.customer_name} diubah ke {data.jam_maksimal}", "order_id": order_id, "new_window_end": order.delivery_window_end}
    except Exception: raise HTTPException(status_code=400, detail="Format jam salah! Gunakan HH:MM")

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.put("/orders/{order_id}/coordinate", response_model=schemas.OrderActionResponse)
def update_coordinate(
    order_id: str, data: CoordinateUpdateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    def upsert_master_customer(kode: str, nama: str, lat: float, lon: float):
        master = db.query(models.MasterCustomer).filter(models.MasterCustomer.kode_customer == kode).first()
        if master: master.latitude, master.longitude = lat, lon
        else: db.add(models.MasterCustomer(kode_customer=kode, store_name=nama, latitude=lat, longitude=lon))

    if order_id.startswith("DRAFT-"):
        upsert_master_customer(data.kode_customer, data.nama_customer, data.latitude, data.longitude)
        db.commit()
        return {"message": "Koordinat DRAFT berhasil disimpan ke Master Database!", "order_id": order_id}

    order = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.order_id == order_id).first()
    if not order: raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    order.latitude, order.longitude, order.status = data.latitude, data.longitude, models.DOStatus.do_verified
    upsert_master_customer(data.kode_customer, data.nama_customer, data.latitude, data.longitude)
    db.commit()
    return {"message": "Koordinat berhasil diupdate dan disimpan ke Master Database!", "order_id": order_id}

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.get("/orders", response_model=schemas.PendingOrderResponse)
def get_pending_orders(status: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.DeliveryOrder)
    if status:
        try: query = query.filter(models.DeliveryOrder.status == models.DOStatus(status))
        except ValueError: pass

    orders = query.all()
    return {
        "status": "success", "total": len(orders),
        "data": [{
            "order_id": o.order_id, "customer_name": o.customer_name, "latitude": float(o.latitude) if o.latitude else None,
            "longitude": float(o.longitude) if o.longitude else None, "weight_total": o.weight_total,
            "delivery_window_start": o.delivery_window_start, "delivery_window_end": o.delivery_window_end,
            "status": o.status.value, "items": json.loads(o.service_type) if o.service_type and o.service_type.startswith('[') else []
        } for o in orders]
    }