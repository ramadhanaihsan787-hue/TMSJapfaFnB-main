import { useAnalytics } from '../hooks';

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import {
    AnalyticsHeader,
    KPICards,
    DeliveryVolumeChart,
    FleetUtilizationChart,
    DriverPerformanceTable
} from '../components';

export default function AnalyticsPage() {
    // 🌟 PANGGIL SEMUA DATA & FUNGSI DARI HOOK PUSAT
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleExport,
        
        kpiData,
        summaryLoading,
        
        fleetData,
        utilizationLoading,
        
        volumeData,
        maxVolume,
        volumeLoading,
        getBarHeight,
        
        driverData,
        driversLoading
    } = useAnalytics();

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            
            {/* Header dengan Filter Tanggal & Tombol Export */}
            <AnalyticsHeader 
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onExport={handleExport}
            />

            {/* Content Area */}
            <div className="p-4 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1 overflow-y-auto custom-scrollbar">
                
                {/* 🌟 4 KARTU KPI DINAMIS */}
                <KPICards 
                    loading={summaryLoading} 
                    data={kpiData} 
                />

                {/* 🌟 Middle Section: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <DeliveryVolumeChart 
                        loading={volumeLoading}
                        data={volumeData}
                        maxVolume={maxVolume}
                        getBarHeight={getBarHeight}
                    />
                    
                    <FleetUtilizationChart 
                        loading={utilizationLoading}
                        data={fleetData}
                    />
                </div>

                {/* 🌟 Bottom Section: Table Driver */}
                <DriverPerformanceTable 
                    loading={driversLoading}
                    drivers={driverData}
                />
                
            </div>
        </div>
    );
}