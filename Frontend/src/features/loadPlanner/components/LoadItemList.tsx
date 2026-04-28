import type { Shipment } from '../types';

interface LoadItemListProps {
    shipments: Shipment[];
    selectedShipmentId: string | null;
    selectShipment: (id: string) => void;
    showToast: (msg: string) => void;
}

export default function LoadItemList({ shipments, selectedShipmentId, selectShipment, showToast }: LoadItemListProps) {
    return (
        <>
            <div className="p-4 border-b border-slate-200 dark:border-[#333]">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shipment Backlogggg</h2>
                    <span className="bg-slate-200 dark:bg-[#2a2a2a] px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 dark:text-slate-200">{shipments.length} Items</span>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">search</span>
                    <input className="w-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] text-xs pl-9 pr-4 py-2 rounded-lg focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white" placeholder="Search orders..." type="text" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {shipments.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => { selectShipment(s.id); showToast(`Selected ${s.id}`); }}
                        className={`bg-white dark:bg-[#111111] p-3 rounded-xl shadow-sm border transition-all cursor-pointer ${selectedShipmentId === s.id ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-slate-200 dark:hover:border-[#333]'}`}
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-black text-primary">{s.id}</span>
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-sm">drag_indicator</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{s.customer}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">Block: {s.block}</p>
                        <div className="space-y-1">
                            {s.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase">
                                    <span className="material-symbols-outlined text-[14px]">
                                        {item.type === 'egg' ? 'egg' : 'nutrition'}
                                    </span>
                                    {item.count} {item.type === 'egg' ? 'Crates' : 'Sacks'}
                                </div>
                            ))}
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                                <span className="material-symbols-outlined text-[14px]">weight</span> {s.weight} KG
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}