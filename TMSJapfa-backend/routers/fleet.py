# routers/fleet.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

import models
from database import SessionLocal
from dependencies import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Fleet Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# SCHEMAS
# ==========================================
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

# ==========================================
# HELPER
# ==========================================
def calculate_efficiency(distance_km: float, liters: float) -> float:
    if not liters or liters == 0 or distance_km == 0:
        return 0.0
    return round(distance_km / liters, 1)

# ==========================================
# ENDPOINT 1: GET ALL FLEET
# ==========================================
@router.get("/fleet")
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

        # Fuel log terakhir
        latest_fuel = db.query(models.FuelLog).filter(
            models.FuelLog.vehicle_id == v.vehicle_id
        ).order_by(desc(models.FuelLog.log_id)).first()

        # Riwayat bensin (5 terakhir)
        fuel_history = []
        if latest_fuel:
            logs = db.query(models.FuelLog).filter(
                models.FuelLog.vehicle_id == v.vehicle_id
            ).order_by(desc(models.FuelLog.log_id)).limit(5).all()

            for fh in logs:
                fuel_history.append({
                    "date": str(fh.date_logged),
                    "km": (fh.km_akhir or 0) - (fh.km_awal or 0),
                    "liters": fh.liters,
                    "cost": f"Rp{fh.cost_rp:,.0f}",
                    "station": fh.station_name
                })

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
            "fuelEfficiency": calculate_efficiency(
                (latest_fuel.km_akhir or 0) - (latest_fuel.km_awal or 0),
                latest_fuel.liters if latest_fuel else 0
            ),
            "history": fuel_history
        })

    return {"status": "success", "data": result}

# ==========================================
# ENDPOINT 2: TAMBAH ARMADA ON-CALL
# ==========================================
@router.post("/fleet/oncall")
def add_on_call_fleet(
    data: OnCallFleetRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role("admin_distribusi", "manager_logistik")
    )
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

# ==========================================
# ENDPOINT 3: UPDATE STATUS ARMADA
# ==========================================
@router.put("/fleet/{truck_id}/status")
def update_truck_status(
    truck_id: int,
    status_data: VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role("admin_distribusi", "manager_logistik")
    )
):
    truck = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.vehicle_id == truck_id
    ).first()

    if not truck:
        raise HTTPException(status_code=404, detail="Truk tidak ditemukan!")

    truck.status = status_data.status
    db.commit()

    return {"message": f"Status truk {truck.license_plate} → {status_data.status}"}

# ==========================================
# ENDPOINT 4: INPUT BENSIN (REAL SAVE TO DB)
# ==========================================
@router.post("/fleet/{truck_id}/fuel")
def add_fuel_log(
    truck_id: int,
    data: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role("admin_distribusi", "manager_logistik", "driver")
    )
):
    truck = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.vehicle_id == truck_id
    ).first()

    if not truck:
        raise HTTPException(status_code=404, detail="Truk tidak ditemukan!")

    # Update KM terakhir
    truck.current_km = data.km_akhir

    # Simpan fuel log
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
        "efficiency": calculate_efficiency(
            data.km_akhir - data.km_awal,
            data.liters
        )
    }

# ==========================================
# ENDPOINT 5: FUEL HISTORY PER TRUK
# ==========================================
@router.get("/fleet/{truck_id}/fuel-history")
def get_fuel_history(
    truck_id: int,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
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
                "efficiency": calculate_efficiency(
                    (l.km_akhir or 0) - (l.km_awal or 0), l.liters
                ),
                "station": l.station_name
            }
            for l in logs
        ]
    }

# ==========================================
# ENDPOINT 6: FLEET SUMMARY (KPI Cards)
# ==========================================
@router.get("/fleet/summary")
def get_fleet_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()

    total_trucks = db.query(models.FleetVehicle).count() or 1
    active_today = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date == today
    ).count()
    in_maintenance = db.query(models.FleetVehicle).filter(
        models.FleetVehicle.status == "Maintenance"
    ).count()

    return {
        "status": "success",
        "totalFleet": total_trucks,
        "activeToday": active_today,
        "inMaintenance": in_maintenance,
        "available": total_trucks - active_today - in_maintenance
    }