import { useState, useEffect } from 'react';
import KPICard from './ManagerKPICards';
import DelayTable from './DelayTable';
import MonitoringPanel from './MonitoringPanel';
import { TrendingUp, Check, Navigation } from 'lucide-react';

// 🌟 BASE URL API LU (Bisa dipindah ke .env nanti)
const API_BASE_URL = 'http://localhost:8000/api'; 

export default function OverviewDashboard() {
    // 🌟 1. STATE BUAT NAMPUNG DATA REAL DARI BACKEND
    const [kpiData, setKpiData] = useState({
        otif: 0,
        onTime: 0,
        fillRate: 0,
        returnRate: 0,
        transportCost: 0, // Format bisa nyesuaiin, misal 0
        loadUtilization: 0,
        damageRate: 0,
        
        // Data Fulfillment Hari Ini
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

    // 🌟 2. MESIN PENYEDOT DATA (Jalan Otomatis Pas Halaman Dibuka)
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ambil token dari localStorage (asumsi lu nyimpen token pas login)
                const token = localStorage.getItem('access_token'); 
                
                // Nembak ke endpoint Dashboard lu
                const response = await fetch(`${API_BASE_URL}/dashboard/kpi`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Update state pake data dari DB. 
                    // Kalau di DB belum ada, fallback ke 0 pake logical OR (|| 0)
                    setKpiData({
                        otif: data.otif || 0,
                        onTime: data.on_time || 0,
                        fillRate: data.fill_rate || 0,
                        returnRate: data.return_rate || 0,
                        transportCost: data.transport_cost || 0, 
                        loadUtilization: data.load_utilization || 0,
                        damageRate: data.damage_rate || 0,
                        todayTarget: data.today_target || 0,
                        todayRemaining: data.today_remaining || 0,
                        completedQty: data.completed_qty || 0,
                        completedPercent: data.completed_percent || 0,
                        completedDrops: data.completed_drops || 0,
                        inTransitQty: data.in_transit_qty || 0,
                        inTransitPercent: data.in_transit_percent || 0,
                        inTransitDrops: data.in_transit_drops || 0,
                        avgPayload: data.avg_payload || 0,
                        utilization: data.utilization || 0
                    });
                } else {
                    console.warn("Backend belum ngirim data atau endpoint belum siap (404)");
                }
            } catch (error) {
                console.error("Gagal narik data API:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        
        // (Opsional) Polling data tiap 5 menit buat nampilin pergerakan truk
        // const interval = setInterval(fetchDashboardData, 300000);
        // return () => clearInterval(interval);
    }, []);

    // Helper buat format angka ribuan (e.g., 45000 -> 45,000)
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

    return (
        <div className={`space-y-8 animate-fadeIn ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            
            {/* 1. TOP KPI ROW (7 CARDS) - SEKARANG PAKE DATA DINAMIS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <KPICard label="OTIF Performance" value={`${kpiData.otif}%`} change="0%" trend="up" icon="schedule" bgColor="bg-blue-50" iconColor="text-blue-600" subtext="vs. last month avg" />
                <KPICard label="On-Time Delivery" value={`${kpiData.onTime}%`} change="0%" trend="up" icon="check_circle" bgColor="bg-green-50" iconColor="text-green-600" subtext="Operational target: 95%" />
                <KPICard label="Fill Rate" value={`${kpiData.fillRate}%`} change="0%" trend="down" icon="inventory_2" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="Stock availability index" />
                <KPICard label="Return Rate" value={`${kpiData.returnRate}%`} change="0%" trend="down" icon="assignment_return" bgColor="bg-red-50" iconColor="text-red-600" subtext="Rejected loads reduction" />
                <KPICard label="Transport Cost" value={`${kpiData.transportCost}B`} change="0%" trend="up" icon="payments" bgColor="bg-purple-50" iconColor="text-purple-600" subtext="Fuel surcharge impact" />
                <KPICard label="Load Utilization" value={`${kpiData.loadUtilization}%`} change="0%" trend="up" icon="local_shipping" bgColor="bg-teal-50" iconColor="text-teal-600" subtext="Capacity efficiency" />
                <KPICard label="Damage Rate" value={`${kpiData.damageRate}%`} change="0%" trend="down" icon="broken_image" bgColor="bg-amber-50" iconColor="text-amber-600" subtext="Product handling quality" />
            </section>

            {/* 2. DISTRIBUTION PERFORMANCE TREND (Semetara tetep UI statis, nanti kita bedah datanya kalau chart backend udah siap) */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl font-bold text-japfa-dark dark:text-white uppercase tracking-tight">Distribution Performance Trend</h2>
                        <p className="text-[11px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">Daily fulfillment vs shipment volume (OTIF & Load Count)</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-orange-100 dark:bg-orange-500/20"></span>
                            <span className="text-[10px] font-bold text-japfa-gray dark:text-gray-400 uppercase">Shipment Volume</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-japfa-orange shadow-[0_0_8px_rgba(242,140,56,0.5)]"></div>
                            <span className="text-[10px] font-bold text-japfa-gray dark:text-gray-400 uppercase">OTIF Performance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 border-t border-dashed border-red-400"></div>
                            <span className="text-[10px] font-bold text-japfa-gray dark:text-gray-400 uppercase">95% Target</span>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-[300px] mb-4">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                        {[0, 60, 120, 180, 240, 300].map((y) => (
                            <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeDasharray="4" />
                        ))}
                        <line x1="0" x2="1000" y1={150} y2={150} stroke="#ef4444" strokeDasharray="6,4" strokeWidth="2" />
                        {[200, 240, 280, 180, 260, 220, 290].map((h, i) => (
                            <rect key={i} x={80 + i * 130} y={300 - h} width="40" height={h} fill="currentColor" className="text-orange-100 dark:text-orange-500/20 rounded-t-sm" />
                        ))}
                        <path d="M 100,200 C 150,200 180,160 230,160 C 280,160 310,120 360,120 C 410,120 440,220 490,220 C 540,220 570,110 620,110 C 670,110 700,140 750,140 C 800,140 830,90 880,90" fill="none" stroke="#F28C38" strokeWidth="4" className="drop-shadow-lg" />
                        {[{ x: 100, y: 200 }, { x: 230, y: 160 }, { x: 360, y: 120 }, { x: 490, y: 220 }, { x: 620, y: 110 }, { x: 750, y: 140 }, { x: 880, y: 90 }].map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke="#F28C38" strokeWidth="2" />
                        ))}
                    </svg>
                </div>
                <div className="flex justify-between px-10 text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </section>

            {/* 3. DELAY ANALYSIS */}
            <DelayTable />

            {/* 4. TODAY'S FULFILLMENT & MONITORING PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 🌟 TODAY'S FULFILLMENT (GRID 2x2) - PAKE DATA DINAMIS */}
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
                        
                        {/* Target vs Remaining Header */}
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

                    {/* 2x2 Metrics Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Box 1: Completed */}
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

                        {/* Box 2: In-Transit */}
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

                        {/* Box 3: Avg Payload */}
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

                        {/* Box 4: Est Completion */}
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