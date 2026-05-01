# routers/fleet.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
import requests

import models
import schemas # 🌟 SUNTIKAN PYDANTIC KITA!
from dependencies import get_db, get_settings, get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Fleet Management"])

live_telematics_cache = {}

# (Model Pydantic Input biarin aja di file ini atau pindahin ke schemas nanti bebas)
class OnCallFleetRequest(BaseModel):
    plate_number: str
    vehicle_type: str
    capacity_kg: int
    box_length_cm: int = 400
    box_width_cm: int = 200
    box_height_cm: int = 200

class FuelLogCreate(BaseModel):
    km_awal: int
    km_akhir: int
    liters: float
    cost_rp: float
    station_name: str

class VehicleStatusUpdate(BaseModel):
    status: str

def calculate_efficiency(distance_km: float, liters: float) -> float:
    if not liters or liters == 0 or distance_km == 0:
        return 0.0
    return round(distance_km / liters, 1)

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.get("/fleet", response_model=schemas.FleetListResponse)
def get_all_fleet(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()
    vehicles = db.query(models.FleetVehicle).all()
    result = []

    for v in vehicles:
        route_today = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.vehicle_id == v.vehicle_id,
            models.TMSRoutePlan.planning_date == today
        ).first()

        current_load = float(route_today.total_weight) if route_today else 0.0
        load_pct = round((current_load / float(v.capacity_kg)) * 100, 1) if v.capacity_kg else 0

        latest_fuel = db.query(models.FuelLog).filter(
            models.FuelLog.vehicle_id == v.vehicle_id
        ).order_by(desc(models.FuelLog.log_id)).first()

        fuel_history = []
        if latest_fuel:
            logs = db.query(models.FuelLog).filter(
                models.FuelLog.vehicle_id == v.vehicle_id
            ).order_by(desc(models.FuelLog.log_id)).limit(5).all()

            for fh in logs:
                fuel_history.append({
                    "date": str(fh.date_logged),
                    "km": (fh.km_akhir or 0) - (fh.km_awal or 0),
                    "liters": float(fh.liters),
                    "cost": f"Rp{fh.cost_rp:,.0f}",
                    "station": fh.station_name
                })

        fuel_efficiency = 0.0
        if latest_fuel:
            jarak_tempuh = (latest_fuel.km_akhir or 0) - (latest_fuel.km_awal or 0)
            fuel_efficiency = calculate_efficiency(jarak_tempuh, latest_fuel.liters or 0)

        result.append({
            "id": str(v.vehicle_id),
            "plateNumber": v.license_plate,
            "model": v.type,
            "capacity": float(v.capacity_kg),
            "currentLoad": current_load,
            "loadPercent": load_pct,
            "status": v.status or "Available",
            "isInternal": v.is_internal,
            "kmAwalHariIni": v.current_km or 0,
            "kmAkhirHariIni": None,
            "boxDimensions": {
                "length": v.box_length_cm or 400,
                "width": v.box_width_cm or 200,
                "height": v.box_height_cm or 200
            },
            "lastFuelDate": str(latest_fuel.date_logged) if latest_fuel else "-",
            "lastFuelCost": f"Rp{latest_fuel.cost_rp:,.0f}" if latest_fuel else "-",
            "fuelEfficiency": fuel_efficiency, 
            "history": fuel_history
        })

    return {"status": "success", "data": result}

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.post("/fleet/oncall", response_model=schemas.FleetActionResponse)
def add_on_call_fleet(
    data: OnCallFleetRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    existing = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.license_plate == data.plate_number
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Plat nomor sudah terdaftar!")

    new_vehicle = models.FleetVehicle(
        license_plate=data.plate_number,
        type=data.vehicle_type,
        capacity_kg=data.capacity_kg,
        status="Available",
        is_internal=False,
        box_length_cm=data.box_length_cm,
        box_width_cm=data.box_width_cm,
        box_height_cm=data.box_height_cm
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return {
        "message": f"Armada {data.plate_number} berhasil ditambahkan!",
        "vehicle_id": new_vehicle.vehicle_id
    }

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.put("/fleet/{truck_id}/status", response_model=schemas.FleetActionResponse)
def update_truck_status(
    truck_id: int,
    status_data: VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    truck = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.vehicle_id == truck_id
    ).first()

    if not truck:
        raise HTTPException(status_code=404, detail="Truk tidak ditemukan!")

    truck.status = status_data.status
    db.commit()

    return {"message": f"Status truk {truck.license_plate} → {status_data.status}"}

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.post("/fleet/{truck_id}/fuel", response_model=schemas.FleetActionResponse)
def add_fuel_log(
    truck_id: int,
    data: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik", "driver"))
):
    truck = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.vehicle_id == truck_id
    ).first()

    if not truck:
        raise HTTPException(status_code=404, detail="Truk tidak ditemukan!")

    truck.current_km = data.km_akhir

    fuel_log = models.FuelLog(
        vehicle_id=truck_id,
        date_logged=date.today(),
        km_awal=data.km_awal,
        km_akhir=data.km_akhir,
        liters=data.liters,
        cost_rp=data.cost_rp,
        station_name=data.station_name
    )

    db.add(fuel_log)
    db.commit()
    db.refresh(fuel_log)

    return {
        "message": f"Bensin {data.liters}L di {data.station_name} berhasil dicatat!",
        "log_id": fuel_log.log_id,
        "efficiency": calculate_efficiency(data.km_akhir - data.km_awal, data.liters)
    }

@router.get("/fleet/{truck_id}/fuel-history")
def get_fuel_history(
    truck_id: int, limit: int = 30, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    logs = db.query(models.FuelLog).filter(
        models.FuelLog.vehicle_id == truck_id
    ).order_by(desc(models.FuelLog.log_id)).limit(limit).all()

    return {
        "status": "success",
        "data": [
            {
                "logId": l.log_id,
                "date": str(l.date_logged),
                "kmStart": l.km_awal,
                "kmEnd": l.km_akhir,
                "distance": (l.km_akhir or 0) - (l.km_awal or 0),
                "liters": l.liters,
                "costRp": f"Rp{l.cost_rp:,.0f}",
                "efficiency": calculate_efficiency((l.km_akhir or 0) - (l.km_awal or 0), l.liters),
                "station": l.station_name
            } for l in logs
        ]
    }

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.get("/fleet/summary", response_model=schemas.FleetSummaryResponse)
def get_fleet_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    today = date.today()

    total_trucks = db.query(models.FleetVehicle).count() or 1
    active_today = db.query(models.TMSRoutePlan).filter(models.TMSRoutePlan.planning_date == today).count()
    in_maintenance = db.query(models.FleetVehicle).filter(models.FleetVehicle.status == "Maintenance").count()

    return {
        "status": "success",
        "totalFleet": total_trucks,
        "activeToday": active_today,
        "inMaintenance": in_maintenance,
        "available": total_trucks - active_today - in_maintenance
    }

# 🌟 SUNTIKAN RESPONSE_MODEL
@router.get("/fleet/telematics/{truck_plate}", response_model=schemas.TelematicsResponse)
def get_live_telematics(truck_plate: str, db: Session = Depends(get_db)):
    settings = get_settings()
    max_temp = settings.alert_max_temp_celsius if settings else 4.0

    default_telematics = {
        "temperature": 2.5, "isTempWarning": False, "compressorStatus": "ON",
        "gpsSignal": "NORMAL", "doorLocked": True, "lastUpdate": datetime.now().isoformat()
    }

    if not settings or not settings.api_temp_sensor:
        return default_telematics

    try:
        url_vendor = f"{settings.api_temp_sensor}?plate={truck_plate}" 
        response = requests.get(url_vendor, timeout=5)
        
        if response.status_code == 200:
            vendor_data = response.json()
            current_temp = float(vendor_data.get("suhu_sekarang", 2.5)) 
            
            return {
                "temperature": current_temp,
                "isTempWarning": current_temp > max_temp,
                "compressorStatus": "ON" if current_temp > 2.0 else "OFF",
                "gpsSignal": "STRONG", 
                "doorLocked": vendor_data.get("pintu_terkunci", True),
                "lastUpdate": datetime.now().isoformat()
            }
            
    except Exception as e:
        print(f"⚠️ Gagal narik data dari API Vendor Truk: {str(e)}")
        pass

    return default_telematics