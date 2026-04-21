import { useEffect, useState } from 'react';
// 🌟 FIX: Import Header dihapus karena ngga dipake di halaman ini
import { useApi } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';

interface KPISummary {
    otifRate: string;
    fillRate: string; 
    loadFactor: string;
    totalShipments: number;
    avgLoadingTime: string; 
}

interface FleetUtilization {
    totalTrucks: number;
    activeTrucks: number;
    utilizationRate: string;
}

// 🌟 FIX: Definisi TypeScript dipertegas biar dia ngga curiga undefined
interface DeliveryVolume {
    time: string;
    count: number;
    hour?: string;
    orders?: number;
}

interface DriverPerformance {
    driver_name: string;
    total_trips: number;
    on_time_rate: number;
    fuel_rating: string;
}

export default function Analytics() {
    // 🌟 STATE BARU BUAT MESIN WAKTU (FILTER)
    const [period, setPeriod] = useState("today");

    // 🌟 URL API SEKARANG DINAMIS NGIKUTIN PERIODE
    const { data: summary, loading: summaryLoading, execute: fetchSummary } = useApi<{ data: KPISummary }>(`${API_ENDPOINTS.ANALYTICS}/kpi-summary?period=${period}`);
    const { data: utilization, loading: utilizationLoading, execute: fetchUtilization } = useApi<{ data: FleetUtilization }>(`${API_ENDPOINTS.ANALYTICS}/fleet-utilization?period=${period}`);
    const { data: volume, loading: volumeLoading, execute: fetchVolume } = useApi<{ data: DeliveryVolume[], max: number }>(`${API_ENDPOINTS.ANALYTICS}/delivery-volume?period=${period}`);
    const { data: drivers, loading: driversLoading, execute: fetchDrivers } = useApi<{ data: DriverPerformance[] }>(`${API_ENDPOINTS.ANALYTICS}/driver-performance?period=${period}`);

    // 🌟 EFEK BAKAL JALAN ULANG TIAP KALI 'PERIOD' BERUBAH
    useEffect(() => {
        fetchSummary();
        fetchUtilization();
        fetchVolume();
        fetchDrivers();
    }, [period]); 

    const kpiData = summary?.data;
    const fleetData = utilization?.data;
    const volumeData = volume?.data || [];
    const maxVolume = volume?.max || 1;
    const driverData = drivers?.data || [];

    // Helper untuk ngitung tinggi balok persentase
    const getBarHeight = (count: number) => {
        if (count === 0) return "5%"; 
        return `${(count / maxVolume) * 100}%`;
    };

    return (
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0A0A0A]">
            <header className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-[#333] px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <h2 className="text-xl font-bold">Logistics Analytics</h2>
                    <div className="flex items-center bg-slate-100 dark:bg-[#1A1A1A] rounded-lg px-3 py-1.5 gap-2 border border-slate-200 dark:border-[#333]">
                        <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">calendar_today</span>
                        
                        {/* 🌟 DROPDOWN MESIN WAKTU */}
                        <select 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-transparent text-sm font-medium outline-none cursor-pointer text-[#111] dark:text-white"
                        >
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </select>

                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export PDF/Excel
                    </button>
                    <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2"></div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-sm font-semibold">Admin Panel</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-primary/20 overflow-hidden shrink-0">
                            <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOVwE6D5skjcA0kdB1Vkbt8PHjFNDhe83XgKDgfzJV23AUHoF1k7RqBV0lasCPs0tW8-U61sPBkk3XNEVlo4Pr9pRr-CmjRUB6jrOeV5GEW58Sj0MQkbIbGXnd8KHZrbxu_TQ_dCcRsBScHB6bVdu6QxJmV7N5zyT798CRXW5PlI16sOxkl5FInv80r4g7WBNepeHG18KzJ6ybv6wjTaKatLnLy_CgbhWKjrzGpOh2D1wcpWtUEJD3P0nbYAlwaIy9kdCn4tiPRjw" alt="Profile" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 md:p-8 space-y-6">
                {/* 🌟 4 KARTU KPI DINAMIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Shipments</p>
                        <div className="flex items-end justify-between mt-2">
                            <h3 className="text-2xl font-bold text-[#111] dark:text-white">{summaryLoading ? '...' : kpiData?.totalShipments || 0}</h3>
                            <span className="text-slate-400 text-sm font-medium flex items-center">
                                orders
                            </span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Load Factor (Avg)</p>
                        <div className="flex items-end justify-between mt-2">
                            <h3 className="text-2xl font-bold text-[#111] dark:text-white">{summaryLoading ? '...' : kpiData?.loadFactor || '0%'}</h3>
                        </div>
                    </div>
                    
                    {/* 🌟 KARTU 3: TOTAL WEIGHT */}
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Weight</p>
                        <div className="flex items-end justify-between mt-2">
                            <h3 className="text-2xl font-bold text-[#111] dark:text-white">{summaryLoading ? '...' : kpiData?.avgLoadingTime || '0 KG'}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Successful Deliveries (OTIF)</p>
                        <div className="flex items-end justify-between mt-2">
                            <h3 className="text-2xl font-bold text-[#111] dark:text-white">{summaryLoading ? '...' : kpiData?.otifRate || '0%'}</h3>
                        </div>
                    </div>
                </div>

                {/* 🌟 Middle Section: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    {/* 🌟 Line Chart Area */}
                    <div className="lg:col-span-6 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-[#111] dark:text-white">Hourly Delivery Volume</h4>
                        </div>
                        
                        <div className="h-64 flex items-end gap-4 px-2">
                            {volumeLoading ? (
                                <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">Loading Data...</div>
                            ) : volumeData.length === 0 ? (
                                <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">No routing data found.</div>
                            ) : volumeData.map((item, idx) => {
                                // 🌟 FIX TS: Pake fallback || 0 biar TS percaya ini angka valid
                                const currentCount = item.count || 0; 
                                const isPeak = currentCount === maxVolume && currentCount > 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div 
                                            className={`w-full rounded-t-md transition-all relative ${isPeak ? 'bg-primary' : 'bg-slate-100 dark:bg-[#333] group-hover:bg-primary/20'}`} 
                                            style={{ height: getBarHeight(currentCount) }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {currentCount} TOKO
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${isPeak ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.hour || item.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Donut Chart Area */}
                    <div className="lg:col-span-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm flex flex-col">
                        <h4 className="font-bold mb-6 text-[#111] dark:text-white">Fleet Utilization</h4>
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {utilizationLoading ? (
                                <span className="text-slate-400">Loading...</span>
                            ) : (
                                <>
                                    <svg className="h-48 w-48" viewBox="0 0 36 36">
                                        <circle className="stroke-slate-100 dark:stroke-[#222]" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                                        <circle
                                            className="stroke-primary transition-all duration-1000 ease-out"
                                            cx="18" cy="18" fill="none" r="16"
                                            strokeDasharray={`${fleetData?.utilizationRate ? fleetData.utilizationRate.replace('%', '') : 0} 100`}
                                            strokeLinecap="round" strokeWidth="3"
                                            transform="rotate(-90 18 18)"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-[#111] dark:text-white">{fleetData?.utilizationRate || '0%'}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">In Use</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="text-center p-2 bg-slate-50 dark:bg-[#1A1A1A] rounded-lg border border-slate-100 dark:border-[#333]">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Active Trucks</p>
                                <p className="text-sm font-bold text-primary">{fleetData?.activeTrucks || 0}</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 dark:bg-[#1A1A1A] rounded-lg border border-slate-100 dark:border-[#333]">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Total Fleet</p>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{fleetData?.totalTrucks || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Table Driver */}
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between">
                        <h4 className="font-bold text-[#111] dark:text-white">Driver Efficiency Performance</h4>
                        <button className="text-sm text-primary font-medium hover:underline">View All Drivers</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#0a0a0a]">
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver Name</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Trips</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">On-time Rate (%)</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Fuel Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                                {driversLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading driver performance data...</td>
                                    </tr>
                                ) : driverData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No driver data available yet.</td>
                                    </tr>
                                ) : (
                                    driverData.map((driver, index) => (
                                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-[#1A1A1A] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {driver.driver_name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <span className="text-sm font-medium text-[#111] dark:text-slate-200">{driver.driver_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{driver.total_trips}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-[#333] rounded-full overflow-hidden w-24">
                                                        <div
                                                            className={`h-full ${driver.on_time_rate > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${driver.on_time_rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-bold text-[#111] dark:text-slate-200">{driver.on_time_rate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-primary">{driver.fuel_rating}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}