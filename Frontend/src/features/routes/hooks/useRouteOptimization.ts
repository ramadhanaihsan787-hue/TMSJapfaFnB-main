import { useState } from "react";
import { routeService } from "../services/routeService";

export const useRouteOptimization = () => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const optimize = async () => {
        setIsOptimizing(true);
        setLoadingProgress(1);
        
        // Animasi bar loading palsu biar UI keliatan mikir
        const progressInterval = setInterval(() => {
            setLoadingProgress((old) => (old >= 99 ? 99 : old + 1));
        }, 600);

        try {
            // 🌟 Panggil Backend buat ngitung AI (VRP)
            const res = await routeService.optimizeRoute();
            
            clearInterval(progressInterval);
            setLoadingProgress(100);
            
            // Jeda dikit biar animasi 100% keliatan
            setTimeout(() => {
                // 🌟 TANGKEP DATA PREVIEW: (Data ini yang bakal dimunculin di Modal)
                setPreviewData(res); 
                setIsOptimizing(false);
                setLoadingProgress(0);
            }, 800);
            
            return res;
        } catch (err) {
            clearInterval(progressInterval);
            setIsOptimizing(false);
            setLoadingProgress(0);
            throw err;
        }
    };

    const confirm = async () => {
        try {
            // 🌟 SIMPAN RUTE: Kirim data preview balik ke Backend buat di-save
            await routeService.confirmRoute(previewData);
            setPreviewData(null); // Tutup modal preview kalau sukses
            return true;
        } catch (error) {
            console.error("Gagal konfirmasi rute:", error);
            throw error;
        }
    };

    return {
        isOptimizing,
        previewData,
        setPreviewData,
        loadingProgress,
        optimize,
        confirm
    };
};