interface DriverPaginationProps {
    totalDrivers: number;
}

export default function DriverPagination({ totalDrivers }: DriverPaginationProps) {
    const hasData = totalDrivers > 0;
    
    return (
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-[#333] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Showing {hasData ? 1 : 0} to {totalDrivers} of {totalDrivers} drivers
            </span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 dark:border-[#444] rounded bg-white dark:bg-[#111111] text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#222] disabled:opacity-50 text-slate-400 dark:text-slate-500">Previous</button>
                <button className="px-3 py-1 bg-primary text-white rounded text-xs font-bold shadow-sm">1</button>
                <button className="px-3 py-1 border border-slate-200 dark:border-[#444] rounded bg-white dark:bg-[#111111] text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#222] text-slate-700 dark:text-slate-300">Next</button>
            </div>
        </div>
    );
}