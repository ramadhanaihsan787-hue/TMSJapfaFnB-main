// src/features/analytics/hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
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

    // 🌟 STATE DATA (Bersih & Terkontrol)
    const [kpiData, setKpiData] = useState<KPISummary | undefined>();
    const [fleetData, setFleetData] = useState<FleetUtilization | undefined>();
    const [volumeData, setVolumeData] = useState<DeliveryVolume[]>([]);
    const [maxVolume, setMaxVolume] = useState<number>(1);
    const [driverData, setDriverData] = useState<DriverPerformance[]>([]);
    
    // 🌟 SATU LOADING UNTUK SEMUA (Biar UI ngga kedap-kedip aneh)
    const [loading, setLoading] = useState(false);

    // 🌟 ENGINE PENARIK DATA
    const fetchAllData = useCallback(async () => {
        if (!startDate || !endDate) return;

        if (new Date(startDate) > new Date(endDate)) {
            alert("Tanggal Mulai tidak boleh lebih besar dari Tanggal Akhir Bos!");
            return;
        }

        setLoading(true);
        try {
            const data = await analyticsService.fetchAnalyticsData(startDate, endDate);
            
            // Masukin data ke masing-masing state
            setKpiData(data.summary?.data);
            setFleetData(data.utilization?.data);
            setVolumeData(data.volume?.data || []);
            setMaxVolume(data.volume?.max || 1);
            setDriverData(data.drivers?.data || []);
            
        } catch (error) {
            console.error("Gagal sinkronisasi Analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    // 🌟 EFEK TRIGGER KALO TANGGAL BERUBAH
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]); 

    // Helper untuk ngitung tinggi balok chart
    const getBarHeight = (count: number, maxVol: number) => {
        if (count === 0) return "5%"; 
        const max = maxVol || 1; // Cegah dibagi nol
        return `${(count / max) * 100}%`;
    };

    // 🌟 FIX: Fungsi handle Export (Udah dirapihin ngga ada yang dobel)
    const handleExport = async () => {
        try {
            // 1. Tembak API Export
            const blobData = await analyticsService.exportReport(startDate, endDate);
            
            // 2. Bikin link virtual di browser buat download
            const url = window.URL.createObjectURL(new Blob([blobData]));
            const link = document.createElement('a');
            link.href = url;
            
            // 3. Kasih nama file dinamis sesuai tanggal
            link.setAttribute('download', `Laporan_JAPFA_${startDate}_sd_${endDate}.pdf`); 
            
            // 4. Eksekusi klik download lalu bersihin
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            
        } catch (error) {
            alert("Gagal download laporan. Pastikan Backend sudah siap ngirim file!");
        }
    };

    // 🌟 FIX: Return block kembali ke jalan yang benar (di luar fungsi handleExport)
    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleExport,
        
        // Data & Loading States
        kpiData,
        summaryLoading: loading, 
        
        fleetData,
        utilizationLoading: loading,
        
        volumeData,
        maxVolume,
        volumeLoading: loading,
        getBarHeight,
        
        driverData,
        driversLoading: loading
    };
};