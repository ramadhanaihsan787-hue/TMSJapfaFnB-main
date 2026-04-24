import type { DriverPerformance } from '../types';

interface DriverTableRowProps {
    driver: DriverPerformance;
}

export default function DriverTableRow({ driver }: DriverTableRowProps) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-[#1A1A1A] transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {driver.driver_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-[#111] dark:text-slate-200">{driver.driver_name}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{driver.total_trips}</td>
            <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-[#333] rounded-full overflow-hidden w-24">
                        <div
                            className={`h-full ${driver.on_time_rate > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${driver.on_time_rate}%` }}
                        ></div>
                    </div>
                    <span className="font-bold text-[#111] dark:text-slate-200">{driver.on_time_rate}%</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-right font-bold text-primary">{driver.fuel_rating}</td>
        </tr>
    );
}