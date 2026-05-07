// src/features/routes/components/RouteMap.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const DEPO_LON = 106.479163;
const DEPO_LAT = -6.207356;

// ==========================================
// 1. STYLING ANIMASI (MAPBOX VERSION)
// ==========================================
const css = `
    @keyframes markerBlink { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; } 50% { transform: scale(1.15); box-shadow: 0 0 15px currentColor; } }
    .blinking-marker { animation: markerBlink 1s ease-in-out infinite; z-index: 9999 !important; position: relative; }
    .dimmed-marker { opacity: 0.3; filter: grayscale(80%); }
    .depo-ring { position: absolute; inset: -6px; border-radius: 50%; border: 2px dashed rgba(239,68,68,0.5); animation: depoSpin 10s linear infinite; }
    @keyframes depoSpin { 100% { transform: rotate(360deg); } }
`;

// ==========================================
// 2. BIKIN LINGKARAN GEOFENCE 2KM (NO LIBRARY)
// ==========================================
const createGeoJSONCircle = (center: [number, number], radiusInMeters: number, points = 64) => {
    const coords = [];
    const km = radiusInMeters / 1000;
    const distanceX = km / (111.320 * Math.cos(center[1] * Math.PI / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]); // Tutup polygon biar nyambung
    
    return {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} }]
    };
};

interface RouteMapProps {
    routesData: any[]; 
    selectedRouteId: string | null;
    truckColors: string[];
    droppedNodesData?: any[];
    onSelectRoute?: (routeId: string | null) => void;
}

export default function RouteMap({ routesData, selectedRouteId, truckColors = [], onSelectRoute }: RouteMapProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({ longitude: DEPO_LON, latitude: DEPO_LAT, zoom: 10 });
    const [popupInfo, setPopupInfo] = useState<any>(null);

    // Auto-terbang kalau rute dipilih di panel kiri
    useEffect(() => {
        if (selectedRouteId && mapRef.current) {
            const selected = routesData.find(r => (r.routeId || r.route_id) === selectedRouteId);
            if (selected) {
                const details = selected.details || selected.detail_rute || selected.detail_perjalanan || [];
                const firstStop = details.find((d: any) => {
                    const lat = parseFloat(d.latitude || d.lat);
                    const lon = parseFloat(d.longitude || d.lon);
                    return !isNaN(lat) && !isNaN(lon); // Cegah terbang ke NaN
                });
                if (firstStop) {
                    mapRef.current.flyTo({ 
                        center: [parseFloat(firstStop.longitude || firstStop.lon), parseFloat(firstStop.latitude || firstStop.lat)], 
                        zoom: 11, duration: 1500 
                    });
                }
            }
        }
    }, [selectedRouteId, routesData]);

    // ==========================================
    // 3. OLAH DATA GARIS RUTE JADI GEOJSON MAPBOX
    // ==========================================
    const routesGeoJSON = useMemo(() => {
        const features = routesData.map((route, i) => {
            const routeId = route.routeId || route.route_id;
            const color = truckColors[i % truckColors.length];
            const isDimmed = selectedRouteId !== null && selectedRouteId !== routeId;
            const isBlinking = selectedRouteId === routeId;

            let coords: number[][] = [];
            
            if (route.garis_aspal && route.garis_aspal.coordinates && route.garis_aspal.coordinates.length > 0) {
                // Saring biar ngga ada koordinat NaN dari Backend
                coords = route.garis_aspal.coordinates.filter((c: any) => !isNaN(c[0]) && !isNaN(c[1])); 
            } else if (route.polyline && route.polyline.length > 0) {
                coords = route.polyline.filter((p: any) => !isNaN(p[0]) && !isNaN(p[1])).map((p: any) => [p[1], p[0]]);
            } else {
                coords = [[DEPO_LON, DEPO_LAT]];
                const details = route.details || route.detail_rute || route.detail_perjalanan || [];
                details.forEach((stop: any) => {
                    const lat = parseFloat(stop.latitude || stop.lat);
                    const lon = parseFloat(stop.longitude || stop.lon);
                    if (!isNaN(lat) && !isNaN(lon)) coords.push([lon, lat]);
                });
            }

            // Mapbox error kalau koordinat kurang dari 2
            if (coords.length < 2) coords = [[DEPO_LON, DEPO_LAT], [DEPO_LON, DEPO_LAT]];

            return {
                type: 'Feature',
                properties: { 
                    routeId, color, 
                    opacity: isDimmed ? 0.2 : 1.0, 
                    width: isBlinking ? 6 : 4,
                    glowOpacity: isDimmed ? 0 : (isBlinking ? 0.5 : 0.2)
                },
                geometry: { type: 'LineString', coordinates: coords }
            };
        });

        return { type: 'FeatureCollection', features };
    }, [routesData, selectedRouteId, truckColors]);

    const geofenceGeoJSON = useMemo(() => createGeoJSONCircle([DEPO_LON, DEPO_LAT], 2000), []);

    return (
        <div className="relative w-full h-full min-h-[500px]">
            <style>{css}</style>
            
            <Map 
                ref={mapRef} 
                {...viewState} 
                onMove={(e: any) => setViewState(e.viewState)} 
                style={{ width: '100%', height: '100%' }} 
                mapStyle="mapbox://styles/mapbox/dark-v11" 
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                {/* 🌟 GEOFENCE DEPOT 2KM */}
                <Source id="geofence" type="geojson" data={geofenceGeoJSON as any}>
                    <Layer id="geo-fill" type="fill" paint={{ 'fill-color': '#ef4444', 'fill-opacity': 0.05 }} />
                    <Layer id="geo-line" type="line" paint={{ 'line-color': '#ef4444', 'line-width': 1.5, 'line-dasharray': [4, 4], 'line-opacity': 0.5 }} />
                </Source>

                {/* 🌟 RUTE GARIS ASPAL (GLOW EFFECT) */}
                <Source id="routes-glow" type="geojson" data={routesGeoJSON as any}>
                    <Layer id="route-glow-layer" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 12, 'line-opacity': ['get', 'glowOpacity'], 'line-blur': 6 }} />
                </Source>
                <Source id="routes" type="geojson" data={routesGeoJSON as any}>
                    <Layer id="route-main-layer" type="line" layout={{ 'line-cap': 'round', 'line-join': 'round' }} paint={{ 'line-color': ['get', 'color'], 'line-width': ['get', 'width'], 'line-opacity': ['get', 'opacity'], 'line-dasharray': [2, 2] }} />
                </Source>

                {/* 🌟 MARKER GUDANG JAPFA */}
                <Marker longitude={DEPO_LON} latitude={DEPO_LAT} anchor="center" onClick={() => setPopupInfo({ type: 'depo' })}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #991b1b)', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, boxShadow: '0 4px 15px rgba(239,68,68,0.5)', cursor: 'pointer', position: 'relative' }}>
                        D<div className="depo-ring"></div>
                    </div>
                </Marker>

                {/* 🌟 RENDER PIN TOKO */}
                {routesData.map((route, i) => {
                    const color = truckColors[i % truckColors.length];
                    const routeId = route.routeId || route.route_id;
                    const vehicle = route.vehicle || route.kendaraan || route.armada || "-";
                    const detailsArray = route.details || route.detail_rute || route.detail_perjalanan || [];
                    
                    const isDimmed = selectedRouteId !== null && selectedRouteId !== routeId;
                    const isBlinking = selectedRouteId === routeId;

                    return (
                        <React.Fragment key={routeId}>
                            {detailsArray.map((stop: any, j: number) => {
                                const lat = parseFloat(stop.latitude || stop.lat);
                                const lon = parseFloat(stop.longitude || stop.lon);
                                const namaToko = stop.storeName || stop.nama_toko || stop.lokasi;
                                const beratKg = stop.weightKg || stop.berat_kg || stop.turun_barang_kg || 0;
                                const urutan = stop.sequence || stop.urutan || (j + 1);

                                // 🌟 FIX CTO: Pastikan lat/lon adalah number yg sah, bukan NaN!
                                if (isNaN(lat) || isNaN(lon) || namaToko?.includes("GUDANG JAPFA")) return null;

                                return (
                                    <Marker key={`${routeId}-${j}`} longitude={lon} latitude={lat} anchor="center" onClick={(e) => { e.originalEvent.stopPropagation(); setPopupInfo({ type: 'customer', stop, color, vehicle, urutan, beratKg }); }}>
                                        <div style={{ color }} className={`${isBlinking ? 'blinking-marker' : ''} ${isDimmed ? 'dimmed-marker' : ''} cursor-pointer`}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isDimmed ? '#334155' : color, border: `2px solid ${isDimmed ? '#64748b' : 'white'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 900, boxShadow: isDimmed ? 'none' : '0 2px 8px rgba(0,0,0,0.5)' }}>
                                                {urutan}
                                            </div>
                                        </div>
                                    </Marker>
                                );
                            })}
                        </React.Fragment>
                    );
                })}

                {/* 🌟 POPUPS */}
                {popupInfo && popupInfo.type === 'depo' && (
                    <Popup longitude={DEPO_LON} latitude={DEPO_LAT} onClose={() => setPopupInfo(null)} closeOnClick={false} anchor="bottom" className="custom-popup z-[9999]">
                        <div className="p-2 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2"><span className="text-xl">🏢</span><b className="text-base text-slate-800 uppercase">Depo Japfa Cikupa</b></div>
                            <div className="text-xs text-slate-500 space-y-1">
                                <div className="flex justify-between"><span>Status</span><b className="text-emerald-600">Operational</b></div>
                                <div className="flex justify-between"><span>Geofence Radius</span><b className="text-slate-800">2 KM</b></div>
                            </div>
                        </div>
                    </Popup>
                )}
                
                {popupInfo && popupInfo.type === 'customer' && (
                    <Popup longitude={parseFloat(popupInfo.stop.longitude || popupInfo.stop.lon)} latitude={parseFloat(popupInfo.stop.latitude || popupInfo.stop.lat)} onClose={() => setPopupInfo(null)} closeOnClick={false} anchor="bottom" className="custom-popup z-[9999]">
                        <div className="p-1 space-y-2 min-w-[200px]">
                            <div className="flex justify-between items-center border-b pb-1 mb-1">
                                <b style={{ color: popupInfo.color }} className="text-sm uppercase truncate pr-2">🚚 {popupInfo.vehicle}</b>
                                <span style={{ backgroundColor: popupInfo.color }} className="text-white font-black text-lg px-2.5 py-0.5 rounded-full shadow">{popupInfo.urutan}</span>
                            </div>
                            <b className="text-sm font-bold text-slate-800">{popupInfo.stop.storeName || popupInfo.stop.nama_toko}</b>
                            {/* 🌟 FIX CTO: Warning beratKg unused sudah sembuh karena dipanggil di sini */}
                            <div className="text-xs text-slate-600 flex justify-between"><span className="font-medium text-slate-400">Muatan:</span> <b className="text-slate-900 font-bold">{popupInfo.beratKg} KG</b></div>
                            <div className="text-xs text-slate-600 flex justify-between"><span className="font-medium text-slate-400">Est. Tiba:</span> <b className="text-slate-900 font-bold">{popupInfo.stop.arrivalTime || popupInfo.stop.jam_tiba || '-'}</b></div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* 🌟 LEGENDA INTERAKTIF */}
            {onSelectRoute && routesData.length > 0 && (
                <div className="absolute bottom-6 right-6 z-[1000] bg-[#111]/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-slate-700 max-h-[250px] overflow-y-auto min-w-[200px]">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center justify-between border-b border-slate-700 pb-2">
                        <span>Rute Aktif</span>
                        <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded">Pilih Manual</span>
                    </h4>
                    <div className="space-y-2">
                        {routesData.map((truk, i) => {
                            const routeId = truk.routeId || truk.route_id;
                            const vehicle = truk.vehicle || truk.kendaraan || truk.armada || "-";
                            const isThisSelected = selectedRouteId === routeId;
                            const isOtherSelected = selectedRouteId !== null && !isThisSelected;
                            return (
                                <div key={i} onClick={() => onSelectRoute(isThisSelected ? null : routeId)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all select-none ${isThisSelected ? 'bg-slate-800 border border-primary scale-105' : 'hover:bg-slate-800'} ${isOtherSelected ? 'opacity-40 grayscale' : ''}`}>
                                    <div className={`w-4 h-4 rounded-full shadow-inner border border-[#111] ${isThisSelected ? 'animate-pulse' : ''}`} style={{ backgroundColor: truckColors[i % truckColors.length] }}></div>
                                    <span className="text-xs font-bold text-slate-200">{vehicle}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}