// src/features/analytics/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import { useApi } from 'shared/hooks/useApi';
// Sesuaikan path ini kalau API_ENDPOINTS lu ada di folder lain 
import type { KPISummary, FleetUtilization, DeliveryVolume, DriverPerformance } from '../types';

export const useAnalytics = () => {
    // 🌟 STATE RENTANG TANGGAL
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setDate(today.getDate() - 30);
        return lastMonth.toISOString().split('T')[0];
    });
    
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // 🌟 URL DINAMIS
    const queryString = `?startDate=${startDate}&endDate=${endDate}`;
    
    // 🌟 TEMBAK API PAKE SENJATA RAHASIA (ALAMAT FIX)
    const { data: summary, loading: summaryLoading, execute: fetchSummary } = useApi<{ data: KPISummary }>(`/api/analytics/kpi-summary${queryString}`);
    const { data: utilization, loading: utilizationLoading, execute: fetchUtilization } = useApi<{ data: FleetUtilization }>(`/api/analytics/fleet-utilization${queryString}`);
    const { data: volume, loading: volumeLoading, execute: fetchVolume } = useApi<{ data: DeliveryVolume[], max: number }>(`/api/analytics/delivery-volume${queryString}`);
    const { data: drivers, loading: driversLoading, execute: fetchDrivers } = useApi<{ data: DriverPerformance[] }>(`/api/analytics/driver-performance${queryString}`);

    // 🌟 EFEK TRIGGER KALO TANGGAL BERUBAH
    useEffect(() => {
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                alert("Tanggal Mulai tidak boleh lebih besar dari Tanggal Akhir Bos!");
                return;
            }
            
            fetchSummary();
            fetchUtilization();
            fetchVolume();
            fetchDrivers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]); 

    // Helper untuk ngitung tinggi balok chart
    const getBarHeight = (count: number, maxVolume: number) => {
        if (count === 0) return "5%"; 
        const max = maxVolume || 1; // Cegah dibagi nol
        return `${(count / max) * 100}%`;
    };

    // Fungsi handle Export
    const handleExport = () => {
        alert(`Siap komandan! Nanti fitur export PDF dari tanggal ${startDate} ke ${endDate} bakal dijahit di sini!`);
    };

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleExport,
        
        // Data & Loading States
        kpiData: summary?.data,
        summaryLoading,
        
        fleetData: utilization?.data,
        utilizationLoading,
        
        volumeData: volume?.data || [],
        maxVolume: volume?.max || 1,
        volumeLoading,
        getBarHeight,
        
        driverData: drivers?.data || [],
        driversLoading
    };
};