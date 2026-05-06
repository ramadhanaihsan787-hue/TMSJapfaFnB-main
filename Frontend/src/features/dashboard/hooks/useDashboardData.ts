// src/features/dashboard/hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import { dashboardService } from '../services/dashboardService';

export interface LiveTruck { id: string; driver: string; lat: number; lon: number; status: string; isDelayed: boolean; }
export interface VolumeData { time: string; count: number; }
export interface RejectionData { reason: string; percentage: number; color: string; }
export interface AlertData { title: string; desc: string; time: string; icon: string; iconColor: string; bgColor: string; }

export const useDashboardData = () => {
    const [kpiData, setKpiData] = useState({ totalShipments: 0, otifRate: "0%", rejectionRate: "0%", totalWeightKg: "0" });
    const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
    const [maxVolume, setMaxVolume] = useState(1);
    const [fleetData, setFleetData] = useState({ active: 0, total: 0, rate: 0 });
    const [activeTrucks, setActiveTrucks] = useState<LiveTruck[]>([]);
    const [rejections, setRejections] = useState<RejectionData[]>([]);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { fetchAllDashboardData } = dashboardService;

    useEffect(() => {
        let isMounted = true; 

        const loadAllData = async () => {
            // Kita cuma nampilin loading pas awal banget buka halaman. 
            // Pas interval polling jalan, jangan nampilin loading biar layar ngga kedap-kedip.
            if (activeTrucks.length === 0) setIsLoading(true); 
            
            try {
                const { kpiRes, volRes, fleetRes, trackRes, rejRes, alertRes } = await fetchAllDashboardData();

                if (!isMounted) return; 

                // 1. Set KPI
                if (kpiRes) {
                    const weightFormated = kpiRes.total_weight_kg > 1000 ? (kpiRes.total_weight_kg / 1000).toFixed(1) + "k" : kpiRes.total_weight_kg;
                    setKpiData({
                        totalShipments: kpiRes.total_deliveries_today || 0,
                        otifRate: `${kpiRes.success_rate_percent || 0}%`,
                        rejectionRate: "0%",
                        totalWeightKg: weightFormated ? weightFormated.toString() : "0"
                    });
                }

                // 2. Set Volume
                if (volRes && volRes.status === "success") {
                    setVolumeData(volRes.data);
                    setMaxVolume(volRes.max || 1); 
                }

                // 3. Set Fleet Util
                if (fleetRes && fleetRes.status === "success") {
                    setFleetData({ active: fleetRes.active_trucks, total: fleetRes.total_trucks, rate: fleetRes.utilization_rate });
                }

                // 4. Set Tracking
                if (trackRes && trackRes.status === "success" && Array.isArray(trackRes.data)) {
                    setActiveTrucks(trackRes.data);
                }

                // 5. Set Rejections
                if (rejRes && rejRes.status === "success" && Array.isArray(rejRes.data)) {
                    setRejections(rejRes.data);
                }

                // 6. Set Alerts
                if (alertRes && alertRes.status === "success" && Array.isArray(alertRes.data)) {
                    setAlerts(alertRes.data);
                }

            } catch (error) {
                console.error("Gagal load data dashboard:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        // 🌟 SUNTIKAN CTO: POLLING MECHANISM
        loadAllData(); // Panggil pertama kali
        const intervalId = setInterval(loadAllData, 30000); // Ulangi setiap 30 detik!

        return () => {
            isMounted = false; 
            clearInterval(intervalId); // Jangan lupa beresin mesin pemanggilnya!
        };
    }, []); 

    return {
        kpiData,
        volumeData,
        maxVolume,
        fleetData,
        activeTrucks,
        rejections,
        alerts,
        isLoading
    };
};