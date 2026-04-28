import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | React.ReactNode;
    icon: string;
    subtitle?: string;
    iconBgClass?: string;
    trendNode?: React.ReactNode;
}

export default function KpiCard({ title, value, icon, subtitle, iconBgClass, trendNode }: KpiCardProps) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </span>
                <div className={`p-2 rounded-lg ${iconBgClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
                {trendNode && trendNode}
            </div>
            {subtitle && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtitle}</p>
            )}
        </div>
    );
}