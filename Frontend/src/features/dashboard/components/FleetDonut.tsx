interface FleetData {
    active: number;
    total: number;
    rate: number;
}

interface FleetDonutProps {
    fleetData: FleetData;
    isLoading: boolean;
}

export default function FleetDonut({ fleetData, isLoading }: FleetDonutProps) {
    return (
        <div className="w-full lg:w-[30%] bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Fleet Utilization</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Daily usage tracking</p>
            <div className="relative flex-1 flex items-center justify-center">
                {isLoading ? (
                    <span className="font-bold text-slate-400">Menghitung...</span>
                ) : (
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle className="stroke-slate-100 dark:stroke-slate-800" cx="18" cy="18" r="16" fill="transparent" strokeWidth="4"></circle>
                            <circle 
                                className="stroke-primary transition-all duration-1000 ease-out" 
                                cx="18" cy="18" r="16" fill="transparent" strokeWidth="4" 
                                strokeDasharray={`${fleetData.rate} 100`} 
                                strokeLinecap="round"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">{fleetData.rate}%</span>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Digunakan</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Active Trucks</span>
                    <span className="font-bold text-slate-900 dark:text-white">{fleetData.active} / {fleetData.total} Unit</span>
                </div>
            </div>
        </div>
    );
}