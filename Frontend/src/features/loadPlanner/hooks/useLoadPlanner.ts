// src/features/loadPlanner/hooks/useLoadPlanner.ts
import { useState } from 'react';
// Sesuaikan path ini kalau store lu beda tempatnya!
import { useLoadStore } from '../../../store/loadStore'; 
import type { Shipment, TruckCapacityTier } from '../types';

export const useLoadPlanner = () => {
    // 🌟 AMBIL SEMUA DARI ZUSTAND STORE
    const store = useLoadStore();
    
    // 🌟 STATE LOKAL BUAT NOTIFIKASI
    const [toast, setToast] = useState<string | null>(null);

    // 🌟 LOGIKA HITUNG-HITUNGAN BERAT & KAPASITAS
    const maxWeights: Record<TruckCapacityTier, number> = { '2T': 2000, '2.7T': 2700, '5T': 5000 };
    const currentTier = store.truckCapacityTier as TruckCapacityTier;
    const maxWeight = maxWeights[currentTier] || 5000;

    // Hitung kapasitas berdasarkan slot yang terisi
    const occupiedCount = store.slots.filter(Boolean).length;
    const capacityPct = store.slots.length > 0 
        ? Math.min(100, Math.round((occupiedCount / store.slots.length) * 100)) 
        : 0;
    
    const weightVal = store.slots.reduce((acc: number, s: any) => acc + (s ? s.weight : 0), 0);

    // Cari data shipment yang lagi diklik
    const selectedShipment = store.shipments.find((s: any) => s.id === store.selectedShipmentId) as Shipment | undefined;

    // Fungsi pop-up notifikasi bawah
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    return {
        // Balikin semua state dan action dari store
        ...store,
        
        // Tambahin hasil hitungan dan state lokal
        toast,
        maxWeight,
        capacityPct,
        weightVal,
        selectedShipment,
        showToast
    };
};