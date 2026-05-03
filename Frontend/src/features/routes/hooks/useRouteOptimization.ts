import { useState } from "react";
// 🌟 FIX CTO: Pastiin lu nge-import api dari client lu yang bener
import { api } from "../../../shared/services/apiClient";

export const useRouteOptimization = () => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const optimize = async (preview = false) => {
        setIsOptimizing(true);
        setLoadingProgress(1);

        // Animasi bar loading palsu biar UI keliatan mikir (lebih lambat karena Async bisa 30 detik)
        const progressInterval = setInterval(() => {
            setLoadingProgress((old) => (old >= 95 ? 95 : old + 1));
        }, 1000); 

        try {
            // 🌟 1. KASIR: Minta tiket antrian dulu
            const startRes = await api.post(`/api/routes/optimize/start?preview=${preview}`);
            const jobId = startRes.data.job_id;

            // 🌟 2. CUSTOMER: Bikin fungsi recursive buat ngecek pesanan
            const checkStatus = async () => {
                try {
                    const statusRes = await api.get(`/api/routes/optimize/status/${jobId}`);
                    const jobInfo = statusRes.data;

                    if (jobInfo.status === 'completed') {
                        // 🎉 BERHASIL! 
                        clearInterval(progressInterval);
                        setLoadingProgress(100);

                        setTimeout(() => {
                            setPreviewData(jobInfo.data);
                            setIsOptimizing(false);
                            setLoadingProgress(0);
                        }, 800);

                        return jobInfo.data;

                    } else if (jobInfo.status === 'failed') {
                        // 💀 GAGAL
                        clearInterval(progressInterval);
                        setIsOptimizing(false);
                        setLoadingProgress(0);
                        throw new Error(jobInfo.message || "AI gagal menghitung rute.");

                    } else {
                        // ⏳ MASIH PROCESSING: Nanya lagi 3 detik kemudian
                        setTimeout(checkStatus, 3000);
                    }
                } catch (error) {
                    clearInterval(progressInterval);
                    setIsOptimizing(false);
                    setLoadingProgress(0);
                    console.error("Gagal polling status VRP:", error);
                    // Jangan lempar error ke UI langsung kalau cuma gagal ngecek, 
                    // kecuali lu bener-bener mau nge-stop prosesnya.
                    throw error;
                }
            };

            // Panggil fungsi ceknya pertama kali
            setTimeout(checkStatus, 3000);

        } catch (err) {
            clearInterval(progressInterval);
            setIsOptimizing(false);
            setLoadingProgress(0);
            throw err;
        }
    };

    const confirm = async () => {
        try {
            // 🌟 Pastiin path API confirm lu bener
            await api.post('/api/routes/confirm', previewData); 
            setPreviewData(null); 
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