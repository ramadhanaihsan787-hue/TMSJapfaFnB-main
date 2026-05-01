// src/features/driver-app/hooks/useDriverappFlow.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverappService, type RouteStop } from '../services/driverappService';
import { useDriverStore } from '../../../store/useDriverStore';

export const useDriverappFlow = () => {
    const navigate = useNavigate();
    
    // 🌟 SEKARANG NYEDOT DATA DARI ZUSTAND, BUKAN USESTATE LOKAL!
    const { 
        tripData, 
        activeStop, 
        isLoading, 
        setActiveStop, 
        fetchMyRoute 
    } = useDriverStore();

    // Otomatis tarik data rute HANYA kalau tripData-nya masih kosong
    // Biar ngga spam API setiap ganti halaman
    useEffect(() => {
        if (!tripData && !isLoading) {
            fetchMyRoute();
        }
    }, [tripData, isLoading, fetchMyRoute]);

    return {
        // Data States (Langsung lempar dari Zustand)
        tripData,
        stops: tripData?.stops || [],
        activeStop,
        isLoading,
        
        // Navigation & Flow Actions
        startRoute: () => navigate('/driver/routes'),
        
        viewStopDetail: (stop: RouteStop) => {
            setActiveStop(stop); // 🌟 Nyimpen stop ke Zustand (Global)
            navigate('/driver/detail');
        },
        
        arriveAtLocation: async () => {
            if (activeStop) {
                // Tembak API bahwa supir udah sampe
                await driverappService.updateStopStatus(activeStop.id, 'arrived');
                
                // Refresh data rute dari backend biar status 'completed'-nya update
                await fetchMyRoute(); 
                
                navigate('/driver/pod');
            }
        },
        
        submitPod: async () => {
            // Pas selesai ngirim foto, tarik ulang data dari backend
            // Biar rute selanjutnya otomatis berubah jadi 'active'
            await fetchMyRoute(); 
            navigate('/driver/summary');
        },

        endTrip: () => navigate('/driver'),
        goToHistory: () => navigate('/driver') 
    };
};