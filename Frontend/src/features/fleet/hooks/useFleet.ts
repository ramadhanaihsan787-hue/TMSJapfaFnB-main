// src/features/fleet/hooks/useFleet.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { fleetService } from "../services/fleetService"; // 🌟 IMPORT SERVICE BARU
import type { FleetVehicle, TelematicsData } from "../types";

export const useFleet = () => {
    const [fleetList, setFleetList] = useState<FleetVehicle[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<FleetVehicle | null>(null);
    const [liveTelematics, setLiveTelematics] = useState<TelematicsData | null>(null);
    
    // 🌟 STATE LOADING PENGGANTI useApi
    const [loading, setLoading] = useState(false);

    // 🌟 TEMBAK API PAKE SERVICE
    const fetchFleet = useCallback(async () => {
        setLoading(true);
        try {
            const resData: any = await fleetService.getFleetList();
            const actualData = resData?.data || resData;

            if (actualData && Array.isArray(actualData)) {
                const mappedFleet: FleetVehicle[] = actualData.map((truck: any) => ({
                    id: truck.vehicle_id || truck.id,
                    licensePlate: truck.license_plate || truck.plateNumber || '-',
                    model: truck.type || truck.model || '-',
                    currentKm: truck.current_km || truck.kmAwalHariIni || 0,
                    status: truck.status || 'Available',
                    raw: truck
                }));

                setFleetList(mappedFleet);
                if (mappedFleet.length > 0) {
                    setSelectedTruck(mappedFleet[0]);
                }
            } else {
                setFleetList([]);
            }
        } catch (error) {
            console.error("Gagal menarik data armada:", error);
            setFleetList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 🌟 EFEK TARIK DATA AWAL (Rem pakem, 1x jalan)
    useEffect(() => {
        fetchFleet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ==========================================
    // 🌟 DIGITAL TWIN ENGINE (POLLING 5 DETIK)
    // ==========================================
    useEffect(() => {
        if (!selectedTruck?.licensePlate) {
            setLiveTelematics(null);
            return;
        }

        // Fungsi buat nembak API Live Telematics pake Service
        const fetchTelemetry = async () => {
            try {
                const data = await fleetService.getTelematics(selectedTruck.licensePlate);
                setLiveTelematics(data);
            } catch (error) {
                console.log("Telemetry offline, falling back to cached/default data");
            }
        };

        // Panggil pertama kali
        fetchTelemetry();

        // JANTUNG APLIKASI: Detak tiap 5 detik
        const intervalId = setInterval(fetchTelemetry, 5000);

        return () => clearInterval(intervalId); // Bersihin pas truk diganti
    }, [selectedTruck]); 


    const kpi = useMemo(() => {
        return {
            activeCount: fleetList.filter(t => t.status === 'Available' || t.status === 'On Trip').length,
            maintenanceCount: fleetList.filter(t => t.status === 'Maintenance').length,
            totalCount: fleetList.length,
            avgFuelEfficiency: 8.2, 
            coldChainBreach: liveTelematics?.isTempWarning ? 1 : 0 
        };
    }, [fleetList, liveTelematics]);

    return {
        loading,
        fleetList,
        selectedTruck,
        setSelectedTruck,
        telematics: liveTelematics, 
        kpi,
        refreshFleet: fetchFleet
    };
};