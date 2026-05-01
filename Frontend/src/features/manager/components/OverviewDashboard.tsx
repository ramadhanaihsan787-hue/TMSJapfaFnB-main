import { useState, useEffect } from 'react';
import KPICard from './ManagerKPICards';
import DelayTable from './DelayTable';
import MonitoringPanel from './MonitoringPanel';
import { TrendingUp, Check, Navigation } from 'lucide-react';
import { api } from '../../../shared/services/apiClient';

export default function OverviewDashboard() {
    // 🌟 STATE BUAT NAMPUNG DATA REAL DARI BACKEND
    const [kpiData, setKpiData] = useState({
        otif: 0,
        onTime: 0,
        fillRate: 0, 
        returnRate: 0,
        transportCost: 0, 
        loadUtilization: 0,
        damageRate: 0,
        
        todayTarget: 0,
        todayRemaining: 0,
        completedQty: 0,
        completedPercent: 0,
        completedDrops: 0,
        inTransitQty: 0,
        inTransitPercent: 0,
        inTransitDrops: 0,
        avgPayload: 0,
        utilization: 0
    });

    const [isLoading, setIsLoading] = useState(true);

    // 🌟 MESIN PENYEDOT DATA PAKE apiClient
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Backend minta startDate dan endDate, kita kasih tanggal hari ini dan 30 hari ke belakang
                const today = new Date();
                const lastMonth = new Date();
                lastMonth.setDate(today.getDate() - 30);
                
                const endDate = today.toISOString().split('T')[0];
                const startDate = lastMonth.toISOString().split('T')[0];

                // 🌟 NEMBAK PAKE apiClient (Otomatis bawa token!)
                // Endpoint-nya jadi /analytics/kpi-summary karena di main.py biasanya prefix-nya /api
                const response = await api.get('/analytics/kpi-summary', {
                    params: { startDate, endDate }
                });

                const resData = response.data;

                if (resData.status === "success") {
                    // Kalkulasi Avg Payload (Ton)
                    const avgPayloadTon = resData.active_fleet_count > 0 
                        ? (resData.total_weight_kg / resData.active_fleet_count / 1000).toFixed(1)
                        : 0;

                    // MAPPING DATA DARI BACKEND KE FRONTEND
                    setKpiData({
                        otif: resData.success_rate_percent || 0,
                        onTime: resData.success_rate_percent || 0, // Pake data yg sama sementara
                        fillRate: resData.data.fillRate || 0,
                        returnRate: resData.data.returnRate || 0,
                        transportCost: resData.data.transportCost || 0, 
                        loadUtilization: resData.load_factor_percent || 0,
                        damageRate: resData.data.damageRate || 0,
                        
                        todayTarget: resData.total_weight_kg || 0,
                        todayRemaining: resData.total_weight_kg || 0, // Asumsi belum ada yg selesai
                        completedQty: 0, 
                        completedPercent: 0, 
                        completedDrops: 0, 
                        inTransitQty: 0, 
                        inTransitPercent: 0, 
                        inTransitDrops: 0, 
                        avgPayload: Number(avgPayloadTon),
                        utilization: resData.load_factor_percent || 0
                    });
                }
            } catch (error) {
                console.error("Gagal narik data KPI Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper buat format angka ribuan (e.g., 45000 -> 45,000)
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

    return (
        <div className={`space-y-8 transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
            
            {/* 1. TOP KPI ROW (7 CARDS) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <KPICard label="OTIF Performance" value={`${kpiData.otif}%`} change="0%" trend="up" icon="schedule" bgColor="bg-blue-50" iconColor="text-blue-600" subtext="vs. last month avg" />
                <KPICard label="On-Time Delivery" value={`${kpiData.onTime}%`} change="0%" trend="up" icon="check_circle" bgColor="bg-green-50" iconColor="text-green-600" subtext="Operational target: 95%" />
                <KPICard label="Fill Rate" value={`${kpiData.fillRate}%`} change="0%" trend="down" icon="inventory_2" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="Stock availability index" />
                <KPICard label="Return Rate" value={`${kpiData.returnRate}%`} change="0%" trend="down" icon="assignment_return" bgColor="bg-red-50" iconColor="text-red-600" subtext="Rejected loads reduction" />
                <KPICard label="Transport Cost" value={`Rp ${formatNumber(kpiData.transportCost)}`} change="0%" trend="up" icon="payments" bgColor="bg-purple-50" iconColor="text-purple-600" subtext="Fuel & Driver cost" />
                <KPICard label="Load Utilization" value={`${kpiData.loadUtilization}%`} change="0%" trend="up" icon="local_shipping" bgColor="bg-teal-50" iconColor="text-teal-600" subtext="Capacity efficiency" />
                <KPICard label="Damage Rate" value={`${kpiData.damageRate}%`} change="0%" trend="down" icon="broken_image" bgColor="bg-amber-50" iconColor="text-amber-600" subtext="Product handling quality" />
            </section>

            {/* 2. DISTRIBUTION PERFORMANCE TREND (Chart Static Sementara) */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl font-bold text-japfa-dark dark:text-white uppercase tracking-tight">Distribution Performance Trend</h2>
                        <p className="text-[11px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">Daily fulfillment vs shipment volume (OTIF & Load Count)</p>
                    </div>
                </div>

                <div className="relative w-full h-[300px] mb-4">
                    {/* SVG Chart Dummy (Bisa diganti pake Recharts nanti) */}
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase tracking-widest text-sm bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        Chart Area (Data akan muncul setelah VRP dijalankan)
                    </div>
                </div>
            </section>

            {/* 3. DELAY ANALYSIS */}
            <DelayTable />

            {/* 4. TODAY'S FULFILLMENT & MONITORING PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 🌟 TODAY'S FULFILLMENT (GRID 2x2) */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col h-full hover:border-emerald-500/30 transition-all">
                    <div className="mb-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-gray-50 dark:border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-japfa-dark dark:text-white flex items-center gap-2">
                                    Today's Fulfillment
                                    {kpiData.todayTarget > 0 && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-0.5">Real-time Ops • Unit: KG</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5 w-full xl:w-auto">
                            <div className="flex-1 xl:flex-none text-center px-4 border-r border-gray-200 dark:border-white/10">
                                <p className="text-[9px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-[0.1em] mb-1">Target</p>
                                <p className="text-lg font-black text-japfa-navy dark:text-blue-400">{formatNumber(kpiData.todayTarget)}</p>
                            </div>
                            <div className="flex-1 xl:flex-none text-center px-4">
                                <p className="text-[9px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-[0.1em] mb-1">Remaining</p>
                                <p className="text-lg font-black text-japfa-gray dark:text-gray-400">{formatNumber(kpiData.todayRemaining)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-emerald-100 dark:bg-emerald-500/20 rounded"><Check className="w-3 h-3 text-emerald-600" /></div>
                                        <span className="text-[10px] font-black text-japfa-dark dark:text-white uppercase tracking-widest">Completed</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">{kpiData.completedPercent}%</span>
                                </div>
                                <p className="text-2xl font-black text-japfa-dark dark:text-white mt-1">{formatNumber(kpiData.completedQty)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-japfa-gray dark:text-gray-500 uppercase mt-3 mb-1.5 flex items-center gap-1.5">
                                    Delivered <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> {kpiData.completedDrops} Drops
                                </p>
                                <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${kpiData.completedPercent}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-blue-500/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-blue-100 dark:bg-blue-500/20 rounded"><Navigation className="w-3 h-3 text-blue-600" /></div>
                                        <span className="text-[10px] font-black text-japfa-dark dark:text-white uppercase tracking-widest">In-Transit</span>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">{kpiData.inTransitPercent}%</span>
                                </div>
                                <p className="text-2xl font-black text-japfa-dark dark:text-white mt-1">{formatNumber(kpiData.inTransitQty)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-japfa-gray dark:text-gray-500 uppercase mt-3 mb-1.5 flex items-center gap-1.5">
                                    Progress <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span> {kpiData.inTransitDrops} Loads
                                </p>
                                <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${kpiData.inTransitPercent}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                            <div>
                                <p className="text-[9px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest mb-1">Avg Payload</p>
                                <h4 className="text-2xl font-black text-japfa-dark dark:text-white">{kpiData.avgPayload} <span className="text-[10px] uppercase opacity-60 font-bold">Ton</span></h4>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-white/5 mt-3">
                                <div className="flex items-center justify-between text-[9px] font-black mb-1.5">
                                    <span className="text-japfa-gray dark:text-gray-500 uppercase italic">Utilization</span>
                                    <span className="text-japfa-orange">{kpiData.utilization}%</span>
                                </div>
                                <div className="h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-japfa-orange transition-all duration-1000" style={{ width: `${kpiData.utilization}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                            <div>
                                <p className="text-[9px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest mb-1">Est Completion</p>
                                <h4 className="text-2xl font-black text-japfa-dark dark:text-white">{kpiData.todayTarget === 0 ? "--:--" : "18:45"} <span className="text-[10px] uppercase opacity-60 font-bold italic">{kpiData.todayTarget > 0 ? 'Tonight' : ''}</span></h4>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-white/5 mt-3">
                                <div className="flex items-center justify-between text-[9px] font-black">
                                    <span className="text-japfa-gray dark:text-gray-500 uppercase italic">Risk level</span>
                                    <span className="text-emerald-500 uppercase tracking-tighter">{kpiData.todayTarget === 0 ? "N/A" : "Low Range"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <MonitoringPanel />
            </div>
        </div>
    );
}