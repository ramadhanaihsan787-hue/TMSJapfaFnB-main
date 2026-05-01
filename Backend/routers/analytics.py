# routers/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from typing import Optional

import models
import schemas
from dependencies import get_db, get_settings, get_current_user, require_role

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def parse_dates(start_str: str, end_str: str):
    try:
        s_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        e_date = datetime.strptime(end_str, "%Y-%m-%d").date()
        return s_date, e_date
    except ValueError:
        e_date = date.today()
        s_date = e_date - timedelta(days=30)
        return s_date, e_date

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
    start_date, end_date = parse_dates(startDate, endDate)
    settings = get_settings()

    total_do = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan, models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date, 
        models.TMSRouteLine.sequence > 0
    ).count()

    weight_raw = db.query(func.sum(models.TMSRoutePlan.total_weight)).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).scalar()
    total_berat = float(weight_raw) if weight_raw else 0.0

    load_utilization = 0.0
    rute_aktif = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).all()

    total_capacity_available = 0.0
    total_trucks_used = len(rute_aktif)

    for rute in rute_aktif:
        if rute.vehicle and rute.vehicle.capacity_kg:
            total_capacity_available += float(rute.vehicle.capacity_kg)

    if total_capacity_available > 0:
        load_utilization = round((total_berat / total_capacity_available) * 100, 1)
        load_utilization = min(load_utilization, 100.0)

    fill_rate = 0.0
    return_rate = 0.0
    damage_rate = 0.0
    otif_rate = 0.0

    if total_do > 0:
        epods = db.query(models.TMSEpodHistory, models.DeliveryOrder.weight_total).join(
            models.TMSRouteLine, models.TMSEpodHistory.line_id == models.TMSRouteLine.line_id
        ).join(
            models.DeliveryOrder, models.TMSRouteLine.order_id == models.DeliveryOrder.order_id
        ).join(
            models.TMSRoutePlan, models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
        ).filter(
            models.TMSRoutePlan.planning_date >= start_date,
            models.TMSRoutePlan.planning_date <= end_date
        ).all()

        sum_qty_ordered = 0.0
        sum_qty_delivered = 0.0
        sum_qty_return = 0.0
        sum_qty_damaged = 0.0
        otif_count = 0

        for epod, ordered_weight in epods:
            qty_ord = float(ordered_weight) if ordered_weight else 0.0
            qty_del = float(epod.qty_delivered) if epod.qty_delivered else 0.0
            
            sum_qty_ordered += qty_ord
            sum_qty_delivered += qty_del
            sum_qty_return += float(epod.qty_return) if epod.qty_return else 0.0
            sum_qty_damaged += float(epod.qty_damaged) if epod.qty_damaged else 0.0

            if epod.status == models.DOStatus.delivered_success and qty_del >= qty_ord:
                otif_count += 1

        if sum_qty_ordered > 0:
            fill_rate = round((sum_qty_delivered / sum_qty_ordered) * 100, 1)
        if sum_qty_delivered > 0:
            return_rate = round((sum_qty_return / sum_qty_delivered) * 100, 1)
            damage_rate = round((sum_qty_damaged / sum_qty_delivered) * 100, 1)
        
        otif_rate = round((otif_count / total_do) * 100, 1)

    dist_raw = db.query(func.sum(models.TMSRoutePlan.total_distance_km)).filter(
        models.TMSRoutePlan.planning_date >= start_date,
        models.TMSRoutePlan.planning_date <= end_date
    ).scalar()
    total_distance = float(dist_raw) if dist_raw else 0.0

    cost_per_km = (settings.cost_fuel_per_liter / settings.cost_avg_km_per_liter) if settings.cost_avg_km_per_liter > 0 else 0
    fuel_cost = total_distance * cost_per_km
    driver_cost = total_trucks_used * (settings.cost_driver_salary / 22)
    total_cost = round(fuel_cost + driver_cost, 2)

    today = datetime.now().date()
    today_orders = db.query(models.TMSRouteLine).join(
        models.TMSRoutePlan, models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).filter(
        models.TMSRoutePlan.planning_date == today,
        models.TMSRouteLine.sequence > 0
    ).all()

    today_target_kg = 0.0
    completed_qty_kg = 0.0
    completed_drops = 0
    in_transit_drops = 0

    for line in today_orders:
        weight = float(line.route_plan.total_weight / len(line.route_plan.route_lines)) if line.route_plan.total_weight else 0
        today_target_kg += weight
        
        epod = db.query(models.TMSEpodHistory).filter(models.TMSEpodHistory.line_id == line.line_id).first()
        if epod and epod.status in [models.DOStatus.delivered_success, models.DOStatus.delivered_partial]:
            completed_drops += 1
            completed_qty_kg += float(epod.qty_delivered) if epod.qty_delivered else weight
        else:
            in_transit_drops += 1

    today_remaining_kg = max(0.0, today_target_kg - completed_qty_kg)
    completed_percent = round((completed_qty_kg / today_target_kg) * 100, 1) if today_target_kg > 0 else 0.0
    
    in_transit_qty_kg = today_remaining_kg
    in_transit_percent = 100.0 - completed_percent if today_target_kg > 0 else 0.0

    return {
        "status": "success",
        "success_rate_percent": otif_rate,
        "load_factor_percent": load_utilization,
        "total_weight_kg": round(total_berat, 1),
        "active_fleet_count": total_trucks_used,
        "total_distance_km": round(total_distance, 1),
        "data": {
            "transportCost": total_cost,
            "fillRate": fill_rate,
            "returnRate": return_rate,
            "damageRate": damage_rate,
        },
        "today_target": round(today_target_kg, 1),
        "today_remaining": round(today_remaining_kg, 1),
        "completed_qty": round(completed_qty_kg, 1),
        "completed_percent": completed_percent,
        "completed_drops": completed_drops,
        "in_transit_qty": round(in_transit_qty_kg, 1),
        "in_transit_percent": in_transit_percent,
        "in_transit_drops": in_transit_drops
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
# 🌟 ENDPOINT BARU 1: RETURNS DASHBOARD (TAB 2)
# ==========================================
@router.get("/returns-dashboard", response_model=schemas.ReturnDashboardResponse) # 🌟 SUNTIK SINI
def get_returns_dashboard(db: Session = Depends(get_db)):
    # Ambil semua data Epod yang diretur
    returns = db.query(models.TMSEpodHistory, models.TMSRoutePlan, models.DeliveryOrder, models.FleetVehicle).join(
        models.TMSRouteLine, models.TMSEpodHistory.line_id == models.TMSRouteLine.line_id
    ).join(
        models.TMSRoutePlan, models.TMSRouteLine.route_id == models.TMSRoutePlan.route_id
    ).join(
        models.DeliveryOrder, models.TMSRouteLine.order_id == models.DeliveryOrder.order_id
    ).join(
        models.FleetVehicle, models.TMSRoutePlan.vehicle_id == models.FleetVehicle.vehicle_id
    ).filter(
        models.TMSEpodHistory.qty_return > 0
    ).all()

    quality_kg, sku_kg, cust_kg = 0.0, 0.0, 0.0
    fleet_map = {}
    audit_logs = []

    for epod, plan, order, vehicle in returns:
        r_qty = float(epod.qty_return) if epod.qty_return else 0.0
        reason = epod.return_reason or "Lainnya"
        
        # Categorize by Root Cause
        if reason in ["Barang Rusak", "Packaging Bocor", "Kadaluarsa"]:
            quality_kg += r_qty
        elif reason in ["Salah Produk"]:
            sku_kg += r_qty
        else:
            cust_kg += r_qty

        # Fleet incident aggregation
        plate = vehicle.license_plate
        if plate not in fleet_map:
            fleet_map[plate] = {"count": 0, "weight": 0.0}
        fleet_map[plate]["count"] += 1
        fleet_map[plate]["weight"] += r_qty

        # Audit Logs Mapping
        status_color = "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
        if reason in ["Barang Rusak"]: status_color = "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"

        audit_logs.append({
            "date": epod.timestamp.strftime("%d %b %Y"),
            "customer": order.customer_name,
            "id": order.order_id,
            "product": epod.driver_notes.replace("Produk Retur: ", "") if epod.driver_notes else "N/A",
            "weight": f"{r_qty} KG",
            "reason": reason,
            "status": "Investigating",
            "color": status_color
        })

    total_return_kg = quality_kg + sku_kg + cust_kg
    
    # Donut Chart percentages
    qp = round((quality_kg / total_return_kg) * 100, 1) if total_return_kg > 0 else 0
    sp = round((sku_kg / total_return_kg) * 100, 1) if total_return_kg > 0 else 0
    cp = round((cust_kg / total_return_kg) * 100, 1) if total_return_kg > 0 else 0

    # Format Fleet Performance
    fleet_performance = []
    for plate, data in fleet_map.items():
        fleet_performance.append({
            "plate": plate,
            "count": data["count"],
            "weight": round(data["weight"], 1),
            "trend": "up", "percent": "+2%" # Dummy trend
        })
    fleet_performance = sorted(fleet_performance, key=lambda x: x['weight'], reverse=True)

    return {
        "status": "success",
        "data": {
            "summary": {
                "qualityKg": quality_kg, "qualityRupiah": quality_kg * 25000, "qualityTrend": -1.2,
                "skuKg": sku_kg, "skuRupiah": sku_kg * 25000, "skuTrend": -0.5,
                "custKg": cust_kg, "custRupiah": cust_kg * 25000, "custTrend": +0.8,
                "totalReturnKg": total_return_kg
            },
            "distribution": { "qualityPercent": qp, "skuPercent": sp, "custPercent": cp },
            "fleet_performance": fleet_performance,
            "audit_logs": audit_logs
        }
    }

# ==========================================
# 🌟 ENDPOINT BARU 2: EFFICIENCY DASHBOARD (TAB 3)
# ==========================================
@router.get("/efficiency-dashboard", response_model=schemas.EfficiencyDashboardResponse) # 🌟 SUNTIK SINI
def get_efficiency_dashboard(db: Session = Depends(get_db)):
    settings = get_settings()
    
    total_shipments = db.query(models.DeliveryOrder).count()

    rutes = db.query(models.TMSRoutePlan).all()
    total_weight = sum([(float(r.total_weight) if r.total_weight else 0.0) for r in rutes])
    total_capacity = 0.0
    total_dist = sum([(float(r.total_distance_km) if r.total_distance_km else 0.0) for r in rutes])

    for r in rutes:
        if r.vehicle and r.vehicle.capacity_kg:
            total_capacity += float(r.vehicle.capacity_kg)

    lf_percent = round((total_weight / total_capacity) * 100, 1) if total_capacity > 0 else 0.0
    
    cost_per_km = (settings.cost_fuel_per_liter / settings.cost_avg_km_per_liter) if settings.cost_avg_km_per_liter > 0 else 0
    total_cost = (total_dist * cost_per_km) + (len(rutes) * (settings.cost_driver_salary / 22))
    cost_per_kg = f"{round(total_cost / total_weight, 0):,}".replace(",", ".") if total_weight > 0 else "0"

    op_excellence = []
    for idx, rute in enumerate(rutes[:5]):
        w = float(rute.total_weight) if rute.total_weight else 0
        c = float(rute.vehicle.capacity_kg) if rute.vehicle and rute.vehicle.capacity_kg else 1
        lf_rute = round((w/c)*100)
        
        op_excellence.append({
            "route": f"Route #{rute.route_id}",
            "region": "Jabodetabek Hub",
            "otif": "95%",
            "lead": "4.2h",
            "factor": f"{lf_rute}%",
            "status": "Optimal" if lf_rute > 80 else "Underloaded",
            "color": "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" if lf_rute > 80 else "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
        })

    # 🌟 DATA BARU BUAT GRAFIK FRONTEND (SUPAYA GA HARDCODE)
    # Ini dummy array 7 hari untuk MVP. Nanti tinggal kita hubungin ke group_by Date!
    lf_trend = [40, 65, 55, 92, 75, 25, lf_percent] 

    cost_dist = [
        { "label": "BBM", "percent": 45, "color": "bg-japfa-orange", "stroke": "#F28C38" },
        { "label": "Driver", "percent": 30, "color": "bg-orange-300", "stroke": "#ffcc80" },
        { "label": "Tol/Parkir", "percent": 15, "color": "bg-amber-700", "stroke": "#8d6e63" },
        { "label": "Helper/Kuli", "percent": 10, "color": "bg-[#1d2d50]", "stroke": "#1d2d50" }
    ]

    hidden_costs = [
        { "label": "Parkir Liar", "value": "52%", "color": "bg-japfa-orange" },
        { "label": "Kuli/Lain2", "value": "31%", "color": "bg-orange-300" },
        { "label": "Helper Harian", "value": "17%", "color": "bg-slate-700" }
    ]

    return {
        "status": "success",
        "data": {
            "kpi": {
                "totalShipments": total_shipments,
                "avgLeadTime": "4.2h",
                "loadFactor": f"{lf_percent}%",
                "costPerKg": f"Rp {cost_per_kg}",
                "hiddenCost": "4.2%"
            },
            "lfTrend": lf_trend,
            "costDist": cost_dist,
            "hiddenCosts": hidden_costs,
            "opExcellence": op_excellence,
            "leakagePoints": [
                { "loc": "Pasar Senen Hub", "cost": "4.250.000", "pct": "24.1%" },
                { "loc": "Pluit Distribution", "cost": "3.120.000", "pct": "18.5%" }
            ]
        }
    }

# ==========================================
# 🌟 ENDPOINT BARU 3: MONITORING ALERTS
# ==========================================
@router.get("/monitoring-alerts")
def get_monitoring_alerts():
    # MVP: Kirim daftar alert dummy interaktif untuk panel
    return {
        "status": "success",
        "data": [
            { "title": "Route Congestion", "time": "2m ago", "desc": "Heavy traffic detected on Jakarta-Cikampek KM 42.", "icon": "report", "color": "border-red-500" },
            { "title": "Fleet Delay", "time": "15m ago", "desc": "Unit B-9281-UFA delayed due to severe weather.", "icon": "warning", "color": "border-orange-500" },
            { "title": "Cold Chain", "time": "1h ago", "desc": "Temp spike detected in Reefer-X45 container.", "icon": "ac_unit", "color": "border-red-500" }
        ]
    }

# ==========================================
# ENDPOINT LAMA: REJECTION ANALYSIS (DIBIARKAN BILA ADA YANG MASIH PAKE)
# ==========================================
@router.get("/rejections")
def get_rejection_analysis(
    startDate: str = None, 
    endDate: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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

# ==========================================
# ENDPOINT LAMA: MANAGER OVERVIEW
# ==========================================
@router.get("/manager/overview")
def get_manager_overview(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role("manager_logistik"))
):
    today = datetime.now().date()
    
    total_do = db.query(models.DeliveryOrder).count()
    
    active_fleet = db.query(models.TMSRoutePlan).filter(
        models.TMSRoutePlan.planning_date == today
    ).count()
    
    cost = db.query(func.sum(models.TMSRoutePlan.total_distance_km)).scalar() or 0
    est_cost = (cost / 5.0) * 12500 

    return {
        "status": "success",
        "data": {
            "total_orders": total_do,
            "active_fleet_today": active_fleet,
            "delayed_trucks": 0, 
            "estimated_cost_rp": int(est_cost)
        }
    }