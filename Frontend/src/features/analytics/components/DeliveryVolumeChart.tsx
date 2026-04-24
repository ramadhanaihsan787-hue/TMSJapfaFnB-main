import type { DeliveryVolume } from '../types';

interface DeliveryVolumeChartProps {
    loading: boolean;
    data: DeliveryVolume[];
    maxVolume: number;
    getBarHeight: (count: number, maxVolume: number) => string;
}

export default function DeliveryVolumeChart({ loading, data, maxVolume, getBarHeight }: DeliveryVolumeChartProps) {
    return (
        <div className="lg:col-span-6 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-[#111] dark:text-white">Hourly Delivery Volume</h4>
            </div>
            
            <div className="h-64 flex items-end gap-4 px-2">
                {loading ? (
                    <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">Loading Data...</div>
                ) : data.length === 0 ? (
                    <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">No routing data found.</div>
                ) : data.map((item, idx) => {
                    const currentCount = item.count || 0; 
                    const isPeak = currentCount === maxVolume && currentCount > 0;
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div 
                                className={`w-full rounded-t-md transition-all relative ${isPeak ? 'bg-primary' : 'bg-slate-100 dark:bg-[#333] group-hover:bg-primary/20'}`} 
                                style={{ height: getBarHeight(currentCount, maxVolume) }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {currentCount} TOKO
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold ${isPeak ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.hour || item.time}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}