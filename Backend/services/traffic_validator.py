# services/traffic_validator.py
import httpx
import datetime
import logging
from dependencies import get_settings
from utils.helpers import time_str_to_minutes

logger = logging.getLogger(__name__)

def _minutes_to_iso(total_minutes: int, date_str: str) -> str:
    """Convert total minutes to ISO 8601 datetime string"""
    base = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    h, m = divmod(total_minutes, 60)
    dt = base + datetime.timedelta(hours=int(h % 24), minutes=int(m))
    return dt.strftime("%Y-%m-%dT%H:%M:%S")

def validate_route_traffic(route: dict, date_str: str) -> dict:
    """
    Validasi satu rute kendaraan via TomTom Routing API.
    Panggil secara SEKUENSIAL (N calls, bukan N²).
    """
    settings = get_settings()
    stops = [s for s in route["detail_perjalanan"]
             if s.get("keterangan", "") not in ["Start", "Finish"]
             and s.get("lat")]
             
    # Pengecekan API KEY
    tomtom_key = getattr(settings, 'TOMTOM_API_KEY', None)
    if not tomtom_key:
        logger.warning("⚠️ TOMTOM_API_KEY tidak ditemukan di setting, skip traffic validation.")
        return {"warnings": [], "skipped": True}
    
    warnings = []
    # 🌟 FIX CTO: Pake fungsi helper biar menitnya ngga ilang
    current_minutes = time_str_to_minutes(settings.vrp_start_time)
    prev_lat, prev_lon = settings.depo_lat, settings.depo_lon
    
    for stop in stops:
        depart_iso = _minutes_to_iso(current_minutes, date_str)
        url = (
            f"https://api.tomtom.com/routing/1/calculateRoute/"
            f"{prev_lat},{prev_lon}:{stop['lat']},{stop['lon']}/json"
        )
        try:
            resp = httpx.get(url, params={
                "key": tomtom_key,
                "departAt": depart_iso,
                "traffic": "true",
                "travelMode": "truck",
            }, timeout=10)
            
            resp.raise_for_status() # Pastikan ga ada error 4xx/5xx dari TomTom
            travel_sec = resp.json()["routes"][0]["summary"]["travelTimeInSeconds"]
            travel_min = travel_sec // 60
        except Exception as e:
            logger.error(f"TomTom API Error untuk toko {stop.get('nama_toko')}: {e}")
            travel_min = 0 # Kalau TomTom gagal, anggap ga ada jarak tambahan sementara
        
        arrival_minutes = current_minutes + travel_min
        tw_end = stop.get("tw_end") 
        
        # Cek apakah kedatangan asli melebihi jam tutup toko
        if tw_end and arrival_minutes > tw_end:
            delay = arrival_minutes - tw_end
            warnings.append({
                "stop_order": stop.get("urutan"),
                "store_name": stop.get("nama_toko"),
                "planned_eta": stop.get("jam_tiba"),
                "real_eta_traffic": f"{int(arrival_minutes//60):02d}:{int(arrival_minutes%60):02d}",
                "delay_minutes": delay,
                "severity": "HIGH" if delay > 30 else "LOW",
                "truck_id": route.get("route_id"),
                "armada": route.get("armada")
            })
        
        # Update current time untuk toko selanjutnya: travel + service time
        service = 60 if stop.get("is_mall") else 15
        current_minutes = arrival_minutes + service
        prev_lat, prev_lon = stop["lat"], stop["lon"]
    
    return {
        "warnings": warnings,
        "has_critical": any(w["severity"] == "HIGH" for w in warnings),
        "route_id": route.get("route_id"),
    }