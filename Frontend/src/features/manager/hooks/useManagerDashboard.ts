// src/features/manager/hooks/useManagerDashboard.ts
import { useState } from 'react';
import { toast } from 'sonner'; 
import type { ManagerTabId } from '../types';

export const useManagerDashboard = () => {
    // State buat ngontrol Tab mana yang lagi aktif
    const [activeTab, setActiveTab] = useState<ManagerTabId>("overview");

    // Fungsi handle Export yang udah elegan
    const handleExport = (reportName: string) => {
        
        toast.promise(
            // Simulasi nembak API Export (delay 2 detik)
            new Promise((resolve) => setTimeout(resolve, 2000)), 
            {
                loading: `Menyiapkan data ${reportName}...`,
                success: `Data ${reportName} berhasil diexport! 📊`,
                error: 'Gagal melakukan export data.'
            }
        );
    };

    return {
        activeTab,
        setActiveTab,
        handleExport
    };
};