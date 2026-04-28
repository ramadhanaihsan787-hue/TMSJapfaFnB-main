// src/features/loadPlanner/services/loadPlannerService.ts
import { api } from "shared/services/apiClient";

export const loadPlannerService = {
    validatePlan: async (planData: any) => {
        // Nanti tembak API validasi posisi 3D di sini
        // const res = await api.post('/api/load-planner/validate', planData);
        // return res.data;
        return { status: 'success', message: 'Valid' };
    },
    
    dispatchFleet: async (truckId: string, planData: any) => {
        // Nanti tembak API buat ngirim truk jalan
        // const res = await api.post(`/api/fleet/${truckId}/dispatch`, planData);
        // return res.data;
        return { status: 'success' };
    }
};