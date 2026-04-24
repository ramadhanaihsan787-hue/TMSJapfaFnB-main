// src/features/fleet/services/fleetService.ts
import { api } from "shared/services/apiClient";

export const fleetService = {
    // Untuk narik data utama lu udah pake useApi, tapi kita sedia payung di sini
    getFleetList: async () => {
        const res = await api.get('/api/fleet');
        return res.data;
    },

    assignDriver: async (vehicleId: string | number, driverId: string) => {
        const res = await api.post(`/api/fleet/${vehicleId}/assign`, { driver_id: driverId });
        return res.data;
    },

    reportMaintenance: async (vehicleId: string | number, issue: string) => {
        const res = await api.post(`/api/fleet/${vehicleId}/maintenance`, { issue });
        return res.data;
    },

    addFuelLog: async (vehicleId: string | number, data: any) => {
        const res = await api.post(`/api/fleet/${vehicleId}/fuel`, data);
        return res.data;
    }
};