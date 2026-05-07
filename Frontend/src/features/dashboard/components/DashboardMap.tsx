// src/features/dashboard/components/DashboardMap.tsx
import { useState, useRef, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// 🌟 FIX CTO: Hapus import dummyFleet biar bersih!
import {
    type TruckTracking, type CustomerDrop,
    DEPO_LON, DEPO_LAT,
    buildRoutesGeoJSON, buildGeofencesGeoJSON, buildZonesGeoJSON
} from './trackingData';

interface LiveTruck {
    id: string;
    driver: string;
    lat: number;
    lon: number;
    status: string;
    isDelayed?: boolean;
    plate?: string;
    zone?: string;
    speed?: number;
    heading?: number;
    loadKg?: number;
    capacityKg?: number;
    eta?: string;
    customers?: CustomerDrop[];
}

interface Props {
    activeTrucks?: LiveTruck[];
    isLoading?: boolean;
}

const css = `
@keyframes truckPulse {
    0%{box-shadow:0 0 0 0 var(--c);transform:scale(1)}
    70%{box-shadow:0 0 0 14px transparent;transform:scale(1.08)}
    100%{box-shadow:0 0 0 0 transparent;transform:scale(1)}
}
@keyframes truckBounce {
    0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}
}
@keyframes depoSpin { 100%{transform:rotate(360deg)} }
.tk-pin{cursor:pointer;transition:all .3s ease}
.tk-pin:hover{transform:scale(1.18)!important;z-index:9999!important}
.tk-active{animation:truckBounce 1s ease-in-out infinite;z-index:9999!important}
.tk-dim{opacity:.2;filter:grayscale(80%);transform:scale(.8)}
.cp-pin{cursor:pointer;transition:all .2s ease}
.cp-pin:hover{transform:scale(1.15);z-index:9999!important}
.cp-dim{opacity:.12;filter:grayscale(100%)}
.depo-ring{position:absolute;inset:-7px;border-radius:50%;border:2px dashed rgba(225,29,72,.4);animation:depoSpin 12s linear infinite}
.fp::-webkit-scrollbar{width:4px}
.fp::-webkit-scrollbar-thumb{background:rgba(100,116,139,.3);border-radius:4px}
`;

const statusColor = (s: string) => s === 'in-transit' ? '#10b981' : s === 'delayed' ? '#f59e0b' : '#94a3b8';
const statusLabel = (s: string) => s === 'in-transit' ? 'In Transit' : s === 'delayed' ? 'Delayed' : 'Idle';
const statusIcon = (s: string) => s === 'in-transit' ? 'local_shipping' : s === 'delayed' ? 'warning' : 'pause_circle';

// Warna armada biar cantik
const TRUCK_COLORS = ['#e11d48', '#0284c7', '#16a34a', '#d97706', '#9333ea', '#0d9488', '#0891b2'];

export default function DashboardMap({ activeTrucks = [], isLoading = false }: Props) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({ longitude: DEPO_LON, latitude: DEPO_LAT, zoom: 10 });
    const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
    const [popupInfo, setPopupInfo] = useState<any>(null);
    const [showZones, setShowZones] = useState(true);
    const [showGeofences, setShowGeofences] = useState(true);

    // 🌟 FULL ADAPTER: Mapping Data API murni ke Format UI
    const displayFleet: TruckTracking[] = useMemo(() => {
        if (!activeTrucks || activeTrucks.length === 0) return [];

        return activeTrucks.map((truck, idx) => {
            const rawStatus = (truck.status || 'idle').toLowerCase();
            let mappedStatus: 'in-transit' | 'delayed' | 'idle' = 'idle';
            
            if (truck.isDelayed || rawStatus === 'delayed') mappedStatus = 'delayed';
            else if (rawStatus === 'in-transit' || rawStatus === 'on route') mappedStatus = 'in-transit';

            return {
                id: truck.id || `truck-${idx}`,
                driver: truck.driver || 'Driver Umum',
                plate: truck.plate || truck.id || '-',
                zone: truck.zone || 'Umum',
                status: mappedStatus,
                lat: truck.lat || DEPO_LAT,
                lon: truck.lon || DEPO_LON,
                speed: truck.speed || (mappedStatus === 'in-transit' ? 45 : 0),
                heading: truck.heading || 0,
                loadKg: truck.loadKg || 0,
                capacityKg: truck.capacityKg || 2000, // Hindari divide by zero
                eta: truck.eta || '-',
                color: TRUCK_COLORS[idx % TRUCK_COLORS.length],
                customers: truck.customers || [] // Pelanggan dari API lu!
            };
        });
    }, [activeTrucks]);

    const flyTo = (lon: number, lat: number, z = 13) => mapRef.current?.flyTo({ center: [lon, lat], zoom: z, duration: 1500 });

    const selectTruck = (id: string) => {
        if (selectedTruck === id) { setSelectedTruck(null); flyTo(DEPO_LON, DEPO_LAT, 10); }
        else { setSelectedTruck(id); const t = displayFleet.find(x => x.id === id); if (t) flyTo(t.lon, t.lat); }
    };

    const routesGJ = useMemo(() => buildRoutesGeoJSON(displayFleet, selectedTruck), [displayFleet, selectedTruck]);
    const geoGJ = useMemo(() => buildGeofencesGeoJSON(displayFleet, selectedTruck), [displayFleet, selectedTruck]);
    const zonesGJ = useMemo(() => buildZonesGeoJSON(), []);

    const stats = useMemo(() => ({
        active: displayFleet.filter(t => t.status === 'in-transit').length,
        delayed: displayFleet.filter(t => t.status === 'delayed').length,
        idle: displayFleet.filter(t => t.status === 'idle').length,
        totalStops: displayFleet.reduce((s, t) => s + t.customers.length, 0),
        done: displayFleet.reduce((s, t) => s + t.customers.filter(c => c.delivered).length, 0),
    }), [displayFleet]);

    return (
        <div className="mt-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col" style={{ height: '780px' }}>
            <style>{css}</style>

            {/* ─── HEADER ─── */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 dark:bg-[#222]/50">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="relative flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative rounded-full h-3 w-3 bg-emerald-500"></span></span>
                        Live Fleet Tracking
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {isLoading ? 'LOADING...' : `${displayFleet.length} UNITS AKTIF`}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{stats.active} Active</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{stats.delayed} Delayed</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="text-[10px] font-bold text-slate-500">{stats.idle} Idle</span>
                    </div>
                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    {/* Toggle buttons */}
                    <button onClick={() => setShowZones(!showZones)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${showZones ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-xs mr-0.5">layers</span>Zones
                    </button>
                    <button onClick={() => setShowGeofences(!showGeofences)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${showGeofences ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-xs mr-0.5">radar</span>Radius
                    </button>
                    <button onClick={() => { setSelectedTruck(null); flyTo(DEPO_LON, DEPO_LAT, 10); }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-100">
                        <span className="material-symbols-outlined text-xs mr-0.5">zoom_out_map</span>Reset
                    </button>
                </div>
            </div>

            {/* ─── MAP + PANEL ─── */}
            <div className="flex-1 flex relative">
                {/* MAP */}
                <div className="flex-1 relative">
                    {displayFleet.length === 0 && !isLoading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 animate-bounce">local_shipping</span>
                            <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Belum Ada Truk Berjalan Hari Ini</h3>
                            <p className="text-sm text-slate-400 mt-2">Selesaikan Routing di menu Route Planning untuk melihat pergerakan truk.</p>
                        </div>
                    )}

                    <Map ref={mapRef} {...viewState} onMove={(e: any) => setViewState(e.viewState)} style={{ width: '100%', height: '100%' }} mapStyle="mapbox://styles/mapbox/dark-v11" mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}>
                        {/* Zone Polygons */}
                        {showZones && (
                            <Source id="zones" type="geojson" data={zonesGJ as any}>
                                <Layer id="zone-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.1 }} />
                                <Layer id="zone-line" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.5, 'line-dasharray': [4, 3] }} />
                            </Source>
                        )}

                        {/* Geofence Circles */}
                        {showGeofences && (
                            <Source id="geofences" type="geojson" data={geoGJ as any}>
                                <Layer id="geo-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacity'] }} />
                                <Layer id="geo-line" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-opacity': ['get', 'strokeOpacity'], 'line-dasharray': [3, 2] }} />
                            </Source>
                        )}

                        {/* Route Polylines */}
                        <Source id="routes-glow" type="geojson" data={routesGJ as any}>
                            <Layer id="route-glow" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 10, 'line-opacity': ['*', ['get', 'opacity'], 0.2], 'line-blur': 6 }} />
                        </Source>
                        <Source id="routes" type="geojson" data={routesGJ as any}>
                            <Layer id="route-main" type="line" layout={{ 'line-cap': 'round', 'line-join': 'round' }} paint={{ 'line-color': ['get', 'color'], 'line-width': ['get', 'width'], 'line-opacity': ['get', 'opacity'], 'line-dasharray': [2, 2] }} />
                        </Source>

                        {/* DEPO Marker */}
                        <Marker longitude={DEPO_LON} latitude={DEPO_LAT} anchor="center" onClick={() => setPopupInfo({ type: 'depo' })}>
                            <div className="depo-marker" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #e11d48, #be123c)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, boxShadow: '0 4px 20px rgba(225,29,72,0.5)', cursor: 'pointer', position: 'relative' }}>
                                🏢<div className="depo-ring"></div>
                            </div>
                        </Marker>

                        {/* Customer Drop Points */}
                        {displayFleet.map((truck) => {
                            const isDim = selectedTruck !== null && selectedTruck !== truck.id;
                            return (truck.customers || []).map((c, j) => (
                                <Marker key={`${truck.id}-c${j}`} longitude={c.lon || 0} latitude={c.lat || 0} anchor="center" onClick={(e) => { e.originalEvent.stopPropagation(); setPopupInfo({ type: 'customer', customer: c, truck }); }}>
                                    <div className={`cp-pin ${isDim ? 'cp-dim' : ''}`}>
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: c.delivered ? '#22c55e' : truck.color, border: '2.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 900, boxShadow: `0 2px 8px ${c.delivered ? 'rgba(34,197,94,0.4)' : truck.color + '66'}`, position: 'relative' }}>
                                            {c.delivered ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span> : (j + 1)}
                                        </div>
                                        {!isDim && !c.delivered && (
                                            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${truck.color}`, opacity: 0.3 }}></div>
                                        )}
                                    </div>
                                </Marker>
                            ));
                        })}

                        {/* Truck Markers */}
                        {displayFleet.map((truck) => {
                            const isDim = selectedTruck !== null && selectedTruck !== truck.id;
                            const isActive = selectedTruck === truck.id;
                            const delivered = (truck.customers || []).filter(c => c.delivered).length;
                            return (
                                <Marker key={truck.id} longitude={truck.lon || 0} latitude={truck.lat || 0} anchor="center" onClick={(e) => { e.originalEvent.stopPropagation(); setPopupInfo({ type: 'truck', truck }); selectTruck(truck.id); }}>
                                    <div className={`tk-pin ${isActive ? 'tk-active' : ''} ${isDim ? 'tk-dim' : ''}`}>
                                        {/* Pulse ring */}
                                        {!isDim && truck.status !== 'idle' && (
                                            <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${statusColor(truck.status)}`, animation: 'truckPulse 2s infinite', ['--c' as any]: statusColor(truck.status) + '66' }}></div>
                                        )}
                                        {/* Pin body */}
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${truck.color}, ${truck.color}dd)`, border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, boxShadow: `0 4px 16px ${truck.color}88`, position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>local_shipping</span>
                                        </div>
                                        {/* Label */}
                                        {!isDim && (
                                            <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#0f172a', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                                                {truck.plate} <span style={{ color: statusColor(truck.status) }}>● {delivered}/{truck.customers?.length || 0}</span>
                                            </div>
                                        )}
                                    </div>
                                </Marker>
                            );
                        })}

                        {/* Zone Labels */}
                        {showZones && !selectedTruck && displayFleet.length > 0 && (
                            <>
                                {[
                                    { name: 'Kelapa Gading', lon: 106.905, lat: -6.155 },
                                    { name: 'Bekasi / Cikarang', lon: 107.075, lat: -6.29 },
                                    { name: 'Serpong / Tangerang', lon: 106.65, lat: -6.25 },
                                ].map(z => (
                                    <Marker key={z.name} longitude={z.lon} latitude={z.lat} anchor="center">
                                        <div style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{z.name}</div>
                                    </Marker>
                                ))}
                            </>
                        )}

                        {/* Popups */}
                        {popupInfo && popupInfo.type === 'depo' && (
                            <Popup longitude={DEPO_LON} latitude={DEPO_LAT} onClose={() => setPopupInfo(null)} closeOnClick={false} anchor="bottom" className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2"><span className="text-xl">🏢</span><b className="text-base text-slate-800 uppercase">Depo Japfa Cikupa</b></div>
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <div className="flex justify-between"><span>Status</span><b className="text-emerald-600">Operational</b></div>
                                        <div className="flex justify-between"><span>Trucks Dispatched</span><b className="text-slate-800">{stats.active + stats.delayed}/{displayFleet.length}</b></div>
                                        <div className="flex justify-between"><span>Geofence Radius</span><b className="text-slate-800">5 KM</b></div>
                                    </div>
                                </div>
                            </Popup>
                        )}
                        {popupInfo && popupInfo.type === 'truck' && (
                            <Popup longitude={popupInfo.truck.lon || 0} latitude={popupInfo.truck.lat || 0} onClose={() => setPopupInfo(null)} closeOnClick={false} anchor="bottom" className="custom-popup">
                                <div className="p-2 min-w-[240px] space-y-2">
                                    <div className="flex items-center justify-between border-b pb-2 mb-1">
                                        <div><b className="text-base block" style={{ color: popupInfo.truck.color }}>{popupInfo.truck.plate}</b><span className="text-[10px] text-slate-400 font-bold">{popupInfo.truck.driver}</span></div>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColor(popupInfo.truck.status) + '20', color: statusColor(popupInfo.truck.status) }}>{statusLabel(popupInfo.truck.status)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-50 p-2 rounded-lg"><span className="text-slate-400 block text-[10px]">Speed</span><b className="text-slate-800">{popupInfo.truck.speed} km/h</b></div>
                                        <div className="bg-slate-50 p-2 rounded-lg"><span className="text-slate-400 block text-[10px]">ETA</span><b className="text-slate-800">{popupInfo.truck.eta}</b></div>
                                        <div className="bg-slate-50 p-2 rounded-lg"><span className="text-slate-400 block text-[10px]">Load</span><b className="text-slate-800">{popupInfo.truck.loadKg}/{popupInfo.truck.capacityKg} KG</b></div>
                                        <div className="bg-slate-50 p-2 rounded-lg"><span className="text-slate-400 block text-[10px]">Stops</span><b className="text-slate-800">{(popupInfo.truck.customers || []).filter((c: CustomerDrop) => c.delivered).length}/{(popupInfo.truck.customers || []).length}</b></div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1"><div className="h-full rounded-full transition-all" style={{ width: `${(popupInfo.truck.loadKg / popupInfo.truck.capacityKg) * 100}%`, backgroundColor: popupInfo.truck.color }}></div></div>
                                    <div className="text-[10px] text-slate-400 text-center">Zone: {popupInfo.truck.zone} • Geofence: 2 KM</div>
                                </div>
                            </Popup>
                        )}
                        {popupInfo && popupInfo.type === 'customer' && (
                            <Popup longitude={popupInfo.customer.lon || 0} latitude={popupInfo.customer.lat || 0} onClose={() => setPopupInfo(null)} closeOnClick={false} anchor="bottom" className="custom-popup">
                                <div className="p-2 min-w-[220px] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <b className="text-sm text-slate-800">{popupInfo.customer.name}</b>
                                        {popupInfo.customer.delivered ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓ Delivered</span> : <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <div className="flex justify-between"><span>Truck</span><b style={{ color: popupInfo.truck.color }}>{popupInfo.truck.plate}</b></div>
                                        <div className="flex justify-between"><span>Muatan</span><b className="text-slate-800">{popupInfo.customer.weightKg || 0} KG</b></div>
                                        <div className="flex justify-between"><span>Time Window</span><b className="text-slate-800">{popupInfo.customer.timeWindow || '-'}</b></div>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Map>
                </div>

                {/* ─── FLEET CONTROL PANEL ─── */}
                <div className="w-[300px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">hub</span> Fleet Control
                        </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 fp">
                        {displayFleet.length === 0 ? (
                            <div className="text-center p-4 text-xs font-bold text-slate-400">
                                Tidak ada armada aktif.
                            </div>
                        ) : displayFleet.map((truck) => {
                            const isSelected = selectedTruck === truck.id;
                            const delivered = (truck.customers || []).filter(c => c.delivered).length;
                            const totalCust = (truck.customers || []).length;
                            const pct = totalCust > 0 ? Math.round((delivered / totalCust) * 100) : 0;
                            return (
                                <div key={truck.id} onClick={() => selectTruck(truck.id)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                                        ? 'bg-slate-50 dark:bg-slate-800 border-primary ring-2 ring-primary/20 shadow-md'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                    } ${selectedTruck && !isSelected ? 'opacity-40' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: truck.color + '20' }}>
                                            <span className="material-symbols-outlined" style={{ color: truck.color, fontSize: 18 }}>{statusIcon(truck.status)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{truck.plate}</span>
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor(truck.status) }}></span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">{truck.driver} • {truck.zone}</span>
                                        </div>
                                    </div>
                                    {/* Progress */}
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: truck.color }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 shrink-0">{delivered}/{totalCust}</span>
                                    </div>
                                    {/* Mini stats */}
                                    <div className="mt-2 flex gap-2 text-[10px] font-bold">
                                        <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{truck.speed > 0 ? `${truck.speed} km/h` : 'Stopped'}</span>
                                        <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{truck.loadKg} KG</span>
                                        {truck.eta !== '-' && <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">ETA {truck.eta}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Summary */}
                    {displayFleet.length > 0 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#222]/50 space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-slate-400 font-medium">Total Stops</span><b className="text-slate-800 dark:text-white">{stats.done}/{stats.totalStops}</b></div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all" style={{ width: stats.totalStops > 0 ? `${(stats.done / stats.totalStops) * 100}%` : '0%' }}></div>
                            </div>
                            <div className="flex justify-between text-[10px]"><span className="text-slate-400">{stats.totalStops > 0 ? Math.round((stats.done / stats.totalStops) * 100) : 0}% Complete</span><span className="text-slate-400">{stats.totalStops - stats.done} remaining</span></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}