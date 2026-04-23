import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApi } from "../../hooks/useApi"; // 🌟 SENJATA RAHASIA

// ... (Biarkan kodingan CSS dan Interface di atas tetap ada DULU sementara) ...
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

interface LiveTruck { id: string; driver: string; lat: number; lon: number; status: string; isDelayed: boolean; }
interface VolumeData { time: string; count: number; }
interface RejectionData { reason: string; percentage: number; color: string; }
interface AlertData { title: string; desc: string; time: string; icon: string; iconColor: string; bgColor: string; }

export default function Dashboard() {
    const gudangLatLon: [number, number] = [-6.207356, 106.479163];

    const [kpiData, setKpiData] = useState({ totalShipments: 0, otifRate: "0%", rejectionRate: "0%", totalWeightKg: "0" });
    const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
    const [maxVolume, setMaxVolume] = useState(1);
    const [fleetData, setFleetData] = useState({ active: 0, total: 0, rate: 0 });
    const [activeTrucks, setActiveTrucks] = useState<LiveTruck[]>([]);
    const [rejections, setRejections] = useState<RejectionData[]>([]);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

    // 🌟 PANGGIL useApi BUAT BAWA TOKEN
    const { execute: fetchKpi } = useApi<any>('/api/analytics/kpi-summary');
    const { execute: fetchVolume } = useApi<any>('/api/dashboard/hourly-volume');
    const { execute: fetchFleet } = useApi<any>('/api/dashboard/fleet-utilization');
    const { execute: fetchTracking } = useApi<any>('/api/dashboard/live-tracking');
    const { execute: fetchRejections } = useApi<any>('/api/dashboard/rejections');
    const { execute: fetchAlerts } = useApi<any>('/api/dashboard/alerts');

    const handleFlyTo = (lat: number, lon: number) => { setFlyToLocation([lat, lon]); };

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                // Eksekusi semua secara paralel biar cepet
                const [kpiRes, volRes, fleetRes, trackRes, rejRes, alertRes] = await Promise.all([
                    fetchKpi(), fetchVolume(), fetchFleet(), fetchTracking(), fetchRejections(), fetchAlerts()
                ]);

                // Set KPI
                if (kpiRes) {
                    const weightFormated = kpiRes.total_weight_kg > 1000 ? (kpiRes.total_weight_kg / 1000).toFixed(1) + "k" : kpiRes.total_weight_kg;
                    setKpiData({
                        totalShipments: kpiRes.total_deliveries_today || 0,
                        otifRate: `${kpiRes.success_rate_percent || 0}%`,
                        rejectionRate: "0%",
                        totalWeightKg: weightFormated ? weightFormated.toString() : "0"
                    });
                }

                // Set Volume
                if (volRes && volRes.status === "success") {
                    setVolumeData(volRes.data);
                    setMaxVolume(volRes.max);
                }

                // Set Fleet Util
                if (fleetRes && fleetRes.status === "success") {
                    setFleetData({ active: fleetRes.active_trucks, total: fleetRes.total_trucks, rate: fleetRes.utilization_rate });
                }

                // Set Tracking
                if (trackRes && trackRes.status === "success" && Array.isArray(trackRes.data)) {
                    setActiveTrucks(trackRes.data);
                } else { setActiveTrucks([]); }

                // Set Rejections
                if (rejRes && rejRes.status === "success" && Array.isArray(rejRes.data)) {
                    setRejections(rejRes.data);
                } else { setRejections([]); }

                // Set Alerts
                if (alertRes && alertRes.status === "success" && Array.isArray(alertRes.data)) {
                    setAlerts(alertRes.data);
                } else { setAlerts([]); }

            } catch (error) {
                console.error("Gagal load data dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllData();
    }, []); // 🌟 KOSONGIN KURUNG SIKU BIAR NGGA INFINITE LOOP

    const getBarHeight = (count: number) => {
        if (count === 0) return "5%";
        return `${(count / maxVolume) * 100}%`;
    };

    return (
        <>
            <Header title="Daily Logistics KPI Dashboard" />

            <div className="p-4 md:p-8 flex flex-col gap-6 md:gap-8">
                {/* 🌟 4 KARTU KPI DINAMIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Kartu 1: OTIF Rate */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">OTIF Rate</span>
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? "..." : kpiData.otifRate}
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">vs. last week target (95%)</p>
                    </div>

                    {/* Kartu 2: Product Rejection */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Rejection</span>
                            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-500 dark:text-red-400">
                                <span className="material-symbols-outlined">error</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? "..." : kpiData.rejectionRate}
                            </h3>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Awaiting E-POD sync</p>
                    </div>

                    {/* Kartu 3: Total Shipments */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Shipments</span>
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500 dark:text-blue-400">
                                <span className="material-symbols-outlined">local_shipping</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? "..." : kpiData.totalShipments}
                            </h3>
                            <span className="text-slate-400 text-sm font-medium uppercase">orders</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Active routing today</p>
                    </div>

                    {/* Kartu 4: Total Weight (KG) */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Weight</span>
                            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-500 dark:text-purple-400">
                                <span className="material-symbols-outlined">scale</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? "..." : kpiData.totalWeightKg}
                            </h3>
                            <span className="text-slate-400 text-sm font-medium uppercase">KG</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Total capacity utilized</p>
                    </div>
                </div>

                {/* 🌟 LAPIS 2: GRAFIK VOLUME & UTILISASI */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Hourly Delivery Volume */}
                    <div className="w-full lg:w-[70%] bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hourly Delivery Volume</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Peak hour based on AI Estimation</p>
                            </div>
                        </div>
                        <div className="h-[250px] flex items-end gap-4 px-4">
                            {isLoading ? (
                                <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">Memuat Data...</div>
                            ) : Array.isArray(volumeData) && volumeData.length === 0 ? (
                                <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">Belum ada rute hari ini.</div>
                            ) : (
                                Array.isArray(volumeData) && volumeData.map((item, idx) => {
                                    const isPeak = item.count === maxVolume && item.count > 0;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div 
                                                className={`w-full rounded-t-md transition-all relative ${isPeak ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20'}`} 
                                                style={{ height: getBarHeight(item.count) }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.count} TOKO
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold ${isPeak ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{item.time}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Fleet Utilization (Donut Chart) */}
                    <div className="w-full lg:w-[30%] bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Fleet Utilization</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Daily usage tracking</p>
                        <div className="relative flex-1 flex items-center justify-center">
                            {isLoading ? (
                                <span className="font-bold text-slate-400">Menghitung...</span>
                            ) : (
                                <div className="relative w-48 h-48">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <circle className="stroke-slate-100 dark:stroke-slate-800" cx="18" cy="18" r="16" fill="transparent" strokeWidth="4"></circle>
                                        <circle 
                                            className="stroke-primary transition-all duration-1000 ease-out" 
                                            cx="18" cy="18" r="16" fill="transparent" strokeWidth="4" 
                                            strokeDasharray={`${fleetData.rate} 100`} 
                                            strokeLinecap="round"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">{fleetData.rate}%</span>
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Digunakan</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Active Trucks</span>
                                <span className="font-bold text-slate-900 dark:text-white">{fleetData.active} / {fleetData.total} Unit</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🌟 LAPIS BAWAH: ALERT & REJECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Rejection Reasons</h3>
                            <span className="text-xs text-slate-400 font-medium">Month to Date</span>
                        </div>
                        <div className="space-y-6">
                            {isLoading ? (
                                <span className="font-bold text-slate-400 text-sm">Menarik data retur...</span>
                            ) : Array.isArray(rejections) && rejections.length === 0 ? (
                                <span className="font-bold text-slate-400 text-sm">Belum ada laporan barang diretur hari ini.</span>
                            ) : (
                                Array.isArray(rejections) && rejections.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.reason}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[320px] transition-colors">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#222]/50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-time Alerts</h3>
                            <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded uppercase">Live</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {isLoading ? (
                                <div className="p-4 text-center"><span className="font-bold text-slate-400 text-sm">Mendeteksi anomali...</span></div>
                            ) : Array.isArray(alerts) && alerts.length === 0 ? (
                                <div className="p-4 text-center"><span className="font-bold text-slate-400 text-sm">Semua sistem aman. Tidak ada alert.</span></div>
                            ) : (
                                Array.isArray(alerts) && alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg flex gap-4 transition-colors ${alert.bgColor}`}>
                                        <span className={`material-symbols-outlined ${alert.iconColor}`}>{alert.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{alert.desc}</p>
                                            <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 block">{alert.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 🌟 PETA LIVE TRACKING */}
                <div className="mt-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[85vh] min-h-[600px]">
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
                            {isLoading ? (
                                <span className="text-xs text-slate-400 font-bold">Memuat armada...</span>
                            ) : Array.isArray(activeTrucks) && activeTrucks.map((truck, idx) => (
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
                    <div className="flex-1 relative bg-slate-100 dark:bg-[#0a0a0a]">
                        <MapContainer
                            center={gudangLatLon}
                            zoom={10}
                            style={{ height: '100%', width: '100%', zIndex: 0 }}
                            whenReady={() => { setTimeout(() => window.dispatchEvent(new Event('resize')), 400); }}
                        >
                            <MapController center={flyToLocation} />
                            <TileLayer attribution='&copy; TomTom' url="https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=xUy50YsjmbRexLalxX3ThDpmC1lOzElP" />

                            <Marker position={gudangLatLon} icon={createDashboardIcon('🏢', 'depo')}>
                                <Tooltip direction="top" offset={[0, -20]} opacity={1}><b>DEPO JAPFA CIKUPA</b></Tooltip>
                                <Popup>
                                    <div className="p-1 text-center">
                                        <b className="text-rose-600 text-base block mb-1">🏢 DEPO JAPFA CIKUPA</b>
                                        <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Pusat Distribusi</span>
                                    </div>
                                </Popup>
                            </Marker>

                            {!isLoading && Array.isArray(activeTrucks) && activeTrucks.map((truck, idx) => (
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

            </div>
        </>
    );
}