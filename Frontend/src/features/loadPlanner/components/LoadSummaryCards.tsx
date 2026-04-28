import type { TruckCapacityTier } from '../types';

interface LoadSummaryCardsProps {
    truckCapacityTier: TruckCapacityTier;
    setCapacityTier: (tier: TruckCapacityTier) => void;
    showToast: (msg: string) => void;
}

export default function LoadSummaryCards({ truckCapacityTier, setCapacityTier, showToast }: LoadSummaryCardsProps) {
    const tiers: TruckCapacityTier[] = ['2T', '2.7T', '5T'];

    return (
        <div className="p-4 border-b border-slate-200 dark:border-[#333]">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Truck Payload Capacity</h2>
            <div className="flex flex-col gap-2">
                {tiers.map((tier) => (
                    <button
                        key={tier}
                        onClick={() => { setCapacityTier(tier); showToast(`Capacity updated to ${tier}`); }}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${truckCapacityTier === tier ? 'bg-white dark:bg-[#1A1A1A] border-primary shadow-sm' : 'bg-slate-100 dark:bg-[#1A1A1A] border-transparent hover:bg-white dark:hover:bg-[#222]'}`}
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{tier} Payload</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400">
                                {tier === '5T' ? '208' : tier === '2.7T' ? '112' : '83'} Max Crates
                            </span>
                        </div>
                        <span className={`material-symbols-outlined text-sm ${truckCapacityTier === tier ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                            {truckCapacityTier === tier ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}