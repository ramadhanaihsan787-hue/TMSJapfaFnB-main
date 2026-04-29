// src/shared/stores/useLiveTrackingStore.ts (Sesuaikan path-nya)
import { create } from 'zustand';
import { api } from '../shared/services/apiClient'; 

export interface TruckLocation {
    id: string;
    driver: string;
    lat: number;
    lon: number;
    status: string;
    isDelayed: boolean;
    delayMinutes: number;
    routeId: string;
}

export interface Alert {
    title: string;
    desc: string;
    time: string;
    icon: string;
    iconColor: string;
    bgColor: string;
}

interface LiveTrackingState {
    trucks: TruckLocation[];
    alerts: Alert[];
    isLoading: boolean;
    lastUpdated: string | null;
    error: string | null;

    // Actions
    fetchTrackingData: () => Promise<void>;
    fetchAlerts: () => Promise<void>;
    
    // Auto-Polling Controls
    isPolling: boolean;
    startPolling: (intervalMs?: number) => void;
    stopPolling: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export const useLiveTrackingStore = create<LiveTrackingState>((set, get) => ({
    trucks: [],
    alerts: [],
    isLoading: false,
    lastUpdated: null,
    error: null,
    isPolling: false,

    fetchTrackingData: async () => {
        set({ isLoading: true, error: null });
        try {
            // 🌟 Nembak langsung ke endpoint backend yang udah lu bikin tadi!
            const response = await api({ method: 'GET', url: '/api/dashboard/live-tracking' });
            set({ 
                trucks: response.data.data, 
                lastUpdated: new Date().toLocaleTimeString('id-ID'),
                isLoading: false 
            });
        } catch (err: any) {
            set({ error: err.message || 'Gagal narik data GPS', isLoading: false });
        }
    },

    fetchAlerts: async () => {
        try {
            const response = await api({ method: 'GET', url: '/api/dashboard/alerts' });
            set({ alerts: response.data.data });
        } catch (err: any) {
            console.error("Gagal narik alerts:", err);
        }
    },

    startPolling: (intervalMs = 10000) => { // Default: update tiap 10 detik
        const { isPolling, fetchTrackingData, fetchAlerts } = get();
        if (isPolling) return; // Kalo udah jalan, jangan ditumpuk!

        set({ isPolling: true });
        
        // Tarik data pertama kali secara instan
        fetchTrackingData();
        fetchAlerts();

        // Jalanin interval untuk narik data berulang
        pollingInterval = setInterval(() => {
            get().fetchTrackingData();
            get().fetchAlerts();
        }, intervalMs);
    },

    stopPolling: () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        set({ isPolling: false });
    }
}));