// src/features/routes/components/UploadVerificationModal.tsx
import React, { useState } from "react";
import { toast } from 'sonner'; // 🌟 SUNTIKAN SONNER!
import type { UploadResult } from "../types";

interface UploadVerificationModalProps {
    uploadReport: { success: UploadResult[], failed: UploadResult[] };
    onClose: () => void;
    onSaveCoord: (idx: number, customerCode: string, storeName: string, lat: number, lon: number) => Promise<boolean>;
    onUpdateTime: (orderId: string, time: string) => void;
    onOptimize: () => void;
}

export default function UploadVerificationModal({ uploadReport, onClose, onSaveCoord, onUpdateTime, onOptimize }: UploadVerificationModalProps) {
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [failedCoords, setFailedCoords] = useState<Record<number, { lat: string, lon: string }>>({});

    const toggleRow = (idx: number) => {
        if (expandedRows.includes(idx)) setExpandedRows(expandedRows.filter(i => i !== idx));
        else setExpandedRows([...expandedRows, idx]);
    };

    const handleSave = async (idx: number, item: UploadResult) => {
        const coords = failedCoords[idx];
        // 🌟 FIX CTO: Ganti alert jadi toast.error
        if (!coords || !coords.lat || !coords.lon) return toast.error("Isi Latitude dan Longitude dulu Bos!");
        
        try {
            await onSaveCoord(idx, item.customerCode || item.storeName, item.storeName, parseFloat(coords.lat), parseFloat(coords.lon));
            const newFailedCoords = { ...failedCoords }; 
            delete newFailedCoords[idx]; 
            setFailedCoords(newFailedCoords);
        } catch (error) {
            // Error handling diserahkan ke hook/service
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col border border-slate-200 dark:border-[#333] overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#111]">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Validasi Pre-Routing VRP</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Harap cek daftar pelanggan dan <b className="text-primary">Batas Waktu</b> sebelum memproses rute AI.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-[#333] rounded-xl text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-slate-50 dark:bg-[#1A1A1A]">
                    {/* TABEL SUKSES */}
                    <div className="bg-white dark:bg-[#1F1F1F] border border-emerald-200 dark:border-emerald-900/50 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 border-b border-emerald-200 flex justify-between items-center">
                            <h3 className="font-bold text-emerald-700 flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> Toko Siap Routing ({uploadReport.success.length})</h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-[#111] shadow-sm z-10 border-b">
                                    <tr className="text-slate-500">
                                        <th className="px-5 py-3">No. & Nama Toko</th>
                                        <th className="px-5 py-3 w-32">Total Berat</th>
                                        <th className="px-5 py-3 w-48">Kordinat GPS</th>
                                        <th className="px-5 py-3 w-40 text-center text-primary">Batas Jam</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {uploadReport.success.map((item, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr className="hover:bg-slate-50 dark:hover:bg-[#2A2A2A]">
                                                <td className="px-5 py-3 font-bold dark:text-white">
                                                    {idx + 1}. {item.storeName}
                                                    {item.items && item.items.length > 0 && (
                                                        <button onClick={() => toggleRow(idx)} className="text-[10px] text-primary flex items-center block mt-1 hover:underline">
                                                            {expandedRows.includes(idx) ? 'Sembunyikan' : `Lihat ${item.items.length} Item`}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-bold">{item.weight} KG</td>
                                                <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.coordinates}</td>
                                                <td className="px-5 py-3 text-center">
                                                    <input type="time" defaultValue={item.maxTime || "20:00"} onChange={(e) => item.orderId && onUpdateTime(item.orderId, e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-bold w-full" />
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TABEL GAGAL & FIX KOORDINAT */}
                    {uploadReport.failed.length > 0 && (
                        <div className="bg-white dark:bg-[#1F1F1F] border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden shadow-sm mt-4">
                            <div className="bg-red-50 px-5 py-3 border-b border-red-200 flex items-center gap-2">
                                <h3 className="font-bold text-red-700 flex items-center gap-2"><span className="material-symbols-outlined">warning</span> Error / Tanpa Koordinat ({uploadReport.failed.length})</h3>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 sticky top-0 border-b">
                                        <tr className="text-slate-500">
                                            <th className="px-5 py-3">Nama Toko</th>
                                            <th className="px-5 py-3">Error</th>
                                            <th className="px-5 py-3 text-center w-80">Aksi (Input Koordinat)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {uploadReport.failed.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-red-50/30">
                                                <td className="px-5 py-3 font-bold dark:text-white">{item.storeName}</td>
                                                <td className="px-5 py-3 text-red-600 font-medium text-xs">{item.reason}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex gap-2">
                                                        <input type="text" placeholder="Lat (-6.2)" className="w-20 border rounded px-2 py-1 text-xs" onChange={(e) => setFailedCoords({...failedCoords, [idx]: { ...failedCoords[idx], lat: e.target.value }})} />
                                                        <input type="text" placeholder="Lon (106.8)" className="w-20 border rounded px-2 py-1 text-xs" onChange={(e) => setFailedCoords({...failedCoords, [idx]: { ...failedCoords[idx], lon: e.target.value }})} />
                                                        <button onClick={() => handleSave(idx, item)} className="bg-primary text-white text-xs font-bold px-3 py-1 rounded hover:brightness-110">SAVE</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 flex justify-end gap-4 bg-white dark:bg-[#111]">
                    <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button>
                    <button onClick={onOptimize} className="px-8 py-3 font-black text-white bg-primary hover:brightness-110 rounded-xl flex items-center gap-2 shadow-xl shadow-primary/30">
                        <span className="material-symbols-outlined">rocket_launch</span> GAS PREVIEW RUTE AI!
                    </button>
                </div>
            </div>
        </div>
    );
}