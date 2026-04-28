import type { SettingsFormData } from '../types';

interface CostSettingsProps {
    formData: SettingsFormData;
    onChange: (field: keyof SettingsFormData, value: string | number) => void;
}

export default function CostSettings({ formData, onChange }: CostSettingsProps) {
    return (
        <div className="animate-fadeIn pb-10">
            {/* Page Title Row */}
            <div className="flex items-baseline justify-between mb-8">
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-on-surface tracking-tighter mb-2">Cost Configuration</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                        Define the foundational economic metrics that drive your logistics routing and profitability calculations.
                    </p>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* 🌟 1. Fuel Cost Card (Besar) */}
                <div className="col-span-12 md:col-span-8 bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-slate-200 dark:border-[#333] flex flex-col justify-between min-h-[280px] relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">local_gas_station</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Energy Rate</p>
                                <h4 className="text-xl font-bold text-on-surface">Fuel Cost per Liter</h4>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">
                            Adjust based on current market trends. This value impacts every delivery route and VRP calculation.
                        </p>
                    </div>
                    <div className="relative z-10 flex items-end gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 dark:text-slate-600">Rp</span>
                                <input
                                    className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-2xl pl-16 pr-6 py-5 text-3xl md:text-4xl font-black tracking-tighter text-on-surface focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1A1A1A] transition-all outline-none"
                                    type="number"
                                    value={formData.cost_fuel_per_liter}
                                    onChange={(e) => onChange('cost_fuel_per_liter', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🌟 2. Fleet Efficiency (Dulu Maintenance Buffer) */}
                <div className="col-span-12 md:col-span-4 bg-[#121212] p-8 rounded-xl text-white flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-emerald-400">speed</span>
                        </div>
                        <h4 className="text-lg font-bold mb-2">Fleet Efficiency</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Average distance covered per liter of fuel. Used by OR-Tools to predict total trip cost.
                        </p>
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex items-end gap-1">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.cost_avg_km_per_liter}
                                    onChange={(e) => onChange('cost_avg_km_per_liter', Number(e.target.value))}
                                    className="text-4xl font-black text-emerald-400 bg-transparent border-none outline-none w-24 p-0"
                                />
                                <span className="text-xl text-emerald-400 font-black mb-1">KM/L</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-300"
                                style={{ width: `${Math.min((formData.cost_avg_km_per_liter / 10) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 🌟 3. Driver Base Salary */}
                <div className="col-span-12 md:col-span-6 lg:col-span-5 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">payments</span>
                            <h4 className="font-bold text-on-surface">Base Salary (Monthly)</h4>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                            <input
                                className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-xl p-4 pl-10 text-xl font-black text-on-surface focus:ring-1 focus:ring-primary outline-none"
                                type="number"
                                value={formData.cost_driver_salary}
                                onChange={(e) => onChange('cost_driver_salary', Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-4 leading-normal">
                        Applied to all active drivers. Includes mandatory social security contributions.
                    </p>
                </div>

                {/* 🌟 4. Overtime Rate */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-slate-400">schedule</span>
                        <h4 className="font-bold text-on-surface">Overtime (per Hr)</h4>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#333]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Standard Rate</p>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-on-surface">Rp</span>
                            <input
                                type="number"
                                value={formData.cost_overtime_rate}
                                onChange={(e) => onChange('cost_overtime_rate', Number(e.target.value))}
                                className="text-xl font-black text-on-surface bg-transparent outline-none w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* 🌟 5. Depo Coordinates (Baru, biar desainnya penuh) */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-slate-400">location_on</span>
                        <h4 className="font-bold text-on-surface">Default Depo Location</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#333]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Latitude</p>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.depo_lat}
                                onChange={(e) => onChange('depo_lat', Number(e.target.value))}
                                className="text-sm font-black text-on-surface bg-transparent outline-none w-full"
                            />
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#333]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Longitude</p>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.depo_lon}
                                onChange={(e) => onChange('depo_lon', Number(e.target.value))}
                                className="text-sm font-black text-on-surface bg-transparent outline-none w-full"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4">JAPFA Cikupa Distribution Center.</p>
                </div>

            </div>
        </div>
    );
}