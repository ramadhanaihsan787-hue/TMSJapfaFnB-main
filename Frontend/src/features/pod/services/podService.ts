import { api } from '../../../shared/services/apiClient';

// ==========================================
// TYPES
// ==========================================
export interface OrderItem {
    nama_barang: string;
    qty: string;
}

export interface DeliveryOrder {
    order_id: string;
    customer_name: string;
    latitude: number | null;
    longitude: number | null;
    weight_total: number;
    delivery_window_start: number;
    delivery_window_end: number;
    status: string;
    items: OrderItem[];
}

export interface GetOrdersResponse {
    status: string;
    total: number;
    data: DeliveryOrder[];
}

// ==========================================
// API SERVICE
// ==========================================
export const podService = {
    // 🌟 1. Fungsi narik data asli dari Backend
    getOrders: async (statusFilter?: string): Promise<GetOrdersResponse> => {
        const response = await api.get<GetOrdersResponse>('/api/orders', {
            params: { status: statusFilter }
        });
        return response.data;
    },

    // 🌟 2. Fungsi bawaan lu (nanti kita sambungin ke Backend kalau API-nya udah ada)
    approvePod: async (id: string) => {
        console.log("Approving POD:", id);
        return { success: true };
    },
    
    rejectPod: async (id: string, reason: string) => {
        console.log("Rejecting POD:", id, reason);
        return { success: true };
    }
};