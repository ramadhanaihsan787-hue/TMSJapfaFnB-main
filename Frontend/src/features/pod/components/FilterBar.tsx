import { useState } from 'react';

export default function FilterBar() {
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex flex-col gap-1 min-w-[200px]">
                <span className="text-[10px] uppercase font-bold text-slate-400">Periode</span>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#222] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-sm text-slate-500">calendar_today</span>
                    <span className="text-sm font-medium dark:text-slate-300">1 Aug 2026 - 31 Aug 2026</span>
                </div>
            </div>
            <div className="flex flex-col gap-1 min-w-[150px]">
                <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                <select className="bg-slate-50 dark:bg-[#222] dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-primary focus:border-primary outline-none px-3 py-2 cursor-pointer">
                    <option>Semua Status</option>
                    <option>Selesai (Success)</option>
                    <option>Gagal (Failed)</option>
                </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Cari Data</span>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#222] dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary outline-none" placeholder="Cari No. DO, Nama Toko, atau Driver..." type="text" />
                </div>
            </div>
            <div className="flex items-end self-stretch relative">
                <button onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-all h-[42px] cursor-pointer active:scale-95">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Unduh Laporan
                </button>
                {isDownloadMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl shadow-lg z-20 overflow-hidden text-left">
                        <div className="p-2 flex flex-col gap-1">
                            <button className="flex items-center gap-3 p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222] hover:text-primary rounded-lg transition-colors active:scale-95 text-left font-medium">
                                <span className="material-symbols-outlined text-[18px]">summarize</span> Excel (CSV)
                            </button>
                            <button className="flex items-center gap-3 p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222] hover:text-primary rounded-lg transition-colors active:scale-95 text-left font-medium">
                                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> PDF Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}