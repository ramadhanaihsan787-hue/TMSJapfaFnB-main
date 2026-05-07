// src/features/routes/components/RouteDispatchModal.tsx
import React, { useState } from "react";
import { toast } from "sonner";

interface RouteDispatchModalProps {
    draftData: any;
    onBack: () => void;
    onConfirmSave: (finalData: any) => void;
    isSaving: boolean;
}

const DRIVER_LIST = [
    { id: 1, name: "Joko Wiyono" }, { id: 2, name: "Eko prasetyo" }, 
    { id: 3, name: "Lestari Primadani" }, { id: 4, name: "Nanang Prianto" },
    { id: 5, name: "Ari Zasmara" }, { id: 6, name: "Santoso" }, { id: 7, name: "Fauzan" },
    { id: 88, name: "Supir Pengganti 1 (Harian)" }
];

const HELPER_LIST = [
    { id: 101, name: "Oman Surahman" }, { id: 102, name: "Wanto Alfrian" }, 
    { id: 103, name: "Martono" }, { id: 99, name: "Tanpa Helper" }
];

const DEDICATED_MAP: Record<string, { d: number, h: number }> = {
    "B 9044 JXS": { d: 1, h: 101 },
    "B 9487 JXS": { d: 2, h: 102 },
    "B 9514 JXS": { d: 4, h: 103 },
};

export default function RouteDispatchModal({ draftData, onBack, onConfirmSave, isSaving }: RouteDispatchModalProps) {
    const [assignments, setAssignments] = useState(() => {
        const initial: Record<number, { driver_id: number, helper_id: number }> = {};
        draftData.jadwal_truk_internal.forEach((truk: any, idx: number) => {
            const defaultKru = DEDICATED_MAP[truk.armada] || { d: 1, h: 99 };
            initial[idx] = { driver_id: defaultKru.d, helper_id: defaultKru.h };
        });
        return initial;
    });

    const handleAssign = (trukIdx: number, field: 'driver_id' | 'helper_id', val: number) => {
        setAssignments(prev => ({
            ...prev,
            [trukIdx]: { ...prev[trukIdx], [field]: val }
        }));
    };

    const handleSave = () => {
        const finalData = { ...draftData };
        finalData.jadwal_truk_internal = finalData.jadwal_truk_internal.map((truk: any, idx: number) => ({
            ...truk,
            driver_id: assignments[idx].driver_id,
            // 🌟 FIX CTO: None (Python) diganti jadi null (JS)
            helper_id: assignments[idx].helper_id === 99 ? null : assignments[idx].helper_id 
        }));
        onConfirmSave(finalData);
    };

    return (
        <div className="fixed inset-0 z-[9999999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in zoom-in-95">
                
                <div className="p-6 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#1A1A1A]">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">engineering</span> Penugasan Kru Armada
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Pilih Supir dan Helper untuk setiap rute. Sistem memilih kru *dedicated* secara otomatis.</p>
                    </div>
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-[#333] rounded-xl text-slate-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50 dark:bg-[#0A0A0A] space-y-4">
                    {draftData.jadwal_truk_internal.map((truk: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-[#1F1F1F] border border-slate-200 dark:border-[#333] rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:border-primary transition-colors">
                            
                            <div className="flex-1 w-full flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#222] border-2 border-slate-200 dark:border-[#444] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-slate-400">local_shipping</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">{truk.armada}</h3>
                                    <p className="text-xs font-bold text-slate-500">{truk.total_muatan_kg.toFixed(1)} KG • {truk.detail_perjalanan.length - 2} Titik Drop</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                                <div className="flex flex-col gap-1 w-full sm:w-48">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Supir Utama</label>
                                    <select 
                                        value={assignments[idx].driver_id} 
                                        onChange={(e) => handleAssign(idx, 'driver_id', parseInt(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        {DRIVER_LIST.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                
                                <div className="flex flex-col gap-1 w-full sm:w-48">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Helper (Knek)</label>
                                    <select 
                                        value={assignments[idx].helper_id} 
                                        onChange={(e) => handleAssign(idx, 'helper_id', parseInt(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        {HELPER_LIST.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] flex justify-end gap-3">
                    <button onClick={onBack} disabled={isSaving} className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#333] rounded-xl transition-colors">
                        Kembali ke Peta
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:brightness-110 flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">send</span>}
                        SIMPAN & BERANGKATKAN!
                    </button>
                </div>

            </div>
        </div>
    );
}