import { useState } from 'react';

export default function ReturnDashboard() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openActionId, setOpenActionId] = useState<number | null>(null);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* 1. Top Row: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-japfa-orange transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-japfa-gray dark:text-gray-400 uppercase tracking-wider">Quality Standard Issues</span>
                            <span className="text-[10px] bg-orange-100 dark:bg-orange-500/20 text-japfa-orange px-2 py-0.5 rounded font-bold self-start uppercase">Production</span>
                        </div>
                        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-japfa-orange rounded-lg">
                            <span className="material-symbols-outlined text-xl">high_quality</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-japfa-dark dark:text-white">12.4K KG</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-japfa-orange">IDR 245.2M</p>
                            <span className="text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded flex items-center">
                                <span className="material-symbols-outlined text-xs mr-0.5">arrow_upward</span>
                                2.4% vs last month
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-japfa-gray dark:text-gray-400 italic border-t border-gray-50 dark:border-white/5 pt-3">Physical damage or contamination</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-japfa-navy transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-japfa-gray dark:text-gray-400 uppercase tracking-wider">Mismatched SKU</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-500/20 text-japfa-slate dark:text-japfa-gray px-2 py-0.5 rounded font-bold self-start uppercase">Warehouse</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-500/10 text-japfa-navy dark:text-blue-400 rounded-lg">
                            <span className="material-symbols-outlined text-xl">category</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-japfa-dark dark:text-white">4.2K KG</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-japfa-orange">IDR 84.1M</p>
                            <span className="text-[11px] font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded flex items-center">
                                <span className="material-symbols-outlined text-xs mr-0.5">arrow_downward</span>
                                0.8% vs last month
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-japfa-gray dark:text-gray-400 italic border-t border-gray-50 dark:border-white/5 pt-3">Incorrect product delivered</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-red-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-japfa-gray dark:text-gray-400 uppercase tracking-wider">Customer Rejection</span>
                            <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-bold self-start uppercase">Transporter</span>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                            <span className="material-symbols-outlined text-xl">person_off</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-extrabold text-japfa-dark dark:text-white">1.5K KG</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-japfa-orange">IDR 32.5M</p>
                            <span className="text-[11px] font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded flex items-center">
                                <span className="material-symbols-outlined text-xs mr-0.5">arrow_downward</span>
                                1.1% vs last month
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-japfa-gray dark:text-gray-400 italic border-t border-gray-50 dark:border-white/5 pt-3">Delivery window or slot missed</p>
                </div>
            </div>

            {/* 2. Middle Section: Donut Chart & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h2 className="text-xl font-bold text-japfa-dark dark:text-white mb-1">Return Causes Distribution</h2>
                    <p className="text-sm text-japfa-gray dark:text-gray-400 font-medium mb-8">Breakdown of return reasons by total weight percentage</p>
                    <div className="flex flex-col items-center">
                        <div className="relative w-56 h-56 mb-8">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <circle className="stroke-gray-100 dark:stroke-white/5" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="3"></circle>
                                <circle className="stroke-japfa-orange" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="5" strokeDasharray="68 32" strokeDashoffset="0"></circle>
                                <circle className="stroke-japfa-navy dark:stroke-blue-400" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="5" strokeDasharray="23 77" strokeDashoffset="-68"></circle>
                                <circle className="stroke-japfa-gray dark:stroke-gray-600" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="5" strokeDasharray="9 91" strokeDashoffset="-91"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-extrabold text-japfa-dark dark:text-white">18.1K</span>
                                <span className="text-[10px] font-bold text-japfa-gray dark:text-gray-400 uppercase tracking-widest mt-1">Total KG</span>
                            </div>
                        </div>
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-japfa-orange"></span>
                                    <span className="text-sm font-semibold text-japfa-gray dark:text-gray-400">Quality Issues</span>
                                </div>
                                <span className="text-md font-bold text-japfa-dark dark:text-white">68.5%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-japfa-navy dark:bg-blue-400"></span>
                                    <span className="text-sm font-semibold text-japfa-gray dark:text-gray-400">Mismatched SKU</span>
                                </div>
                                <span className="text-md font-bold text-japfa-dark dark:text-white">23.1%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-japfa-gray dark:bg-gray-600"></span>
                                    <span className="text-sm font-semibold text-japfa-gray dark:text-gray-400">Cust. Rejection</span>
                                </div>
                                <span className="text-md font-bold text-japfa-dark dark:text-white">8.4%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h2 className="text-xl font-bold text-japfa-dark dark:text-white mb-1">Fleet Performance</h2>
                    <p className="text-sm text-japfa-gray dark:text-gray-400 font-medium mb-6">Top vehicles by incident count and weight impact</p>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { plate: "B 9044 JXS", count: 14, weight: "1.2K KG", trend: "up", percent: "+5%" },
                            { plate: "B 9513 JXS", count: 11, weight: "940 KG", trend: "down", percent: "-2%" },
                            { plate: "B 9514 JXS", count: 8, weight: "650 KG", trend: "flat", percent: "Stable" },
                            { plate: "B 9517 JXS", count: 6, weight: "420 KG", trend: "down", percent: "-8%" },
                            { plate: "B 9518 JXS", count: 5, weight: "380 KG", trend: "up", percent: "+1%" }
                        ].map((fleet, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${idx === 0 ? 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20' : 'bg-white dark:bg-slate-950 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20'}`}>
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-japfa-orange text-white' : 'bg-gray-100 dark:bg-white/10 text-japfa-gray dark:text-gray-400'}`}>{idx + 1}</span>
                                    <div>
                                        <p className="font-bold text-japfa-dark dark:text-white text-lg tracking-tight">{fleet.plate}</p>
                                        <p className="text-[11px] text-japfa-gray dark:text-gray-500 uppercase font-bold">{fleet.count} Incidents This Month</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-extrabold text-japfa-dark dark:text-white">{fleet.weight}</p>
                                    <p className={`text-[10px] font-bold flex items-center justify-end gap-1 ${fleet.trend === 'up' ? 'text-red-500' : fleet.trend === 'down' ? 'text-green-500' : 'text-japfa-gray dark:text-gray-500'}`}>
                                        <span className="material-symbols-outlined text-xs">
                                            {fleet.trend === 'up' ? 'trending_up' : fleet.trend === 'down' ? 'trending_down' : 'trending_flat'}
                                        </span>
                                        {fleet.percent} vs last month
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Bottom Section: Historical Return Audit Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-japfa-dark dark:text-white">Historical Return Audit Table</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-japfa-gray dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                Filter
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-lg z-20 overflow-hidden">
                                    <div className="p-3 border-b border-gray-100 dark:border-white/10">
                                        <p className="text-xs font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-wider">Filter By Status</p>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                            <input type="checkbox" className="rounded text-japfa-orange focus:ring-japfa-orange" />
                                            <span className="text-sm dark:text-gray-300">Resolved</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                            <input type="checkbox" className="rounded text-japfa-orange focus:ring-japfa-orange" />
                                            <span className="text-sm dark:text-gray-300">Investigating</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => alert("Export functionality coming soon")} className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-japfa-gray dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 transition-colors">
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Date</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Customer</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Batch ID</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Product</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Weight</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest">Reason</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest text-center">Status</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-japfa-orange uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 border-b border-gray-100 dark:border-white/10">
                            {[
                                { date: "25 Oct 2023", customer: "Superindo JKT-12", id: "DO-2023-9021", product: "Chicken Fillet 500g", weight: "450 KG", reason: "Temperature Breach", status: "Resolved", color: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" },
                                { date: "24 Oct 2023", customer: "Lotte Mart Solo", id: "DO-2023-8842", product: "Whole Chicken Grade A", weight: "1,200 KG", reason: "Damaged Packaging", status: "Investigating", color: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" }
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6 text-japfa-gray dark:text-gray-400 group-hover:text-japfa-dark dark:group-hover:text-white transition-colors">{row.date}</td>
                                    <td className="py-4 px-6 font-semibold text-japfa-dark dark:text-white">{row.customer}</td>
                                    <td className="py-4 px-6 font-mono text-xs text-japfa-gray dark:text-gray-500">{row.id}</td>
                                    <td className="py-4 px-6 text-japfa-dark dark:text-gray-300">{row.product}</td>
                                    <td className="py-4 px-6 font-extrabold text-japfa-dark dark:text-white text-md">{row.weight}</td>
                                    <td className="py-4 px-6 text-japfa-gray dark:text-gray-400">{row.reason}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${row.color}`}>{row.status}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === idx ? null : idx); }}
                                            className="px-3 py-1.5 bg-japfa-orange/10 dark:bg-japfa-orange/20 text-japfa-orange text-xs font-bold rounded hover:bg-japfa-orange hover:text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1 ml-auto"
                                        >
                                            Details <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                                        </button>
                                        {openActionId === idx && (
                                            <div className="absolute right-6 top-10 mt-1 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-lg z-20 overflow-hidden text-left">
                                                <div className="p-1" role="menu">
                                                    <button onClick={(e) => { e.stopPropagation(); alert('View Report'); setOpenActionId(null); }} className="w-full text-left px-4 py-2 text-sm text-japfa-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span> View Report
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); alert('Download PDF'); setOpenActionId(null); }} className="w-full text-left px-4 py-2 text-sm text-japfa-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">download</span> Download PDF
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); alert('Process Return'); setOpenActionId(null); }} className="w-full text-left px-4 py-2 text-sm text-japfa-orange hover:bg-orange-50 dark:hover:bg-japfa-orange/10 flex items-center gap-2 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">assignment_return</span> Process Return
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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