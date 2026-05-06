import type { AlertData } from "../hooks/useDashboardData"; 

interface AlertListProps {
    alerts: AlertData[];
    isLoading: boolean;
}

export default function AlertList({ alerts, isLoading }: AlertListProps) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[320px] transition-colors">
            
            {/* HEADER */}
            <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Real-time Alerts</h2>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Live performance & daily monitoring</p>
                </div>
                
                {/* Ping Animation Indicator */}
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
            
            {/* KONTEN ALERTS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 text-center">
                        <span className="font-bold text-slate-400 text-sm">Mendeteksi anomali...</span>
                    </div>
                ) : Array.isArray(alerts) && alerts.length === 0 ? (
                    <div className="p-4 text-center">
                        <span className="font-bold text-slate-400 text-sm">Semua sistem aman. Tidak ada alert.</span>
                    </div>
                ) : (
                    Array.isArray(alerts) && alerts.map((alert, idx) => (
                        <div key={idx} className={`flex items-start gap-4 p-4 rounded-lg hover:shadow-md transition-all ${alert.bgColor}`}>
                            <div className={alert.iconColor}>
                                <span className="material-symbols-outlined text-xl">{alert.icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">{alert.time}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">{alert.desc}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}