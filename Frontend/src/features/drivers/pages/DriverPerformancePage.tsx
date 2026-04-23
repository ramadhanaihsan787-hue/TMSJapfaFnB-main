import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useApi } from '../../hooks/useApi'; // 🌟 Senjata rahasia!

interface DriverData {
    id: string;
    name: string;
    avatar: string;
    status: string;
    score: number;
    ontime: string;
    doSuccess: string;
    truck: string;
    distanceToday: number;
    doCompleted: number;
    doTotal: number;
    lastLocation: string;
    lastUpdate: string;
}

export default function DriverPerformance() {
    const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<DriverData[]>([]);
    
    // Bikin tanggal dinamis buat filter data 30 hari terakhir
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

    // 🌟 TEMBAK KE MESIN ANALYTICS YANG ASLI!
    const { loading, execute } = useApi(`/api/analytics/driver-performance?startDate=${thirtyDaysAgo}&endDate=${today}`);

    useEffect(() => {
        execute().then((resData: any) => {
            console.log("CCTV DATA DARI BACKEND:", resData);
            // 🌟 JURUS SAPU JAGAT: Ambil data sedalam apapun bungkusnya
            const actualData = resData?.data?.data || resData?.data || resData;
            
            if (Array.isArray(actualData)) {
                // 🌟 MAPPING MAGIC: Nyesuain nama kolom DB sama UI Frontend
                const mappedDrivers = actualData.map((d: any) => ({
                    id: d.id || (d.driver_id ? `DRV-${String(d.driver_id).padStart(3, '0')}` : `DRV-${Math.floor(Math.random()*1000)}`),
                    name: d.name || d.driver_name || "Supir JAPFA",
                    avatar: d.avatar || `https://ui-avatars.com/api/?name=${(d.name || d.driver_name || 'S').replace(' ', '+')}&background=0D8ABC&color=fff`,
                    status: (d.status === true || d.status === 'Active') ? 'On Route' : (d.status || 'Offline'),
                    score: d.score || 85,
                    ontime: d.ontime || (d.on_time_rate ? `${d.on_time_rate}%` : "95%"),
                    doSuccess: d.doSuccess || d.total_trips || "0",
                    truck: d.truck || "-",
                    distanceToday: d.distanceToday || 0,
                    doCompleted: d.doCompleted || 0,
                    doTotal: d.doTotal || d.total_trips || 0,
                    lastLocation: d.lastLocation || "📍 Depo Cikupa",
                    lastUpdate: d.lastUpdate || "Baru saja"
                }));
                
                setDrivers(mappedDrivers);
                if (mappedDrivers.length > 0) setExpandedDriverId(mappedDrivers[0].id);
            }
        });
    }, []);

    const toggleExpand = (id: string) => {
        if (expandedDriverId === id) setExpandedDriverId(null);
        else setExpandedDriverId(id);
    };

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'On Route': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'Resting': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'Offline': return 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusIndicator = (status: string) => {
        switch(status) {
            case 'On Route': return 'bg-emerald-500';
            case 'Resting': return 'bg-blue-500';
            case 'Offline': return 'bg-slate-400';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            <Header title="Driver List" />

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Performance Directory</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Monitor driver performance and real-time shift progress.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:max-w-xl justify-end">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 dark:text-white shadow-sm" placeholder="Find Driver by name or ID..." type="text" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333] rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A1A1A] shadow-sm whitespace-nowrap">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            Filter
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-[#333]">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver Info</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perf. Score</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Metrics</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Truck</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-12 font-bold text-slate-500">Menarik Data Driver...</td></tr>
                                ) : !Array.isArray(drivers) || drivers.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 font-bold text-slate-500">Belum ada driver yang terdaftar di Database!</td></tr>
                                ) : (
                                    drivers.map((driver) => {
                                        const isExpanded = expandedDriverId === driver.id;
                                        
                                        return (
                                            <React.Fragment key={driver.id}>
                                                {/* BARIS UTAMA DRIVER */}
                                                <tr 
                                                    onClick={() => toggleExpand(driver.id)}
                                                    className={`transition-colors cursor-pointer ${isExpanded ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-[#444]">
                                                                <img className="h-full w-full object-cover" src={driver.avatar} alt={driver.name} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">{driver.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{driver.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(driver.status)}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusIndicator(driver.status)}`}></span>
                                                            {driver.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`material-symbols-outlined text-lg ${driver.score >= 90 ? 'text-amber-500' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                                                            <span className="font-bold text-slate-800 dark:text-white">{driver.score}</span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">/100</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="text-slate-400 dark:text-slate-500 w-20">On-time:</span>
                                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{driver.ontime}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="text-slate-400 dark:text-slate-500 w-20">DO Success:</span>
                                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{driver.doSuccess}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        {driver.truck}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-colors">
                                                            <span className="material-symbols-outlined text-lg">more_vert</span>
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* BARIS EXPANSION */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/50 dark:bg-[#111111]">
                                                        <td className="px-6 pb-6 pt-2 border-l-2 border-primary" colSpan={6}>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="material-symbols-outlined text-sm text-primary">data_usage</span>
                                                                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today's Shift Progress</h4>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {/* Panel 1: Distance */}
                                                                <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Distance</p>
                                                                    <p className="text-2xl font-black text-slate-800 dark:text-white flex items-end gap-1">
                                                                        {driver.distanceToday} <span className="text-sm font-bold text-slate-400 mb-0.5">KM</span>
                                                                    </p>
                                                                </div>

                                                                {/* Panel 2: DO Progress */}
                                                                <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Delivery Progress</p>
                                                                    <p className="text-2xl font-black text-primary flex items-end gap-1">
                                                                        {driver.doCompleted} <span className="text-sm font-bold text-slate-400 mb-0.5">/ {driver.doTotal} DO</span>
                                                                    </p>
                                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-[#333] rounded-full mt-3 overflow-hidden">
                                                                        <div 
                                                                            className="h-full bg-primary rounded-full transition-all duration-500" 
                                                                            style={{ width: driver.doTotal > 0 ? `${(driver.doCompleted / driver.doTotal) * 100}%` : '0%' }}
                                                                        ></div>
                                                                    </div>
                                                                </div>

                                                                {/* Panel 3: Last Location/EPOD */}
                                                                <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last E-POD Update</p>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-2 truncate">
                                                                        {driver.lastLocation}
                                                                    </p>
                                                                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                                        {driver.lastUpdate}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-[#333] flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Showing {Array.isArray(drivers) && drivers.length > 0 ? 1 : 0} to {Array.isArray(drivers) ? drivers.length : 0} of {Array.isArray(drivers) ? drivers.length : 0} drivers</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-slate-200 dark:border-[#444] rounded bg-white dark:bg-[#111111] text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#222] disabled:opacity-50 text-slate-400 dark:text-slate-500">Previous</button>
                            <button className="px-3 py-1 bg-primary text-white rounded text-xs font-bold shadow-sm">1</button>
                            <button className="px-3 py-1 border border-slate-200 dark:border-[#444] rounded bg-white dark:bg-[#111111] text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#222] text-slate-700 dark:text-slate-300">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}