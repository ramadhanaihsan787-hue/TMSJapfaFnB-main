// src/features/analytics/services/analyticsService.ts
import { api } from "../../../shared/services/apiClient"; // Sesuaikan path

export const analyticsService = {
    // 🌟 1. FUNGSI BARU DARI CTO: Narik semua data grafik sekaligus (Kenceng!)
    fetchAnalyticsData: async (startDate: string, endDate: string) => {
        try {
            const params = { startDate, endDate };
            const [summaryRes, utilizationRes, volumeRes, driversRes] = await Promise.all([
                api.get('/api/analytics/kpi-summary', { params }),
                api.get('/api/analytics/fleet-utilization', { params }),
                api.get('/api/analytics/delivery-volume', { params }),
                api.get('/api/analytics/driver-performance', { params })
            ]);

            return {
                summary: summaryRes.data,
                utilization: utilizationRes.data,
                volume: volumeRes.data,
                drivers: driversRes.data
            };
        } catch (error) {
            console.error("Gagal narik data analytics:", error);
            throw error;
        }
    },

    // 🌟 2. FUNGSI LU YANG ASLI: Buat download file PDF/Excel (Aman Terkendali!)
    exportReport: async (startDate: string, endDate: string) => {
        try {
            const res = await api.get(`/api/analytics/export?startDate=${startDate}&endDate=${endDate}`, {
                responseType: 'blob' // Buat download file binary
            });
            return res.data;
        } catch (error) {
            console.error("Gagal export data:", error);
            throw error;
        }
    }
};