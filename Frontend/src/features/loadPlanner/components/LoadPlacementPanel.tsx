import type { Shipment } from '../types';

interface LoadPlacementPanelProps {
    selectedShipment?: Shipment;
}

export default function LoadPlacementPanel({ selectedShipment }: LoadPlacementPanelProps) {
    return (
        <div className="p-5 border-b border-slate-200 dark:border-[#333]">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Inspector</h2>
            {selectedShipment ? (
                <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl">
                    <span className="text-[10px] font-black text-primary uppercase">Selection</span>
                    <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{selectedShipment.id}</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Customer</span>
                            <span className="font-semibold text-right text-slate-900 dark:text-white">{selectedShipment.customer}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-y border-slate-200 dark:border-[#333] py-2">
                            <span className="text-[9px] text-slate-400 uppercase font-black">Cargo Detail</span>
                            {selectedShipment.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400 capitalize">{item.type}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{item.count} {item.type === 'egg' ? 'Crates' : 'Sacks'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Weight</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{selectedShipment.weight} KG</span>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-slate-400 text-center py-6">Select a shipment to inspect</p>
            )}
        </div>
    );
}