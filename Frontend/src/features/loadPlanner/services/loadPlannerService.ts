import { api } from "../../../shared/services/apiClient";

export const loadPlannerService = {
    fetchLoadPlan: async (routeId: string) => {
        const res = await api.get(`/api/routes/${routeId}/loadplan`);
        return res.data;
    },

    // 🌟 FIX: Kasih underscore (_) biar TS ngga bawel nanyain "kenapa ngga dipake?"
    validatePlan: async (_planData: any) => { 
        return { status: 'success', message: 'Valid' };
    },
    
    // 🌟 FIX: Kasih underscore (_) juga
    dispatchFleet: async (_truckId: string, _planData: any) => { 
        return { status: 'success' };
    }
};