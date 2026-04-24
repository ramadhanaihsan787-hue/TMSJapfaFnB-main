// src/features/fleet/components/FleetSummaryCards.tsx

interface FleetSummaryCardsProps {
    loading: boolean;
    kpi: {
        activeCount: number;
        maintenanceCount: number;
        totalCount: number;
        avgFuelEfficiency: number;
        coldChainBreach: number;
    };
}

export default function FleetSummaryCards({ loading, kpi }: FleetSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Active Fleet */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Fleet</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">
                        {loading ? '...' : kpi.activeCount} 
                        <span className="text-base font-normal text-slate-400 ml-1">/ {kpi.totalCount || 7}</span>
                    </h3>
                    <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>Optimal
                    </span>
                </div>
            </div>

            {/* Avg Fuel Efficiency */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Fuel Efficiency</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">{kpi.avgFuelEfficiency} <span className="text-base font-normal text-slate-400">km/L</span></h3>
                    <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">trending_up</span>+0.5%
                    </span>
                </div>
            </div>

            {/* Trucks in Maintenance */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Trucks in Maintenance</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">
                        {loading ? '...' : kpi.maintenanceCount} 
                    </h3>
                    <span className="text-rose-500 text-sm font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">build</span>Workshop
                    </span>
                </div>
            </div>

            {/* Cold Chain Breach */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cold Chain Breach</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">{kpi.coldChainBreach} <span className="text-base font-normal text-slate-400">Incidents</span></h3>
                    <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">Safe</span>
                </div>
            </div>
        </div>
    );
}