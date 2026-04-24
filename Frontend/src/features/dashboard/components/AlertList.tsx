import type { AlertData } from "../hooks/useDashboardData"; // 🌟 Tarik interface dari Hook

interface AlertListProps {
    alerts: AlertData[];
    isLoading: boolean;
}

export default function AlertList({ alerts, isLoading }: AlertListProps) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[320px] transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#222]/50 rounded-t-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-time Alertsssss</h3>
                <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded uppercase">Live</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
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
                        <div key={idx} className={`p-4 rounded-lg flex gap-4 transition-colors ${alert.bgColor}`}>
                            <span className={`material-symbols-outlined ${alert.iconColor}`}>{alert.icon}</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{alert.desc}</p>
                                <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 block">{alert.time}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}