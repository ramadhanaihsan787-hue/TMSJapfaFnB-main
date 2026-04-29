// src/features/dashboard/services/dashboardService.ts
import { api } from "../../../shared/services/apiClient"; // 🌟 PASTIKAN PATH-NYA BENER KE apiClient LU

export const dashboardService = {
    // 🌟 KITA PECAH JADI FUNGSI KECIL (Biar gampang dipanggil satuan kalo butuh)
    fetchKpi: async () => (await api.get('/api/analytics/kpi-summary')).data,
    fetchVolume: async () => (await api.get('/api/dashboard/hourly-volume')).data,
    fetchFleet: async () => (await api.get('/api/dashboard/fleet-utilization')).data,
    fetchTracking: async () => (await api.get('/api/dashboard/live-tracking')).data,
    fetchRejections: async () => (await api.get('/api/dashboard/rejections')).data,
    fetchAlerts: async () => (await api.get('/api/dashboard/alerts')).data,

    // 🌟 FUNGSI SAKTI BUAT NARIK SEMUA SEKALIGUS (PROMISE.ALL)
    fetchAllDashboardData: async () => {
        try {
            // Paralel request biar kenceng kayak F1! 🏎️💨
            const [kpiRes, volRes, fleetRes, trackRes, rejRes, alertRes] = await Promise.all([
                api.get('/api/analytics/kpi-summary'),
                api.get('/api/dashboard/hourly-volume'),
                api.get('/api/dashboard/fleet-utilization'),
                api.get('/api/dashboard/live-tracking'),
                api.get('/api/dashboard/rejections'),
                api.get('/api/dashboard/alerts')
            ]);

            // Karena axios ngebungkus respon di dalem object 'data', kita keluarin dulu
            return { 
                kpiRes: kpiRes.data, 
                volRes: volRes.data, 
                fleetRes: fleetRes.data, 
                trackRes: trackRes.data, 
                rejRes: rejRes.data, 
                alertRes: alertRes.data 
            };
        } catch (error) {
            console.error("Gagal menarik data dari server:", error);
            throw error;
        }
    }
};