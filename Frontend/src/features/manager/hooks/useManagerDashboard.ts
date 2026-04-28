// src/features/manager/hooks/useManagerDashboard.ts
import { useState } from 'react';
import type { ManagerTabId } from '../types';

export const useManagerDashboard = () => {
    // State buat ngontrol Tab mana yang lagi aktif
    const [activeTab, setActiveTab] = useState<ManagerTabId>("overview");

    // Fungsi handle Export (sementara pake alert dulu)
    const handleExport = (reportName: string) => {
        alert(`Sedang menyiapkan Export untuk: ${reportName}`);
    };

    return {
        activeTab,
        setActiveTab,
        handleExport
    };
};