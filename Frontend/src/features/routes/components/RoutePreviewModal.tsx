import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'; // 🌟 Popup dihapus biar ngga kuning
import L from 'leaflet'; // 🌟 INI YANG TADI KETINGGALAN BOS!

interface RoutePreviewModalProps {
    previewData: any; // Format dari AI Backend
    truckColors: string[];
    onCancel: () => void;
    onConfirmSave: () => void;
}

export default function RoutePreviewModal({ previewData, truckColors, onCancel, onConfirmSave }: RoutePreviewModalProps) {
    const [activePreviewTruck, setActivePreviewTruck] = useState<number | null>(null);

    // Kodingan marker map minimalis khusus modal preview
    const createMiniIcon = (number: number, color: string) => {
        return L.divIcon({
            className: "custom-mini-icon",
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: bold; border: 2px solid white; font-size: 10px;">${number}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    };

    return (
        <div className="fixed inset-0 z-[999999] bg-slate-900/90 backdrop-blur-sm flex flex-col p-4 md:p-8">
            <div className="bg-white dark:bg-[#111] flex-1 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                
                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#1A1A1A]">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">route</span> Peta Preview Rute AI
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">edit</span> Batal
                        </button>
                        <button onClick={onConfirmSave} className="px-6 py-2 bg-primary text-white font-black rounded-xl hover:brightness-110 flex items-center gap-2 shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined">save</span> SIMPAN RUTE PERMANEN
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative bg-slate-100 dark:bg-slate-900" style={{ minHeight: '600px' }}>
                    <MapContainer center={[-6.207356, 106.479163]} zoom={10} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=xUy50YsjmbRexLalxX3ThDpmC1lOzElP" />
                        
                        {/* LOOPING TRUK PREVIEW DARI AI */}
                        {previewData.jadwal_truk_internal && previewData.jadwal_truk_internal.map((truk: any, i: number) => {
                            const color = truckColors[i % truckColors.length];
                            if (activePreviewTruck !== null && activePreviewTruck !== i) return null; // Filter truk aktif

                            return (
                                <React.Fragment key={i}>
                                    {truk.detail_perjalanan.map((stop: any, j: number) => {
                                        if (stop.urutan === 0) return null; // Skip depo
                                        return (
                                            <Marker key={`${i}-${j}`} position={[stop.lat, stop.lon]} icon={createMiniIcon(stop.urutan, color)}>
                                                <Tooltip><b>{stop.nama_toko || stop.lokasi}</b></Tooltip>
                                            </Marker>
                                        )
                                    })}
                                </React.Fragment>
                            )
                        })}
                    </MapContainer>

                    {/* PANEL LIST TRUK MENGAMBANG DI KANAN BAWAH */}
                    <div className="absolute bottom-8 right-8 z-[1000] bg-white/95 p-5 rounded-2xl shadow-2xl border border-slate-200 max-h-[400px] overflow-y-auto w-[320px]">
                        <h4 className="text-xs font-black uppercase text-slate-500 mb-4 border-b pb-2">Rute Truk</h4>
                        <div className="space-y-3">
                            {previewData.jadwal_truk_internal && previewData.jadwal_truk_internal.map((truk: any, i: number) => (
                                <div key={i} onClick={() => setActivePreviewTruck(activePreviewTruck === i ? null : i)} className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer ${activePreviewTruck === i ? 'border-primary bg-slate-50' : ''}`}>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: truckColors[i % truckColors.length] }}></div>
                                    <div className="flex-1">
                                        <span className="text-sm font-black text-slate-800 block">{truk.armada}</span>
                                        <span className="text-[10px] font-bold text-slate-500">{truk.total_muatan_kg} KG | {truk.total_jarak_km} KM</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}