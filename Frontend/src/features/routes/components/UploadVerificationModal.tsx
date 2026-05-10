// src/features/routes/components/UploadVerificationModal.tsx
import React, { useState } from "react";
import { toast } from 'sonner'; 
import type { UploadResult } from "../types";

interface UploadVerificationModalProps {
    uploadReport: { success: UploadResult[], failed: UploadResult[] };
    onClose: () => void;
    // Props buat update data di tabel sukses
    onUpdateTime: (orderId: string, time: string) => void;
    onUpdateWeight: (orderId: string, weight: number) => void;
    onUpdateSuccessCoord: (orderId: string, lat: number, lon: number) => void;
    
    // Props lama buat tabel gagal
    onSaveCoord: (idx: number, customerCode: string, storeName: string, lat: number, lon: number) => Promise<boolean>;
    onOptimize: () => void;
}

export default function UploadVerificationModal({ 
    uploadReport, onClose, onSaveCoord, onUpdateTime, onUpdateWeight, onUpdateSuccessCoord, onOptimize 
}: UploadVerificationModalProps) {
    // State buat nampung index baris yang lagi dibuka (expand) buat liat item produk
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [failedCoords, setFailedCoords] = useState<Record<number, { lat: string, lon: string }>>({});

    // Local state buat nampung editan sementara kordinat di tabel sukses sebelum disave (biar ngga ngelag)
    const [successCoords, setSuccessCoords] = useState<Record<string, { lat: string, lon: string }>>({});

    // 🌟 FUNGSI TOGGLE DROPDOWN ITEM PRODUK
    const toggleRow = (idx: number) => {
        if (expandedRows.includes(idx)) setExpandedRows(expandedRows.filter(i => i !== idx));
        else setExpandedRows([...expandedRows, idx]);
    };

    const handleSaveFailed = async (idx: number, item: UploadResult) => {
        const coords = failedCoords[idx];
        if (!coords || !coords.lat || !coords.lon) return toast.error("Isi Latitude dan Longitude dulu Bos!");
        
        try {
            await onSaveCoord(idx, item.customerCode || item.storeName, item.storeName, parseFloat(coords.lat), parseFloat(coords.lon));
            const newFailedCoords = { ...failedCoords }; 
            delete newFailedCoords[idx]; 
            setFailedCoords(newFailedCoords);
        } catch (error) {
            // Error handling di parent
        }
    };

    const handleSaveSuccessCoord = (orderId: string, originalLat: number, originalLon: number) => {
        const coords = successCoords[orderId];
        if (!coords) return; // Ngga ada perubahan
        
        const newLat = parseFloat(coords.lat);
        const newLon = parseFloat(coords.lon);
        
        if (isNaN(newLat) || isNaN(newLon)) {
            toast.error("Format kordinat salah!");
            return;
        }

        if (newLat !== originalLat || newLon !== originalLon) {
            onUpdateSuccessCoord(orderId, newLat, newLon);
            toast.success("Kordinat berhasil diupdate sementara!");
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white dark:bg-[#1F1F1F] rounded-xl shadow-2xl w-full max-w-[98vw] h-[95vh] flex flex-col border border-slate-200 dark:border-[#333] overflow-hidden animate-in zoom-in-95">
                
                {/* HEADER COMPACT */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#111]">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Validasi Pre-Routing VRP</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Edit <b className="text-primary">Berat, Kordinat, atau Jam</b> langsung di tabel jika ada revisi mendadak.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#333] rounded-lg text-slate-500 transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#1A1A1A] p-3 sm:p-4 flex flex-col gap-4">
                    
                    {/* TABEL SUKSES (COMPACT/DENSE MODE) */}
                    <div className="bg-white dark:bg-[#1F1F1F] border border-emerald-200 dark:border-emerald-900/50 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 border-b border-emerald-200 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span> 
                                Toko Siap Routing ({uploadReport.success.length})
                            </h3>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 relative">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-slate-100 dark:bg-[#222] shadow-sm z-10">
                                    <tr className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="px-3 py-2 border-b dark:border-[#333] w-10 text-center">No</th>
                                        <th className="px-2 py-2 border-b dark:border-[#333]">Nama Toko & Rincian</th>
                                        <th className="px-2 py-2 border-b dark:border-[#333] w-28 text-center bg-blue-50/50 dark:bg-blue-900/10">Berat (KG)</th>
                                        <th className="px-2 py-2 border-b dark:border-[#333] w-56 text-center bg-purple-50/50 dark:bg-purple-900/10">Kordinat (Lat, Lon)</th>
                                        <th className="px-2 py-2 border-b dark:border-[#333] w-28 text-center bg-orange-50/50 dark:bg-orange-900/10">Batas Jam</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                                    {uploadReport.success.map((item, idx) => {
                                        // Destructure kordinat default
                                        const [defLat, defLon] = item.coordinates ? item.coordinates.split(',').map(s => s.trim()) : ['', ''];
                                        const isExpanded = expandedRows.includes(idx);
                                        
                                        return (
                                            <React.Fragment key={idx}>
                                                <tr className={`hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-[#1F1F1F]' : 'bg-slate-50/30 dark:bg-[#222]'}`}>
                                                    <td className="px-3 py-1.5 text-center font-medium text-slate-400">{idx + 1}</td>
                                                    
                                                    {/* NAMA TOKO & DROPDOWN ITEM PRODUK */}
                                                    <td className="px-2 py-1.5">
                                                        <div className="font-bold text-slate-800 dark:text-white truncate max-w-[200px] xl:max-w-[350px]" title={item.storeName}>
                                                            {item.storeName}
                                                        </div>
                                                        {item.items && item.items.length > 0 && (
                                                            <button 
                                                                onClick={() => toggleRow(idx)} 
                                                                className="text-[10px] text-primary flex items-center mt-0.5 hover:underline font-semibold"
                                                            >
                                                                {isExpanded ? (
                                                                    <><span className="material-symbols-outlined text-[12px] mr-1">expand_less</span> Sembunyikan</>
                                                                ) : (
                                                                    <><span className="material-symbols-outlined text-[12px] mr-1">expand_more</span> Lihat {item.items.length} Produk</>
                                                                )}
                                                            </button>
                                                        )}
                                                    </td>
                                                    
                                                    {/* INPUT BERAT/KG */}
                                                    <td className="px-2 py-1.5 bg-blue-50/30 dark:bg-blue-900/5">
                                                        <div className="relative">
                                                            <input 
                                                                type="number" 
                                                                defaultValue={item.weight}
                                                                onBlur={(e) => item.orderId && onUpdateWeight(item.orderId, parseFloat(e.target.value))}
                                                                className="w-full border border-slate-200 dark:border-[#444] bg-white dark:bg-[#111] text-slate-800 dark:text-white rounded px-2 py-1 text-xs font-bold text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" 
                                                            />
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">KG</span>
                                                        </div>
                                                    </td>

                                                    {/* INPUT KORDINAT */}
                                                    <td className="px-2 py-1.5 bg-purple-50/30 dark:bg-purple-900/5">
                                                        <div className="flex items-center gap-1">
                                                            <input 
                                                                type="text" 
                                                                defaultValue={defLat}
                                                                onChange={(e) => setSuccessCoords({...successCoords, [item.orderId!]: { lat: e.target.value, lon: successCoords[item.orderId!]?.lon || defLon }})}
                                                                onBlur={() => item.orderId && handleSaveSuccessCoord(item.orderId, parseFloat(defLat), parseFloat(defLon))}
                                                                placeholder="Lat"
                                                                className="w-full border border-slate-200 dark:border-[#444] bg-white dark:bg-[#111] text-slate-800 dark:text-white rounded px-1.5 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-primary" 
                                                            />
                                                            <span className="text-slate-300">,</span>
                                                            <input 
                                                                type="text" 
                                                                defaultValue={defLon}
                                                                onChange={(e) => setSuccessCoords({...successCoords, [item.orderId!]: { lat: successCoords[item.orderId!]?.lat || defLat, lon: e.target.value }})}
                                                                onBlur={() => item.orderId && handleSaveSuccessCoord(item.orderId, parseFloat(defLat), parseFloat(defLon))}
                                                                placeholder="Lon"
                                                                className="w-full border border-slate-200 dark:border-[#444] bg-white dark:bg-[#111] text-slate-800 dark:text-white rounded px-1.5 py-1 text-xs font-mono text-center focus:ring-1 focus:ring-primary" 
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* INPUT JAM */}
                                                    <td className="px-2 py-1.5 bg-orange-50/30 dark:bg-orange-900/5">
                                                        <input 
                                                            type="time" 
                                                            defaultValue={item.maxTime || "20:00"} 
                                                            onChange={(e) => item.orderId && onUpdateTime(item.orderId, e.target.value)} 
                                                            className="w-full border border-slate-200 dark:border-[#444] bg-white dark:bg-[#111] text-slate-800 dark:text-white rounded px-2 py-1 text-xs font-bold text-center focus:ring-1 focus:ring-primary outline-none cursor-pointer" 
                                                        />
                                                    </td>
                                                </tr>
                                                
                                                {/* 🌟 RINCIAN PRODUK (DROPDOWN) */}
                                                {isExpanded && item.items && (
                                                    <tr className="bg-slate-100/50 dark:bg-black/20">
                                                        <td colSpan={5} className="p-3">
                                                            <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg p-3 mx-8 shadow-inner">
                                                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-[#333] pb-1 mb-2">
                                                                    Rincian Produk
                                                                </h4>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                    {item.items.map((prod, pIdx) => (
                                                                        <div key={pIdx} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-[#222] px-2 py-1.5 rounded">
                                                                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2" title={prod.name}>
                                                                                {prod.name}
                                                                            </span>
                                                                            <span className="font-bold text-slate-900 dark:text-white shrink-0">
                                                                                {prod.quantity}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TABEL GAGAL (Sama aja, cuma diperkecil paddingnya) */}
                    {uploadReport.failed.length > 0 && (
                        <div className="bg-white dark:bg-[#1F1F1F] border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden shadow-sm shrink-0">
                            <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2 border-b border-red-200 flex items-center gap-2">
                                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px]">warning</span> 
                                    Error / Tanpa Koordinat ({uploadReport.failed.length})
                                </h3>
                            </div>
                            <div className="max-h-[250px] overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100 dark:bg-[#222] sticky top-0 shadow-sm z-10">
                                        <tr className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="px-3 py-2 border-b dark:border-[#333]">Nama Toko</th>
                                            <th className="px-2 py-2 border-b dark:border-[#333]">Error</th>
                                            <th className="px-2 py-2 border-b dark:border-[#333] text-center w-72">Input Manual Koordinat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                                        {uploadReport.failed.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                                <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{item.storeName}</td>
                                                <td className="px-2 py-2 text-red-600 dark:text-red-400 font-medium">{item.reason}</td>
                                                <td className="px-2 py-2">
                                                    <div className="flex gap-1.5 justify-center">
                                                        <input type="text" placeholder="Lat (-6.2...)" className="w-24 border border-slate-300 dark:border-[#555] bg-white dark:bg-[#111] rounded px-2 py-1 font-mono text-center" onChange={(e) => setFailedCoords({...failedCoords, [idx]: { ...failedCoords[idx], lat: e.target.value }})} />
                                                        <input type="text" placeholder="Lon (106.8...)" className="w-24 border border-slate-300 dark:border-[#555] bg-white dark:bg-[#111] rounded px-2 py-1 font-mono text-center" onChange={(e) => setFailedCoords({...failedCoords, [idx]: { ...failedCoords[idx], lon: e.target.value }})} />
                                                        <button onClick={() => handleSaveFailed(idx, item)} className="bg-primary text-white font-bold px-3 py-1 rounded hover:brightness-110 shadow-sm">SAVE</button>
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

                {/* FOOTER */}
                <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-[#333] flex justify-end gap-3 bg-white dark:bg-[#111] shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#222] rounded-lg transition-colors">Batal</button>
                    <button onClick={onOptimize} className="px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-primary to-orange-500 hover:brightness-110 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">rocket_launch</span> GAS ROUTING BANG!
                    </button>
                </div>
            </div>
        </div>
    );
}