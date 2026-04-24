// src/features/fleet/components/TelematicsCard.tsx
import type { TelematicsData } from "../types";

interface TelematicsCardProps {
    telematics: TelematicsData | null;
}

export default function TelematicsCard({ telematics }: TelematicsCardProps) {
    if (!telematics) return null;

    return (
        <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Live Chiller Telematics</h5>
            
            {/* Suhu Freezer */}
            <div className={`p-5 rounded-xl border ${telematics.isTempWarning ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-1.5 ${telematics.isTempWarning ? 'text-rose-600' : 'text-blue-600'}`}>
                        <span className="material-symbols-outlined text-sm">ac_unit</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Box Temperature</span>
                    </div>
                    {telematics.isTempWarning && <span className="material-symbols-outlined text-rose-500 text-sm animate-bounce">warning</span>}
                </div>
                <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black tracking-tighter ${telematics.isTempWarning ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {telematics.temperature}°
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
                        <p className="text-xs font-bold text-[#111] dark:text-white">ACTIVE ({telematics.compressorStatus})</p>
                    </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex flex-col gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">satellite_alt</span>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GPS Signal</p>
                        <p className="text-xs font-bold text-[#111] dark:text-white">{telematics.gpsSignal}</p>
                    </div>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">door_back</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Box Door Status</span>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 ${telematics.doorLocked ? 'bg-slate-200 dark:bg-[#333] text-[#111] dark:text-white' : 'bg-rose-100 text-rose-600'}`}>
                        <span className="material-symbols-outlined text-[12px]">
                            {telematics.doorLocked ? 'lock' : 'lock_open'}
                        </span> 
                        {telematics.doorLocked ? 'LOCKED' : 'OPENED'}
                    </span>
                </div>
            </div>
        </div>
    );
}