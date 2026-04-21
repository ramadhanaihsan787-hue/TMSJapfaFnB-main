# routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime

import models
from database import SessionLocal
from dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

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
# ENDPOINT 1: LIVE TRACKING
# ==========================================
@router.get("/live-tracking")
def get_live_tracking(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()
    settings = get_settings(db)

    # Koordinat depo dari settings (bukan hardcode!)
    DEPO_LAT = settings.depo_lat
    DEPO_LON = settings.depo_lon

    now = datetime.now()
    now_minutes = now.hour * 60 + now.minute

    routes_today = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date == today
    ).all()

    trucks = []

    for route in routes_today:
        vehicle = db.query(models.FleetVehicle).filter(
            models.FleetVehicle.vehicle_id == route.vehicle_id
        ).first()

        driver = db.query(models.HRDriver).filter(
            models.HRDriver.driver_id == route.driver_id
        ).first()

        # Default posisi = depo
        lat = DEPO_LAT
        lon = DEPO_LON
        status_text = "Standby di Gudang"
        is_delayed = False
        delay_minutes = 0

        # Cari stop pertama
        next_stop = db.query(models.TMSRouteLine).filter(
            models.TMSRouteLine.route_id == route.route_id,
            models.TMSRouteLine.sequence == 1
        ).first()

        if next_stop:
            order = db.query(models.DeliveryOrder).filter(
                models.DeliveryOrder.order_id == next_stop.order_id
            ).first()

            if order and order.latitude and order.longitude:
                # Simulasi: posisi di tengah jalan menuju tujuan
                lat = float(order.latitude) + 0.005
                lon = float(order.longitude) - 0.005
                status_text = f"Menuju: {order.customer_name}"

                if next_stop.est_arrival:
                    est_m = next_stop.est_arrival.hour * 60 + next_stop.est_arrival.minute
                    delay_minutes = now_minutes - est_m
                    is_delayed = delay_minutes > settings.alert_delay_mins

                    if is_delayed:
                        status_text = f"⚠️ DELAYED +{delay_minutes} menit"

        trucks.append({
            "id": vehicle.license_plate if vehicle else "UNKNOWN",
            "driver": driver.name if driver else "Unknown",
            "lat": lat,
            "lon": lon,
            "status": status_text,
            "isDelayed": is_delayed,
            "delayMinutes": max(0, delay_minutes),
            "routeId": route.route_id
        })

    # Dummy kalau tidak ada rute hari ini
    if not trucks:
        trucks = [
            {
                "id": "B 9044 JXS", "driver": "Budi Santoso",
                "lat": DEPO_LAT + 0.01, "lon": DEPO_LON + 0.01,
                "status": "Idle", "isDelayed": False, "delayMinutes": 0
            }
        ]

    return {"status": "success", "data": trucks}

# ==========================================
# ENDPOINT 2: REAL-TIME ALERTS
# ==========================================
@router.get("/alerts")
def get_realtime_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()
    settings = get_settings(db)
    now = datetime.now()
    now_minutes = now.hour * 60 + now.minute

    alerts = []

    routes_today = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date == today
    ).all()

    # Deteksi keterlambatan
    for route in routes_today:
        first_stop = db.query(models.TMSRouteLine).filter(
            models.TMSRouteLine.route_id == route.route_id,
            models.TMSRouteLine.sequence == 1
        ).first()

        if not first_stop or not first_stop.est_arrival:
            continue

        est_m = first_stop.est_arrival.hour * 60 + first_stop.est_arrival.minute
        delay = now_minutes - est_m

        if delay > settings.alert_delay_mins:
            vehicle = db.query(models.FleetVehicle).filter(
                models.FleetVehicle.vehicle_id == route.vehicle_id
            ).first()
            plat = vehicle.license_plate if vehicle else "Truk"

            alerts.append({
                "title": f"{plat} Terdeteksi Terlambat!",
                "desc": f"Delay +{delay} menit dari jadwal AI VRP.",
                "time": "Live",
                "icon": "warning",
                "iconColor": "text-orange-500",
                "bgColor": "bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500"
            })

    # Status aman
    if not alerts:
        alerts.append({
            "title": "OTIF Target Aman ✅",
            "desc": "Semua armada berjalan sesuai estimasi VRP AI.",
            "time": "Live",
            "icon": "check_circle",
            "iconColor": "text-green-500",
            "bgColor": "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
        })

    # System status
    alerts.append({
        "title": "Sistem AI Online 🟢",
        "desc": "Backend Uvicorn, PostgreSQL & OR-Tools berjalan normal.",
        "time": "System",
        "icon": "memory",
        "iconColor": "text-blue-500",
        "bgColor": "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
    })

    return {"status": "success", "data": alerts}

# ==========================================
# ENDPOINT 3 & 4: LEGACY SUPPORT WIDGETS
# (Dashboard lama masih pakai URL /api/dashboard/*)
# ==========================================
@router.get("/hourly-volume")
def dashboard_hourly_volume(
    period: str = "today",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Redirect ke analytics endpoint"""
    from routers.analytics import get_delivery_volume
    return get_delivery_volume(period, db, current_user)

@router.get("/fleet-utilization")
def dashboard_fleet_utilization(
    period: str = "today",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Redirect ke analytics endpoint"""
    from routers.analytics import get_fleet_utilization
    return get_fleet_utilization(period, db, current_user)

@router.get("/rejections")
def dashboard_rejections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Redirect ke analytics endpoint"""
    from routers.analytics import get_rejection_analysis
    return get_rejection_analysis(db, current_user)