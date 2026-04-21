import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
// 🌟 PASTIKAN PATH useApi INI BENAR!
import { useApi } from '../../hooks/useApi';

// Definisikan tipe data sesuai JSON dari Python
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
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 NARIK DATA DARI BACKEND
    useEffect(() => {
        fetch('http://localhost:8000/api/drivers/performance')
            .then(res => res.json())
            .then(data => {
                if(data.status === "success") {
                    setDrivers(data.data);
                    // Buka baris pertama otomatis biar keliatan keren
                    if(data.data.length > 0) setExpandedDriverId(data.data[0].id);
                }
            })
            .catch(err => console.error("Gagal narik driver:", err))
            .finally(() => setIsLoading(false));
    }, []); // <--- JANGAN LUPA KURUNG SIKUNYA BOS!

    const toggleExpand = (id: string) => {
        if (expandedDriverId === id) setExpandedDriverId(null);
        else setExpandedDriverId(id);
    };

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'On Route': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'Resting': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'Offline': return 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-600';
            default: return 'bg-slate-100 text-slate-800';
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
        <>
            <Header title="Driver List" />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Performance Directory</h2>
                        <p className="text-slate-500 dark:text-slate-400">Monitor driver performance and real-time shift progress.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:max-w-xl justify-end">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-[#111111] transition-all outline-none text-slate-800 dark:text-white" placeholder="Find Driver by name or ID..." type="text" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333] rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A1A1A] whitespace-nowrap">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            Filter
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#1A1A1A]/50 border-b border-slate-200 dark:border-[#333]">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perf. Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Metrics</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Truck</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-10 font-bold text-slate-500">Loading Data Driver...</td></tr>
                                ) : drivers.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 font-bold text-slate-500">Belum ada driver yang terdaftar</td></tr>
                                ) : (
                                    drivers.map((driver) => {
                                        const isExpanded = expandedDriverId === driver.id;
                                        
                                        return (
                                            <React.Fragment key={driver.id}>
                                                {/* BARIS UTAMA DRIVER */}
                                                <tr 
                                                    onClick={() => toggleExpand(driver.id)}
                                                    className={`transition-colors cursor-pointer ${isExpanded ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
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
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(driver.status)}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusIndicator(driver.status)}`}></span>
                                                            {driver.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`material-symbols-outlined text-lg ${driver.score >= 90 ? 'text-yellow-500' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
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

                                                {/* 🌟 BARIS EXPANSION */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50/50 dark:bg-[#111111]">
                                                        <td className="px-6 pb-6 pt-2 border-l-2 border-primary" colSpan={6}>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="material-symbols-outlined text-sm text-primary">data_usage</span>
                                                                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Today's Shift Progress</h4>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {/* Panel 1: Distance */}
                                                                <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Distance</p>
                                                                    <p className="text-2xl font-black text-slate-800 dark:text-white flex items-end gap-1">
                                                                        {driver.distanceToday} <span className="text-sm font-bold text-slate-400 mb-0.5">KM</span>
                                                                    </p>
                                                                </div>

                                                                {/* Panel 2: DO Progress */}
                                                                <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Delivery Progress</p>
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
                                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last E-POD Update</p>
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-2 truncate">
                                                                        {driver.lastLocation}
                                                                    </p>
                                                                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
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

                    <div className="px-6 py-4 bg-slate-50 dark:bg-[#1A1A1A] border-t border-slate-200 dark:border-[#333] flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Showing {drivers.length > 0 ? 1 : 0} to {drivers.length} of {drivers.length} drivers</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-slate-200 dark:border-[#444] rounded bg-white dark:bg-[#111111] text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#222] disabled:opacity-50 text-slate-400 dark:text-slate-500">Previous</button>
                            <button className="px-3 py-1 bg-primary text-white rounded text-xs font-bold shadow-sm">1</button>
                            <button className="px-3 py-1 border border-slate-200 dark:border-[#444] rounded bg-white dark:bg-[#111111] text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#222] text-slate-700 dark:text-slate-300">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}