# routers/settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

import models
from database import SessionLocal
from dependencies import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["System Settings"])

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
# HELPER: Get or Create Settings
# ==========================================
def get_or_create_settings(db: Session) -> models.SystemSettings:
    """Ambil settings, kalau belum ada buat default"""
    settings = db.query(models.SystemSettings).first()
    if not settings:
        settings = models.SystemSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# ==========================================
# SCHEMA
# ==========================================
class SystemSettingsUpdate(BaseModel):
    # VRP & Routing
    vrp_start_time: str
    vrp_end_time: str
    vrp_base_drop_time_mins: int
    vrp_var_drop_time_mins: int
    vrp_capacity_buffer_percent: int

    # Cost & Operations
    cost_fuel_per_liter: float
    cost_avg_km_per_liter: float
    cost_driver_salary: float
    cost_overtime_rate: float
    depo_lat: float
    depo_lon: float

    # Telematics & IoT
    api_tomtom_key: str
    api_gps_webhook: Optional[str] = None
    api_temp_sensor: Optional[str] = None
    sync_interval_sec: int

    # Alerts
    alert_max_temp_celsius: float
    alert_delay_mins: int
    alert_channel_dashboard: bool = True
    alert_channel_email: bool = True
    alert_channel_whatsapp: bool = False

# ==========================================
# ENDPOINT 1: GET SETTINGS
# ==========================================
@router.get("/settings")
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Ambil konfigurasi sistem
    Semua role yang login bisa baca settings
    """
    settings = get_or_create_settings(db)

    return {
        "status": "success",
        "data": {
            # VRP & Routing
            "vrp_start_time": settings.vrp_start_time,
            "vrp_end_time": settings.vrp_end_time,
            "vrp_base_drop_time_mins": settings.vrp_base_drop_time_mins,
            "vrp_var_drop_time_mins": settings.vrp_var_drop_time_mins,
            "vrp_capacity_buffer_percent": settings.vrp_capacity_buffer_percent,

            # Cost & Operations
            "cost_fuel_per_liter": settings.cost_fuel_per_liter,
            "cost_avg_km_per_liter": settings.cost_avg_km_per_liter,
            "cost_driver_salary": settings.cost_driver_salary,
            "cost_overtime_rate": settings.cost_overtime_rate,
            "depo_lat": settings.depo_lat,
            "depo_lon": settings.depo_lon,

            # Telematics
            "api_tomtom_key": settings.api_tomtom_key,
            "api_gps_webhook": settings.api_gps_webhook,
            "api_temp_sensor": settings.api_temp_sensor,
            "sync_interval_sec": settings.sync_interval_sec,

            # Alerts
            "alert_max_temp_celsius": settings.alert_max_temp_celsius,
            "alert_delay_mins": settings.alert_delay_mins,
            "alert_channel_dashboard": settings.alert_channel_dashboard,
            "alert_channel_email": settings.alert_channel_email,
            "alert_channel_whatsapp": settings.alert_channel_whatsapp,
        }
    }

# ==========================================
# ENDPOINT 2: UPDATE SETTINGS
# ==========================================
@router.put("/settings")
def update_system_settings(
    data: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    # 🌟 HANYA Manager Logistik yang bisa ubah settings
    current_user: models.User = Depends(require_role("manager_logistik"))
):
    """
    Update konfigurasi sistem
    Hanya Manager Logistik yang bisa mengubah
    """
    settings = get_or_create_settings(db)

    # Update semua field
    for key, value in data.dict().items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return {
        "status": "success",
        "message": "Konfigurasi sistem berhasil diperbarui!"
    }

# ==========================================
# ENDPOINT 3: GET DEPO COORDS (Public untuk VRP)
# ==========================================
@router.get("/settings/depo")
def get_depo_coordinates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Shortcut: Ambil koordinat depo saja
    Dipakai oleh VRP engine dan frontend map
    """
    settings = get_or_create_settings(db)

    return {
        "status": "success",
        "data": {
            "depo_lat": settings.depo_lat,
            "depo_lon": settings.depo_lon,
            "depo_name": "Gudang JAPFA Cikupa"
        }
    }

# ==========================================
# ENDPOINT 4: GET VRP CONFIG (Untuk VRP Engine)
# ==========================================
@router.get("/settings/vrp-config")
def get_vrp_config(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Shortcut: Ambil config VRP saja
    Dipakai internal oleh VRP solver
    """
    settings = get_or_create_settings(db)

    # Convert jam string ke menit
    def time_to_minutes(time_str: str) -> int:
        h, m = map(int, time_str.split(":"))
        return h * 60 + m

    return {
        "status": "success",
        "data": {
            "start_minutes": time_to_minutes(settings.vrp_start_time),
            "end_minutes": time_to_minutes(settings.vrp_end_time),
            "base_drop_time": settings.vrp_base_drop_time_mins,
            "var_drop_time": settings.vrp_var_drop_time_mins,
            "capacity_buffer": settings.vrp_capacity_buffer_percent / 100.0,
            "depo_lat": settings.depo_lat,
            "depo_lon": settings.depo_lon,
            "tomtom_key": settings.api_tomtom_key,
            "alert_delay_mins": settings.alert_delay_mins,
            "alert_max_temp": settings.alert_max_temp_celsius,
        }
    }