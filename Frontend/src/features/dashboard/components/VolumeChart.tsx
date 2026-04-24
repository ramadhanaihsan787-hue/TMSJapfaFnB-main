import type { VolumeData } from "../hooks/useDashboardData";

interface VolumeChartProps {
    volumeData: VolumeData[];
    maxVolume: number;
    isLoading: boolean;
}

export default function VolumeChart({ volumeData, maxVolume, isLoading }: VolumeChartProps) {
    // 🌟 Pindahin logic tinggi bar ke dalam komponen ini
    const getBarHeight = (count: number) => {
        if (count === 0) return "5%";
        return `${(count / maxVolume) * 100}%`;
    };

    return (
        <div className="w-full lg:w-[70%] bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hourly Delivery Volume</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Peak hour based on AI Estimation</p>
                </div>
            </div>
            <div className="h-[250px] flex items-end gap-4 px-4">
                {isLoading ? (
                    <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">Memuat Data...</div>
                ) : Array.isArray(volumeData) && volumeData.length === 0 ? (
                    <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">Belum ada rute hari ini.</div>
                ) : (
                    Array.isArray(volumeData) && volumeData.map((item, idx) => {
                        const isPeak = item.count === maxVolume && item.count > 0;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <div 
                                    className={`w-full rounded-t-md transition-all relative ${isPeak ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20'}`} 
                                    style={{ height: getBarHeight(item.count) }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.count} TOKO
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold ${isPeak ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{item.time}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}