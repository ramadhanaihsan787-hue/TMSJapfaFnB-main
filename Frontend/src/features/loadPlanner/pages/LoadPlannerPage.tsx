import { useLoadPlanner } from '../hooks';

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import {
    LoadPlannerToolbar,
    LoadSummaryCards,
    LoadItemList,
    LoadCanvas3D,
    LoadPlacementPanel,
    LoadResultPanel,
    LoadWarningList
} from '../components';

// Data statis log aktivitas (bisa dipindah ke API/Zustand nanti)
const activityLog = [
    { label: 'Truck Capacity: 5T Selected', sub: 'Optimization v2.5 • 10:05 PM', active: true },
    { label: 'Fleet synced (7 Trucks active)', sub: 'TRC Series • 10:00 PM', active: false },
    { label: 'Realistic cargo scaling enabled', sub: 'User: Admin_42 • 09:55 PM', active: false },
];

export default function LoadPlannerPage() {
    // 🌟 PANGGIL SEMUA DATA & FUNGSI DARI HOOK PUSAT
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
        showToast
    } = useLoadPlanner();

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a]">
            
            {/* 🌟 HEADER ATAS (TOOLBAR) */}
            <LoadPlannerToolbar 
                capacityPct={capacityPct}
                weightVal={weightVal}
                maxWeight={maxWeight}
                onValidate={() => showToast('✓ Load plan validated successfully!')}
                onDispatch={() => showToast('🚚 Dispatching TRC-204 to fleet...')}
            />

            {/* ── Main Layout ── */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* 🌟 PANEL KIRI: Kapasitas Truk + Antrian Kargo */}
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

                {/* 🌟 TENGAH: Studio Canvas 3D Truk */}
                <LoadCanvas3D 
                    sceneBackground={sceneBackground}
                    setSceneBackground={setSceneBackground}
                />

                {/* 🌟 PANEL KANAN: Inspector + Feedback + Log */}
                <section className="w-72 shrink-0 bg-white dark:bg-[#111111] border-l border-slate-200 dark:border-[#333] flex flex-col overflow-hidden">
                    <LoadPlacementPanel 
                        selectedShipment={selectedShipment} 
                    />
                    <LoadResultPanel />
                    <LoadWarningList 
                        activityLog={activityLog} 
                    />
                </section>

            </div>

            {/* 🌟 NOTIFIKASI TOAST */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-xl animate-bounce-once">
                    {toast}
                </div>
            )}
        </div>
    );
}