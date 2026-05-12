# services/vrp_service.py
import logging
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import copy

from services import map_service, zone_manager, vrp_solver

logger = logging.getLogger(__name__)

class VRPService:
    @staticmethod
    def cluster_first_pipeline(pending_orders: List[Any], vehicles: List[Any], settings: Any):
        """
        🚀 ARSITEKTUR BARU: Cluster-First, Route-Second
        Ini adalah entry point untuk menjalankan 5 Fase Routing.
        """
        try:
            # ==========================================
            # FASE 0: Inisialisasi Data & Order Consolidation
            # ==========================================
            from utils.helpers import consolidate_orders, classify_store
            grouped_orders = consolidate_orders(pending_orders)
            
            locations = [{"lat": settings.depo_lat, "lon": settings.depo_lon, "nama_toko": "GUDANG JAPFA"}]
            node_to_orders = {}
            node_counter = 1
            
            total_berat_semua = 0
            total_estimasi_bongkar_menit = 0 # Buat ngukur butuh berapa truk secara waktu
            
            for key, orders in grouped_orders.items():
                first_order = orders[0]
                total_node_weight = sum(int(o.weight_total) for o in orders)
                total_berat_semua += total_node_weight
                store_name = first_order.customer.store_name if first_order.customer else "Toko"
                
                # Hitung estimasi waktu bongkar di titik ini
                is_mall = classify_store(store_name)
                base_time = 60 if is_mall else 15
                var_time = (float(total_node_weight) / 10.0) * 1.0
                total_estimasi_bongkar_menit += (base_time + var_time)
                
                locations.append({
                    "node_id": node_counter, 
                    "lat": float(first_order.latitude), 
                    "lon": float(first_order.longitude),
                    "nama_toko": store_name,
                    "berat": total_node_weight
                })
                node_to_orders[node_counter] = orders
                node_counter += 1

            # 🌟 LOGIKA BARU PEMANGGILAN ARMADA (MURNI BERAT & JAM KERJA)
            ideal_trucks_by_weight = int((total_berat_semua // 2500) + 1)
            
            # Asumsi: Jam 07:00 sd 19:30 = 750 menit. Dikurang estimasi jalan di aspal 150 menit = 600 menit murni bongkar per truk.
            ideal_trucks_by_time = int(total_estimasi_bongkar_menit // 600) + 1 
            
            # Panggil truk berdasarkan kebutuhan paling mendesak (waktu atau berat)
            ideal_trucks = max(ideal_trucks_by_weight, ideal_trucks_by_time)
            
            active_count = min(ideal_trucks, len(vehicles))
            if active_count < 1: active_count = 1
            
            logger.info(f"🚚 Mempersiapkan {active_count} Armada untuk {len(locations)-1} toko. Total muatan: {total_berat_semua}kg, Est. Waktu Bongkar: {total_estimasi_bongkar_menit} menit.")

            # ==========================================
            # FASE 1: Spatial K-Means Clustering
            # ==========================================
            raw_clusters = map_service.cluster_stores_for_routing(locations, active_count)

            # ==========================================
            # FASE 2: Border Swapping (Penyeimbangan Kapasitas)
            # ==========================================
            max_safe_capacity = max(v.capacity_kg for v in vehicles) * (settings.vrp_capacity_buffer_percent / 100.0)
            
            balanced_clusters, spillover_basket = zone_manager.balance_zones(
                raw_clusters, max_capacity_per_truck=max_safe_capacity
            )

            # ==========================================
            # FASE 3: Parallel Routing (Jalanin OR-Tools bersamaan!)
            # ==========================================
            logger.info(f"⚡ Memulai Parallel Routing untuk {len(balanced_clusters)} zona...")
            
            final_routes_data = []
            
            def _solve_zone_worker(cluster_idx, cluster_stores):
                if not cluster_stores: return None
                
                zone_locs = [{"lat": settings.depo_lat, "lon": settings.depo_lon, "nama_toko": "GUDANG JAPFA"}] + cluster_stores
                zone_demands = [0] + [int(s['berat']) for s in cluster_stores]
                
                zone_is_mall = [False] + [classify_store(s['nama_toko']) for s in cluster_stores]
                
                # 🌟 KUNCI WAKTU KERJA
                start_min = 420 # 07:00 Pagi jalan dari depo
                max_drop_min = 1170 # 19:30 Malam (Batas akhir tiba & bongkar di toko terakhir)
                
                # Depo ngga dikasih batas waktu kepulangan (mentok di 1440 alias 23:59), jadi supir ngga akan dihukum mau balik jam berapapun.
                zone_tw = [(start_min, 1440)] + [(start_min, max_drop_min)] * len(cluster_stores)

                dist_mat, time_mat = map_service.build_osrm_matrix(zone_locs)
                if not dist_mat:
                    dist_mat, time_mat = map_service.build_haversine_matrix(zone_locs)
                
                matrix_km = [[int(d / 1000) for d in row] for row in dist_mat]
                
                hasil = vrp_solver.solve_single_zone(
                    distance_matrix=matrix_km,
                    time_matrix=time_mat,
                    demands=zone_demands,
                    vehicle_capacity=int(max_safe_capacity),
                    is_mall_list=zone_is_mall,
                    time_windows=zone_tw,
                    base_drop_time=15, 
                    var_drop_time=10 
                )
                
                return {"cluster_idx": cluster_idx, "result": hasil, "locations": zone_locs, "dist_mat": dist_mat, "time_mat": time_mat}

            # 🌟 PARALLEL EXECUTION MAGIC
            with ThreadPoolExecutor(max_workers=active_count) as executor:
                futures = {executor.submit(_solve_zone_worker, i, c): i for i, c in enumerate(balanced_clusters)}
                for future in as_completed(futures):
                    res = future.result()
                    if res and res["result"]:
                        final_routes_data.append(res)

            # ==========================================
            # FASE 4: Smart Fleet Matching
            # ==========================================
            return VRPService.match_routes_to_fleet(
                final_routes_data, vehicles, settings, node_to_orders, spillover_basket
            )

        except Exception as e:
            logger.error(f"🚨 FATAL ERROR Pipeline: {str(e)}", exc_info=True)
            raise e

    @staticmethod
    def match_routes_to_fleet(final_routes_data, vehicles, settings, node_to_orders, spillover_basket):
        """Menjodohkan Rute Terberat dengan Truk Terbesar"""
        logger.info("🚚 Menjodohkan Rute dengan Armada berdasarkan muatan...")
        
        extracted_routes = []
        for rd in final_routes_data:
            if not rd["result"] or not rd["result"]['routes']: continue
            
            route_indices = rd["result"]['routes'][0]
            if len(route_indices) <= 2: continue # Rute kosong (cuma Depo-Depo)
            
            zone_locs = rd["locations"]
            
            total_berat_rute = 0
            for idx in route_indices:
                if idx == 0: continue
                total_berat_rute += zone_locs[idx]['berat']
                
            extracted_routes.append({
                "cluster_idx": rd["cluster_idx"], 
                "weight": total_berat_rute,
                "route_indices": route_indices,
                "locations": zone_locs,
                "dist_mat": rd["dist_mat"],
                "time_mat": rd["time_mat"],
                "dropped": rd["result"]['dropped_nodes']
            })
            
        # Urutkan Rute dari yang Paling Berat ke Ringan
        extracted_routes.sort(key=lambda x: x["weight"], reverse=True)
        # Urutkan Truk dari Kapasitas Terbesar ke Terkecil
        sorted_vehicles = sorted(vehicles, key=lambda v: v.capacity_kg, reverse=True)
        
        formatted_routes = []
        for i, r_data in enumerate(extracted_routes):
            if i >= len(sorted_vehicles): 
                # Truk abis! Lempar rute ini ke spillover
                for idx in r_data["route_indices"]:
                    if idx != 0: spillover_basket.append(r_data["locations"][idx])
                continue
                
            assigned_vehicle = sorted_vehicles[i]
            
            from utils.helpers import menit_ke_jam, classify_store
            import datetime
            
            route_id = f"RP-{datetime.datetime.now().strftime('%Y%m%d')}-T{i+1}"
            manifest = []
            current_time = 420 # 07:00 Pagi jalan dari depo
            prev_node = 0
            global_seq = 0 
            
            for step, node_idx in enumerate(r_data["route_indices"]):
                seg_m = r_data["dist_mat"][prev_node][node_idx] if step != 0 else 0
                seg_km = round(seg_m / 1000.0, 1)
                
                if node_idx == 0:
                    if step != 0: current_time += r_data["time_mat"][prev_node][node_idx]
                    manifest.append({
                        "urutan": global_seq, "lokasi": "📍 GUDANG JAPFA", 
                        "jam": str(menit_ke_jam(current_time)),
                        "keterangan": "Start" if step == 0 else "Finish", 
                        "lat": settings.depo_lat, "lon": settings.depo_lon, "distance_from_prev_km": seg_km
                    })
                    global_seq += 1
                else:
                    toko_data = r_data["locations"][node_idx]
                    original_node_id = toko_data.get("node_id")
                    
                    is_mall = classify_store(toko_data.get("nama_toko", ""))
                    base_time = 60 if is_mall else 15
                    var_time = (float(toko_data.get('berat', 0)) / 10.0) * 1.0
                    service_time = base_time + var_time
                    
                    current_time += r_data["time_mat"][prev_node][node_idx]
                    
                    if original_node_id and original_node_id in node_to_orders:
                        orders_in_node = node_to_orders[original_node_id]
                        for sub_idx, order in enumerate(orders_in_node):
                            manifest.append({
                                "urutan": global_seq, 
                                "nomor_do": order.order_id,
                                "nama_toko": order.customer.store_name if order.customer else "Toko", 
                                "turun_barang_kg": round(float(order.weight_total), 2), 
                                "jam_tiba": str(menit_ke_jam(current_time)),
                                "lat": float(order.latitude), "lon": float(order.longitude), 
                                "distance_from_prev_km": seg_km if sub_idx == 0 else 0
                            })
                            global_seq += 1
                            
                    current_time += service_time
                    
                prev_node = node_idx
                
            route_geometry = map_service.get_road_geometry(r_data["route_indices"], r_data["locations"])
            total_km = round(sum(r_data["dist_mat"][r_data["route_indices"][j]][r_data["route_indices"][j+1]] for j in range(len(r_data["route_indices"])-1)) / 1000.0, 1)

            formatted_routes.append({
                "route_id": route_id, 
                "color_index": r_data["cluster_idx"], 
                "armada": assigned_vehicle.license_plate,
                "driver_id": assigned_vehicle.default_driver_id,
                "helper_id": assigned_vehicle.co_driver_id,
                "total_muatan_kg": r_data["weight"], 
                "total_jarak_km": total_km,
                "detail_perjalanan": manifest, 
                "garis_aspal": route_geometry
            })

        return formatted_routes, spillover_basket