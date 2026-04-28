import { useState, useEffect, useCallback } from "react";
import { useApi } from "../../../shared/hooks/useApi"; // 🌟 TYPO FIX: Path Import yang Bener!
import type { DriverData } from "../types/types";

export const useDriverPerformance = () => {
    const [drivers, setDrivers] = useState<DriverData[]>([]);
    const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(""); 

    // Bikin tanggal dinamis buat filter data 30 hari terakhir
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

    // 🌟 TEMBAK KE MESIN ANALYTICS ASLI POSTGRESQL!
    const { loading, execute } = useApi(`/api/analytics/driver-performance?startDate=${thirtyDaysAgo}&endDate=${today}`);

    const fetchDrivers = useCallback(async () => {
        try {
            const resData: any = await execute();
            const actualData = resData?.data?.data || resData?.data || resData;
            
            if (Array.isArray(actualData)) {
                // Translator dari model.HRDriver PostgreSQL ke Frontend State
                const mappedDrivers: DriverData[] = actualData.map((d: any) => ({
                    id: d.id, // DRV-001
                    name: d.name,
                    avatar: d.avatar,
                    status: d.status,
                    score: d.score,
                    ontime: d.ontime,
                    doSuccess: d.doSuccess,
                    truck: d.truck,
                    distanceToday: d.distanceToday,
                    doCompleted: d.doCompleted,
                    doTotal: d.doTotal,
                    lastLocation: d.lastLocation,
                    lastUpdate: d.lastUpdate
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