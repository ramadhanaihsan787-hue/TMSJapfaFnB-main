type ModalType = 'cost' | 'distance' | 'fleet' | 'stops' | null;

interface RouteSummaryCardsProps {
    totalCost: string;
    totalDistance: string;
    totalFleet: number;
    totalOrders: number;
    onCardClick: (type: ModalType) => void;
}

export default function RouteSummaryCards({ totalCost, totalDistance, totalFleet, totalOrders, onCardClick }: RouteSummaryCardsProps) {
    return (
        <div className="grid grid-cols-4 gap-6">
            <div onClick={() => onCardClick('cost')} className="bg-white dark:bg-[#1F1F1F] p-5 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm cursor-pointer hover:border-primary transition-all">
                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Estimation</span><span className="material-symbols-outlined text-slate-300">payments</span></div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">Rp {totalCost}</div><div className="mt-2 text-[10px] text-primary">Klik rincian ↗</div>
            </div>
            <div onClick={() => onCardClick('distance')} className="bg-white dark:bg-[#1F1F1F] p-5 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm cursor-pointer hover:border-primary transition-all">
                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Distanceuu</span><span className="material-symbols-outlined text-slate-300">route</span></div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{totalDistance} <span className="text-lg">KM</span></div><div className="mt-2 text-[10px] text-primary">Klik rincian ↗</div>
            </div>
            <div onClick={() => onCardClick('fleet')} className="bg-white dark:bg-[#1F1F1F] p-5 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm cursor-pointer hover:border-primary transition-all">
                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet</span><span className="material-symbols-outlined text-slate-300">local_shipping</span></div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalFleet} Trucks</div><div className="mt-2 text-[10px] text-primary">Klik rincian ↗</div>
            </div>
            <div onClick={() => onCardClick('stops')} className="bg-white dark:bg-[#1F1F1F] p-5 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm cursor-pointer hover:border-primary transition-all">
                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stops</span><span className="material-symbols-outlined text-slate-300">inventory_2</span></div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalOrders} Destinations</div><div className="mt-2 text-[10px] text-primary">Klik rincian ↗</div>
            </div>
        </div>
    );
}