// src/shared/stores/useDriverStore.ts
import { create } from 'zustand';
import { driverappService, type RouteStop, type DriverTripResponse } from '../features/driver-app/services/driverappService';

interface DriverState {
    tripData: DriverTripResponse | null;
    activeStop: RouteStop | null;
    isLoading: boolean;
    
    setTripData: (data: DriverTripResponse | null) => void;
    setActiveStop: (stop: RouteStop | null) => void;
    setIsLoading: (status: boolean) => void;
    
    fetchMyRoute: () => Promise<void>;
}

export const useDriverStore = create<DriverState>((set) => ({
    tripData: null,
    activeStop: null,
    isLoading: false,

    setTripData: (data) => set({ tripData: data }),
    setActiveStop: (stop) => set({ activeStop: stop }),
    setIsLoading: (status) => set({ isLoading: status }),

    fetchMyRoute: async () => {
        set({ isLoading: true });
        try {
            const data = await driverappService.getMyRoute();
            const current = data.stops.find((s: RouteStop) => s.status === 'active');
            
            set({ 
                tripData: data, 
                activeStop: current || null, 
                isLoading: false 
            });
        } catch (err) {
            console.error("Gagal menarik rute supir:", err);
            set({ isLoading: false });
        }
    }
}));