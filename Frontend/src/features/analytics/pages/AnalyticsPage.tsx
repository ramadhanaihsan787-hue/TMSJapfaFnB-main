// src/features/analytics/pages/AnalyticsPage.tsx
import { useEffect } from 'react';
import { useAnalytics } from '../hooks';
import { useDateRange } from '../../../context/DateRangeContext';

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

    useEffect(() => {
        setStartDate(globalStart);
        setEndDate(globalEnd);
    }, [globalStart, globalEnd, setStartDate, setEndDate]);

    // 🌟 KITA BUANG DIV h-screen & Header DARI SINI, BIAR LAYOUT INDUK YANG NGURUSIN
    return (
        <div className="flex flex-col w-full h-full"> 
            
            {/* TOMBOL EXPORT (Tetap dipertahankan) */}
            <div className="px-4 md:px-8 pt-6 pb-2 flex justify-end">
                <button onClick={handleExport} className="flex items-center gap-2 bg-gradient-to-r from-[#994700] to-[#FF7A00] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export PDF/Excel
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