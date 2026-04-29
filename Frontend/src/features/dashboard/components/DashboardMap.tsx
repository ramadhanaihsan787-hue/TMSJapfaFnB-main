// src/features/dashboard/components/DashboardMap.tsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLiveTrackingStore } from '../../../store/useLiveTrackingStore'; 

// =======================================================================
// 🌟 STYLING & ICON KUSTOM KHUSUS PETA
// =======================================================================
const globalDashboardStyles = `
    @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); transform: scale(1); }
        70% { box-shadow: 0 0 0 15px rgba(14, 165, 233, 0); transform: scale(1.1); }
        100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); transform: scale(1); }
    }
    @keyframes warningGlow {
        0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); transform: scale(1); }
        70% { box-shadow: 0 0 0 20px rgba(249, 115, 22, 0); transform: scale(1.15); }
        100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); transform: scale(1); }
    }
    .db-marker {
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    }
    .db-marker-normal {
        width: 32px; height: 32px;
        background-color: #0ea5e9;
        animation: pulseGlow 2s infinite;
    }
    .db-marker-warning {
        width: 32px; height: 32px;
        background-color: #f97316;
        animation: warningGlow 1.5s infinite;
    }
    .db-marker-depo {
        width: 40px; height: 40px;
        background-color: #e11d48;
        font-size: 20px;
        border-width: 4px;
    }
`;

const createDashboardIcon = (iconStr: string, type: 'normal' | 'warning' | 'depo') => {
    const size = type === 'depo' ? 40 : 32;
    return new L.DivIcon({
        className: "custom-leaflet-icon",
        html: `<style>${globalDashboardStyles}</style><div class="db-marker db-marker-${type}">${iconStr}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};

const MapController = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

// =======================================================================
// 🌟 KOMPONEN UTAMA PETA (Udah ngga butuh props lagi!)
// =======================================================================
export default function DashboardMap() {
    // 🌟 TARIK DATA DARI ZUSTAND STORE
    const { trucks, isLoading, startPolling, stopPolling } = useLiveTrackingStore();
    
    // Koordinat Pusat JAPFA Cikupa
    const gudangLatLon: [number, number] = [-6.207356, 106.479163];
    const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

    // 🌟 NYALAKAN MESIN AUTO-POLLING PAS KOMPONEN DIBUKA
    useEffect(() => {
        // Tarik data tiap 10 detik (10000 ms)
        startPolling(10000);

        // MATIKAN MESIN PAS PINDAH HALAMAN (Biar laptop ngga jebol)
        return () => {
            stopPolling();
        };
    }, [startPolling, stopPolling]);

    const handleFlyTo = (lat: number, lon: number) => { 
        setFlyToLocation([lat, lon]); 
    };

    return (
        <div className="mt-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[85vh] min-h-[600px]">
            {/* 🌟 HEADER PETA & TOMBOL NAVIGASI */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#222]/50 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Live Fleet Tracking
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Real-time GPS positioning from driver E-POD devices.</p>
                </div>

                <div className="flex gap-2 flex-wrap justify-end max-w-[50%]">
                    {isLoading && trucks.length === 0 ? (
                        <span className="text-xs text-slate-400 font-bold">Memuat armada...</span>
                    ) : Array.isArray(trucks) && trucks.map((truck, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleFlyTo(truck.lat, truck.lon)}
                            className={`px-3 py-1.5 bg-white dark:bg-[#111] border rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm hover:-translate-y-0.5
                                ${truck.isDelayed
                                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-900/30'
                                    : 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/30'
                                }
                            `}
                        >
                            {truck.isDelayed ? '⚠️ ' : '🚚 '}{truck.id}
                        </button>
                    ))}
                    <button
                        onClick={() => handleFlyTo(gudangLatLon[0], gudangLatLon[1])}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all whitespace-nowrap shadow-sm hover:-translate-y-0.5"
                    >
                        🏢 DEPO CIKUPA
                    </button>
                </div>
            </div>

            {/* 🌟 KANVAS PETA */}
            <div className="flex-1 relative bg-slate-100 dark:bg-[#0a0a0a]">
                <MapContainer
                    center={gudangLatLon}
                    zoom={10}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    whenReady={() => { setTimeout(() => window.dispatchEvent(new Event('resize')), 400); }}
                >
                    <MapController center={flyToLocation} />
                    <TileLayer 
                        attribution='&copy; TomTom' 
                        url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_API_KEY}`} 
                    />

                    <Marker position={gudangLatLon} icon={createDashboardIcon('🏢', 'depo')}>
                        <Tooltip direction="top" offset={[0, -20]} opacity={1}><b>DEPO JAPFA CIKUPA</b></Tooltip>
                        <Popup>
                            <div className="p-1 text-center">
                                <b className="text-rose-600 text-base block mb-1">🏢 DEPO JAPFA CIKUPA</b>
                                <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Pusat Distribusi</span>
                            </div>
                        </Popup>
                    </Marker>

                    {Array.isArray(trucks) && trucks.map((truck, idx) => (
                        <Marker
                            key={idx}
                            position={[truck.lat, truck.lon]}
                            icon={createDashboardIcon('🚚', truck.isDelayed ? 'warning' : 'normal')}
                            zIndexOffset={truck.isDelayed ? 9999 : 500}
                        >
                            <Tooltip direction="top" offset={[0, -16]} opacity={1}><b>{truck.id}</b> - {truck.status}</Tooltip>
                            <Popup>
                                <div className="p-1 min-w-[180px]">
                                    <b className={`text-base flex items-center gap-1 ${truck.isDelayed ? 'text-orange-600' : 'text-blue-600'}`}>
                                        🚚 {truck.id} {truck.isDelayed && '⚠️'}
                                    </b>
                                    <div className="border-b border-slate-200 dark:border-slate-700 my-2"></div>
                                    <span className="text-xs text-slate-500 block mb-2">Supir: <b className="text-slate-800">{truck.driver}</b></span>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded inline-block ${truck.isDelayed ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {truck.status}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}