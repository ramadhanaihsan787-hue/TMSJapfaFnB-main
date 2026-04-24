interface AnalyticsHeaderProps {
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
    onExport: () => void;
}

export default function AnalyticsHeader({ startDate, setStartDate, endDate, setEndDate, onExport }: AnalyticsHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-[#333] px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto">
                <h2 className="text-xl font-bold dark:text-white shrink-0">Logistics Analytics</h2>
                
                {/* 🌟 FILTER RENTANG TANGGAL */}
                <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-[#1A1A1A] rounded-lg px-3 py-1.5 border border-slate-200 dark:border-[#333]">
                        <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 mr-2">event</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm font-medium outline-none text-[#111] dark:text-white"
                            title="Start Date"
                        />
                    </div>
                    <span className="text-slate-400 font-bold px-1">-</span>
                    <div className="flex items-center bg-slate-100 dark:bg-[#1A1A1A] rounded-lg px-3 py-1.5 border border-slate-200 dark:border-[#333]">
                        <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 mr-2">event</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm font-medium outline-none text-[#111] dark:text-white"
                            title="End Date"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <button onClick={onExport} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export PDF/Excellll
                </button>
                <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold dark:text-white">Admin Panel</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-primary/20 overflow-hidden shrink-0">
                        <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOVwE6D5skjcA0kdB1Vkbt8PHjFNDhe83XgKDgfzJV23AUHoF1k7RqBV0lasCPs0tW8-U61sPBkk3XNEVlo4Pr9pRr-CmjRUB6jrOeV5GEW58Sj0MQkbIbGXnd8KHZrbxu_TQ_dCcRsBScHB6bVdu6QxJmV7N5zyT798CRXW5PlI16sOxkl5FInv80r4g7WBNepeHG18KzJ6ybv6wjTaKatLnLy_CgbhWKjrzGpOh2D1wcpWtUEJD3P0nbYAlwaIy9kdCn4tiPRjw" alt="Profile" />
                    </div>
                </div>
            </div>
        </header>
    );
}