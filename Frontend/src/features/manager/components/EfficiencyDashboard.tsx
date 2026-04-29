import KPICard from './ManagerKPICards';
import { Download, Search, TrendingUp, TrendingDown, Gauge, Zap, BarChart3, Wallet } from 'lucide-react';

export default function EfficiencyDashboard() {
    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            
            {/* 1. PREMIUM KPI ROW (4 CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    label="Total Shipments" 
                    value="1,240" 
                    change="+12%" 
                    trend="up" 
                    icon="local_shipping" 
                    bgColor="bg-orange-50" 
                    iconColor="text-japfa-orange" 
                    subtext="vs. last month performance" 
                />
                <KPICard 
                    label="Avg. Lead Time" 
                    value="4.2h" 
                    change="-0.3d" 
                    trend="down" 
                    icon="schedule" 
                    bgColor="bg-slate-50" 
                    iconColor="text-japfa-navy" 
                    subtext="Faster route processing" 
                />
                <KPICard 
                    label="Load Factor %" 
                    value="85%" 
                    change="+5.0%" 
                    trend="up" 
                    icon="inventory_2" 
                    bgColor="bg-orange-50" 
                    iconColor="text-japfa-orange" 
                    subtext="Fleet capacity utilization" 
                />
                <KPICard 
                    label="Cost per KG" 
                    value="Rp 4.8k" 
                    change="+4.3%" 
                    trend="up" 
                    icon="payments" 
                    bgColor="bg-red-50" 
                    iconColor="text-red-600" 
                    subtext="+2.1% vs initial budget" 
                />
            </div>

            {/* 2. ACTUAL VS TARGET LOAD FACTOR - Visual: Premium Chart with Gradients */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-4">
                    <div>
                        <h3 className="text-xl font-black text-japfa-dark dark:text-white uppercase tracking-tight">Actual vs. Target Load Factor</h3>
                        <p className="text-[11px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">Comparison of daily actual load against performance benchmarks</p>
                    </div>
                    <div className="flex flex-wrap gap-6 items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-1 bg-japfa-orange rounded-full shadow-[0_0_8px_rgba(242,140,56,0.4)]"></span>
                            <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-wider">Actual Load</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-0.5 bg-japfa-navy dark:bg-blue-400"></span>
                            <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-wider">Baseline</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 border-t-2 border-dashed border-red-500 h-0"></span>
                            <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-wider">90% Target</span>
                        </div>
                    </div>
                </div>

                <div className="relative flex w-full h-[350px]">
                    {/* Y-Axis Labels - Visual: Bold & Spaced */}
                    <div className="flex flex-col justify-between text-[10px] font-black text-gray-400 dark:text-gray-600 pr-8 pb-10 uppercase tracking-[0.2em] h-full text-right border-r border-gray-100 dark:border-white/5">
                        <span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
                    </div>

                    {/* Chart Content Area */}
                    <div className="flex-1 relative h-full ml-4">
                        {/* Horizontal Background Grid */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 h-full">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="border-t border-gray-100 dark:border-white/5 w-full h-0"></div>
                            ))}
                        </div>

                        {/* 🎯 TARGET LINE (90%) - With Premium Badge */}
                        <div className="absolute inset-x-0 top-[10%] border-t-2 border-dashed border-red-500/60 z-20 pointer-events-none">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                                <span className="text-red-600 dark:text-red-400 text-[9px] font-black tracking-[0.15em] uppercase whitespace-nowrap flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" /> 90% Capacity Target
                                </span>
                            </div>
                        </div>

                        {/* 🌟 SVG CHART WITH LINEAR GRADIENTS */}
                        <svg className="absolute inset-0 w-full h-[calc(100%-40px)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <defs>
                                <linearGradient id="efficiencyGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                    <stop offset="0%" stopColor="#F28C38" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#F28C38" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Historical Baseline Line */}
                            <path 
                                d="M 0 45 L 166.6 25 L 333.3 35 L 500 15 L 666.6 20 L 833.3 50 L 1000 45" 
                                fill="none" 
                                stroke="currentColor" 
                                className="text-japfa-navy dark:text-blue-400 opacity-40" 
                                strokeDasharray="6 4" 
                                strokeWidth="1.5" 
                                vectorEffect="non-scaling-stroke" 
                            />

                            {/* Orange Area Fill */}
                            <path 
                                d="M 0 55 L 166.6 35 L 333.3 45 L 500 10 L 666.6 25 L 833.3 75 L 1000 65 V 100 H 0 Z" 
                                fill="url(#efficiencyGradient)" 
                            />

                            {/* Main Actual Line */}
                            <path 
                                d="M 0 55 L 166.6 35 L 333.3 45 L 500 10 L 666.6 25 L 833.3 75 L 1000 65" 
                                fill="none" 
                                stroke="#F28C38" 
                                strokeLinejoin="round" 
                                strokeLinecap="round"
                                strokeWidth="3" 
                                style={{ filter: 'drop-shadow(0 4px 6px rgba(242,140,56,0.3))' }}
                                vectorEffect="non-scaling-stroke" 
                            />

                            {/* Data Markers */}
                            <g fill="#F28C38">
                                {[
                                    { x: 0, y: 55 }, { x: 166.6, y: 35 }, { x: 333.3, y: 45 }, 
                                    { x: 500, y: 10 }, { x: 666.6, y: 25 }, { x: 833.3, y: 75 }, { x: 1000, y: 65 }
                                ].map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="5" stroke="white" strokeWidth="2" className="drop-shadow-md" />
                                ))}
                            </g>
                        </svg>

                        {/* X-Axis Labels - Visual: Oct Dates */}
                        <div className="absolute bottom-0 inset-x-0 flex justify-between pt-4">
                            {["Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23", "Oct 24", "Oct 25"].map((d, i) => (
                                <div key={i} className="flex flex-col items-center" style={{ width: '0', marginLeft: i === 0 ? '0' : '16.6%' }}>
                                    <div className="w-px h-2 bg-gray-200 dark:bg-white/10 mb-2"></div>
                                    <span className="text-[10px] text-japfa-gray dark:text-gray-500 font-black uppercase whitespace-nowrap tracking-tighter italic">{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. OPERATIONAL EXCELLENCE TABLE - Visual: High Contrast & Toolbars */}
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
                            <input 
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold focus:ring-2 focus:ring-japfa-orange/20 focus:border-japfa-orange outline-none w-72 text-japfa-dark dark:text-white transition-all shadow-sm" 
                                placeholder="Search route, hub, or status..." 
                                type="text" 
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-japfa-navy dark:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-japfa-dark transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                            <Download className="w-4 h-4" /> EXPORT
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
                            {[
                                { route: "Cikupa → Bandung", region: "West Java Hub", otif: "92.4%", lead: "3.2h", factor: "88%", status: "Optimal Performance", color: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
                                { route: "Bekasi → Surabaya", region: "Main Hub Transit", otif: "82.1%", lead: "18.2h", factor: "74%", status: "Critical Delay", color: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" },
                                { route: "Tangerang → Serang", region: "Regional Supply", otif: "89.5%", lead: "4.5h", factor: "52%", status: "Underloaded Unit", color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" },
                                { route: "Semarang → Solo", region: "Central Java", otif: "87.8%", lead: "12.5h", factor: "82%", status: "On Track", color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" },
                                { route: "Cikupa → Lampung", region: "Sumatera Gateway", otif: "91.2%", lead: "24.5h", factor: "94%", status: "High Efficiency", color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" }
                            ].map((row, idx) => (
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
                                    <td className="px-8 py-6 text-center">
                                        <span className="font-black text-japfa-orange text-lg tabular-nums">{row.factor}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${row.color}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Table Footer Visual */}
                <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex justify-center">
                    <button className="text-[10px] font-black text-japfa-gray hover:text-japfa-orange uppercase tracking-[0.3em] transition-all flex items-center gap-3 active:scale-95">
                        <BarChart3 className="w-3.5 h-3.5" /> View Regional Analytics Detail
                    </button>
                </div>
            </div>
        </div>
    );
}