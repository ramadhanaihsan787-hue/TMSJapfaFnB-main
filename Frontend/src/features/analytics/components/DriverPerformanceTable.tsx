import type { DriverPerformance } from '../types';
import DriverTableRow from './DriverTableRow';

interface DriverPerformanceTableProps {
    loading: boolean;
    drivers: DriverPerformance[];
}

export default function DriverPerformanceTable({ loading, drivers }: DriverPerformanceTableProps) {
    return (
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between">
                <h4 className="font-bold text-[#111] dark:text-white">Driver Efficiency Performance</h4>
                <button className="text-sm text-primary font-medium hover:underline">View All Drivers</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-[#0a0a0a]">
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver Name</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Trips</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">On-time Rate (%)</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Fuel Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading driver performance data...</td>
                            </tr>
                        ) : drivers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No driver data available yet.</td>
                            </tr>
                        ) : (
                            drivers.map((driver, index) => (
                                <DriverTableRow key={index} driver={driver} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}