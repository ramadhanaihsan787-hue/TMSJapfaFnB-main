"""
Configuration module - Secure Settings with Pydantic
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ==========================================
    # DATABASE CONFIGURATION
    # ==========================================
    # Tidak ada fallback bahaya! Kalau di .env kosong, server nolak nyala!
    DATABASE_URL: str

    # ==========================================
    # SECURITY & JWT CONFIGURATION
    # ==========================================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 

    # ==========================================
    # APPLICATION CONFIGURATION
    # ==========================================
    APP_NAME: str = "TMS JAPFA - AI Engine"
    APP_VERSION: str = "2.0.0"
    APP_DESCRIPTION: str = "Transport Management System dengan CVRPTW Optimization"
    DEBUG: bool = False 

    # ==========================================
    # EXTERNAL API CONFIGURATION
    # ==========================================
    TOMTOM_API_KEY: Optional[str] = None 
    traffic_validation_enabled: bool = True 

    # ==========================================
    # 🌟 VRP & ROUTING CONFIGURATION
    # ==========================================
    depo_lat: float = -6.2234  
    depo_lon: float = 106.5123 
    vrp_start_time: str = "07:00"
    vrp_end_time: str = "17:00"
    vrp_base_drop_time_mins: int = 15
    vrp_var_drop_time_mins: int = 1 
    vrp_capacity_buffer_percent: int = 90 

    # ==========================================
    # FILE UPLOAD CONFIGURATION
    # ==========================================
    UPLOAD_DIR: str = "uploads"
    EPOD_DIR: str = "uploads/epod"
    GEOMETRY_DIR: str = "route_geometries"

    # ==========================================
    # COST & OPERATIONS (TAMBAHAN BUAT ANALYTICS)
    # ==========================================
    cost_fuel_per_liter: float = 12500.0
    cost_avg_km_per_liter: float = 5.0
    cost_driver_salary: float = 4500000.0
    cost_overtime_rate: float = 25000.0

    # ==========================================
    # 🌟 FIX ERROR: SENSOR, WEBHOOK & ALERTS CONFIGURATION
    # (Ini yang bikin server lu meledak tadi karena ngga didaftarin)
    # ==========================================
    api_gps_webhook: Optional[str] = None
    api_temp_sensor: Optional[str] = None
    sync_interval_sec: int = 300
    alert_max_temp_celsius: float = 8.0
    alert_delay_mins: int = 30
    alert_channel_dashboard: bool = True
    alert_channel_email: bool = True
    alert_channel_whatsapp: bool = False

    # Mesin utama buat ngebaca file .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Instansiasi setting global
settings = Settings()

# Create directories if not exist
os.makedirs(settings.EPOD_DIR, exist_ok=True)
os.makedirs(settings.GEOMETRY_DIR, exist_ok=True)