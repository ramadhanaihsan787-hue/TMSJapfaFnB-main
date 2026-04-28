import KPICard from './ManagerKPICards';
import { Download } from 'lucide-react';

export default function EfficiencyDashboard() {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard label="Total Shipments" value="1,240" change="+12%" trend="up" icon="local_shipping" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="vs. last month" />
                <KPICard label="Avg. Lead Time" value="4.2h" change="-0.3d" trend="down" icon="schedule" bgColor="bg-slate-50" iconColor="text-japfa-navy" subtext="faster processing" />
                <KPICard label="Load Factor %" value="85%" change="+5.0%" trend="up" icon="inventory_2" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="capacity utilization" />
                <KPICard label="Cost per KG" value="Rp 4.8k" change="+4.3%" trend="up" icon="payments" bgColor="bg-red-50" iconColor="text-red-600" subtext="+2.1% vs budget" />
            </div>

            {/* Actual vs. Target Load Factor Chart */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-japfa-dark dark:text-white">Actual vs. Target Load Factor</h3>
                        <p className="text-sm text-japfa-gray dark:text-gray-400 font-medium mt-1">Comparison of daily actual load against established performance targets</p>
                    </div>
                    <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-2"><span className="w-4 h-1 bg-japfa-orange rounded-full"></span><span className="text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-wider">Actual Load Factor</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-japfa-navy dark:bg-blue-400"></span><span className="text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-wider">Historical Baseline</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 border-t-2 border-dashed border-red-500 h-0"></span><span className="text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-wider">90% Target</span></div>
                    </div>
                </div>

                <div className="relative flex w-full h-[320px]">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between text-[10px] font-bold text-gray-400 dark:text-gray-600 pr-6 pb-8 uppercase tracking-widest h-full">
                        <span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
                    </div>
                    {/* Chart Content Area */}
                    <div className="flex-1 relative h-full">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 h-full">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="border-t border-gray-100 dark:border-white/5 w-full h-0"></div>
                            ))}
                        </div>
                        {/* Target Benchmark Line (90%) */}
                        <div className="absolute inset-x-0 top-[10%] border-t-2 border-dashed border-red-500/80 z-20 pointer-events-none">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-2">
                                <span className="text-red-600 text-[9px] font-black tracking-widest uppercase whitespace-nowrap">90% CAPACITY TARGET</span>
                            </div>
                        </div>
                        {/* SVG Chart */}
                        <svg className="absolute inset-0 w-full h-[calc(100%-32px)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <defs>
                                <linearGradient id="orangeGradientEfficiency" x1="0%" x2="0%" y1="0%" y2="100%">
                                    <stop offset="0%" stopColor="#F28C38" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#F28C38" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M 0 45 L 166.6 25 L 333.3 35 L 500 15 L 666.6 20 L 833.3 50 L 1000 45" fill="none" stroke="currentColor" className="text-japfa-navy dark:text-blue-400" strokeDasharray="4 2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            <path d="M 0 55 L 166.6 35 L 333.3 45 L 500 10 L 666.6 25 L 833.3 75 L 1000 65 V 100 H 0 Z" fill="url(#orangeGradientEfficiency)" />
                            <path d="M 0 55 L 166.6 35 L 333.3 45 L 500 10 L 666.6 25 L 833.3 75 L 1000 65" fill="none" stroke="#F28C38" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            <g fill="#F28C38">
                                {[{ x: 0, y: 55 }, { x: 166.6, y: 35 }, { x: 333.3, y: 45 }, { x: 500, y: 10 }, { x: 666.6, y: 25 }, { x: 833.3, y: 75 }, { x: 1000, y: 65 }].map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="4" stroke="white" strokeWidth="1.5" />
                                ))}
                            </g>
                        </svg>
                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 inset-x-0 flex justify-between">
                            {["Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23", "Oct 24", "Oct 25"].map((d, i) => (
                                <span key={i} className="text-[10px] text-japfa-gray dark:text-gray-500 font-bold uppercase w-0 text-center whitespace-nowrap" style={{ marginLeft: i === 0 ? '0' : '16.6%' }}>{d}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Operational Excellence Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden mt-4">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-japfa-dark dark:text-white uppercase tracking-tight">Operational Excellence</h3>
                        <p className="text-sm text-japfa-gray dark:text-gray-400 font-medium mt-1">Regional performance and efficiency tracking</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-1 focus:ring-japfa-orange focus:border-japfa-orange outline-none w-64 text-japfa-dark dark:text-white" placeholder="Search route or hub..." type="text" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold text-japfa-gray dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Download className="w-4 h-4" />
                            EXPORT
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-japfa-orange/5 dark:bg-japfa-orange/10 border-b border-japfa-orange/10">
                                <th className="px-8 py-4 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Route / Region</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-japfa-orange uppercase tracking-widest text-center">OTIF %</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-japfa-orange uppercase tracking-widest text-center">Avg. Lead Time</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-japfa-orange uppercase tracking-widest text-center">Load Factor</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-japfa-orange uppercase tracking-widest text-right">SLA Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {[
                                { route: "Cikupa → Bandung", region: "West Java Hub", otif: "92.4%", lead: "3.2h", factor: "88%", status: "Optimal", color: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
                                { route: "Bekasi → Surabaya", region: "Main Hub Transit", otif: "82.1%", lead: "18.2h", factor: "74%", status: "Critical Delay", color: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" },
                                { route: "Tangerang → Serang", region: "Regional Supply", otif: "89.5%", lead: "4.5h", factor: "52%", status: "Underloaded", color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" },
                                { route: "Semarang → Solo", region: "Central Java", otif: "87.8%", lead: "12.5h", factor: "82%", status: "On Track", color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" }
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-japfa-dark dark:text-white group-hover:text-japfa-orange transition-colors">{row.route}</span>
                                            <span className="text-[10px] text-japfa-gray dark:text-gray-500 uppercase font-bold tracking-tight">{row.region}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center font-extrabold text-japfa-dark dark:text-white uppercase">{row.otif}</td>
                                    <td className="px-8 py-5 text-center text-japfa-gray dark:text-gray-400 font-medium">{row.lead}</td>
                                    <td className="px-8 py-5 text-center font-extrabold text-japfa-orange">{row.factor}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.color}`}>{row.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}