// src/features/routes/hooks/useUpload.ts
import { useState } from "react";
import { toast } from 'sonner'; // 🌟 Tambahin toaster buat ngasih tau kalau sukses
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
            
            return true; 
        } catch (err) {
            console.error("Gagal upload:", err);
            return false; 
        } finally {
            setIsUploading(false);
        }
    };

    const updateTime = async (orderId: string, time: string) => {
        try {
            await routeService.updateTimeWindow(orderId, time);
            // Update state lokal biar UI langsung refresh tanpa loading
            if (uploadReport) {
                const newSuccess = uploadReport.success.map(item => 
                    item.orderId === orderId ? { ...item, maxTime: time } : item
                );
                setUploadReport({ ...uploadReport, success: newSuccess });
            }
        } catch (error) {
            console.error("Gagal update waktu:", error);
            toast.error("Gagal update jam!");
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

    // 🌟 SUNTIKAN BARU: UPDATE BERAT (KG)
    const updateWeight = async (orderId: string, weight: number) => {
        try {
            await routeService.updateWeight(orderId, weight);
            if (uploadReport) {
                const newSuccess = uploadReport.success.map(item => 
                    item.orderId === orderId ? { ...item, weight: weight } : item
                );
                setUploadReport({ ...uploadReport, success: newSuccess });
            }
            toast.success("Berat berhasil diupdate!");
        } catch (error) {
            console.error("Gagal update berat:", error);
            toast.error("Gagal update berat!");
        }
    };

    // 🌟 SUNTIKAN BARU: UPDATE KORDINAT DI TABEL SUKSES
    const updateSuccessCoord = async (orderId: string, lat: number, lon: number) => {
        try {
            const item = uploadReport?.success.find(i => i.orderId === orderId);
            if (!item) return;

            // Pake API update kordinat yang udah ada buat order yang valid
            await routeService.updateOrderCoordinate(orderId, {
                latitude: lat,
                longitude: lon,
                kode_customer: item.customerCode || "",
                nama_customer: item.storeName
            });

            if (uploadReport) {
                const newSuccess = uploadReport.success.map(i => 
                    i.orderId === orderId ? { ...i, coordinates: `${lat}, ${lon}` } : i
                );
                setUploadReport({ ...uploadReport, success: newSuccess });
            }
            toast.success("Kordinat berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal update kordinat sukses:", error);
            toast.error("Gagal update kordinat!");
        }
    };

    return {
        isUploading,
        uploadReport,
        setUploadReport,
        uploadFile,
        updateTime,
        saveCoord,
        updateWeight, // 🌟 EXPORT FUNGSI BARU
        updateSuccessCoord // 🌟 EXPORT FUNGSI BARU
    };
};