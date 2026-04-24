// src/features/fleet/hooks/useFleet.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useApi } from "shared/hooks/useApi";
import type { FleetVehicle, TelematicsData } from "../types";

export const useFleet = () => {
    const [fleetList, setFleetList] = useState<FleetVehicle[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<FleetVehicle | null>(null);

    // 🌟 Manggil senjata rahasia lu
    const { loading, execute } = useApi('/api/fleet');

    const fetchFleet = useCallback(async () => {
        try {
            const resData: any = await execute();
            const actualData = resData?.data || resData;

            if (actualData && Array.isArray(actualData)) {
                // 🌟 MESIN TRANSLATOR: Translate data kotor Backend jadi camelCase bersih!
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
        }
    }, [execute]);

    useEffect(() => {
        fetchFleet();
    }, []);

    // 🌟 SIMULASI TELEMATICS (Nanti gampang diganti kalau API aslinya udah siap)
    const telematics: TelematicsData | null = useMemo(() => {
        if (!selectedTruck) return null;
        
        // Bikin suhu seakan-akan berubah berdasarkan ID truk
        const numId = typeof selectedTruck.id === 'number' ? selectedTruck.id : parseInt(String(selectedTruck.id)) || 1;
        const mockTemp = parseFloat((2.1 + (numId % 3) * 0.5).toFixed(1));
        
        return {
            temperature: mockTemp,
            isTempWarning: mockTemp > 4.0,
            compressorStatus: 'ON',
            gpsSignal: 'STRONG',
            doorLocked: true
        };
    }, [selectedTruck]);

    // 🌟 KALKULASI KPI OTOMATIS
    const kpi = useMemo(() => {
        return {
            activeCount: fleetList.filter(t => t.status === 'Available' || t.status === 'On Trip').length,
            maintenanceCount: fleetList.filter(t => t.status === 'Maintenance').length,
            totalCount: fleetList.length,
            avgFuelEfficiency: 8.2, // Mock data
            coldChainBreach: 0 // Mock data
        };
    }, [fleetList]);

    return {
        loading,
        fleetList,
        selectedTruck,
        setSelectedTruck,
        telematics,
        kpi,
        refreshFleet: fetchFleet
    };
};