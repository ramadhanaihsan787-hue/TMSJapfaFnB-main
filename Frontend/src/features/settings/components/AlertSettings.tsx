import type { SettingsFormData } from '../types';

interface AlertSettingsProps {
    formData: SettingsFormData;
    onChange: (field: keyof SettingsFormData, value: string | number) => void;
}

export default function AlertSettings({ formData, onChange }: AlertSettingsProps) {
    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight mb-1 text-[#111] dark:text-white">Alerts & Notifications</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Set safety thresholds for cold chain logistics and configure notification channels.</p>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333] rounded-xl p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">thermostat</span> Max Temp Threshold
                        </label>
                        <div className="relative">
                            <input value={formData.alert_max_temp_celsius} onChange={(e) => onChange('alert_max_temp_celsius', Number(e.target.value))} className="w-full px-4 py-2 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm text-rose-700 dark:text-rose-400 transition-all text-right pr-10 font-bold" type="number" step="0.1" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">°C</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">timer</span> Delay Threshold
                        </label>
                        <div className="relative">
                            <input value={formData.alert_delay_mins} onChange={(e) => onChange('alert_delay_mins', Number(e.target.value))} className="w-full px-4 py-2 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm text-orange-700 dark:text-orange-400 transition-all text-right pr-14 font-bold" type="number" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-xs">Mins</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 md:col-span-2 pt-4 border-t border-slate-100 dark:border-[#333]">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Critical Alert Channels</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-[#333] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors flex-1">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary accent-primary" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#111] dark:text-white">Dashboard Alerts</span>
                                    <span className="text-[10px] text-slate-400">Real-time popups on Admin screen</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-[#333] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors flex-1">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary accent-primary" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#111] dark:text-white">Manager Email</span>
                                    <span className="text-[10px] text-slate-400">LogisticsManager@japfa.com</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-[#333] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors flex-1">
                                <input type="checkbox" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary accent-primary" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-[#111] dark:text-white">WhatsApp Bot</span>
                                    <span className="text-[10px] text-slate-400">Send to Admin WhatsApp Group</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}