// src/features/fleet/pages/FleetManagementPage.tsx
import Header from "../../../shared/components/Header"; 
import { toast } from 'sonner'; // 🌟 SUNTIKAN SONNER!

import { useFleet } from "../hooks/index";

import { 
    FleetSummaryCards, 
    FleetTable, 
    FleetDetailPanel 
} from "../components";

export default function FleetManagementPage() {
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
        // 🌟 FIX CTO: Ganti alert jadi toast.info
        toast.info(`Menu Ganti Supir untuk truk ${selectedTruck?.licensePlate} dibuka!`);
    };

    const handleReportIssue = () => {
        // 🌟 FIX CTO: Ganti alert jadi toast.warning
        toast.warning(`Form Laporan Servis truk ${selectedTruck?.licensePlate} dibuka!`);
    };

    const handleInputFuel = () => {
        // 🌟 FIX CTO: Ganti alert jadi toast.info
        toast.info("Input Resi Bensin via E-POD Supir atau buka form manual!");
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            {/* Header Utama */}
            <Header title="Fleet Health & Cold Chain Tracking" />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* 🌟 KONTEN KIRI/TENGAH (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                    
                    <FleetSummaryCards 
                        loading={loading} 
                        kpi={kpi} 
                    />

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