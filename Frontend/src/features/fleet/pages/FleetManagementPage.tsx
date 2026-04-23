import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useApi } from "../../hooks/useApi"; // 🌟 Manggil senjata rahasia lu

export default function FleetManagement() {
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    
    const [fleetList, setFleetList] = useState<any[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<any>(null);
    
    // 🌟 PAKE useApi BIAR KTP (TOKEN) OTOMATIS KEBAWA
    const { loading, execute } = useApi('/api/fleet');

    useEffect(() => {
        // Tembak API pas halaman kebuka
        execute().then((resData: any) => {
            // 🌟 FIX 1: Ambil property 'data' dari balikan Backend lu!
            const actualData = resData?.data || resData; 
            
            if (actualData && Array.isArray(actualData)) {
                setFleetList(actualData);
                if (actualData.length > 0) setSelectedTruck(actualData[0]);
            }
        });
    }, []);

    // Simulasi Suhu Dinamis berdasarkan Truk yang dipilih
    // 🌟 FIX 2: Sesuaikan ID truk
    const truckId = selectedTruck?.vehicle_id || selectedTruck?.id || 1;
    const mockTemp = selectedTruck ? (2.1 + (truckId % 3) * 0.5).toFixed(1) : "2.4";
    const isTempWarning = parseFloat(mockTemp) > 4.0; // Sesuai threshold di Settings

    // 🌟 TAMENG PELINDUNG: Kalau data masih loading atau kosong, kasih tau user dengan sopan
    const activeFleetCount = Array.isArray(fleetList) ? fleetList.filter(t => t.status === 'Available').length : 0;
    const maintenanceCount = Array.isArray(fleetList) ? fleetList.filter(t => t.status === 'Maintenance').length : 0;
    const totalFleet = Array.isArray(fleetList) ? fleetList.length : 0;

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            <Header title="Fleet Health & Cold Chain Tracking" />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Fleet</p>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold text-[#111] dark:text-white">
                                    {loading ? '...' : activeFleetCount} 
                                    <span className="text-base font-normal text-slate-400 ml-1">/ {totalFleet || 7}</span>
                                </h3>
                                <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">check_circle</span>Optimal
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Fuel Efficiency</p>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold text-[#111] dark:text-white">8.2 <span className="text-base font-normal text-slate-400">km/L</span></h3>
                                <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">trending_up</span>+0.5%
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Trucks in Maintenance</p>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold text-[#111] dark:text-white">
                                    {loading ? '...' : maintenanceCount || 0} 
                                </h3>
                                <span className="text-rose-500 text-sm font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">build</span>Workshop
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cold Chain Breach</p>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold text-[#111] dark:text-white">0 <span className="text-base font-normal text-slate-400">Incidents</span></h3>
                                <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">Safe</span>
                            </div>
                        </div>
                    </div>

                    {/* Fleet Table */}
                    <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden flex flex-col flex-1">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between bg-slate-50/50 dark:bg-[#111111]">
                            <h3 className="font-bold text-lg text-[#111] dark:text-white">Fleet Status & Telematics</h3>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 border border-slate-200 dark:border-[#333] text-slate-500 dark:text-slate-400 rounded hover:bg-slate-50 dark:hover:bg-[#1a1a1a] text-xs font-bold transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">filter_list</span> Filter
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left min-w-[800px] border-collapse">
                                <thead className="bg-slate-50 dark:bg-[#1a1a1a] sticky top-0 z-10 border-b border-slate-200 dark:border-[#333]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Truck ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Model</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">License Plate</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mileage (KM)</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fuel Economy</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">Menarik Data Armada dari Server...</td>
                                        </tr>
                                    ) : !Array.isArray(fleetList) || fleetList.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">Data Truk Belum Ada / Database Kosong!</td>
                                        </tr>
                                    ) : (
                                        fleetList.map((truck, idx) => {
                                            // 🌟 FIX 3: Nyesuain nama variabel sama database Backend lu
                                            const t_id = truck.vehicle_id || truck.id;
                                            const t_model = truck.type || truck.model || '-';
                                            const t_plate = truck.license_plate || truck.plateNumber || '-';
                                            const t_km = truck.current_km || truck.kmAwalHariIni || 0;
                                            const t_status = truck.status || 'Available';
                                            
                                            const isSelected = selectedTruck?.vehicle_id === t_id || selectedTruck?.id === t_id;

                                            return (
                                                <tr 
                                                    key={idx} 
                                                    onClick={() => setSelectedTruck(truck)}
                                                    className={`hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                >
                                                    <td className={`px-6 py-4 font-bold ${isSelected ? 'text-primary' : 'text-[#111] dark:text-slate-300'}`}>
                                                        TRK-{String(t_id).padStart(3, '0')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[#111] dark:text-white">{t_model}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[#111] dark:text-white">{t_plate}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{t_km.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-[#333] rounded-full overflow-hidden">
                                                                <div className="bg-primary h-full" style={{ width: `${10 + ((idx * 15) % 60)}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-[#111] dark:text-white">{12.0 + (idx % 4)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wide border ${
                                                            t_status === 'Available' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 
                                                            t_status === 'Maintenance' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' : 
                                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                        }`}>
                                                            {t_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* KANAN: SELECTED TRUCK & COLD CHAIN TELEMATICS PANEL */}
                <aside className="w-full lg:w-80 bg-white dark:bg-[#111111] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-[#333] p-6 overflow-y-auto shrink-0 space-y-8 flex flex-col h-full custom-scrollbar">
                    
                    {/* Panel Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Telematics Connected</span>
                            </div>
                            <h4 className="text-2xl font-black text-[#111] dark:text-white leading-none mb-1">
                                TRK-{String(truckId).padStart(3, '0')}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                {selectedTruck?.license_plate || selectedTruck?.plateNumber || 'B 9044 JXS'} • {selectedTruck?.type || selectedTruck?.model || 'Isuzu ELF'}
                            </p>
                        </div>
                        <div className="relative inline-block text-left">
                            <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="p-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-lg hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-sm">more_vert</span>
                            </button>
                            {isActionMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] z-20 overflow-hidden">
                                    <div className="py-1">
                                        <button onClick={() => { alert('Assign Driver'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">person_add</span> Ganti Supir
                                        </button>
                                        <button onClick={() => { alert('Report Issue'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">build</span> Servis Berkala
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PENGGANTI HEALTH RADAR: COLD CHAIN SENSORS */}
                    <div className="space-y-3">
                        <h5 className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Live Chiller Telematics</h5>
                        
                        {/* Suhu Freezer */}
                        <div className={`p-5 rounded-xl border ${isTempWarning ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`flex items-center gap-1.5 ${isTempWarning ? 'text-rose-600' : 'text-blue-600'}`}>
                                    <span className="material-symbols-outlined text-sm">ac_unit</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Box Temperature</span>
                                </div>
                                {isTempWarning && <span className="material-symbols-outlined text-rose-500 text-sm animate-bounce">warning</span>}
                            </div>
                            <div className="flex items-end gap-2">
                                <span className={`text-4xl font-black tracking-tighter ${isTempWarning ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                    {mockTemp}°
                                </span>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">C</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-2">TARGET: &lt; 4.0 °C</p>
                        </div>

                        {/* Grid Sensor Lainnya */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex flex-col gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-[18px]">mode_fan</span>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compressor</p>
                                    <p className="text-xs font-bold text-[#111] dark:text-white">ACTIVE (ON)</p>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex flex-col gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-[18px]">satellite_alt</span>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GPS Signal</p>
                                    <p className="text-xs font-bold text-[#111] dark:text-white">STRONG</p>
                                </div>
                            </div>
                            <div className="col-span-2 p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">door_back</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Box Door Status</span>
                                </div>
                                <span className="px-2 py-1 bg-slate-200 dark:bg-[#333] text-[#111] dark:text-white text-[10px] font-bold rounded flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">lock</span> LOCKED
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pembatas */}
                    <div className="h-px bg-slate-200 dark:bg-[#333] w-full"></div>

                    {/* Fuel & Expenses Log */}
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Fuel Expenses Log</h5>
                            <button className="text-[10px] font-bold text-primary hover:underline">View All</button>
                        </div>
                        <div className="space-y-2">
                            <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex items-center justify-between transition-colors hover:border-primary/30">
                                <div>
                                    <p className="text-xs font-bold text-[#111] dark:text-white">24 Feb 2026</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">45 L • Shell Pertamina</p>
                                </div>
                                <p className="text-xs font-black text-primary">Rp 450.500</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex items-center justify-between transition-colors hover:border-primary/30">
                                <div>
                                    <p className="text-xs font-bold text-[#111] dark:text-white">18 Feb 2026</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">42 L • SPBU 34.12</p>
                                </div>
                                <p className="text-xs font-black text-primary">Rp 420.200</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    <button onClick={() => alert("Input Resi Bensin via E-POD Supir!")} className="w-full py-3.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">local_gas_station</span>
                        Input Resi Bensin (Manual)
                    </button>
                </aside>
            </div>
        </div>
    );
}