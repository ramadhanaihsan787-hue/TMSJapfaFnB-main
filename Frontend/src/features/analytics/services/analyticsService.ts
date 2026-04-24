// src/features/analytics/services/analyticsService.ts
import { api } from "shared/services/apiClient";

export const analyticsService = {
    // Fitur buat tombol "Export PDF/Excel" nanti
    exportReport: async (startDate: string, endDate: string) => {
        try {
            const res = await api.get(`/api/analytics/export?startDate=${startDate}&endDate=${endDate}`, {
                responseType: 'blob' // Buat download file
            });
            return res.data;
        } catch (error) {
            console.error("Gagal export data:", error);
            throw error;
        }
    }
};