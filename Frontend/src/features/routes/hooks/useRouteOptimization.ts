// src/features/routes/hooks/useRouteOptimization.ts
import { useState } from "react";
import { toast } from 'sonner';
import { api } from "../../../shared/services/apiClient";

export const useRouteOptimization = () => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const optimize = async (preview = false) => {
        setIsOptimizing(true);
        setLoadingProgress(1);

        const progressInterval = setInterval(() => {
            setLoadingProgress((old) => (old >= 95 ? 95 : old + 1));
        }, 1000); 

        try {
            const startRes = await api.post(`/api/routes/optimize/start?preview=${preview}`);
            const jobId = startRes.data.job_id;

            const checkStatus = async () => {
                try {
                    const statusRes = await api.get(`/api/routes/optimize/status/${jobId}`);
                    const jobInfo = statusRes.data;

                    if (jobInfo.status === 'completed') {
                        clearInterval(progressInterval);
                        setLoadingProgress(100);

                        setTimeout(() => {
                            setPreviewData(jobInfo.data);
                            setIsOptimizing(false);
                            setLoadingProgress(0);
                        }, 800);

                        return jobInfo.data;

                    } else if (jobInfo.status === 'failed') {
                        clearInterval(progressInterval);
                        setIsOptimizing(false);
                        setLoadingProgress(0);
                        throw new Error(jobInfo.message || "AI gagal menghitung rute.");

                    } else {
                        setTimeout(checkStatus, 3000);
                    }
                } catch (error) {
                    clearInterval(progressInterval);
                    setIsOptimizing(false);
                    setLoadingProgress(0);
                    console.error("Gagal polling status VRP:", error);
                    throw error;
                }
            };

            setTimeout(checkStatus, 3000);

        } catch (err) {
            clearInterval(progressInterval);
            setIsOptimizing(false);
            setLoadingProgress(0);
            throw err;
        }
    };

    // 🌟 FUNGSI BARU: MINTA BACKEND NGITUNG ULANG URUTAN (TSP)
    const resequenceRoute = async (draftData: any) => {
        try {
            setIsOptimizing(true);
            const response = await api.post('/api/routes/resequence', draftData);
            setPreviewData(response.data); // Update preview data dengan hasil baru
            toast.success("Urutan berhasil dihitung ulang!");
            return response.data;
        } catch (error) {
            console.error("Gagal menghitung ulang urutan:", error);
            toast.error("Gagal menghitung ulang urutan!");
            throw error;
        } finally {
            setIsOptimizing(false);
        }
    };

    const confirm = async (modifiedData?: any) => {
        try {
            const dataToSave = modifiedData || previewData;
            await api.post('/api/routes/confirm', dataToSave); 
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
        resequenceRoute, // 🌟 EXPORT FUNGSI BARU
        confirm
    };
};