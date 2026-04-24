export interface KpiCardProps {
    title: string;
    value: string | number;
    unit?: string;
    subtitle: string;
    icon: string;
    iconColorClass: string;
    iconBgClass: string;
    isLoading?: boolean;
}

export default function KpiCard({
    title,
    value,
    unit,
    subtitle,
    icon,
    iconColorClass,
    iconBgClass,
    isLoading = false
}: KpiCardProps) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors hover:shadow-md hover:-translate-y-1 duration-200">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </span>
                <div className={`p-2 rounded-lg ${iconBgClass} ${iconColorClass}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>
            
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? "..." : value}
                </h3>
                {/* Kalau ada unit (kayak 'KG' atau 'orders') dan ngga lagi loading, baru ditampilin */}
                {unit && !isLoading && (
                    <span className="text-slate-400 text-sm font-medium uppercase">
                        {unit}
                    </span>
                )}
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                {subtitle}
            </p>
        </div>
    );
}