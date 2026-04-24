import type { SettingsFormData } from '../types';

interface TelematicsSettingsProps {
    formData: SettingsFormData;
    onChange: (field: keyof SettingsFormData, value: string | number) => void;
}

export default function TelematicsSettings({ formData, onChange }: TelematicsSettingsProps) {
    return (
        <div className="animate-fadeIn">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-lg font-bold tracking-tight mb-1 text-[#111] dark:text-white">Telematics & IoT Integration</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Connect external APIs for Maps, 3PL Live GPS Tracking, and Cold Chain Temperature Sensors.</p>
                </div>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-[12px]">webhook</span> API Active
                </span>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333] rounded-xl p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">map</span> TomTom Maps API Key
                        </label>
                        <input value={formData.api_tomtom_key} onChange={(e) => onChange('api_tomtom_key', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all font-mono" type="password" />
                    </div>
                    
                    <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-slate-100 dark:border-[#333]">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">satellite_alt</span> 3PL GPS Webhook URL
                        </label>
                        <input value={formData.api_gps_webhook || ''} onChange={(e) => onChange('api_gps_webhook', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-blue-600 dark:text-blue-400 transition-all" type="url" placeholder="https://..." />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">ac_unit</span> Cold Chain Temp Sensor API
                        </label>
                        <input value={formData.api_temp_sensor || ''} onChange={(e) => onChange('api_temp_sensor', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-blue-600 dark:text-blue-400 transition-all" type="url" placeholder="https://..." />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Data Sync Interval</label>
                        <div className="relative">
                            <input value={formData.sync_interval_sec} onChange={(e) => onChange('sync_interval_sec', Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all text-right pr-14" type="number" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">Secs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}