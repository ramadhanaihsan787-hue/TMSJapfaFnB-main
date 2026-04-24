// src/features/routes/components/RouteMap.tsx
import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { RouteItem, DroppedNode } from "../types";

// 🌟 STYLING KHUSUS PETA
const globalStyles = `
    @keyframes markerBlink { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); } 50% { transform: scale(1.2); box-shadow: 0 0 20px currentColor; } }
    @keyframes polylineBlink { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px currentColor); } 50% { opacity: 0.3; filter: none; } }
    .blinking-marker { animation: markerBlink 1s ease-in-out infinite; z-index: 9999 !important; position: relative; }
    .blinking-polyline { animation: polylineBlink 1s ease-in-out infinite; }
`;

const createNumberedIcon = (number: number | string, colorHex: string, isDepo: boolean = false, isDimmed: boolean = false, isBlinking: boolean = false) => {
    const size = isDepo ? 34 : 26;
    const fontSize = isDepo ? '16px' : '12px';
    const bgColor = isDimmed ? '#94a3b8' : colorHex;
    const opacity = isDimmed ? 0.4 : 1;

    const markerHtmlStyles = `
        background-color: ${bgColor}; opacity: ${opacity}; width: ${size}px; height: ${size}px;
        display: flex; align-items: center; justify-content: center; border-radius: 50%;
        color: ${colorHex}; font-weight: 900; font-size: ${fontSize};
        border: 2px solid ${isDimmed ? '#e2e8f0' : 'white'};
        box-shadow: ${isDimmed ? 'none' : '0 4px 10px rgba(0,0,0,0.5)'}; transition: all 0.3s ease;
    `;

    return new L.DivIcon({
        className: "custom-leaflet-icon",
        html: `<style>${globalStyles}</style><div class="${isBlinking ? 'blinking-marker' : ''}" style="${markerHtmlStyles}"><span style="color: white;">${number}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};

const GlowPolyline = ({ positions, color, isDimmed, isBlinking }: { positions: [number, number][], color: string, isDimmed?: boolean, isBlinking?: boolean }) => {
    const mainOpacity = isDimmed ? 0.2 : 1.0;
    const glowOpacityInner = isDimmed ? 0 : (isBlinking ? 0.7 : 0.35);
    const glowOpacityOuter = isDimmed ? 0 : (isBlinking ? 0.4 : 0.15);
    const pathClass = isBlinking ? "blinking-polyline" : "";
    const displayColor = isDimmed ? '#94a3b8' : color;

    return (
        <>
            {!isDimmed && <Polyline positions={positions} pathOptions={{ color: displayColor, weight: 14, opacity: glowOpacityOuter, lineCap: 'round', lineJoin: 'round', className: pathClass }} />}
            {!isDimmed && <Polyline positions={positions} pathOptions={{ color: displayColor, weight: 8, opacity: glowOpacityInner, lineCap: 'round', lineJoin: 'round', className: pathClass }} />}
            <Polyline positions={positions} pathOptions={{ color: displayColor, weight: 4, opacity: mainOpacity, lineCap: 'round', lineJoin: 'round', dashArray: '8, 8', className: pathClass }} />
        </>
    );
};

interface RouteMapProps {
    routesData: RouteItem[];
    selectedRouteId: string | null;
    truckColors: string[];
    droppedNodesData?: DroppedNode[];
    onSelectRoute?: (routeId: string | null) => void; // Buat legenda
}

export default function RouteMap({ routesData, selectedRouteId, truckColors, droppedNodesData = [], onSelectRoute }: RouteMapProps) {
    const mapRef = useRef<any>(null);
    const defaultCenter: [number, number] = [-6.207356, 106.479163];

    useEffect(() => {
        if (mapRef.current) setTimeout(() => { mapRef.current?.invalidateSize(); }, 300);
    }, [routesData, selectedRouteId]);

    return (
        <div className="relative w-full h-full">
            <MapContainer center={defaultCenter} zoom={10} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} className="z-0" ref={mapRef} whenReady={() => { setTimeout(() => window.dispatchEvent(new Event('resize')), 400); }}>
                <TileLayer attribution='&copy; TomTom' url="https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=xUy50YsjmbRexLalxX3ThDpmC1lOzElP" />

                <Marker position={defaultCenter} icon={createNumberedIcon('0', '#1e293b', true, selectedRouteId !== null, false)} zIndexOffset={1000}>
                    <Tooltip direction="top" offset={[0, -16]} opacity={1}><b>Gudang JAPFA Cikupa</b></Tooltip>
                    <Popup><div className="p-1"><b className="text-lg uppercase text-slate-800">Depo JAPFA Cikupa</b><div className="text-sm font-bold text-primary">06:00 AM (Depart)</div></div></Popup>
                </Marker>

                {routesData.map((route, i) => {
                    const color = truckColors[i % truckColors.length];
                    let positions: [number, number][] = [];
                    
                    if (route.polyline && route.polyline.length > 0) {
                        positions = route.polyline;
                    } else {
                        positions = [defaultCenter];
                        route.details.forEach(stop => {
                            if (stop.latitude && stop.longitude) positions.push([stop.latitude, stop.longitude]);
                        });
                    }

                    const isDimmed = selectedRouteId !== null && selectedRouteId !== route.routeId;
                    const isBlinking = selectedRouteId === route.routeId;

                    return (
                        <React.Fragment key={route.routeId}>
                            {positions.length > 1 && <GlowPolyline positions={positions} color={color} isDimmed={isDimmed} isBlinking={isBlinking} />}
                            {route.details.map((stop, j) => {
                                if (!stop.latitude || !stop.longitude) return null;
                                return (
                                    <Marker key={`${route.routeId}-${j}`} position={[stop.latitude, stop.longitude]} icon={createNumberedIcon(stop.sequence, color, false, isDimmed, isBlinking)} zIndexOffset={isBlinking ? 9999 : (isDimmed ? 0 : 500)}>
                                        <Tooltip direction="top" offset={[0, -12]} opacity={isDimmed ? 0.3 : 1}><b>{stop.storeName}</b></Tooltip>
                                        <Popup>
                                            <div className="p-1 space-y-2 min-w-[200px]">
                                                <div className="flex justify-between items-center border-b pb-1 mb-1">
                                                    <b style={{ color: color }} className="text-base uppercase truncate pr-2">🚚 {route.vehicle}</b>
                                                    <span style={{ backgroundColor: color }} className="text-white font-black text-xl px-3 py-1 rounded-full shadow">{stop.sequence}</span>
                                                </div>
                                                <b className="text-sm font-bold text-slate-800">{stop.storeName}</b>
                                                <div className="text-xs text-slate-600 flex justify-between"><span className="font-medium text-slate-400">Muatan:</span> <b className="text-slate-900 font-bold">{stop.weightKg} KG</b></div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* LEGENDA INTERAKTIF (MANUAL TRUK) */}
            {onSelectRoute && routesData.length > 0 && (
                <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[250px] overflow-y-auto min-w-[200px]">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3 flex items-center justify-between border-b pb-2">
                        <span>Rute Aktif</span>
                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded">Pilih Manual</span>
                    </h4>
                    <div className="space-y-2">
                        {routesData.map((truk, i) => {
                            const isThisSelected = selectedRouteId === truk.routeId;
                            const isOtherSelected = selectedRouteId !== null && !isThisSelected;
                            return (
                                <div key={i} onClick={() => onSelectRoute(isThisSelected ? null : truk.routeId)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all select-none ${isThisSelected ? 'bg-slate-100 dark:bg-slate-800 border border-primary scale-105' : 'hover:border-slate-300'} ${isOtherSelected ? 'opacity-40 grayscale' : ''}`}>
                                    <div className={`w-4 h-4 rounded-full shadow-inner border border-white ${isThisSelected ? 'animate-pulse' : ''}`} style={{ backgroundColor: truckColors[i % truckColors.length] }}></div>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{truk.vehicle}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}