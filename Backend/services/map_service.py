# services/map_service.py
import requests
import math
import logging
import random
import hashlib
import json

logger = logging.getLogger(__name__)

OSRM_BASE_URL = "http://157.10.161.170:5000"

# 🌟 KAMUS KEMACETAN JABODETABEK (SPRINT 1)
TRAFFIC_MULTIPLIERS = {    
    (0, 5):   1.0,   # Tengah malam - pagi buta: clear    
    (5, 7):   1.15,  # Subuh - sebelum rush: sedikit padat    
    (7, 9):   1.55,  # Morning rush Jakarta: berat    
    (9, 11):  1.25,  # Post-rush masih medium    
    (11, 14): 1.15,  # Siang: relatif lancar    
    (14, 16): 1.25,  # Sore mulai padat    
    (16, 19): 1.60,  # Evening rush: berat banget    
    (19, 24): 1.10,  # Malam: mulai sepi
}

def get_traffic_multiplier(departure_hour: int) -> float:
    """Ambil faktor pengali kemacetan berdasarkan jam"""
    for (start, end), mult in TRAFFIC_MULTIPLIERS.items():
        if start <= departure_hour < end:
            return mult
    return 1.2  

def apply_traffic_to_time_matrix(time_matrix: list[list[int]], departure_hour: int) -> list[list[int]]:
    """Kalikan seluruh time matrix dengan traffic multiplier"""
    mult = get_traffic_multiplier(departure_hour)
    logger.info(f"🚦 Jam {departure_hour}:00 -> Traffic Multiplier {mult}x diterapkan!")
    return [
        [int(cell * mult) for cell in row]
        for row in time_matrix
    ]

def calculate_haversine(lat1, lon1, lat2, lon2) -> int:
    R = 6371.0 
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2.0)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c * 1000) 

def build_osrm_matrix(locations: list):
    try:
        logger.info(f"🗺️ Menembak OSRM Matrix API untuk {len(locations)} titik...")
        coords = ";".join([f"{loc['lon']},{loc['lat']}" for loc in locations])
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
                time_matrix[i][j] = int(data["durations"][i][j] / 60)
                
        logger.info("✅ OSRM Matrix berhasil didapatkan!")
        return distance_matrix, time_matrix

    except Exception as e:
        logger.warning(f"⚠️ OSRM gagal: {e} → Switch ke Haversine fallback")
        return None, None

def build_haversine_matrix(locations: list):
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
    try:
        coords = ";".join([f"{locations[n]['lon']},{locations[n]['lat']}" for n in route_indices])
        url = f"{OSRM_BASE_URL}/route/v1/driving/{coords}?overview=full&geometries=geojson"
        res = requests.get(url, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if data.get("code") == "Ok":
                coordinates = data["routes"][0]["geometry"]["coordinates"]
                return [[p[1], p[0]] for p in coordinates]
    except Exception as e:
        logger.error(f"⚠️ Gagal ambil geometry OSRM: {e}")
    return []

# ==========================================
# 🌟 SPRINT 3: ANCHORED K-MEANS & SPATIAL CLUSTERING 
# ==========================================

def _graham_scan_convex_hull(points):
    """Mencari polygon pembungkus."""
    if len(points) <= 3: return points

    def polar_angle(p1, p2): return math.atan2(p2[1] - p1[1], p2[0] - p1[0])

    p0 = min(points, key=lambda p: (p[1], p[0]))
    points.sort(key=lambda p: (polar_angle(p0, p), (p[0]-p0[0])**2 + (p[1]-p0[1])**2))

    hull = []
    for p in points:
        while len(hull) >= 2:
            p1, p2 = hull[-2], hull[-1]
            if (p2[0] - p1[0]) * (p[1] - p1[1]) - (p2[1] - p1[1]) * (p[0] - p1[0]) <= 0:
                hull.pop()
            else:
                break
        hull.append(p)
    return hull

def _generate_seed_from_locations(locations):
    sample_str = "".join([f"{loc['lat']}{loc['lon']}" for loc in locations[:5]])
    hash_obj = hashlib.md5(sample_str.encode('utf-8'))
    return int(hash_obj.hexdigest()[:8], 16)

# 🌟 7 TITIK JANTUNG JABODETABEK (RACIKAN KUSTOM JAPFA)
JABODETABEK_ANCHORS = [
    {'lat': -6.2855, 'lon': 107.1465, 'name': 'Bekasi / Cikarang'},         # Zona 1: East Industrial
    {'lat': -6.1599, 'lon': 106.9050, 'name': 'Kelapa Gading & Sekitarnya'},# Zona 2: North Urban
    {'lat': -6.1887, 'lon': 106.7460, 'name': 'Kembangan / Jakarta Barat'}, # Zona 3: West Urban
    {'lat': -6.3016, 'lon': 106.6520, 'name': 'Serpong / BSD'},             # Zona 4: West Suburban
    {'lat': -6.2146, 'lon': 106.8229, 'name': 'Jakarta Pusat & Selatan'},   # Zona 5: Central & South Urban
    {'lat': -6.5971, 'lon': 106.8060, 'name': 'Bogor'},                     # Zona 6: South Suburban
    {'lat': -6.2253, 'lon': 106.5088, 'name': 'Tangerang Kota / Tigaraksa'} # Zona 7: West Buffer (Depot Area)
]

def _kmeans_clustering(locations, k, max_iters=20):
    """
    Anchored K-Means: Mulai dari 7 titik logis, lalu biarkan bergeser 
    secara dinamis menyesuaikan orderan nyata hari ini.
    """
    if len(locations) <= k:
        return [[loc] for loc in locations]

    centroids = []
    if k <= len(JABODETABEK_ANCHORS):
        # Kalau butuh 7 truk atau kurang, kita tarik anchor dari database kita
        centroids = [{'lat': a['lat'], 'lon': a['lon']} for a in JABODETABEK_ANCHORS[:k]]
    else:
        # Fallback misal lu tiba-tiba punya 10 truk
        seed_val = _generate_seed_from_locations(locations)
        random.seed(seed_val)
        centroids = random.sample(locations, k)
    
    clusters = []

    for iteration in range(max_iters):
        clusters = [[] for _ in range(k)]
        # 1. Magnet menarik toko terdekat
        for loc in locations:
            distances = [calculate_haversine(loc['lat'], loc['lon'], c['lat'], c['lon']) for c in centroids]
            closest_idx = distances.index(min(distances))
            clusters[closest_idx].append(loc)
            
        # 2. Pusat magnet bergeser menyesuaikan titik tengah toko yang ketarik
        new_centroids = []
        for cluster in clusters:
            if not cluster:
                # Kalau ada zona yang saking sepinya kosong, ganti pake random titik toko
                new_centroids.append(random.choice(locations))
            else:
                avg_lat = sum(c['lat'] for c in cluster) / len(cluster)
                avg_lon = sum(c['lon'] for c in cluster) / len(cluster)
                new_centroids.append({'lat': avg_lat, 'lon': avg_lon})
                
        centroids = new_centroids

    return clusters

def generate_spatial_zones(locations: list, num_zones: int) -> list:
    """Dipakai untuk Preview Animasi Polygon di Frontend"""
    logger.info(f"🗺️ Memetakan {len(locations)} toko ke {num_zones} zona (Anchored K-Means)...")
    store_locations = [loc for loc in locations if "GUDANG" not in str(loc.get('nama_toko', '')).upper()]
    clusters = _kmeans_clustering(store_locations, num_zones)
    
    zones = []
    for i, cluster in enumerate(clusters):
        if not cluster: continue
        points = [[loc['lon'], loc['lat']] for loc in cluster]
        polygon = _graham_scan_convex_hull(points)
        zones.append({
            "zone_id": i + 1,
            "stores": cluster,
            "bounding_polygon": polygon
        })
    return zones

# ==========================================
# 🌟 TAHAP 1 DARI MASTER PLAN: ENTRY POINT BUAT ZONE_MANAGER
# ==========================================
def cluster_stores_for_routing(locations: list, num_zones: int) -> list:
    """Mengembalikan list of cluster murni untuk di-swap dan di-routing."""
    logger.info(f"🗺️ Tahap 1: Membagi {len(locations)} toko ke dalam {num_zones} Cluster Awal (Anchored)...")
    store_locations = [loc for loc in locations if "GUDANG" not in str(loc.get('nama_toko', '')).upper()]
    
    if len(store_locations) <= num_zones:
        return [[store] for store in store_locations]
        
    return _kmeans_clustering(store_locations, num_zones)