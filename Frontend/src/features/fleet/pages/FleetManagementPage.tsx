import Header from "../../../shared/components/Header"; 

// 🌟 IMPORT HOOK SAKTI KITA
import { useFleet } from "../hooks/index";

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import { 
    FleetSummaryCards, 
    FleetTable, 
    FleetDetailPanel 
} from "../components";

export default function FleetManagementPage() {
    // 🌟 PANGGIL SEMUA DATA DARI HOOK PUSAT
    // Otomatis narik API, nerjemahin data, ngitung KPI, dan ngurus telematics!
    const { 
        loading, 
        fleetList, 
        selectedTruck, 
        setSelectedTruck, 
        telematics, 
        kpi 
    } = useFleet();

    // ================= HANDLERS BUAT ACTION BUTTONS =================
    const handleAssignDriver = () => {
        // Nanti bisa disambungin ke Modal Assign Driver
        alert(`Menu Ganti Supir untuk truk ${selectedTruck?.licensePlate} dibuka!`);
    };

    const handleReportIssue = () => {
        // Nanti bisa disambungin ke Modal Servis
        alert(`Form Laporan Servis truk ${selectedTruck?.licensePlate} dibuka!`);
    };

    const handleInputFuel = () => {
        alert("Input Resi Bensin via E-POD Supir atau buka form manual!");
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            {/* Header Utama */}
            <Header title="Fleet Health & Cold Chain Tracking" />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* 🌟 KONTEN KIRI/TENGAH (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                    
                    {/* 4 Kartu KPI Atas */}
                    <FleetSummaryCards 
                        loading={loading} 
                        kpi={kpi} 
                    />

                    {/* Tabel Daftar Truk */}
                    <FleetTable 
                        loading={loading}
                        fleetList={fleetList}
                        selectedTruck={selectedTruck}
                        onSelectTruck={setSelectedTruck}
                    />

                </div>

                {/* 🌟 SIDEBAR KANAN (DETAIL TRUK & SENSOR) */}
                <FleetDetailPanel 
                    selectedTruck={selectedTruck}
                    telematics={telematics}
                    onAssignDriver={handleAssignDriver}
                    onReportIssue={handleReportIssue}
                    onInputFuel={handleInputFuel}
                />
                
            </div>
        </div>
    );
}