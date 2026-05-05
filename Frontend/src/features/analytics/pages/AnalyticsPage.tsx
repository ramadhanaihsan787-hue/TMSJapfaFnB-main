// src/features/analytics/pages/AnalyticsPage.tsx
import { useEffect } from 'react';
import { useAnalytics } from '../hooks';
import { useDateRange } from '../../../context/DateRangeContext';
import { toast } from 'sonner';

import {
    KPICards,
    DeliveryVolumeChart,
    FleetUtilizationChart,
    DriverPerformanceTable
} from '../components';

export default function AnalyticsPage() {
    const { startDate: globalStart, endDate: globalEnd } = useDateRange();

    const {
        setStartDate,
        setEndDate,
        // handleExport, <-- KITA MATIIN FUNGSI PALSU INI
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

    useEffect(() => {
        setStartDate(globalStart);
        setEndDate(globalEnd);
    }, [globalStart, globalEnd, setStartDate, setEndDate]);

    // 🌟 SUNTIKAN CTO: FUNGSI EXPORT EXCEL NYATA (FR-6.5)
    const handleRealExport = async () => {
        toast.loading("Mempersiapkan file Excel...", { id: "export-toast" });

        try {
            const token = localStorage.getItem('token');
            // Pastiin URL ini nembak ke endpoint yang tadi kita bikin di analytics.py
            const response = await fetch(`http://localhost:8000/api/analytics/export?format=xlsx&startDate=${globalStart}&endDate=${globalEnd}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Gagal download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `JAPFA_Logistics_Report_${globalStart}_to_${globalEnd}.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Excel Report berhasil diunduh!", { id: "export-toast" });
        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat laporan Excel", { id: "export-toast" });
        }
    };

    return (
        <div className="flex flex-col w-full h-full"> 
            
            {/* 🌟 TOMBOL EXPORT UDAH AKTIF! */}
            <div className="px-4 md:px-8 pt-6 pb-2 flex justify-end">
                <button 
                    onClick={handleRealExport} 
                    className="flex items-center gap-2 bg-gradient-to-r from-[#994700] to-[#FF7A00] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Excel Data
                </button>
            </div>

            {/* Content Area */}
            <div className="p-4 md:p-8 pt-4 space-y-6 max-w-[1600px] w-full mx-auto pb-12">
                <KPICards loading={summaryLoading} data={kpiData} />
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <DeliveryVolumeChart loading={volumeLoading} data={volumeData} maxVolume={maxVolume} getBarHeight={getBarHeight} />
                    <FleetUtilizationChart loading={utilizationLoading} data={fleetData} />
                </div>
                <DriverPerformanceTable loading={driversLoading} drivers={driverData} />
            </div>
        </div>
    );
}