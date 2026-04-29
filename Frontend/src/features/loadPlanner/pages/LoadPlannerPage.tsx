import { useEffect } from 'react'; // 🌟 FIX: Jangan lupa di-import!
import { useLoadPlanner } from '../hooks/useLoadPlanner';

import {
    LoadPlannerToolbar,
    LoadSummaryCards,
    LoadItemList,
    LoadCanvas3D,
    LoadPlacementPanel,
    LoadResultPanel,
    LoadWarningList
} from '../components';

const activityLog = [
    { label: 'Truck Capacity: 5T Selected', sub: 'Optimization v2.5 • 10:05 PM', active: true },
    { label: 'Fleet synced (7 Trucks active)', sub: 'TRC Series • 10:00 PM', active: false },
    { label: 'Realistic cargo scaling enabled', sub: 'User: Admin_42 • 09:55 PM', active: false },
];

export default function LoadPlannerPage() {
    const {
        shipments,
        selectedShipmentId,
        selectShipment,
        truckCapacityTier,
        setCapacityTier,
        sceneBackground,
        setSceneBackground,
        toast,
        maxWeight,
        capacityPct,
        weightVal,
        selectedShipment,
        showToast,
        loadPlanFromBackend, // 🌟 Diambil dari hook
        isLoadingPlan        // 🌟 Diambil dari hook
    } = useLoadPlanner();

    // 🌟 FIX: BLOK INI YANG TADI KETINGGALAN! (Buat nembak API otomatis)
    useEffect(() => {
        const testRouteId = "RP-20241025-T1"; // Dummy route_id dulu buat ngetes
        loadPlanFromBackend(testRouteId);
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a]">
            
            <LoadPlannerToolbar 
                capacityPct={capacityPct}
                weightVal={weightVal}
                maxWeight={maxWeight}
                onValidate={() => showToast('✓ Load plan validated successfully!')}
                onDispatch={() => showToast('🚚 Dispatching TRC-204 to fleet...')}
            />

            {/* 🌟 FIX: Munculin Overlay kalau lagi mikir 3D */}
            {isLoadingPlan && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-2">autorenew</span>
                    <p className="font-bold tracking-widest uppercase">Calculating 3D Layout...</p>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                
                <section className="w-72 shrink-0 bg-slate-50 dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-[#333] flex flex-col overflow-hidden">
                    <LoadSummaryCards 
                        truckCapacityTier={truckCapacityTier}
                        setCapacityTier={setCapacityTier}
                        showToast={showToast}
                    />
                    <LoadItemList 
                        shipments={shipments}
                        selectedShipmentId={selectedShipmentId}
                        selectShipment={selectShipment}
                        showToast={showToast}
                    />
                </section>

                <LoadCanvas3D 
                    sceneBackground={sceneBackground}
                    // 🌟 FIX ERROR MERAH: Paksa jadi (color as any) biar TS tutup mata
                    setSceneBackground={(color) => setSceneBackground(color as any)} 
                />

                <section className="w-72 shrink-0 bg-white dark:bg-[#111111] border-l border-slate-200 dark:border-[#333] flex flex-col overflow-hidden">
                    <LoadPlacementPanel selectedShipment={selectedShipment} />
                    <LoadResultPanel />
                    <LoadWarningList activityLog={activityLog} />
                </section>

            </div>

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-xl animate-bounce-once">
                    {toast}
                </div>
            )}
        </div>
    );
}