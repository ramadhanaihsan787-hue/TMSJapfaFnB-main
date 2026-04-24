// src/features/dashboard/services/dashboardService.ts
import { useApi } from "shared/hooks/useApi";

export const useDashboardService = () => {
    // 🌟 KUMPULIN SEMUA SENJATA RAHASIA DI SINI
    const { execute: fetchKpi } = useApi<any>('/api/analytics/kpi-summary');
    const { execute: fetchVolume } = useApi<any>('/api/dashboard/hourly-volume');
    const { execute: fetchFleet } = useApi<any>('/api/dashboard/fleet-utilization');
    const { execute: fetchTracking } = useApi<any>('/api/dashboard/live-tracking');
    const { execute: fetchRejections } = useApi<any>('/api/dashboard/rejections');
    const { execute: fetchAlerts } = useApi<any>('/api/dashboard/alerts');

    // 🌟 BIKIN 1 FUNGSI SAKTI BUAT NARIK SEMUA DATA SEKALIGUS
    const fetchAllDashboardData = async () => {
        try {
            const [kpiRes, volRes, fleetRes, trackRes, rejRes, alertRes] = await Promise.all([
                fetchKpi(), 
                fetchVolume(), 
                fetchFleet(), 
                fetchTracking(), 
                fetchRejections(), 
                fetchAlerts()
            ]);

            return { kpiRes, volRes, fleetRes, trackRes, rejRes, alertRes };
        } catch (error) {
            console.error("Gagal menarik data dari server:", error);
            throw error; // Lempar errornya biar bisa ditangkap sama halaman Dashboard
        }
    };

    return {
        fetchAllDashboardData
    };
};