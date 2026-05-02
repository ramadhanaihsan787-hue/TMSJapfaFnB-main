# routers/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

import models
import schemas
from dependencies import get_db, get_settings, get_current_user, require_role

# 🌟 IMPORT SERVICE DAPUR KITA
from services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

# ==========================================
# ENDPOINT 1: KPI SUMMARY (TAB 1 - OVERVIEW)
# ==========================================
@router.get("/kpi-summary")
def get_kpi_summary(
    startDate: str, 
    endDate: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
): 
    settings = get_settings()
    return analytics_service.get_kpi_summary(db, startDate, endDate, settings)

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
    return analytics_service.get_delivery_volume(db, startDate, endDate)

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
    return analytics_service.get_fleet_utilization(db, startDate, endDate)

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
    return analytics_service.get_driver_performance(db, startDate, endDate)

# ==========================================
# ENDPOINT 5: RETURNS DASHBOARD (TAB 2)
# ==========================================
@router.get("/returns-dashboard", response_model=schemas.ReturnDashboardResponse)
def get_returns_dashboard(db: Session = Depends(get_db)):
    data = analytics_service.get_returns_dashboard(db)
    return {"status": "success", "data": data}

# ==========================================
# ENDPOINT 6: EFFICIENCY DASHBOARD (TAB 3)
# ==========================================
@router.get("/efficiency-dashboard", response_model=schemas.EfficiencyDashboardResponse)
def get_efficiency_dashboard(db: Session = Depends(get_db)):
    settings = get_settings()
    data = analytics_service.get_efficiency_dashboard(db, settings)
    return {"status": "success", "data": data}

# ==========================================
# ENDPOINT 7: MONITORING ALERTS
# ==========================================
@router.get("/monitoring-alerts")
def get_monitoring_alerts():
    return {
        "status": "success",
        "data": [
            { "title": "Route Congestion", "time": "2m ago", "desc": "Heavy traffic detected on Jakarta-Cikampek KM 42.", "icon": "report", "color": "border-red-500" },
            { "title": "Fleet Delay", "time": "15m ago", "desc": "Unit B-9281-UFA delayed due to severe weather.", "icon": "warning", "color": "border-orange-500" },
            { "title": "Cold Chain", "time": "1h ago", "desc": "Temp spike detected in Reefer-X45 container.", "icon": "ac_unit", "color": "border-red-500" }
        ]
    }

# ==========================================
# ENDPOINT 8: REJECTION ANALYSIS (LEGACY)
# ==========================================
@router.get("/rejections")
def get_rejection_analysis(
    startDate: str = None, 
    endDate: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return analytics_service.get_rejection_analysis(db, startDate, endDate)

# ==========================================
# ENDPOINT 9: MANAGER OVERVIEW (LEGACY)
# ==========================================
@router.get("/manager/overview")
def get_manager_overview(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role("manager_logistik"))
):
    return analytics_service.get_manager_overview(db)