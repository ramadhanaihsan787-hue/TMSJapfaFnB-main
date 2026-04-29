import { useState } from 'react';
import { 
    Download, 
    Filter, 
    ChevronDown, 
    Eye, 
    FileText, 
    RefreshCcw,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

export default function ReturnDashboard() {
    // 🌟 STATES
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openActionId, setOpenActionId] = useState<number | null>(null);

    // 🌟 DUMMY DATA FOR FLEET PERFORMANCE
    const fleetIncidentData = [
        { plate: "B 9044 JXS", count: 14, weight: "1.2K KG", trend: "up", percent: "+5%" },
        { plate: "B 9513 JXS", count: 11, weight: "940 KG", trend: "down", percent: "-2%" },
        { plate: "B 9514 JXS", count: 8, weight: "650 KG", trend: "flat", percent: "Stable" },
        { plate: "B 9517 JXS", count: 6, weight: "420 KG", trend: "down", percent: "-8%" },
        { plate: "B 9518 JXS", count: 5, weight: "380 KG", trend: "up", percent: "+1%" }
    ];

    // 🌟 DUMMY DATA FOR AUDIT TABLE
    const auditData = [
        { date: "25 Oct 2023", customer: "Superindo JKT-12", id: "DO-2023-9021", product: "Chicken Fillet 500g", weight: "450 KG", reason: "Temperature Breach", status: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
        { date: "24 Oct 2023", customer: "Lotte Mart Solo", id: "DO-2023-8842", product: "Whole Chicken Grade A", weight: "1,200 KG", reason: "Damaged Packaging", status: "Investigating", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" },
        { date: "23 Oct 2023", customer: "Hypermart Karawaci", id: "DO-2023-8755", product: "Chicken Breast", weight: "820 KG", reason: "Wrong Item SKU", status: "Pending", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* 1. TOP ROW: SUMMARY CARDS (Visual: Font Black & Premium Borders) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quality Issues Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-japfa-orange transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-[0.15em]">Quality Standard Issues</span>
                            <span className="text-[9px] bg-orange-100 dark:bg-orange-500/20 text-japfa-orange px-2 py-0.5 rounded font-black self-start uppercase">Production Dept</span>
                        </div>
                        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-japfa-orange rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-xl">high_quality</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-black text-japfa-dark dark:text-white tracking-tight">12.4K KG</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-japfa-orange">IDR 245.2M</p>
                            <span className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> 2.4%
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] text-japfa-gray dark:text-gray-500 italic border-t border-gray-50 dark:border-white/5 pt-3 font-medium">Physical damage or contamination reports</p>
                </div>

                {/* SKU Mismatch Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-japfa-navy transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-[0.15em]">Mismatched SKU</span>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-500/20 text-japfa-slate dark:text-japfa-gray px-2 py-0.5 rounded font-black self-start uppercase">Warehouse Dept</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-500/10 text-japfa-navy dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-xl">category</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-black text-japfa-dark dark:text-white tracking-tight">4.2K KG</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-japfa-orange">IDR 84.1M</p>
                            <span className="text-[11px] font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                                <TrendingDown className="w-3 h-3 mr-1" /> 0.8%
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] text-japfa-gray dark:text-gray-500 italic border-t border-gray-50 dark:border-white/5 pt-3 font-medium">Incorrect product picker error rate</p>
                </div>

                {/* Customer Rejection Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-red-500 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-japfa-gray dark:text-gray-400 uppercase tracking-[0.15em]">Customer Rejection</span>
                            <span className="text-[9px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-black self-start uppercase">Transporter Dept</span>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-xl">person_off</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-black text-japfa-dark dark:text-white tracking-tight">1.5K KG</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-japfa-orange">IDR 32.5M</p>
                            <span className="text-[11px] font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                                <TrendingDown className="w-3 h-3 mr-1" /> 1.1%
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] text-japfa-gray dark:text-gray-500 italic border-t border-gray-50 dark:border-white/5 pt-3 font-medium">Delivery window or slot missed impact</p>
                </div>
            </div>

            {/* 2. MIDDLE SECTION: DONUT CHART & FLEET PERFORMANCE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart (Visual: High Detail SVG) */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h2 className="text-xl font-black text-japfa-dark dark:text-white mb-1 uppercase tracking-tight">Return Causes Distribution</h2>
                    <p className="text-[11px] text-japfa-gray dark:text-gray-500 font-bold uppercase tracking-widest mb-8">Weight percentage analysis by root cause</p>
                    <div className="flex flex-col items-center">
                        <div className="relative w-56 h-56 mb-8">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <circle className="stroke-gray-100 dark:stroke-white/5" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="3"></circle>
                                {/* Quality: 68.5% */}
                                <circle className="stroke-japfa-orange" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="5" strokeDasharray="68.5 31.5" strokeDashoffset="0"></circle>
                                {/* SKU: 23.1% */}
                                <circle className="stroke-japfa-navy dark:stroke-blue-400" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="5" strokeDasharray="23.1 76.9" strokeDashoffset="-68.5"></circle>
                                {/* Rejection: 8.4% */}
                                <circle className="stroke-japfa-gray dark:stroke-gray-600" cx="18" cy="18" r="15.9155" fill="transparent" strokeWidth="5" strokeDasharray="8.4 91.6" strokeDashoffset="-91.6"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-japfa-dark dark:text-white">18.1K</span>
                                <span className="text-[10px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">Total KG</span>
                            </div>
                        </div>
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-white/5 transition-all hover:translate-x-1">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-japfa-orange shadow-[0_0_8px_rgba(242,140,56,0.5)]"></span>
                                    <span className="text-xs font-black text-japfa-gray dark:text-gray-400 uppercase tracking-tighter">Quality Issues</span>
                                </div>
                                <span className="text-md font-black text-japfa-dark dark:text-white">68.5%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-white/5 transition-all hover:translate-x-1">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-japfa-navy dark:bg-blue-400"></span>
                                    <span className="text-xs font-black text-japfa-gray dark:text-gray-400 uppercase tracking-tighter">Mismatched SKU</span>
                                </div>
                                <span className="text-md font-black text-japfa-dark dark:text-white">23.1%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fleet Performance List (Visual: Compact & Premium) */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h2 className="text-xl font-black text-japfa-dark dark:text-white mb-1 uppercase tracking-tight">Fleet Incident Performance</h2>
                    <p className="text-[11px] text-japfa-gray dark:text-gray-500 font-bold uppercase tracking-widest mb-6">Units with highest return impact</p>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {fleetIncidentData.map((fleet, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                idx === 0 
                                ? 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20' 
                                : 'bg-white dark:bg-slate-950 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20'
                            }`}>
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                        idx === 0 ? 'bg-japfa-orange text-white' : 'bg-gray-100 dark:bg-white/10 text-japfa-gray dark:text-gray-400'
                                    }`}>{idx + 1}</span>
                                    <div>
                                        <p className="font-black text-japfa-dark dark:text-white text-lg tracking-tight">{fleet.plate}</p>
                                        <p className="text-[10px] text-japfa-gray dark:text-gray-500 uppercase font-black">{fleet.count} Incidents • This Month</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-japfa-dark dark:text-white">{fleet.weight}</p>
                                    <div className={`text-[10px] font-black flex items-center justify-end gap-1 ${
                                        fleet.trend === 'up' ? 'text-red-500' : fleet.trend === 'down' ? 'text-green-500' : 'text-japfa-gray'
                                    }`}>
                                        <span className="material-symbols-outlined text-xs">
                                            {fleet.trend === 'up' ? 'trending_up' : fleet.trend === 'down' ? 'trending_down' : 'horizontal_rule'}
                                        </span>
                                        {fleet.percent}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. BOTTOM SECTION: AUDIT TABLE (Visual: Detailed Actions & Headers) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-lg font-black text-japfa-dark dark:text-white uppercase tracking-tight">Historical Return Audit</h3>
                        <p className="text-[10px] font-bold text-japfa-gray uppercase tracking-[0.15em] mt-1">Transaction-level accountability log</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                                className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-black text-japfa-gray uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                                    <div className="p-3 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                        <p className="text-[10px] font-black text-japfa-gray uppercase tracking-widest">Filter By Status</p>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        {['Resolved', 'Investigating', 'Pending'].map(stat => (
                                            <label key={stat} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                                                <input type="checkbox" className="rounded text-japfa-orange focus:ring-japfa-orange border-gray-300 dark:border-gray-700" />
                                                <span className="text-xs font-bold text-japfa-gray dark:text-gray-400">{stat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="px-4 py-2 bg-japfa-navy dark:bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-japfa-dark transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                            <Download className="w-3.5 h-3.5" /> Export PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                                {['Date', 'Customer', 'Batch ID', 'Product', 'Weight', 'Return Reason', 'Status', 'Action'].map((h) => (
                                    <th key={h} className="py-4 px-6 text-[10px] font-black text-japfa-orange uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {auditData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6 text-[11px] font-bold text-japfa-gray dark:text-gray-400">{row.date}</td>
                                    <td className="py-4 px-6">
                                        <p className="font-black text-japfa-dark dark:text-white text-sm">{row.customer}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-mono text-[10px] font-bold text-japfa-gray bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">
                                            {row.id}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[11px] font-bold text-japfa-dark dark:text-gray-300">{row.product}</td>
                                    <td className="py-4 px-6 font-black text-japfa-dark dark:text-white">{row.weight}</td>
                                    <td className="py-4 px-6 text-[11px] font-medium italic text-japfa-gray dark:text-gray-500">{row.reason}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-tighter ${row.color}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === idx ? null : idx); }}
                                            className="px-3 py-1.5 bg-japfa-orange/10 dark:bg-japfa-orange/20 text-japfa-orange text-[10px] font-black rounded hover:bg-japfa-orange hover:text-white transition-all flex items-center gap-1 ml-auto active:scale-95"
                                        >
                                            DETAILS <ChevronDown className={`w-3 h-3 transition-transform ${openActionId === idx ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {openActionId === idx && (
                                            <div className="absolute right-6 top-12 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                                                <div className="p-1">
                                                    <button className="w-full text-left px-4 py-2.5 text-[11px] font-black text-japfa-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-wider">
                                                        <Eye className="w-3.5 h-3.5 text-blue-500" /> View Report
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2.5 text-[11px] font-black text-japfa-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-wider">
                                                        <FileText className="w-3.5 h-3.5 text-orange-500" /> Download PDF
                                                    </button>
                                                    <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                                                    <button className="w-full text-left px-4 py-2.5 text-[11px] font-black text-japfa-orange hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center gap-3 uppercase tracking-wider">
                                                        <RefreshCcw className="w-3.5 h-3.5" /> Re-Process
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
                <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex justify-center">
                    <button className="text-[10px] font-black text-japfa-gray hover:text-japfa-orange uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                        View All Audit Records <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}