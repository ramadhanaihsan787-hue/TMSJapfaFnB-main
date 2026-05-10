// src/features/routes/hooks/useRouteOptimization.ts
import { useState } from "react";
import { toast } from 'sonner';
import { api } from "../../../shared/services/apiClient";

export const useRouteOptimization = () => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    
    // 🌟 FIX CTO: Tambah fase 'validating'
    const [optimizationPhase, setOptimizationPhase] = useState<'idle' | 'zoning' | 'routing' | 'validating' | 'done'>('idle');
    const [zoningData, setZoningData] = useState<any>(null); 
    
    const [previewData, setPreviewData] = useState<any>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const optimize = async (preview = false) => {
        setIsOptimizing(true);
        setLoadingProgress(1);
        setOptimizationPhase('zoning'); 

        try {
            const zoneRes = await api.post(`/api/routes/spatial-preview?preview=${preview}`);
            setZoningData(zoneRes.data.data);
            setLoadingProgress(25); 
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error("Gagal buat zona spasial:", error);
        }

        setOptimizationPhase('routing');
        const progressInterval = setInterval(() => {
            setLoadingProgress((old) => (old >= 95 ? 95 : old + 1));
        }, 1000); 

        try {
            const startRes = await api.post(`/api/routes/optimize/start?preview=${preview}`);
            const jobId = startRes.data.job_id;

            const checkVrpStatus = async () => {
                try {
                    const statusRes = await api.get(`/api/routes/optimize/status/${jobId}`);
                    const jobInfo = statusRes.data;

                    if (jobInfo.status === 'completed') {
                        clearInterval(progressInterval);
                        
                        // 🌟 FIX CTO SPRINT 4: JANGAN LANGSUNG SELESAI, LANJUT CEK MACET!
                        setOptimizationPhase('validating');
                        setLoadingProgress(10); // Reset progress buat ngecek macet
                        
                        const trafficInterval = setInterval(() => {
                            setLoadingProgress((old) => (old >= 95 ? 95 : old + 5));
                        }, 500);
                        
                        try {
                            // Trigger Backend nembak TomTom
                            await api.post(`/api/routes/validate-traffic/${jobId}`);
                            
                            const checkTrafficStatus = async () => {
                                const tRes = await api.get(`/api/routes/validate-traffic/${jobId}/status`);
                                const tInfo = tRes.data;
                                
                                if (tInfo.status === 'completed') {
                                    clearInterval(trafficInterval);
                                    setLoadingProgress(100);
                                    
                                    // Selipin data warnings ke dalam previewData
                                    const finalData = { ...jobInfo.data, traffic_warnings: tInfo.warnings };
                                    
                                    if (tInfo.critical_count > 0) {
                                        toast.warning(`🚨 AI mendeteksi ${tInfo.critical_count} toko berpotensi terlambat akibat macet!`);
                                    }

                                    setTimeout(() => {
                                        setPreviewData(finalData);
                                        setIsOptimizing(false);
                                        setOptimizationPhase('done');
                                        setLoadingProgress(0);
                                    }, 800);
                                    
                                } else if (tInfo.status === 'failed') {
                                    throw new Error("Gagal cek macet TomTom");
                                } else {
                                    setTimeout(checkTrafficStatus, 1500); // Polling tiap 1.5 detik (karena TomTom cepet)
                                }
                            };
                            setTimeout(checkTrafficStatus, 1500);

                        } catch (trafficErr) {
                            // Kalau cek macet gagal, yaudah tampilin data VRP mentah aja
                            clearInterval(trafficInterval);
                            setPreviewData(jobInfo.data);
                            setIsOptimizing(false);
                            setOptimizationPhase('done');
                            toast.warning("Gagal memvalidasi kemacetan jalan, menampilkan estimasi standar.");
                        }

                    } else if (jobInfo.status === 'failed') {
                        clearInterval(progressInterval);
                        setIsOptimizing(false);
                        setOptimizationPhase('idle');
                        setLoadingProgress(0);
                        throw new Error(jobInfo.message || "AI gagal menghitung rute.");

                    } else {
                        setTimeout(checkVrpStatus, 3000);
                    }
                } catch (error) {
                    clearInterval(progressInterval);
                    setIsOptimizing(false);
                    setOptimizationPhase('idle');
                    setLoadingProgress(0);
                    throw error;
                }
            };

            setTimeout(checkVrpStatus, 3000);

        } catch (err) {
            clearInterval(progressInterval);
            setIsOptimizing(false);
            setOptimizationPhase('idle');
            setLoadingProgress(0);
            throw err;
        }
    };

    const resequenceRoute = async (draftData: any) => {
        try {
            setIsOptimizing(true);
            const response = await api.post('/api/routes/resequence', draftData, { timeout: 120000 });
            setPreviewData(response.data); 
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
            setOptimizationPhase('idle');
            return true;
        } catch (error) {
            console.error("Gagal konfirmasi rute:", error);
            throw error;
        }
    };

    return {
        isOptimizing,
        optimizationPhase, 
        zoningData,        
        previewData,
        setPreviewData,
        loadingProgress,
        optimize,
        resequenceRoute, 
        confirm
    };
};