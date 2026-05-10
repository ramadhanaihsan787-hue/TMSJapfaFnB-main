// src/features/routes/components/SpilloverBasket.tsx
import type { DroppedNode } from '../types'; 

interface SpilloverBasketProps {
    droppedNodes: DroppedNode[];
    onGenerateOnCall: () => void;
    isGenerating: boolean;
}

export default function SpilloverBasket({ droppedNodes, onGenerateOnCall, isGenerating }: SpilloverBasketProps) {
    if (!droppedNodes || droppedNodes.length === 0) return null;

    // Asumsi biaya: 1 truk On-Call (kapasitas 2.5T) disewa seharga Rp 1.500.000
    const totalWeight = droppedNodes.reduce((sum, node) => sum + (node.weightKg || node.berat_kg || 0), 0);
    const estimatedTrucks = Math.ceil(totalWeight / 2500);
    const estimatedCost = estimatedTrucks * 1500000;

    return (
        <div className="w-full mt-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-500">warning</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-red-700 dark:text-red-400 uppercase tracking-tight">
                            {droppedNodes.length} Toko Overload (Keranjang Merah)
                        </h3>
                        <p className="text-sm font-medium text-red-600/80 dark:text-red-300/80 mt-0.5">
                            Kapasitas armada internal tidak mencukupi. Sistem mengamankan toko-toko ini dari rute utama.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex gap-4 text-xs font-bold text-red-800 dark:text-red-300">
                    <div className="bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-red-200/50 dark:border-red-800/50">
                        Total Muatan: <span className="text-red-600 dark:text-red-400">{totalWeight.toLocaleString()} KG</span>
                    </div>
                    <div className="bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-red-200/50 dark:border-red-800/50">
                        Est. Kebutuhan: <span className="text-red-600 dark:text-red-400">{estimatedTrucks} Truk Sewa</span>
                    </div>
                    <div className="bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-red-200/50 dark:border-red-800/50">
                        Est. Biaya Sewa: <span className="text-red-600 dark:text-red-400">Rp {estimatedCost.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                <button 
                    onClick={onGenerateOnCall}
                    disabled={isGenerating}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isGenerating ? (
                        <><span className="material-symbols-outlined animate-spin">sync</span> MENGHITUNG...</>
                    ) : (
                        <><span className="material-symbols-outlined">support_agent</span> ALOKASIKAN KE ON-CALL</>
                    )}
                </button>
                <button className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold px-6 py-2 rounded-xl text-xs transition-colors">
                    Lihat Daftar Toko
                </button>
            </div>
        </div>
    );
}