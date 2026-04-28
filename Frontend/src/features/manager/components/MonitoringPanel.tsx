export default function MonitoringPanel() {
    const alerts = [
        { title: "Route Congestion", time: "2m ago", desc: "Heavy traffic detected on Jakarta-Cikampek KM 42.", icon: "report", color: "border-red-500" },
        { title: "Fleet Delay", time: "15m ago", desc: "Unit B-9281-UFA delayed due to severe weather.", icon: "warning", color: "border-orange-500" },
        { title: "GPS Signal", time: "42m ago", desc: "Loss of signal for 12 units in West Java sector.", icon: "gps_off", color: "border-red-500" },
        { title: "Cold Chain", time: "1h ago", desc: "Temp spike detected in Reefer-X45 container.", icon: "ac_unit", color: "border-red-500" }
    ];

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col h-full">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center h-20">
                <h2 className="text-xl font-bold text-japfa-dark dark:text-white uppercase tracking-tight">Monitoring</h2>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 text-[10px] font-black rounded-full uppercase">4 ACTIVE</span>
            </div>
            <div className="p-6 flex-1 space-y-4 overflow-y-auto max-h-[450px]">
                {alerts.map((alert, i) => (
                    <div key={i} className={`p-4 bg-gray-50 dark:bg-slate-950 border-l-4 ${alert.color} rounded-r-lg relative`}>
                        <span className="absolute top-3 right-3 text-[10px] font-bold text-japfa-gray">{alert.time}</span>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="material-symbols-outlined text-sm text-red-500">{alert.icon}</span>
                            <h3 className="text-xs font-bold text-japfa-dark dark:text-white uppercase">{alert.title}</h3>
                        </div>
                        <p className="text-[11px] text-japfa-gray dark:text-gray-400 leading-tight">{alert.desc}</p>
                    </div>
                ))}
                <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg uppercase transition-all shadow-md">
                    Acknowledge All Alerts
                </button>
            </div>
        </section>
    );
}