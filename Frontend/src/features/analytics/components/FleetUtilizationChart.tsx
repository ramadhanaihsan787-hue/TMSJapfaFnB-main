import type { FleetUtilization } from '../types';

interface FleetUtilizationChartProps {
    loading: boolean;
    data?: FleetUtilization;
}

export default function FleetUtilizationChart({ loading, data }: FleetUtilizationChartProps) {
    const utilRate = data?.utilizationRate ? parseInt(data.utilizationRate.replace('%', '')) : 0;

    return (
        <div className="lg:col-span-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm flex flex-col">
            <h4 className="font-bold mb-6 text-[#111] dark:text-white">Fleet Utilization</h4>
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {loading ? (
                    <span className="text-slate-400">Loading...</span>
                ) : (
                    <>
                        <svg className="h-48 w-48" viewBox="0 0 36 36">
                            <circle className="stroke-slate-100 dark:stroke-[#222]" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                            <circle
                                className="stroke-primary transition-all duration-1000 ease-out"
                                cx="18" cy="18" fill="none" r="16"
                                strokeDasharray={`${utilRate} 100`}
                                strokeLinecap="round" strokeWidth="3"
                                transform="rotate(-90 18 18)"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-[#111] dark:text-white">{data?.utilizationRate || '0%'}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">In Use</span>
                        </div>
                    </>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-2 bg-slate-50 dark:bg-[#1A1A1A] rounded-lg border border-slate-100 dark:border-[#333]">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Active Trucks</p>
                    <p className="text-sm font-bold text-primary">{data?.activeTrucks || 0}</p>
                </div>
                <div className="text-center p-2 bg-slate-50 dark:bg-[#1A1A1A] rounded-lg border border-slate-100 dark:border-[#333]">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Total Fleet</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{data?.totalTrucks || 0}</p>
                </div>
            </div>
        </div>
    );
}