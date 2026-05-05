import { useState, useEffect } from 'react';
import KPICard from './ManagerKPICards';
import { Download, Search, AlertCircle, Gauge } from 'lucide-react';
import { api } from '../../../shared/services/apiClient';
import { toast } from 'sonner';
import { useDateRange } from '../../../context/DateRangeContext';

export default function EfficiencyDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const { startDate, endDate } = useDateRange();

    // 🌟 FUNGSI EXPORT UDAH AMAN DI SINI
    const handleExport = async () => {
        toast.loading("Mempersiapkan file Excel...", { id: "export-efficiency" });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/analytics/export?format=xlsx&startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Gagal download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `JAPFA_Efficiency_Report_${startDate}_to_${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Excel Report berhasil diunduh!", { id: "export-efficiency" });
        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat laporan Excel", { id: "export-efficiency" });
        }
    };
    
    // 🌟 STATE SEKARANG UDAH FULL NAMPUNG SEMUA GRAFIK!
    const [efficiencyData, setEfficiencyData] = useState<any>({
        kpi: { totalShipments: 0, avgLeadTime: "0h", loadFactor: "0%", costPerKg: "Rp 0", hiddenCost: "0%" },
        lfTrend: [0, 0, 0, 0, 0, 0, 0], // Data 7 hari terakhir
        costDist: [],
        hiddenCosts: [],
        leakagePoints: [],
        opExcellence: []
    });

    useEffect(() => {
        const fetchEfficiencyData = async () => {
            try {
                const response = await api.get('/analytics/efficiency-dashboard');
                if (response.data.status === "success") {
                    setEfficiencyData(response.data.data);
                }
            } catch (error) {
                console.error("Gagal narik data Efficiency Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEfficiencyData();
    }, []);

    // 🌟 MATEMATIKA CTO: Ngubah array Load Factor jadi koordinat SVG Grafik!
    const generateChartPoints = (data: number[]) => {
        // Data harus 7 item. Range X = 0 sampai 1000. Range Y = 0 sampai 100 (dibalik)
        return data.map((val, i) => ({
            x: (i / 6) * 1000,
            y: 100 - val // Kalau 90%, Y nya di titik 10
        }));
    };
    const points = generateChartPoints(efficiencyData.lfTrend);
    const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const pathArea = `${pathD} V 100 H 0 Z`;

    // 🌟 MATEMATIKA CTO: Ngitung Donut Chart Cost Dist
    let currentOffset = 0;
    const circumference = 251.2; // 2 * pi * r (r=40)

    return (
        <div className={`space-y-8 animate-fadeIn pb-20 transition-opacity duration-500 ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
            
            {/* 1. PREMIUM KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard label="Total Shipments" value={efficiencyData.kpi.totalShipments.toString()} change="+12%" trend="up" icon="local_shipping" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="vs. last month" />
                <KPICard label="Avg. Lead Time" value={efficiencyData.kpi.avgLeadTime} change="-0.3h" trend="down" icon="schedule" bgColor="bg-slate-50" iconColor="text-japfa-navy" subtext="faster processing" />
                <KPICard label="Load Factor %" value={efficiencyData.kpi.loadFactor} change="+5.0%" trend="up" icon="inventory_2" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="capacity utilization" />
                <KPICard label="Cost per KG" value={efficiencyData.kpi.costPerKg} change="-2.1%" trend="down" icon="payments" bgColor="bg-red-50" iconColor="text-red-600" subtext="vs budget" />
                <KPICard label="Hidden Cost" value={efficiencyData.kpi.hiddenCost} change="-0.5%" trend="down" icon="visibility_off" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="minimal leakage" />
            </div>

            {/* 2. MIDDLE SECTION: ACTUAL VS TARGET & COST DONUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Actual vs. Target Load Factor Chart */}
                <section className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all hover:shadow-md">
                    <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-4">
                        <div>
                            <h3 className="text-xl font-black text-japfa-dark dark:text-white uppercase tracking-tight">Actual vs. Target Load Factor</h3>
                            <p className="text-[11px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">7 Days Performance Trend</p>
                        </div>
                        <div className="flex flex-wrap gap-6 items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-1 bg-japfa-orange rounded-full shadow-[0_0_8px_rgba(242,140,56,0.4)]"></span>
                                <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-wider">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 border-t-2 border-dashed border-red-500 h-0"></span>
                                <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-wider">90% Target</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex w-full h-[350px]">
                        <div className="flex flex-col justify-between text-[10px] font-black text-gray-400 dark:text-gray-600 pr-8 pb-10 uppercase tracking-[0.2em] h-full text-right border-r border-gray-100 dark:border-white/5">
                            <span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
                        </div>

                        <div className="flex-1 relative h-full ml-4">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 h-full">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="border-t border-gray-100 dark:border-white/5 w-full h-0"></div>
                                ))}
                            </div>

                            <div className="absolute inset-x-0 top-[10%] border-t-2 border-dashed border-red-500/60 z-20 pointer-events-none">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                                    <span className="text-red-600 dark:text-red-400 text-[9px] font-black tracking-[0.15em] uppercase whitespace-nowrap flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" /> 90% CAPACITY TARGET
                                    </span>
                                </div>
                            </div>

                            {/* 🌟 GRAFIK DINAMIS DARI API! */}
                            <svg className="absolute inset-0 w-full h-[calc(100%-40px)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 100">
                                <defs>
                                    <linearGradient id="efficiencyGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" stopColor="#F28C38" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#F28C38" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={pathArea} fill="url(#efficiencyGradient)" className="transition-all duration-1000" />
                                <path d={pathD} fill="none" stroke="#F28C38" strokeLinejoin="round" strokeLinecap="round" strokeWidth="3" style={{ filter: 'drop-shadow(0 4px 6px rgba(242,140,56,0.3))' }} vectorEffect="non-scaling-stroke" className="transition-all duration-1000" />
                                <g fill="#F28C38">
                                    {points.map((p, i) => (
                                        <circle key={i} cx={p.x} cy={p.y} r="5" stroke="white" strokeWidth="2" className="drop-shadow-md transition-all duration-1000" />
                                    ))}
                                </g>
                            </svg>

                            <div className="absolute bottom-0 inset-x-0 flex justify-between pt-4">
                                {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"].map((d, i) => (
                                    <div key={i} className="flex flex-col items-center" style={{ width: '0', marginLeft: i === 0 ? '0' : '16.6%' }}>
                                        <div className="w-px h-2 bg-gray-200 dark:bg-white/10 mb-2"></div>
                                        <span className="text-[10px] text-japfa-gray dark:text-gray-500 font-black uppercase whitespace-nowrap tracking-tighter italic">{d}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Operating Cost Distribution Donut (UDAH DINAMIS) */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col h-full">
                    <h3 className="text-lg font-black text-japfa-dark dark:text-white mb-8 uppercase tracking-tight">Operating Cost Dist.</h3>
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[180px]">
                        <svg className="w-44 h-44 transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                            {efficiencyData.costDist.map((item: any, idx: number) => {
                                const dash = (item.percent / 100) * circumference;
                                const strokeOffset = circumference - dash;
                                const transformRotate = `rotate(${(currentOffset / 100) * 360} 50 50)`;
                                currentOffset += item.percent;
                                return (
                                    <circle key={idx} cx="50" cy="50" r="40" fill="transparent" stroke={item.stroke} strokeWidth="12" 
                                        strokeDasharray={circumference} strokeDashoffset={strokeOffset} transform={transformRotate} className="transition-all duration-1000" />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-japfa-dark dark:text-white">100%</span>
                            <span className="text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest">Total Ops</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 mt-8">
                        {efficiencyData.costDist.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`}></span>
                                <span className="text-[11px] font-black text-japfa-gray dark:text-gray-400">{item.label} ({item.percent}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. HIDDEN COST & LEAKAGE POINTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h3 className="text-lg font-black text-japfa-dark dark:text-white mb-8 uppercase tracking-tight">Hidden Cost Composition</h3>
                    <div className="space-y-6">
                        {efficiencyData.hiddenCosts.length === 0 ? (
                            <div className="text-center text-gray-400 py-10 font-bold text-sm">Tidak ada data hidden cost</div>
                        ) : (
                            efficiencyData.hiddenCosts.map((item: any, idx: number) => (
                                <div key={idx} className="space-y-2 group">
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                        <span className="text-japfa-dark dark:text-white">{item.label}</span>
                                        <span className="text-japfa-orange text-sm group-hover:scale-110 transition-transform">{item.value}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: item.value }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h3 className="text-lg font-black text-japfa-dark dark:text-white mb-8 uppercase tracking-tight">Highest Leakage Points</h3>
                    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="p-4 text-[10px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest">Location</th>
                                    <th className="p-4 text-[10px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest text-right">Cost (IDR)</th>
                                    <th className="p-4 text-[10px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest text-right">% Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {efficiencyData.leakagePoints.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-xs font-bold text-gray-400">Belum ada data leakage cost.</td>
                                    </tr>
                                ) : (
                                    efficiencyData.leakagePoints.map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-xs font-black text-japfa-dark dark:text-white">{row.loc}</td>
                                            <td className="p-4 text-xs font-mono font-bold text-japfa-gray dark:text-gray-400 text-right">{row.cost}</td>
                                            <td className="p-4 text-xs font-black text-japfa-orange text-right">{row.pct}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. OPERATIONAL EXCELLENCE TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden mt-4 transition-all hover:border-japfa-orange/20">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-white/[0.02]">
                    <div>
                        <h3 className="text-xl font-black text-japfa-dark dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-japfa-orange" /> Operational Excellence
                        </h3>
                        <p className="text-[11px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">Regional performance and cross-hub efficiency metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-japfa-orange transition-colors w-4 h-4" />
                            <input className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold focus:ring-2 focus:ring-japfa-orange/20 focus:border-japfa-orange outline-none w-72 text-japfa-dark dark:text-white transition-all shadow-sm" placeholder="Search route, hub, or status..." type="text" />
                        </div>
                        {/* 🌟 INI DIA TOMBOL EXPORT-NYA UDAH DIAMANIN */}
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-japfa-navy dark:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-japfa-dark transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Download className="w-4 h-4" /> EXPORT EXCEL
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto text-sm custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-japfa-orange/[0.03] dark:bg-japfa-orange/[0.07] border-b border-japfa-orange/10">
                                <th className="px-8 py-5 text-[10px] font-black text-japfa-orange uppercase tracking-[0.2em]">Route / Region</th>
                                <th className="px-8 py-5 text-[10px] font-black text-japfa-orange uppercase tracking-[0.2em] text-center">OTIF %</th>
                                <th className="px-8 py-5 text-[10px] font-black text-japfa-orange uppercase tracking-[0.2em] text-center">Avg. Lead Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-japfa-orange uppercase tracking-[0.2em] text-center">Load Factor</th>
                                <th className="px-8 py-5 text-[10px] font-black text-japfa-orange uppercase tracking-[0.2em] text-right">SLA Compliance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {efficiencyData.opExcellence.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-bold">Belum ada data operasional.</td></tr>
                            ) : (
                                efficiencyData.opExcellence.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-all group cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-black text-japfa-dark dark:text-white text-base group-hover:text-japfa-orange transition-colors">{row.route}</span>
                                                <span className="text-[10px] text-japfa-gray dark:text-gray-500 uppercase font-black tracking-widest">{row.region}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-black text-japfa-dark dark:text-white text-lg">{row.otif}</span>
                                                <div className="w-12 h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-japfa-orange" style={{ width: row.otif }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-sm font-black text-japfa-gray dark:text-gray-400 italic">{row.lead}</td>
                                        <td className="px-8 py-6 text-center"><span className="font-black text-japfa-orange text-lg tabular-nums">{row.factor}</span></td>
                                        <td className="px-8 py-6 text-right"><span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${row.color}`}>{row.status}</span></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}