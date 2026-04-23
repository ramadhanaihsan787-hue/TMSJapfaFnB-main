import { useState, useEffect } from 'react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('vrp');
    
    // 🌟 STATE UTAMA: Nyimpen semua data konfigurasi
    const [formData, setFormData] = useState({
        vrp_start_time: "06:00",
        vrp_end_time: "20:00",
        vrp_base_drop_time_mins: 15,
        vrp_var_drop_time_mins: 1,
        vrp_capacity_buffer_percent: 90,
        
        cost_fuel_per_liter: 12500,
        cost_avg_km_per_liter: 5,
        cost_driver_salary: 4500000,
        cost_overtime_rate: 25000,
        depo_lat: -6.207356,
        depo_lon: 106.479163,
        
        api_tomtom_key: "xUy50YsjmbRexLalxX3ThDpmC1lOzElP",
        api_gps_webhook: "",
        api_temp_sensor: "",
        sync_interval_sec: 60,
        
        alert_max_temp_celsius: 4.0,
        alert_delay_mins: 30
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

    const tabs = [
        { id: 'vrp', label: 'VRP & Routing Engine', icon: 'route' },
        { id: 'cost', label: 'Cost & Operations', icon: 'payments' },
        { id: 'telematics', label: 'Telematics & IoT', icon: 'sensors' },
        { id: 'alerts', label: 'Alerts & Notifications', icon: 'notifications_active' }
    ];

    // 🌟 1. NARIK DATA DARI DATABASE PAS HALAMAN DIBUKA
    useEffect(() => {
        fetch('http://localhost:8000/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    setFormData(data.data);
                }
            })
            .catch(err => console.error("Gagal narik setting:", err))
            .finally(() => setIsLoading(false));
    }, []);

    // 🌟 2. FUNGSI NANGKEP KETIKAN MANAJER
    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // 🌟 3. FUNGSI SAVE KE DATABASE
    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch('http://localhost:8000/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            
            if (result.status === 'success') {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000); // Ilangin notif sukses setelah 3 detik
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error("Gagal save setting:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] font-bold text-slate-400">Loading System Configuration...</div>;
    }

    return (
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0A0A0A] flex flex-col h-screen relative">
            
            {/* 🌟 NOTIFIKASI TOAST (MUNCUL PAS DI SAVE) */}
            {saveStatus === 'success' && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-2 z-50 animate-bounce">
                    <span className="material-symbols-outlined">check_circle</span>
                    Configuration Saved Successfully!
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-2 z-50">
                    <span className="material-symbols-outlined">error</span>
                    Failed to save configuration.
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-[#333] px-4 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-xl font-bold">Settings Configuration</h1>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl">search</span>
                        <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#1A1A1A] border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 outline-none text-[#111] dark:text-white" placeholder="Search settings..." type="text" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="h-8 w-px bg-slate-200 dark:bg-[#333]"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-[#111] dark:text-white">Bos Ihsan</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">Super Admin TMS</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-primary/20 overflow-hidden shrink-0">
                                <img className="h-full w-full object-cover" src="https://ui-avatars.com/api/?name=Bos+Ihsan&background=0D8ABC&color=fff" alt="Profile" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col">
                
                {/* 🌟 LOGIKA TABS DINAMIS */}
                <div className="flex items-center border-b border-slate-200 dark:border-[#333] mb-8 overflow-x-auto hide-scrollbar">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 shrink-0 transition-colors ${
                                activeTab === tab.id 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    {/* TAB 1: VRP & ROUTING ENGINE */}
                    {activeTab === 'vrp' && (
                        <div className="animate-fadeIn">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold tracking-tight mb-1 text-[#111] dark:text-white">VRP & Routing Engine</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Configure how the OR-Tools AI algorithm thinks and constraints operational parameters.</p>
                            </div>

                            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333] rounded-xl p-8 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Default Start Time (HH:MM)</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">schedule</span>
                                            <input value={formData.vrp_start_time} onChange={(e) => handleChange('vrp_start_time', e.target.value)} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="time" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Default End Time (HH:MM)</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">update</span>
                                            <input value={formData.vrp_end_time} onChange={(e) => handleChange('vrp_end_time', e.target.value)} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="time" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Base Drop Time (Minutes)</label>
                                        <div className="relative">
                                            <input value={formData.vrp_base_drop_time_mins} onChange={(e) => handleChange('vrp_base_drop_time_mins', Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all text-right pr-14" type="number" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">Mins</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Variable Drop Time (per 10 KG)</label>
                                        <div className="relative">
                                            <input value={formData.vrp_var_drop_time_mins} onChange={(e) => handleChange('vrp_var_drop_time_mins', Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all text-right pr-14" type="number" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">Mins</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Max Vehicle Capacity Buffer (%)</label>
                                        <div className="flex items-center gap-4">
                                            <input value={formData.vrp_capacity_buffer_percent} onChange={(e) => handleChange('vrp_capacity_buffer_percent', Number(e.target.value))} type="range" min="50" max="100" className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                            <div className="w-16 text-center py-1 bg-primary/10 text-primary font-bold rounded-lg text-sm">{formData.vrp_capacity_buffer_percent}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: COST & OPERATIONS */}
                    {activeTab === 'cost' && (
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
                                            <input value={formData.cost_fuel_per_liter} onChange={(e) => handleChange('cost_fuel_per_liter', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg. Fleet Consumption (KM/L)</label>
                                        <div className="relative">
                                            <input value={formData.cost_avg_km_per_liter} onChange={(e) => handleChange('cost_avg_km_per_liter', Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all text-right pr-14" type="number" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">KM/L</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Driver Base Salary (Monthly)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                                            <input value={formData.cost_driver_salary} onChange={(e) => handleChange('cost_driver_salary', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overtime Rate (per hour)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                                            <input value={formData.cost_overtime_rate} onChange={(e) => handleChange('cost_overtime_rate', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 md:col-span-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#333]">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Default Depo Coordinates (Cikupa)</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">LAT</span>
                                                <input value={formData.depo_lat} onChange={(e) => handleChange('depo_lat', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" step="0.000001" />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">LON</span>
                                                <input value={formData.depo_lon} onChange={(e) => handleChange('depo_lon', Number(e.target.value))} className="w-full pl-12 pr-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all" type="number" step="0.000001" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: TELEMATICS & IOT */}
                    {activeTab === 'telematics' && (
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
                                        <input value={formData.api_tomtom_key} onChange={(e) => handleChange('api_tomtom_key', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all font-mono" type="password" />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-slate-100 dark:border-[#333]">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">satellite_alt</span> 3PL GPS Webhook URL
                                        </label>
                                        <input value={formData.api_gps_webhook || ''} onChange={(e) => handleChange('api_gps_webhook', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-blue-600 dark:text-blue-400 transition-all" type="url" placeholder="https://..." />
                                    </div>

                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">ac_unit</span> Cold Chain Temp Sensor API
                                        </label>
                                        <input value={formData.api_temp_sensor || ''} onChange={(e) => handleChange('api_temp_sensor', e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-blue-600 dark:text-blue-400 transition-all" type="url" placeholder="https://..." />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Data Sync Interval</label>
                                        <div className="relative">
                                            <input value={formData.sync_interval_sec} onChange={(e) => handleChange('sync_interval_sec', Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#111] dark:text-white transition-all text-right pr-14" type="number" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">Secs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ALERTS & NOTIFICATIONS */}
                    {activeTab === 'alerts' && (
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
                                            <input value={formData.alert_max_temp_celsius} onChange={(e) => handleChange('alert_max_temp_celsius', Number(e.target.value))} className="w-full px-4 py-2 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm text-rose-700 dark:text-rose-400 transition-all text-right pr-10 font-bold" type="number" step="0.1" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">°C</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">timer</span> Delay Threshold
                                        </label>
                                        <div className="relative">
                                            <input value={formData.alert_delay_mins} onChange={(e) => handleChange('alert_delay_mins', Number(e.target.value))} className="w-full px-4 py-2 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm text-orange-700 dark:text-orange-400 transition-all text-right pr-14 font-bold" type="number" />
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
                    )}
                    
                    {/* 🌟 GLOBAL SAVE BUTTON: NEMBAK KE API */}
                    <div className="mt-8 flex justify-end gap-3 sticky bottom-4">
                        <button className="px-6 py-2.5 bg-slate-100 dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-[#222] text-[#111] dark:text-white rounded-lg text-sm font-bold transition-colors">Discard Changes</button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className="material-symbols-outlined text-sm">{isSaving ? 'sync' : 'save'}</span> 
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>

                </div>
            </div>

            {/* Footer Stats Sub-Bar */}
            <footer className="border-t border-slate-200 dark:border-[#333] bg-white dark:bg-[#111111] px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 hover:bg-slate-50 dark:hover:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-slate-500 dark:text-slate-400">System Status: <span className="text-slate-900 dark:text-white font-bold">Optimal</span></span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 hidden sm:block">Last configuration sync: <span className="text-slate-900 dark:text-white font-medium">Just now</span></div>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                    TMS JAPFA Cold Chain V2.4.1
                </div>
            </footer>
        </div>
    );
}