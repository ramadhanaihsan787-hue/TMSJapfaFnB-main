import type { SettingsFormData } from '../types';

interface CostSettingsProps {
    formData: SettingsFormData;
    onChange: (field: keyof SettingsFormData, value: string | number) => void;
}

export default function CostSettings({ formData, onChange }: CostSettingsProps) {
    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight mb-1 text-[#111] dark:text-white">Cost & Operations</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Define global parameters for automated shipping cost calculations and base coordinates.</p>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333] rounded-xl p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fuel Cost per Liter (IDR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                            <input value={formData.cost_fuel_per_liter} onChange={(e) => onChange('cost_fuel_per_liter', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg. Fleet Consumption (KM/L)</label>
                        <div className="relative">
                            <input value={formData.cost_avg_km_per_liter} onChange={(e) => onChange('cost_avg_km_per_liter', Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all text-right pr-14" type="number" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">KM/L</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Driver Base Salary (Monthly)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                            <input value={formData.cost_driver_salary} onChange={(e) => onChange('cost_driver_salary', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overtime Rate (per hour)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                            <input value={formData.cost_overtime_rate} onChange={(e) => onChange('cost_overtime_rate', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 md:col-span-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#333]">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Default Depo Coordinates (Cikupa)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">LAT</span>
                                <input value={formData.depo_lat} onChange={(e) => onChange('depo_lat', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" step="0.000001" />
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">LON</span>
                                <input value={formData.depo_lon} onChange={(e) => onChange('depo_lon', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" step="0.000001" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}