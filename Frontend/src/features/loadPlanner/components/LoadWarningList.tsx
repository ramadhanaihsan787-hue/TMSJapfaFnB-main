import type { ActivityLogEntry } from '../types';

interface LoadWarningListProps {
    activityLog: ActivityLogEntry[];
}

export default function LoadWarningList({ activityLog }: LoadWarningListProps) {
    return (
        <div className="p-5 border-t border-slate-200 dark:border-[#333]">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Activity</h2>
            <div className="space-y-4">
                {activityLog.map((entry, i) => (
                    <div key={i} className="flex gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${entry.active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div>
                            <p className="text-[10px] font-bold leading-none text-slate-900 dark:text-white">{entry.label}</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{entry.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}