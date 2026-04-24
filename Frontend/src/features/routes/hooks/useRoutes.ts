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
            // 🌟 SAFETY NET: Pastiin datanya beneran Array
            if (data && Array.isArray(data.routes)) {
                setRoutesData(data.routes as RouteItem[]);
                setDroppedNodes(data.dropped_nodes || []);
                setSelectedRouteId(data.routes[0]?.routeId || null);
            } else if (Array.isArray(data)) {
                setRoutesData(data as RouteItem[]);
                setSelectedRouteId(data[0]?.routeId || null);
            } else {
                // Kalo backend ngawur, set array kosong!
                setRoutesData([]);
                setDroppedNodes([]);
                setSelectedRouteId(null);
            }
        } catch (err) {
            console.error("Gagal mengambil data rute:", err);
            // 🌟 SAFETY NET JALUR ERROR: Cegah blank putih!
            setRoutesData([]);
            setDroppedNodes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        routesData,
        droppedNodes,
        selectedRouteId,
        setSelectedRouteId, // Biar UI bisa ganti rute yang diklik
        isLoading,
        fetchRoutes
    };
};