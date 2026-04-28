import ThemeToggle from '../../../shared/components/ThemeToggle';

interface LoadPlannerToolbarProps {
    capacityPct: number;
    weightVal: number;
    maxWeight: number;
    onValidate: () => void;
    onDispatch: () => void;
}

export default function LoadPlannerToolbar({ capacityPct, weightVal, maxWeight, onValidate, onDispatch }: LoadPlannerToolbarProps) {
    return (
        <header className="flex justify-between items-center px-6 h-16 w-full z-10 bg-white/85 dark:bg-[#111111]/85 backdrop-blur-md border-b border-slate-200 dark:border-[#333] sticky top-0 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>Warehouse</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span>Load Planning</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1A1A1A] px-2 py-1 rounded border border-slate-200 dark:border-[#333]">
                    <span className="text-primary font-bold">TRC-204</span>
                    <span className="text-[10px] text-slate-400">/ 7 Trucks in Fleet</span>
                </div>
            </div>

            {/* Loading Progress */}
            <div className="flex flex-col items-center w-56 hidden md:flex">
                <div className="flex justify-between w-full mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Loading Payload</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{capacityPct}% Capacity</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#222] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#994700] to-[#FF7A00] h-full rounded-full shadow-[0_0_8px_rgba(255,122,0,0.3)]" style={{ width: `${capacityPct}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{weightVal} / {maxWeight} kg</div>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                    onClick={onValidate}
                    className="px-4 py-2 bg-slate-100 dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] active:scale-95 text-slate-900 dark:text-white text-xs font-bold rounded-lg transition-all cursor-pointer select-none border border-slate-200 dark:border-[#333]">
                    Validate
                </button>
                <button
                    onClick={onDispatch}
                    className="px-4 py-2 bg-gradient-to-r from-[#994700] to-[#FF7A00] text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none">
                    Dispatch
                </button>
            </div>
        </header>
    );
}