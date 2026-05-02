import { useState } from 'react';
import { toast } from 'sonner'; // 🌟 SUNTIKAN SONNER

interface CustomerPaginationProps {
    totalItems: number;
}

export default function CustomerPagination({ totalItems }: CustomerPaginationProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const hasData = totalItems > 0;

    return (
        <div className="px-8 py-4 bg-slate-50 dark:bg-[#222] flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{hasData ? 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> entries
            </p>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-700 rounded-lg transition-colors active:scale-95 duration-150">
                        <span className="material-symbols-outlined text-base">filter_list</span> Filter
                    </button>
                    {isFilterOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl shadow-lg z-20 overflow-hidden">
                            <div className="p-3 border-b border-slate-100 dark:border-[#333]">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter By Type</p>
                            </div>
                            <div className="p-2 flex flex-col gap-1">
                                <label className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-[#222] rounded-lg cursor-pointer">
                                    <input type="checkbox" className="rounded text-[#FF7A00] focus:ring-[#FF7A00]" />
                                    <span className="text-sm dark:text-slate-300">Retail Partner</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-[#222] rounded-lg cursor-pointer">
                                    <input type="checkbox" className="rounded text-[#FF7A00] focus:ring-[#FF7A00]" />
                                    <span className="text-sm dark:text-slate-300">Wholesale</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                {/* 🌟 FIX CTO: Ganti alert jadi toast.info */}
                <button onClick={() => toast.info("Fitur Export Excel sedang dibangun!")} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#FF7A00] rounded-lg hover:bg-[#e66a00] transition-colors active:scale-95 duration-150">
                    <span className="material-symbols-outlined text-base">download</span> Export
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#FF7A00] transition-all">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="px-3 py-1 text-xs font-bold bg-[#FF7A00] text-white rounded shadow-sm border border-[#FF7A00]">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#FF7A00] transition-all">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        </div>
    );
}