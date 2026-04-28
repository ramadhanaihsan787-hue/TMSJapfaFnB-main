import type { KPICardData } from '../types';

export default function KPICard({ label, value, change, trend, icon, bgColor, iconColor, subtext }: KPICardData) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-japfa-gray dark:text-gray-400 uppercase tracking-wider">{label}</span>
                <div className={`p-2 ${bgColor} dark:bg-opacity-10 ${iconColor} rounded-lg`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-japfa-dark dark:text-white">{value}</h3>
                <span className={`text-sm font-semibold flex items-center ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    <span className="material-symbols-outlined text-sm mr-1">
                        {trend === 'up' ? 'arrow_upward' : trend === 'down' ? 'arrow_downward' : 'trending_flat'}
                    </span>
                    {change}
                </span>
            </div>
            <p className="mt-2 text-xs text-japfa-gray dark:text-gray-400">{subtext}</p>
        </div>
    );
}