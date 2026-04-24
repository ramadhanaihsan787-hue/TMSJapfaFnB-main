import type { DriverData } from '../types/types';

interface DriverExpandedRowProps {
    driver: DriverData;
}

export default function DriverExpandedRow({ driver }: DriverExpandedRowProps) {
    // Hitung persentase progress DO
    const progressPercent = driver.doTotal > 0 ? (driver.doCompleted / driver.doTotal) * 100 : 0;

    return (
        <tr className="bg-slate-50/50 dark:bg-[#111111]">
            <td className="px-6 pb-6 pt-2 border-l-2 border-primary" colSpan={6}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-sm text-primary">data_usage</span>
                    <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today's Shift Progress</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Panel 1: Distance */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Distance</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white flex items-end gap-1">
                            {driver.distanceToday} <span className="text-sm font-bold text-slate-400 mb-0.5">KM</span>
                        </p>
                    </div>

                    {/* Panel 2: DO Progress */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Delivery Progress</p>
                        <p className="text-2xl font-black text-primary flex items-end gap-1">
                            {driver.doCompleted} <span className="text-sm font-bold text-slate-400 mb-0.5">/ {driver.doTotal} DO</span>
                        </p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#333] rounded-full mt-3 overflow-hidden">
                            <div 
                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Panel 3: Last Location/EPOD */}
                    <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last E-POD Update</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white mt-2 truncate">
                            {driver.lastLocation}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {driver.lastUpdate}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}