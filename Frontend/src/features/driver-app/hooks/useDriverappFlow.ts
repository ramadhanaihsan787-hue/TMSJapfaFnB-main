import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverappService, type RouteStop, type DriverTripResponse } from '../services/driverappService';

export const useDriverappFlow = () => {
    const navigate = useNavigate();
    
    // Global States biar data sinkron antar halaman app driver
    const [tripData, setTripData] = useState<DriverTripResponse | null>(null);
    const [activeStop, setActiveStop] = useState<RouteStop | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Ambil rute supir pas pertama kali buka
    const fetchMyRoute = async () => {
        setIsLoading(true);
        try {
            const data = await driverappService.getMyRoute();
            setTripData(data);
            // Cari stop yang statusnya lagi 'active'
            const current = data.stops.find(s => s.status === 'active');
            if (current) setActiveStop(current);
        } catch (err) {
            console.error("Gagal menarik rute supir:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRoute();
    }, []);

    return {
        // Data States
        tripData,
        stops: tripData?.stops || [],
        activeStop,
        isLoading,
        
        // Navigation & Flow Actions (Fitur lu ngga ada yang dikurangin!)
        startRoute: () => navigate('/driver/routes'),
        
        viewStopDetail: (stop: RouteStop) => {
            setActiveStop(stop); // Simpan stop mana yang diklik
            navigate('/driver/detail');
        },
        
        arriveAtLocation: async () => {
            if (activeStop) {
                await driverappService.updateStopStatus(activeStop.id, 'arrived');
                navigate('/driver/pod');
            }
        },
        
        submitPod: () => navigate('/driver/summary'),
        endTrip: () => navigate('/driver'),
        goToHistory: () => navigate('/driver') 
    };
};