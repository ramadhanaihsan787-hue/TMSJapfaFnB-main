import { useState, useCallback } from 'react';
import { useLoadStore } from '../../../store/loadStore'; 
import { loadPlannerService } from '../services/loadPlannerService';
import type { Shipment, TruckCapacityTier } from '../types';

export const useLoadPlanner = () => {
    const store = useLoadStore();
    const [toast, setToast] = useState<string | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false); // 🌟 Loading state

    const maxWeights: Record<TruckCapacityTier, number> = { '2T': 2000, '2.7T': 2700, '5T': 5000 };
    const currentTier = store.truckCapacityTier as TruckCapacityTier;
    const maxWeight = maxWeights[currentTier] || 5000;

    const occupiedCount = store.slots?.filter(Boolean).length || 0;
    const capacityPct = store.slots?.length > 0 
        ? Math.min(100, Math.round((occupiedCount / store.slots.length) * 100)) 
        : 0;
    
    const weightVal = store.slots?.reduce((acc: number, s: any) => acc + (s ? s.weight : 0), 0) || 0;
    const selectedShipment = store.shipments?.find((s: any) => s.id === store.selectedShipmentId) as Shipment | undefined;

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    // 🌟 FUNGSI SAKTI: Narik Data 3D dari API
    const loadPlanFromBackend = useCallback(async (routeId: string) => {
        setIsLoadingPlan(true);
        showToast(`Calculating 3D space for ${routeId}...`);
        
        try {
            const response = await loadPlannerService.fetchLoadPlan(routeId);
            
            if (response.status === 'success' && response.data.length > 0) {
                // Ambil truk pertama aja dulu (asumsi 1 rute = 1 truk)
                const truckData = response.data[0]; 
                
                // 🌟 TRANSLATOR: Ubah format Backend ke format Zustand lu
                // Note: Sesuaikan nama field 'setShipments' sama yang ada di loadStore.ts lu ya!
                const mappedShipments = truckData["3d_layout_data"].map((item: any, idx: number) => ({
                    id: `DO-${idx + 1}`,
                    customer: item.item_name.split(" | ")[0],
                    block: "A", 
                    weight: (item.dimensions_whd[0] * item.dimensions_whd[1] * item.dimensions_whd[2]) / 1000, // Estimasi berat kardus
                    items: [{ type: 'egg', count: 1 }], 
                    // Simpan XYZ buat digambar di LoadCanvas3D lu!
                    position: item.position_xyz,
                    dimensions: item.dimensions_whd
                }));

                // Kalau di Zustand lu ada fungsi update shipments, panggil di sini
                // store.setShipments(mappedShipments); 
                
                showToast(`✅ Load plan ready! Loaded ${mappedShipments.length} boxes.`);
            }
        } catch (error) {
            console.error("Gagal narik Load Plan:", error);
            showToast("❌ Failed to calculate 3D layout!");
        } finally {
            setIsLoadingPlan(false);
        }
    }, [store]); // Masukin store ke dependency

    return {
        ...store,
        toast,
        maxWeight,
        capacityPct,
        weightVal,
        selectedShipment,
        showToast,
        loadPlanFromBackend, // 🌟 Jangan lupa di-export!
        isLoadingPlan
    };
};