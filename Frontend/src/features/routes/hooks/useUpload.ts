// src/features/routes/hooks/useUpload.ts
import { useState } from "react";
import { routeService } from "../services/routeService";
import type { UploadResult } from "../types";

interface UploadReport {
    success: UploadResult[];
    failed: UploadResult[];
}

export const useUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadReport, setUploadReport] = useState<UploadReport | null>(null);

    const uploadFile = async (file: File) => {
        try {
            setIsUploading(true);
            const data = await routeService.uploadExcel(file);
            
            // 🌟 MESIN TRANSLATOR: Backend (Indo) -> Frontend (English)
            const mapBackendToFrontend = (item: any): UploadResult => ({
                orderId: item.order_id,
                customerCode: item.kode_customer,
                storeName: item.nama_toko,
                weight: item.berat,
                coordinates: item.kordinat,
                reason: item.alasan,
                maxTime: item.jam_maks,
                items: item.items?.map((i: any) => ({
                    name: i.nama_barang,
                    quantity: i.qty
                })) || []
            });

            setUploadReport({
                success: (data.success_list || []).map(mapBackendToFrontend),
                failed: (data.failed_list || []).map(mapBackendToFrontend),
            });
            
            return true; // Berhasil
        } catch (err) {
            console.error("Gagal upload:", err);
            return false; // Gagal
        } finally {
            setIsUploading(false);
        }
    };

    const updateTime = async (orderId: string, time: string) => {
        try {
            await routeService.updateTimeWindow(orderId, time);
        } catch (error) {
            console.error("Gagal update waktu:", error);
        }
    };

    const saveCoord = async (idx: number, customerCode: string, storeName: string, lat: number, lon: number) => {
        try {
            await routeService.saveCoordinate(idx, customerCode, storeName, lat, lon);
            
            if (uploadReport) {
                const currentSuccess = [...uploadReport.success];
                const fixedItem = uploadReport.failed[idx];
                
                // Pindahin dari failed ke success, trus tambahin koordinat barunya
                currentSuccess.push({ ...fixedItem, coordinates: `${lat}, ${lon}` });
                
                const currentFailed = uploadReport.failed.filter((_, i) => i !== idx);
                setUploadReport({ success: currentSuccess, failed: currentFailed });
            }
            return true;
        } catch (error) {
            console.error("Gagal simpan koordinat:", error);
            throw error;
        }
    };

    return {
        isUploading,
        uploadReport,
        setUploadReport,
        uploadFile,
        updateTime,
        saveCoord
    };
};