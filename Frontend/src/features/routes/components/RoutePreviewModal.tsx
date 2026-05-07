// src/features/routes/components/RoutePreviewModal.tsx
import React, { useState, useRef, useEffect } from "react";
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';

interface RoutePreviewModalProps {
    previewData: any; 
    truckColors: string[];
    onCancel: () => void;
    onProceedDispatch: (draft: any) => void;    
    onResequence?: (draftData: any) => Promise<void>; 
}

// 🌟 FIX CTO: onConfirmSave diganti jadi onProceedDispatch di destruct object
export default function RoutePreviewModal({ previewData, truckColors, onCancel, onProceedDispatch, onResequence }: RoutePreviewModalProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({ longitude: 106.479163, latitude: -6.207356, zoom: 10 });
    
    const [draftData, setDraftData] = useState(JSON.parse(JSON.stringify(previewData)));
    const [isDirty, setIsDirty] = useState(false); 
    const [isResequencing, setIsResequencing] = useState(false);
    
    useEffect(() => {
        setDraftData(JSON.parse(JSON.stringify(previewData)));
        setIsDirty(false); 
    }, [previewData]);

    const [activePreviewTruck, setActivePreviewTruck] = useState<number | null>(null);
    const [selectedStopPopup, setSelectedStopPopup] = useState<{tIdx: number, sIdx: number, stop: any} | null>(null);
    
    const [draggedItem, setDraggedItem] = useState<{tIdx: number, sIdx: number} | null>(null);
    const [dragOverTruck, setDragOverTruck] = useState<number | null>(null);

    const handleMoveStop = (fromTrukIdx: number, toTrukIdx: number, stopIdx: number) => {
        if (fromTrukIdx === toTrukIdx) return;

        const newData = { ...draftData };
        const fromTruk = newData.jadwal_truk_internal[fromTrukIdx];
        const toTruk = newData.jadwal_truk_internal[toTrukIdx];

        const [movedStop] = fromTruk.detail_perjalanan.splice(stopIdx, 1);
        fromTruk.total_muatan_kg -= (movedStop.turun_barang_kg || movedStop.berat_kg || 0);

        toTruk.detail_perjalanan.push(movedStop);
        toTruk.total_muatan_kg += (movedStop.turun_barang_kg || movedStop.berat_kg || 0);

        setDraftData(newData);
        setIsDirty(true); 
        setSelectedStopPopup(null);
        toast.success(`Toko dipindah ke ${toTruk.armada}!`);
    };

    const handleResequence = async () => {
        if(!onResequence) return;
        setIsResequencing(true);
        try {
            await onResequence(draftData);
        } finally {
            setIsResequencing(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[999999] bg-slate-900/90 backdrop-blur-sm flex flex-col p-4 md:p-8">
            <div className="bg-white dark:bg-[#111] flex-1 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                
                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#1A1A1A]">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">route</span> Peta Preview Rute AI
                        </h2>
                        <p className="text-xs font-bold text-slate-500 mt-1">Manual Override: Klik Pin Toko di peta atau Drag-Drop nama toko di panel kanan untuk memindahkan rute.</p>
                    </div>
                    <div className="flex gap-3">
                        {isDirty && (
                            <button 
                                onClick={handleResequence} 
                                disabled={isResequencing}
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined text-sm ${isResequencing ? 'animate-spin' : ''}`}>sync</span> 
                                {isResequencing ? 'Menghitung...' : 'Hitung Ulang Urutan'}
                            </button>
                        )}
                        <button onClick={onCancel} className="px-4 py-2 border-2 border-slate-200 dark:border-[#444] text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#333] flex items-center gap-2 transition-colors">
                            Batal
                        </button>
                        <button onClick={() => onProceedDispatch(draftData)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:brightness-110 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                            LANJUT PENUGASAN KRU <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative bg-slate-100 dark:bg-[#0a0a0a]" style={{ minHeight: '600px' }}>
                    <Map 
                        ref={mapRef} 
                        {...viewState} 
                        onMove={(e: any) => setViewState(e.viewState)} 
                        style={{ width: '100%', height: '100%' }} 
                        mapStyle="mapbox://styles/mapbox/dark-v11" 
                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    >
                        {draftData.jadwal_truk_internal?.map((truk: any, i: number) => {
                            const color = truckColors[i % truckColors.length];
                            if (activePreviewTruck !== null && activePreviewTruck !== i) return null;

                            return (
                                <React.Fragment key={i}>
                                    {truk.detail_perjalanan.map((stop: any, j: number) => {
                                        if (stop.urutan === 0) return null; 
                                        return (
                                            <Marker key={`${i}-${j}`} longitude={stop.lon} latitude={stop.lat} anchor="center">
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedStopPopup({tIdx: i, sIdx: j, stop}); }}
                                                    className="cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-white font-bold text-[10px] shadow-lg"
                                                    style={{ backgroundColor: color, width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white' }}
                                                >
                                                    {j}
                                                </div>
                                            </Marker>
                                        )
                                    })}
                                </React.Fragment>
                            )
                        })}

                        {selectedStopPopup && (
                            <Popup 
                                longitude={selectedStopPopup.stop.lon} 
                                latitude={selectedStopPopup.stop.lat} 
                                anchor="bottom" 
                                onClose={() => setSelectedStopPopup(null)}
                                className="z-[9999]"
                            >
                                <div className="p-2 min-w-[200px] text-slate-800">
                                    <div className="font-bold border-b pb-2 mb-2">{selectedStopPopup.stop.nama_toko || selectedStopPopup.stop.lokasi}</div>
                                    <div className="text-xs font-semibold text-slate-500 mb-2">Pindahkan Rute ke:</div>
                                    <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                        {draftData.jadwal_truk_internal.map((t: any, targetIdx: number) => {
                                            if (targetIdx === selectedStopPopup.tIdx) return null;
                                            return (
                                                <button 
                                                    key={targetIdx} 
                                                    onClick={() => handleMoveStop(selectedStopPopup.tIdx, targetIdx, selectedStopPopup.sIdx)}
                                                    className="w-full text-left px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: truckColors[targetIdx % truckColors.length]}}></span>
                                                    {t.armada}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Map>

                    <div className="absolute bottom-8 right-8 z-[1000] bg-white/95 dark:bg-[#1F1F1F]/95 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-[#333] h-[75vh] flex flex-col w-[360px] backdrop-blur-md">
                        <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-4 border-b dark:border-[#333] pb-2 shrink-0">Panel Manual Override</h4>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                            {draftData.jadwal_truk_internal?.map((truk: any, i: number) => (
                                <div 
                                    key={i} 
                                    onDragOver={(e) => { e.preventDefault(); setDragOverTruck(i); }}
                                    onDragLeave={() => setDragOverTruck(null)}
                                    onDrop={(e) => { 
                                        e.preventDefault(); 
                                        setDragOverTruck(null); 
                                        if(draggedItem) handleMoveStop(draggedItem.tIdx, i, draggedItem.sIdx); 
                                    }}
                                    className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${activePreviewTruck === i ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-[#444]'} ${dragOverTruck === i ? 'ring-2 ring-primary ring-offset-2 scale-[1.02] bg-primary/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePreviewTruck(activePreviewTruck === i ? null : i)}>
                                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: truckColors[i % truckColors.length] }}></div>
                                        <div className="flex-1">
                                            <span className="text-sm font-black text-slate-800 dark:text-white block">{truk.armada}</span>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Muatan: {truk.total_muatan_kg.toFixed(1)} KG</span>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 text-sm">
                                            {activePreviewTruck === i ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </div>

                                    {activePreviewTruck === i && (
                                        <div className="mt-2 pl-7 space-y-1.5 border-l-2 border-slate-100 dark:border-[#333] ml-1.5">
                                            {truk.detail_perjalanan.map((stop: any, j: number) => {
                                                if (stop.urutan === 0) return null;
                                                return (
                                                    <div 
                                                        key={j}
                                                        draggable
                                                        onDragStart={() => setDraggedItem({ tIdx: i, sIdx: j })}
                                                        onDragEnd={() => setDraggedItem(null)}
                                                        className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#333] px-2 py-1.5 rounded text-xs cursor-grab active:cursor-grabbing hover:border-primary transition-colors flex items-center justify-between"
                                                    >
                                                        <div className="flex flex-col truncate w-[60%]">
                                                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={stop.nama_toko}>{j}. {stop.nama_toko}</span>
                                                            <span className="text-[9px] font-medium text-slate-400 mt-0.5" title="Batas Waktu Pengiriman">Tutup: {stop.timeWindow || stop.jam_maks || '20:00'}</span>
                                                        </div>
    
                                                        <div className="flex flex-col items-end shrink-0 gap-1">
                                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-[#222] px-1.5 py-0.5 rounded">{stop.turun_barang_kg || stop.berat_kg} KG</span>
        
                                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1
                                                                ${(stop.timeWindow || stop.jam_maks || '20:00') < (stop.jam_tiba || '00:00') 
                                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                                }`}
                                                            >
                                                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                                {stop.jam_tiba || 'Menghitung...'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}