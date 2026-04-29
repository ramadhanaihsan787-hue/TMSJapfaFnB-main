// src/features/routes/hooks/useRoutes.ts
import { useState, useCallback } from "react";
import { routeService } from "../services/routeService";
import type { RouteItem, DroppedNode } from "../types";

export const useRoutes = () => {
    const [routesData, setRoutesData] = useState<RouteItem[]>([]);
    const [droppedNodes, setDroppedNodes] = useState<DroppedNode[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRoutes = useCallback(async (date: string) => {
        setIsLoading(true);
        try {
            const data = await routeService.fetchRoutes(date);
            const rawRoutes = data?.routes || data;

            if (rawRoutes && Array.isArray(rawRoutes)) {
                const mapped: RouteItem[] = rawRoutes.map((r: any) => {
                    // Mapping isi rute ke array
                    const mappedStops = (r.detail_rute || r.detail_perjalanan || []).map((s: any) => ({
                        sequence: s.urutan,
                        storeName: s.nama_toko,
                        weight: s.berat_kg || s.turun_barang_kg || 0,
                        arrivalTime: s.jam_tiba || s.jam || "",
                        lat: s.latitude || s.lat || 0,
                        lng: s.longitude || s.lon || 0
                    }));

                    return {
                        routeId: r.route_id,
                        truckName: r.kendaraan || r.armada || "-",
                        driverName: r.driver_name || r.driver || "-",
                        totalWeight: r.total_berat || r.total_muatan_kg || 0,
                        totalDistanceKm: r.total_distance_km || r.total_jarak_km || 0,
                        destinationCount: r.destinasi_jumlah || (r.detail_perjalanan?.length || 0),
                        
                        date: r.tanggal || new Date().toISOString().split('T')[0],
                        vehicle: r.kendaraan || r.armada || "-",
                        vehicleType: r.jenis || "Box Truck",
                        status: r.status || "Aktif",
                        transportCost: r.transport_cost || 0,
                        zone: r.zone || "-",

                        // 🌟 FIX: Kita kasih DUA-DUANYA biar UI aman, TypeScript mingkem!
                        stops: mappedStops,
                        details: mappedStops, // Ini yang diteriakin TS tadi!
                        
                        geometry: r.garis_aspal || []
                    } as unknown as RouteItem; // 🌟 Pake 'unknown' dulu biar TS berhenti bawel
                });
                
                setRoutesData(mapped);
                setDroppedNodes(data.dropped_nodes || []);
                setSelectedRouteId(mapped[0]?.routeId || null);
            }
        } catch (err) {
            console.error("Gagal mengambil data rute:", err);
            setRoutesData([]);
            setDroppedNodes([]);
            setSelectedRouteId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        routesData,
        droppedNodes,
        selectedRouteId,
        setSelectedRouteId, 
        isLoading,
        fetchRoutes
    };
};