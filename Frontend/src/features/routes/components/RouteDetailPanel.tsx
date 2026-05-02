// src/features/routes/components/RouteDetailPanel.tsx
import React, { useState } from "react";
import { toast } from 'sonner'; // 🌟 SUNTIKAN SONNER!
import type { RouteItem } from "../types";

const formatTimeWindow = (timeStr: string, weight: number) => {
    if (!timeStr) return "-";
    const cleanedTimeStr = timeStr.substring(0, 5);
    const parts = cleanedTimeStr.split(':');
    if (parts.length < 2) return cleanedTimeStr;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const serviceTime = 15 + (weight / 10);
    const totalMinutes = h * 60 + m + Math.round(serviceTime);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

interface RouteDetailPanelProps {
    selectedRoute: RouteItem | undefined;
    isFocusMode: boolean;
    onToggleFocus: () => void;
    showMapView: boolean;
    onToggleMapView: () => void;
    mapComponent?: React.ReactNode; 
}

export default function RouteDetailPanel({ 
    selectedRoute, 
    isFocusMode, 
    onToggleFocus, 
    showMapView, 
    onToggleMapView,
    mapComponent 
}: RouteDetailPanelProps) {
    const [expandedStopIdx, setExpandedStopIdx] = useState<number | null>(null);

    return (
        <div className="space-y-4 transition-all duration-300 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">timeline</span> 
                    Route Sequence {selectedRoute && `- ${selectedRoute.vehicle}`}
                </h3>
                <div className="flex gap-2">
                    <button type="button" onClick={onToggleFocus} className={`px-3 py-1.5 border rounded-lg text-sm font-bold transition-colors flex items-center gap-1 ${isFocusMode ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:hover:bg-[#1A1A1A] dark:text-slate-300 dark:border-[#333]'}`}>
                        <span className="material-symbols-outlined text-base">{isFocusMode ? 'fullscreen_exit' : 'fullscreen'}</span>
                        {isFocusMode ? 'Normal View' : 'Focus Mode'}
                    </button>
                    <button type="button" onClick={onToggleMapView} className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${showMapView ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:hover:bg-[#1A1A1A] dark:text-slate-300 dark:border-[#333]'}`}>
                        {showMapView ? 'List View' : 'Map View'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1F1F1F] border border-slate-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px] flex-1">
                {showMapView ? (
                    <div className="flex-1 bg-slate-100 dark:bg-[#1A1A1A] flex flex-col relative w-full h-full min-h-[500px] z-0">
                        {mapComponent}
                    </div>
                ) : (
                    selectedRoute ? (
                        <div className="p-8 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                            <div className="space-y-0 relative">
                                <div className="absolute left-[9px] top-2 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700 border-l-2 border-dashed border-slate-200 dark:border-[#333] -z-10"></div>

                                {/* GUDANG JAPFA (START POINT) */}
                                <div className="relative pl-10 pb-10">
                                    <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center ring-4 ring-white dark:ring-[#1F1F1F]">
                                        <span className="text-[10px] text-white font-bold">0</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">Main Distribution Center</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gudang JAPFA Cikupa</p>
                                            <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded">
                                                <span className="material-symbols-outlined text-xs">inventory</span> TOTAL MUATAN: {selectedRoute.totalWeight} KG
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">06:00 AM</span>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Berangkat</p>
                                        </div>
                                    </div>
                                </div>

                                {/* LOOPING DESTINASI */}
                                {selectedRoute.details.map((stop, idx) => (
                                    <div key={idx} className="relative pl-10 pb-10">
                                        <div
                                            className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-white dark:ring-[#1F1F1F] cursor-pointer hover:scale-110 transition-transform"
                                            onClick={() => setExpandedStopIdx(expandedStopIdx === idx ? null : idx)}
                                        >
                                            <span className="text-[10px] text-white font-bold">{idx + 1}</span>
                                        </div>

                                        <div className="flex justify-between items-start cursor-pointer group" onClick={() => setExpandedStopIdx(expandedStopIdx === idx ? null : idx)}>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                                                    {stop.storeName}
                                                    <span className={`material-symbols-outlined text-lg transition-transform ${expandedStopIdx === idx ? 'rotate-180' : ''}`}>expand_more</span>
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono text-[11px]">📍 GPS: {stop.latitude}, {stop.longitude}</p>
                                                <div className="mt-3 flex gap-3">
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                        <span className="material-symbols-outlined text-xs">package_2</span> {stop.weightKg} KG Total Turun
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-primary">{formatTimeWindow(stop.arrivalTime, stop.weightKg)}</span>
                                                <p className="text-[10px] text-primary font-bold uppercase mt-1">Est. Time Window</p>
                                            </div>
                                        </div>

                                        {expandedStopIdx === idx && stop.items && stop.items.length > 0 && (
                                            <div className="mt-4 bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] animate-in slide-in-from-top-2 fade-in duration-200">
                                                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 uppercase">
                                                    <span className="material-symbols-outlined text-sm">receipt_long</span> Rincian Produk Dikirim:
                                                </h5>
                                                <ul className={`grid gap-2 ${isFocusMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                    {stop.items.map((product, prodIdx) => (
                                                        <li key={prodIdx} className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-[#333] pb-2">
                                                            <span className="text-slate-600 dark:text-slate-300 font-medium truncate pr-2">{product.name}</span>
                                                            <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#111] px-2 py-0.5 rounded shrink-0">{product.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <span className="material-symbols-outlined text-5xl mb-3">touch_app</span>
                            <h4 className="font-bold">Pilih Truk di sebelah kiri untuk melihat urutan</h4>
                        </div>
                    )
                )}

                <div className="bg-slate-50 dark:bg-[#1A1A1A] p-6 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#333] mt-auto">
                    <button type="button" onClick={() => window.print()} disabled={!selectedRoute} className="px-6 py-2.5 bg-white dark:bg-[#1F1F1F] border border-slate-300 dark:border-[#333] text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-sm flex items-center gap-2 disabled:opacity-50">
                        <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Cetak Surat Jalan (PDF)
                    </button>
                    {/* 🌟 FIX CTO: Ganti alert jadi toast.success */}
                    <button type="button" onClick={() => toast.success(`Jadwal berhasil dikirim ke HP Supir: ${selectedRoute?.driverName}!`)} disabled={!selectedRoute} className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:brightness-110 text-sm shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50">
                        <span className="material-symbols-outlined text-lg">done_all</span> Kirim ke HP Supir
                    </button>
                </div>
            </div>
        </div>
    );
}