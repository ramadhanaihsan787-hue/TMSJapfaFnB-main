import Header from "../../../shared/components/Header"; 

// 🌟 IMPORT HOOK SAKTI KITA
import { useDriverPerformance } from "../hooks";

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import { 
    DriverToolbar, 
    DriverTable, 
    DriverPagination 
} from "../components";

export default function DriverPerformancePage() {
    // 🌟 PANGGIL SEMUA DATA DARI HOOK PUSAT
    const { 
        loading, 
        drivers, 
        expandedDriverId, 
        toggleExpand,
        searchQuery,
        setSearchQuery
    } = useDriverPerformance();

    // 🌟 LOGIC FILTER PENCARIAN (FRONTEND)
    // Biar kalau ngetik nama/ID, tabelnya langsung nge-filter otomatis!
    const filteredDrivers = drivers.filter(driver => 
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            <Header title="Driver List" />

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                
                {/* Bagian Atas: Judul dan Search/Filter */}
                <DriverToolbar 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Bungkus Tabel Utama */}
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden flex flex-col">
                    
                    {/* Komponen Jeroan Tabel */}
                    <DriverTable 
                        loading={loading}
                        drivers={filteredDrivers}
                        expandedDriverId={expandedDriverId}
                        onToggleExpand={toggleExpand}
                    />

                    {/* Pagination di Bawah Tabel */}
                    <DriverPagination 
                        totalDrivers={filteredDrivers.length}
                    />
                    
                </div>
            </div>
        </div>
    );
}