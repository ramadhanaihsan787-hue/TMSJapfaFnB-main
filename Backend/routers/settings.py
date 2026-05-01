# routers/settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

import models
import schemas # 🌟 SUNTIKAN PYDANTIC!
from dependencies import get_db, get_settings, get_current_user, require_role
from utils.helpers import time_str_to_minutes

router = APIRouter(prefix="/api", tags=["System Settings"])

@router.get("/settings", response_model=schemas.SettingsResponse)
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    settings = get_settings()

    return {
        "status": "success",
        "data": {
            "vrp_start_time": settings.vrp_start_time,
            "vrp_end_time": settings.vrp_end_time,
            "vrp_base_drop_time_mins": settings.vrp_base_drop_time_mins,
            "vrp_var_drop_time_mins": settings.vrp_var_drop_time_mins,
            "vrp_capacity_buffer_percent": settings.vrp_capacity_buffer_percent,
            "cost_fuel_per_liter": settings.cost_fuel_per_liter,
            "cost_avg_km_per_liter": settings.cost_avg_km_per_liter,
            "cost_driver_salary": settings.cost_driver_salary,
            "cost_overtime_rate": settings.cost_overtime_rate,
            "depo_lat": settings.depo_lat,
            "depo_lon": settings.depo_lon,
            "api_gps_webhook": settings.api_gps_webhook,
            "api_temp_sensor": settings.api_temp_sensor,
            "sync_interval_sec": settings.sync_interval_sec,
            "alert_max_temp_celsius": settings.alert_max_temp_celsius,
            "alert_delay_mins": settings.alert_delay_mins,
            "alert_channel_dashboard": settings.alert_channel_dashboard,
            "alert_channel_email": settings.alert_channel_email,
            "alert_channel_whatsapp": settings.alert_channel_whatsapp,
        }
    }

@router.put("/settings", response_model=schemas.GenericResponse)
def update_system_settings(
    data: schemas.SystemSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi"))
):
    settings = db.query(models.SystemSettings).first()
    
    if not settings:
        settings = models.SystemSettings(id=1)
        db.add(settings)

    for key, value in data.dict().items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()

    return {
        "status": "success",
        "message": "Konfigurasi sistem berhasil diperbarui!"
    }

@router.get("/settings/depo", response_model=schemas.DepoResponse)
def get_depo_coordinates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    settings = get_settings()
    return {
        "status": "success",
        "data": {
            "depo_lat": settings.depo_lat,
            "depo_lon": settings.depo_lon,
            "depo_name": "Gudang JAPFA Cikupa"
        }
    }

@router.get("/settings/vrp-config", response_model=schemas.VrpConfigResponse)
def get_vrp_config(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    settings = get_settings()
    return {
        "status": "success",
        "data": {
            "start_minutes": time_str_to_minutes(settings.vrp_start_time),
            "end_minutes": time_str_to_minutes(settings.vrp_end_time),
            "base_drop_time": settings.vrp_base_drop_time_mins,
            "var_drop_time": settings.vrp_var_drop_time_mins,
            "capacity_buffer": settings.vrp_capacity_buffer_percent / 100.0,
            "depo_lat": settings.depo_lat,
            "depo_lon": settings.depo_lon,
            "alert_delay_mins": settings.alert_delay_mins,
            "alert_max_temp": settings.alert_max_temp_celsius,
        }
    }