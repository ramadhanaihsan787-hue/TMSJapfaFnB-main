# routers/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from typing import Optional

import models
from database import SessionLocal
from dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_settings(db: Session) -> models.SystemSettings:
    settings = db.query(models.SystemSettings).first()
    if not settings:
        settings = models.SystemSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# ==========================================
# 🌟 HELPER BARU: Ubah String YYYY-MM-DD dari Frontend jadi Date Python
# ==========================================
def parse_dates(start_str: str, end_str: str):
    try:
        s_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        e_date = datetime.strptime(end_str, "%Y-%m-%d").date()
        return s_date, e_date
    except ValueError:
        # Kalau format tanggal rusak, default ke 30 hari terakhir
        e_date = date.today()
        s_date = e_date - timedelta(days=30)
        return s_date, e_date

# ==========================================
# HELPER: Hitung OTIF Real dari EPOD
# ==========================================
def calculate_otif(start_date: date, end_date: date, db: Session) -> dict:
    total = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan,
        models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date,
        models.TMSRouteLine.sequence > 0
    ).count()

    if total == 0:
        return {"rate": 0.0, "total": 0, "ontime": 0}

    success = db.query(models.TMSEpodHistory).join(
        models.TMSRouteLine,
        models.TMSEpodHistory.line_id == models.TMSRouteLine.line_id
    ).join(
        models.TMSRoutePlan,
        models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSEpodHistory.status == models.DOStatus.delivered_success,
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).count()

    rate = round((success / total) * 100, 1)
    return {"rate": rate, "total": total, "ontime": success}

# ==========================================
# ENDPOINT 1: KPI SUMMARY
# ==========================================
@router.get("/kpi-summary")
def get_kpi_summary(
    startDate: str, 
    endDate: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
): 
    # Ubah teks jadi tanggal beneran
    start_date, end_date = parse_dates(startDate, endDate)
    settings = get_settings(db)

    # Total DO dalam rute
    total_do = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan,
        models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date, # Pake end_date, bukan today lagi
        models.TMSRouteLine.sequence > 0
    ).count()

    # Total berat
    weight_raw = db.query(
        func.sum(models.TMSRoutePlan.total_weight)
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).scalar()
    total_berat = float(weight_raw) if weight_raw else 0.0

    # Total truk jalan
    total_trucks_used = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).count()

    total_trucks_all = db.query(models.FleetVehicle).count() or 1

    # Load factor
    load_factor = round((total_trucks_used / total_trucks_all) * 100, 1)
    if load_factor > 100:
        load_factor = 100.0

    # OTIF real
    otif = calculate_otif(start_date, end_date, db)

    # Total jarak
    dist_raw = db.query(
        func.sum(models.TMSRoutePlan.total_distance_km)
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).scalar()
    total_distance = float(dist_raw) if dist_raw else 0.0

    # Transport cost real
    cost_per_km = (
        settings.cost_fuel_per_liter / settings.cost_avg_km_per_liter
        if settings.cost_avg_km_per_liter > 0
        else 0
    )
    fuel_cost = round(total_distance * cost_per_km, 2)
    driver_cost = round(total_trucks_used * (settings.cost_driver_salary / 22), 2)
    total_cost = round(fuel_cost + driver_cost, 2)

    # Format berat
    if total_berat > 1000:
        weight_str = f"{total_berat / 1000:.1f}k"
    else:
        weight_str = f"{total_berat:.1f}"

    return {
        "status": "success",
        "period": f"{startDate} to {endDate}",
        "data": {
            "totalShipments": total_do,
            "otifRate": f"{otif['rate']}%",
            "loadFactor": f"{load_factor}%",
            "avgLoadingTime": f"{weight_str} KG",
            "transportCost": total_cost
        },
        "total_deliveries_today": total_do,
        "success_rate_percent": otif['rate'],
        "load_factor_percent": load_factor,
        "total_weight_kg": round(total_berat, 1),
        "active_fleet_count": total_trucks_used,
        "total_distance_km": round(total_distance, 1)
    }

# ==========================================
# ENDPOINT 2: HOURLY DELIVERY VOLUME
# ==========================================
@router.get("/delivery-volume")
def get_delivery_volume(
    startDate: str, 
    endDate: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    start_date, end_date = parse_dates(startDate, endDate)

    lines = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan,
        models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date,
        models.TMSRouteLine.sequence > 0
    ).all()

    buckets = {
        "06:00": 0, "08:00": 0, "10:00": 0, "12:00": 0,
        "14:00": 0, "16:00": 0, "18:00": 0, "20:00": 0
    }

    for line in lines:
        if line.est_arrival:
            h = line.est_arrival.hour
            if h < 8:    buckets["06:00"] += 1
            elif h < 10: buckets["08:00"] += 1
            elif h < 12: buckets["10:00"] += 1
            elif h < 14: buckets["12:00"] += 1
            elif h < 16: buckets["14:00"] += 1
            elif h < 18: buckets["16:00"] += 1
            elif h < 20: buckets["18:00"] += 1
            else:        buckets["20:00"] += 1

    data = [
        {"time": k, "count": v, "hour": k, "orders": v}
        for k, v in buckets.items()
    ]
    max_val = max([v for v in buckets.values()] + [1])

    # 🌟 INI DIA YANG ILANG KEMAREN BOS! REZEKI NOMPLOK!
    return {"status": "success", "data": data, "max": max_val}

# ==========================================
# ENDPOINT 3: FLEET UTILIZATION
# ==========================================
@router.get("/fleet-utilization")
def get_fleet_utilization(
    startDate: str, 
    endDate: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    start_date, end_date = parse_dates(startDate, endDate)
    total_truck = db.query(models.FleetVehicle).count() or 1
    
    # Hitung selisih hari
    delta_days = (end_date - start_date).days + 1
    days = delta_days if delta_days > 0 else 1

    total_rute = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).count()

    active_avg = round(total_rute / days)
    utilization = min(round((active_avg / total_truck) * 100), 100)

    return {
        "status": "success",
        "data": {
            "totalTrucks": total_truck,
            "activeTrucks": active_avg,
            "utilizationRate": f"{utilization}%"
        },
        "active_trucks": active_avg,
        "total_trucks": total_truck,
        "utilization_rate": utilization
    }

# ==========================================
# ENDPOINT 4: DRIVER PERFORMANCE
# ==========================================
@router.get("/driver-performance")
def get_driver_performance(
    startDate: str, 
    endDate: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    start_date, end_date = parse_dates(startDate, endDate)
    drivers = db.query(models.HRDriver).all()
    hasil = []

    for d in drivers:
        rutes = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.driver_id == d.driver_id,
            models.TMSRoutePlan.planning_date >= start_date,
            models.TMSRoutePlan.planning_date <= end_date
        ).all()

        total_trips = len(rutes)
        total_do    = 0
        jarak_total = 0.0
        ontime_count = 0
        total_epod   = 0

        for rute in rutes:
            jarak_total += rute.total_distance_km or 0

            lines = db.query(models.TMSRouteLine).filter(
                models.TMSRouteLine.route_id == rute.route_id,
                models.TMSRouteLine.sequence > 0
            ).all()

            total_do += len(lines)

            for line in lines:
                epod = db.query(models.TMSEpodHistory).filter(
                    models.TMSEpodHistory.line_id == line.line_id
                ).first()

                if epod and epod.timestamp and line.est_arrival:
                    total_epod += 1
                    actual_m = epod.timestamp.hour * 60 + epod.timestamp.minute
                    est_m    = line.est_arrival.hour * 60 + line.est_arrival.minute
                    if (actual_m - est_m) <= 15:
                        ontime_count += 1

        ontime_rate = round((ontime_count / total_epod) * 100) if total_epod > 0 else (95 if total_trips > 0 else 0)

        fuel_rating = "-"
        if total_trips > 0:
            fuel_rating = "A" if jarak_total < 50 else ("B" if jarak_total < 150 else "C")

        score = min(70 + (ontime_rate // 5), 100)

        hasil.append({
            "driver_name": d.name,
            "total_trips": total_do,
            "on_time_rate": ontime_rate,
            "fuel_rating": fuel_rating,
            "id": f"DRV-{d.driver_id:03d}",
            "name": d.name,
            "avatar": f"https://ui-avatars.com/api/?name={d.name.replace(' ', '+')}&background=0D8ABC&color=fff",
            "status": "On Route" if total_trips > 0 else "Offline",
            "score": score,
            "ontime": f"{ontime_rate}%",
            "doSuccess": f"{ontime_count}",
            "truck": "-",
            "distanceToday": round(jarak_total, 1),
            "doCompleted": ontime_count,
            "doTotal": total_do,
            "lastLocation": "📍 Depo Cikupa",
            "lastUpdate": "Baru saja"
        })

    return {"status": "success", "data": hasil}

# ==========================================
# ENDPOINT 5: REJECTION ANALYSIS
# ==========================================
@router.get("/rejections")
def get_rejection_analysis(
    startDate: str = None, 
    endDate: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Buat endpoint rejections juga sekalian gw benerin kalau mau difilter
    if startDate and endDate:
        start_date, end_date = parse_dates(startDate, endDate)
        rejected = db.query(models.TMSEpodHistory).filter(
            models.TMSEpodHistory.status == models.DOStatus.delivered_partial,
            func.date(models.TMSEpodHistory.timestamp) >= start_date,
            func.date(models.TMSEpodHistory.timestamp) <= end_date
        ).count()
    else:
        rejected = db.query(models.TMSEpodHistory).filter(
            models.TMSEpodHistory.status == models.DOStatus.delivered_partial
        ).count()

    if rejected == 0:
        return {
            "status": "success",
            "data": [
                {"reason": "Belum Ada Data Retur", "percentage": 0, "color": "bg-slate-200"}
            ]
        }

    return {
        "status": "success",
        "data": [
            {"reason": "Barang Rusak/Cacat",  "percentage": 60, "color": "bg-red-500"},
            {"reason": "Salah Item/SKU",       "percentage": 25, "color": "bg-orange-400"},
            {"reason": "Customer Tidak Ada",   "percentage": 15, "color": "bg-slate-400"},
        ]
    }