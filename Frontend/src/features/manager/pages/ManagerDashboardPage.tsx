import { useManagerDashboard } from '../hooks';

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import {
    ManagerHeader,
    ManagerTabs,
    OverviewDashboard,
    ReturnDashboard,
    EfficiencyDashboard
} from '../components';

export default function ManagerDashboardPage() {
    // 🌟 PANGGIL STATE TAB DARI HOOK
    const { activeTab, setActiveTab } = useManagerDashboard();

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50 dark:bg-slate-950 text-japfa-dark dark:text-white transition-colors duration-200">
            
            {/* 🌟 HEADER ATAS */}
            <ManagerHeader />

            {/* 🌟 AREA KONTEN (BISA DI-SCROLL) */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 pt-0 space-y-8 min-h-max pb-24 max-w-[1600px] mx-auto">

                    {/* 🌟 TAB NAVIGASI */}
                    <ManagerTabs 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                    />

                    {/* 🌟 RENDER KONTEN SESUAI TAB */}
                    <div className="space-y-8">
                        {activeTab === "overview" && <OverviewDashboard />}
                        {activeTab === "return" && <ReturnDashboard />}
                        {activeTab === "efficiency" && <EfficiencyDashboard />}
                    </div>
                    
                </div>
            </main>
        </div>
    );
}