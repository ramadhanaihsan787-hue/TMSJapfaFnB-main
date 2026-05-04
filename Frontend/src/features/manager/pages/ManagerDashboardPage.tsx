// src/features/manager/pages/ManagerDashboardPage.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 🌟 IMPORT KOMPONEN UI (MANAGER HEADER UDAH DIBUANG)
import {
    OverviewDashboard,
    ReturnDashboard,
    EfficiencyDashboard
} from '../components';

// 🌟 IMPORT KURIR JUDUL
import { useHeaderStore } from "../../../store/useHeaderStore";

export default function ManagerDashboardPage() {
    const location = useLocation();
    const { setTitle } = useHeaderStore();
    
    /**
     * 🌟 LOGIC DARI VERSI KOTOR
     * Mengambil segmen terakhir dari URL (misal: /manager/efficiency -> efficiency)
     * Kalau cuma /manager, default ke 'overview'
     */
    const activeTab = location.pathname.split('/').pop() || 'overview';

    // 🌟 SET JUDUL DINAMIS BERDASARKAN TAB
    useEffect(() => {
        if (activeTab === 'return') {
            setTitle("Manager Dashboard / Return & Rejection");
        } else if (activeTab === 'efficiency') {
            setTitle("Manager Dashboard / SLA & Efficiency");
        } else {
            setTitle("Manager Dashboard / Overview");
        }
    }, [activeTab, setTitle]);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50 dark:bg-slate-950 text-japfa-dark dark:text-white transition-colors duration-200">
            
            {/* 🌟 <ManagerHeader /> UDAH KITA CABUT DARI SINI BIAR GA DOUBLE! */}

            {/* 🌟 AREA KONTEN UTAMA (PLONG TANPA TAB HORIZONTAL) */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 pt-6 space-y-8 min-h-max pb-24 max-w-[1600px] mx-auto">

                    {/* 🌟 RENDER KONTEN BERDASARKAN URL YANG DIKLIK DI SIDEBAR */}
                    <div className="animate-fadeIn transition-all duration-500">
                        {(activeTab === "overview" || activeTab === "manager") && <OverviewDashboard />}
                        {activeTab === "return" && <ReturnDashboard />}
                        {activeTab === "efficiency" && <EfficiencyDashboard />}
                    </div>
                    
                </div>
            </main>
        </div>
    );
}