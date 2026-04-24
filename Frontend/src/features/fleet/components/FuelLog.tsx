// src/features/fleet/components/FuelLog.tsx

interface FuelLogProps {
    onInputFuel: () => void;
}

export default function FuelLog({ onInputFuel }: FuelLogProps) {
    return (
        <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Fuel Expenses Log</h5>
                <button className="text-[10px] font-bold text-primary hover:underline">View All</button>
            </div>
            
            <div className="space-y-2 flex-1">
                {/* Dummy Data, nanti bisa di-map dari props kalau API bensinnya udah ada */}
                <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex items-center justify-between transition-colors hover:border-primary/30">
                    <div>
                        <p className="text-xs font-bold text-[#111] dark:text-white">24 Feb 2026</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">45 L • Shell Pertamina</p>
                    </div>
                    <p className="text-xs font-black text-primary">Rp 450.500</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex items-center justify-between transition-colors hover:border-primary/30">
                    <div>
                        <p className="text-xs font-bold text-[#111] dark:text-white">18 Feb 2026</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">42 L • SPBU 34.12</p>
                    </div>
                    <p className="text-xs font-black text-primary">Rp 420.200</p>
                </div>
            </div>

            {/* Action Button */}
            <button 
                onClick={onInputFuel} 
                className="w-full mt-4 py-3.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
                <span className="material-symbols-outlined text-[16px]">local_gas_station</span>
                Input Resi Bensin (Manual)
            </button>
        </div>
    );
}