# services/map_service.py
import requests
import time
import math
import logging # 🌟 FIX CTO: Pakai proper logging, bukan print!

# Setup logger biar rapi
logger = logging.getLogger(__name__)

def calculate_haversine(lat1, lon1, lat2, lon2) -> int:
    """Jarak garis lurus bumi dalam meter (Rumus Akurat)"""
    R = 6371.0 # Radius bumi dalam Kilometer (pakai float biar akurat)
    
    # Konversi ke Radian
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    # Rumus Haversine standar
    a = math.sin(dlat / 2.0)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    # Hasil akhir ubah ke meter (int)
    return int(R * c * 1000) 

def build_tomtom_matrix(locations: list, api_key: str):
    """Bangun distance & time matrix pakai TomTom Async API."""
    url = f"https://api.tomtom.com/routing/matrix/2/async?key={api_key}"
    points = [{"point": {"latitude": loc["lat"], "longitude": loc["lon"]}} for loc in locations]
    payload = {
        "origins": points, "destinations": points,
        "options": {"routeType": "fastest", "traffic": "historical", "travelMode": "truck"}
    }

    try:
        logger.info("🗺️ Menembak TomTom Matrix API...")
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
        response.raise_for_status()
        matrix_result = None

        if response.status_code == 202:
            job_id = response.json().get('jobId')
            tracking_url = f"https://api.tomtom.com/routing/matrix/2/async/{job_id}?key={api_key}"
            for _ in range(30):
                time.sleep(2)
                status_res = requests.get(tracking_url, timeout=10)
                if status_res.status_code == 200:
                    state = status_res.json().get("state", "").upper()
                    if state == "COMPLETED":
                        matrix_result = requests.get(f"{tracking_url}/result?key={api_key}", timeout=15).json()
                        break
                    elif state == "FAILED":
                        raise Exception("TomTom job FAILED")
            if not matrix_result: raise Exception("TomTom timeout!")
        else:
            matrix_result = response.json()

        n = len(locations)
        distance_matrix, time_matrix = [[0] * n for _ in range(n)], [[0] * n for _ in range(n)]

        if "data" in matrix_result:
            for cell in matrix_result["data"]:
                o_idx, d_idx = cell.get("originIndex", 0), cell.get("destinationIndex", 0)
                if "routeSummary" in cell:
                    distance_matrix[o_idx][d_idx] = cell["routeSummary"]["lengthInMeters"]
                    time_matrix[o_idx][d_idx] = int(cell["routeSummary"].get("travelTimeInSeconds", 0) / 60)
                else:
                    distance_matrix[o_idx][d_idx], time_matrix[o_idx][d_idx] = 999999, 999

        logger.info("✅ TomTom Matrix berhasil!")
        return distance_matrix, time_matrix

    except Exception as e:
        logger.warning(f"⚠️ TomTom gagal: {e} → Switch ke Haversine")
        return None, None

def build_haversine_matrix(locations: list):
    """Fallback matrix pakai Haversine formula"""
    logger.info("🔄 Pakai Haversine fallback...")
    n = len(locations)
    distance_matrix, time_matrix = [[0] * n for _ in range(n)], [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                # SESUDAH FIX
                dist = calculate_haversine(locations[i]["lat"], locations[i]["lon"], locations[j]["lat"], locations[j]["lon"])
                distance_matrix[i][j] = dist
                time_matrix[i][j] = int(dist / 400) 
    return distance_matrix, time_matrix

def get_road_geometry(route_indices: list, locations: list, api_key: str) -> list:
    """Ambil polyline aspal dari TomTom"""
    waypoints_str = ":".join([f"{locations[n]['lat']},{locations[n]['lon']}" for n in route_indices])
    try:
        url = f"https://api.tomtom.com/routing/1/calculateRoute/{waypoints_str}/json?key={api_key}&routeType=fastest&travelMode=truck"
        res = requests.get(url, timeout=15)
        if res.status_code == 200:
            return [[p['latitude'], p['longitude']] for leg in res.json()['routes'][0]['legs'] for p in leg['points']]
    except Exception as e:
        logger.error(f"⚠️ Gagal ambil geometry: {e}")
    return []