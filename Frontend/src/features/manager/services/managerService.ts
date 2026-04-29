// src/features/manager/services/managerService.ts
import { api } from "../../../shared/services/apiClient";

export const managerService = {
    // 🌟 SEKARANG NYEDOT DATA ASLI DARI BACKEND!
    getOverviewData: async () => {
        const res = await api.get('/api/manager/overview');
        return res.data;
    },
    
    exportDelayReport: async () => {
        // Blob dipake biar browser ngerti ini file yang mau didownload
        const res = await api.get('/api/manager/export/delay', { responseType: 'blob' });
        return res.data;
    }
};