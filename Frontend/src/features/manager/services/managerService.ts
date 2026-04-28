// src/features/manager/services/managerService.ts
import { api } from "../../../shared/services/apiClient";

export const managerService = {
    // Nanti buat narik data Overview KPI
    getOverviewData: async () => {
        // const res = await api.get('/api/manager/overview');
        // return res.data;
        return { status: 'success' };
    },
    // Nanti buat export laporan Delay
    exportDelayReport: async () => {
        // const res = await api.get('/api/manager/export/delay', { responseType: 'blob' });
        // return res.data;
        console.log("Exporting report...");
    }
};