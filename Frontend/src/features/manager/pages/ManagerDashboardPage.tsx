import { useLocation } from 'react-router-dom';

// 🌟 IMPORT KOMPONEN UI (TANPA MANAGERTABS)
import {
    ManagerHeader,
    OverviewDashboard,
    ReturnDashboard,
    EfficiencyDashboard
} from '../components';

export default function ManagerDashboardPage() {
    const location = useLocation();
    
    /**
     * 🌟 LOGIC DARI VERSI KOTOR
     * Mengambil segmen terakhir dari URL (misal: /manager/efficiency -> efficiency)
     * Kalau cuma /manager, default ke 'overview'
     */
    const activeTab = location.pathname.split('/').pop() || 'overview';

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50 dark:bg-slate-950 text-japfa-dark dark:text-white transition-colors duration-200">
            
            {/* 🌟 HEADER TETAP DI ATAS SEBAGAI IDENTITAS */}
            <ManagerHeader />

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