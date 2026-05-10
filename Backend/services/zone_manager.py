# services/zone_manager.py
import logging
from services.map_service import calculate_haversine

logger = logging.getLogger(__name__)

def _get_cluster_weight(cluster: list) -> float:
    """Menghitung total berat dalam satu zona"""
    return sum(float(store.get('berat', 0) or store.get('weight_total', 0)) for store in cluster)

def _get_centroid(cluster: list) -> dict:
    """Menghitung titik tengah (centroid) dari sebuah zona"""
    if not cluster:
        return {'lat': 0, 'lon': 0}
    avg_lat = sum(float(s['lat'] if 'lat' in s else s.latitude) for s in cluster) / len(cluster)
    avg_lon = sum(float(s['lon'] if 'lon' in s else s.longitude) for s in cluster) / len(cluster)
    return {'lat': avg_lat, 'lon': avg_lon}

def _find_best_alternative_cluster(store: dict, centroids: list, weights: list, max_cap: float, current_idx: int) -> int:
    """
    Mencari zona tetangga yang paling dekat dengan toko ini, 
    TAPI syaratnya zona tetangga itu kapasitasnya masih muat.
    """
    store_lat = float(store['lat'] if 'lat' in store else store.latitude)
    store_lon = float(store['lon'] if 'lon' in store else store.longitude)
    store_weight = float(store.get('berat', 0) or store.get('weight_total', 0))

    best_idx = None
    min_dist = float('inf')

    for i, centroid in enumerate(centroids):
        if i == current_idx: continue
        
        # Cek apakah zona tetangga masih muat kalau ditambahin toko ini
        if weights[i] + store_weight <= max_cap:
            dist = calculate_haversine(store_lat, store_lon, centroid['lat'], centroid['lon'])
            if dist < min_dist:
                min_dist = dist
                best_idx = i

    return best_idx

def balance_zones(clusters: list, max_capacity_per_truck: float, max_swap_iters: int = 50):
    """
    🌟 FASE 2: BORDER SWAPPING & SPILLOVER (Mitigasi R1)
    Menyeimbangkan beban antar zona agar tidak melebihi kapasitas maksimum truk.
    """
    logger.info("⚖️ Memulai Border Swapping (Tukar Guling) antar zona...")
    spillover_basket = []
    
    # Hitung centroid awal masing-masing zona
    centroids = [_get_centroid(c) for c in clusters]

    for iteration in range(max_swap_iters):
        weights = [_get_cluster_weight(c) for c in clusters]
        
        # Cari zona mana aja yang obesitas (melebihi kapasitas truk terbesar kita)
        overweight_indices = [i for i, w in enumerate(weights) if w > max_capacity_per_truck]

        if not overweight_indices:
            logger.info(f"✅ Semua zona sudah seimbang di bawah {max_capacity_per_truck}kg dalam {iteration} iterasi!")
            break

        moved_anything = False

        for ov_idx in overweight_indices:
            cluster = clusters[ov_idx]
            centroid = centroids[ov_idx]
            
            # Urutkan toko di zona obesitas berdasarkan yang PALING JAUH dari pusat zonanya sendiri (Toko Perbatasan)
            # Biar yang digeser ke tetangga itu toko yang di pinggiran, bukan yang di tengah kota
            sorted_stores = sorted(
                cluster, 
                key=lambda s: calculate_haversine(
                    float(s['lat'] if 'lat' in s else s.latitude), 
                    float(s['lon'] if 'lon' in s else s.longitude), 
                    centroid['lat'], 
                    centroid['lon']
                ), 
                reverse=True
            )

            for store in sorted_stores:
                best_alt_idx = _find_best_alternative_cluster(store, centroids, weights, max_capacity_per_truck, ov_idx)
                
                if best_alt_idx is not None:
                    # LAKUKAN TUKAR GULING!
                    clusters[ov_idx].remove(store)
                    clusters[best_alt_idx].append(store)
                    
                    # Update cache berat & centroid
                    weights[ov_idx] -= float(store.get('berat', 0) or store.get('weight_total', 0))
                    weights[best_alt_idx] += float(store.get('berat', 0) or store.get('weight_total', 0))
                    centroids[ov_idx] = _get_centroid(clusters[ov_idx])
                    centroids[best_alt_idx] = _get_centroid(clusters[best_alt_idx])
                    
                    moved_anything = True
                    # Cukup pindah 1 toko per zona per iterasi biar stabil ngeceknya
                    break 

        if not moved_anything:
            logger.warning(f"⚠️ Swap stuck di iterasi {iteration}. Tidak ada zona tetangga yang muat lagi.")
            break

    # 🌟 PENYAPUAN TERAKHIR (KERANJANG MERAH / SPILLOVER)
    # Kalau setelah di-swap ke tetangga ternyata MASIH ada zona yang kepenuhan 
    # (berarti emang pesanan hari itu lagi membludak), sisa toko kita potong paksa.
    for i, cluster in enumerate(clusters):
        while _get_cluster_weight(cluster) > max_capacity_per_truck and len(cluster) > 0:
            centroid = _get_centroid(cluster)
            # Potong toko yang paling jauh dari pusat
            furthest_store = max(
                cluster, 
                key=lambda s: calculate_haversine(
                    float(s['lat'] if 'lat' in s else s.latitude), 
                    float(s['lon'] if 'lon' in s else s.longitude), 
                    centroid['lat'], 
                    centroid['lon']
                )
            )
            cluster.remove(furthest_store)
            
            # Catat alasan ngga masuk rute
            if type(furthest_store) == dict:
                furthest_store['alasan'] = "Overcapacity (Spillover Zona)"
            else:
                furthest_store.alasan = "Overcapacity (Spillover Zona)"
                
            spillover_basket.append(furthest_store)

    if spillover_basket:
        logger.error(f"🚨 Terdapat {len(spillover_basket)} toko yang masuk Keranjang Spillover (On-Call)!")

    return clusters, spillover_basket