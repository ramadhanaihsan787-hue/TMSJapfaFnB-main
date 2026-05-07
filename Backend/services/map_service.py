# services/map_service.py
import requests
import math
import logging

# Setup logger biar rapi
logger = logging.getLogger(__name__)

# 🌟 FIX CTO: URL VPS OSRM Lu yang nyala 24 jam!
OSRM_BASE_URL = "http://157.10.161.170:5000"

def calculate_haversine(lat1, lon1, lat2, lon2) -> int:
    """Jarak garis lurus bumi dalam meter (Rumus Akurat)"""
    R = 6371.0 # Radius bumi dalam Kilometer
    
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

def build_osrm_matrix(locations: list):
    """
    Bangun distance & time matrix pakai OSRM VPS Mandiri.
    Lebih cepat dari TomTom dan GRATIS!
    """
    try:
        logger.info(f"🗺️ Menembak OSRM Matrix API untuk {len(locations)} titik...")
        
        # 🌟 FIX CTO: OSRM mintanya Longitude duluan (lon,lat)
        coords = ";".join([f"{loc['lon']},{loc['lat']}" for loc in locations])
        
        # Endpoint table buat narik matriks massal
        url = f"{OSRM_BASE_URL}/table/v1/driving/{coords}?annotations=duration,distance"
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") != "Ok":
            raise Exception(f"OSRM Error: {data.get('code')}")
            
        n = len(locations)
        distance_matrix = [[0] * n for _ in range(n)]
        time_matrix = [[0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                distance_matrix[i][j] = int(data["distances"][i][j])
                # Convert detik ke menit biar OR-Tools lu seneng
                time_matrix[i][j] = int(data["durations"][i][j] / 60)
                
        logger.info("✅ OSRM Matrix berhasil didapatkan!")
        return distance_matrix, time_matrix

    except Exception as e:
        logger.warning(f"⚠️ OSRM gagal: {e} → Switch ke Haversine fallback")
        return None, None

def build_haversine_matrix(locations: list):
    """Fallback matrix pakai Haversine formula"""
    logger.info("🔄 Pakai Haversine fallback...")
    n = len(locations)
    distance_matrix, time_matrix = [[0] * n for _ in range(n)], [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                dist = calculate_haversine(locations[i]["lat"], locations[i]["lon"], locations[j]["lat"], locations[j]["lon"])
                distance_matrix[i][j] = dist
                time_matrix[i][j] = int(dist / 400) 
    return distance_matrix, time_matrix

def get_road_geometry(route_indices: list, locations: list) -> list:
    """Ambil polyline aspal rute dari OSRM VPS Mandiri"""
    try:
        # 🌟 FIX CTO: OSRM mintanya Longitude duluan (lon,lat)
        coords = ";".join([f"{locations[n]['lon']},{locations[n]['lat']}" for n in route_indices])
        
        # Endpoint route buat narik polyline / garis jalan
        url = f"{OSRM_BASE_URL}/route/v1/driving/{coords}?overview=full&geometries=geojson"
        
        res = requests.get(url, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if data.get("code") == "Ok":
                # OSRM ngasih GeoJSON [lon, lat], kita puter balik ke [lat, lon] buat mapbox frontend
                coordinates = data["routes"][0]["geometry"]["coordinates"]
                return [[p[1], p[0]] for p in coordinates]
    except Exception as e:
        logger.error(f"⚠️ Gagal ambil geometry OSRM: {e}")
    return []