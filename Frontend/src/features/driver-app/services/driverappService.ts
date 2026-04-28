import { api } from '../../../shared/services/apiClient';

// ==========================================
// INTERFACES (Tipe Data)
// ==========================================
export interface RouteStop {
    id: string | number;
    sequence: number;
    customerName: string;
    address: string;
    timeWindow: string;
    weight: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    latitude?: number;
    longitude?: number;
    phone?: string;
}

export interface DriverTripResponse {
    truck_id: string;
    driver_name: string;
    total_stops: number;
    completed_stops: number;
    total_distance: number;
    stops: RouteStop[];
}

// ==========================================
// API ENGINE
// ==========================================
export const driverappService = {
    // Tarik rute tugas supir
    getMyRoute: async (): Promise<DriverTripResponse> => {
        const response = await api.get<DriverTripResponse>('/api/driver/my-route');
        return response.data;
    },

    // Update status (Arrive, Start, etc)
    updateStopStatus: async (stopId: string | number, status: string) => {
        const response = await api.post(`/api/driver/stops/${stopId}/status`, { status });
        return response.data;
    },

    // Kirim bukti foto & tanda tangan
    submitEpod: async (stopId: string | number, formData: FormData) => {
        const response = await api.post(`/api/driver/stops/${stopId}/epod`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};