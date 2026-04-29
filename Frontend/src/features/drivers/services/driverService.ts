// src/features/drivers/services/driverService.ts
import { api } from "../../../shared/services/apiClient"; // Sesuaikan path-nya

export const driverService = {
    // 🌟 FUNGSI BARU: Tarik data performa supir untuk tabel/grid
    getDriverPerformance: async (startDate: string, endDate: string) => {
        const res = await api.get('/api/analytics/driver-performance', {
            params: { startDate, endDate }
        });
        return res.data;
    },

    // Buat jaga-jaga kalau besok mau download PDF performa supir
    downloadPerformanceReport: async (driverId: string) => {
        const res = await api.get(`/api/analytics/driver/${driverId}/report`, {
            responseType: 'blob'
        });
        return res.data;
    },

    // Kirim notif/teguran ke supir
    sendWarning: async (driverId: string, message: string) => {
        const res = await api.post(`/api/drivers/${driverId}/warning`, { message });
        return res.data;
    }
};