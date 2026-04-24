// src/features/drivers/hooks/useDriverPerformance.ts
import { useState, useEffect, useCallback } from "react";
import { useApi } from "shared/hooks/useApi";
import type { DriverData } from "../types/types";

export const useDriverPerformance = () => {
    const [drivers, setDrivers] = useState<DriverData[]>([]);
    const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(""); // Siap-siap buat fitur search

    // Bikin tanggal dinamis buat filter data 30 hari terakhir
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

    // 🌟 TEMBAK KE MESIN ANALYTICS!
    const { loading, execute } = useApi(`/api/analytics/driver-performance?startDate=${thirtyDaysAgo}&endDate=${today}`);

    const fetchDrivers = useCallback(async () => {
        try {
            const resData: any = await execute();
            const actualData = resData?.data?.data || resData?.data || resData;
            
            if (Array.isArray(actualData)) {
                // 🌟 MESIN TRANSLATOR: Backend -> Frontend
                const mappedDrivers: DriverData[] = actualData.map((d: any) => ({
                    id: d.id || (d.driver_id ? `DRV-${String(d.driver_id).padStart(3, '0')}` : `DRV-${Math.floor(Math.random()*1000)}`),
                    name: d.name || d.driver_name || "Supir JAPFA",
                    avatar: d.avatar || `https://ui-avatars.com/api/?name=${(d.name || d.driver_name || 'S').replace(' ', '+')}&background=0D8ABC&color=fff`,
                    status: (d.status === true || d.status === 'Active') ? 'On Route' : (d.status || 'Offline'),
                    score: d.score || 85,
                    ontime: d.ontime || (d.on_time_rate ? `${d.on_time_rate}%` : "95%"),
                    doSuccess: d.doSuccess || d.total_trips || "0",
                    truck: d.truck || "-",
                    distanceToday: d.distanceToday || 0,
                    doCompleted: d.doCompleted || 0,
                    doTotal: d.doTotal || d.total_trips || 0,
                    lastLocation: d.lastLocation || "📍 Depo Cikupa",
                    lastUpdate: d.lastUpdate || "Baru saja"
                }));
                
                setDrivers(mappedDrivers);
                if (mappedDrivers.length > 0) {
                    setExpandedDriverId(mappedDrivers[0].id);
                }
            } else {
                setDrivers([]);
            }
        } catch (error) {
            console.error("Gagal menarik data supir:", error);
            setDrivers([]);
        }
    }, [execute]);

    // 🌟 OBAT ANTI KEDAP-KEDIP (INFINITE LOOP)
    useEffect(() => {
        fetchDrivers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const toggleExpand = (id: string) => {
        setExpandedDriverId(prev => prev === id ? null : id);
    };

    return {
        loading,
        drivers,
        expandedDriverId,
        toggleExpand,
        searchQuery,
        setSearchQuery,
        refreshData: fetchDrivers
    };
};