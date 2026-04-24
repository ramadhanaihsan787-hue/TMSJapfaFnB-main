import type { KPISummary } from '../types';

interface KPICardsProps {
    loading: boolean;
    data?: KPISummary;
}

export default function KPICards({ loading, data }: KPICardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Shipments</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">{loading ? '...' : data?.totalShipments || 0}</h3>
                    <span className="text-slate-400 text-sm font-medium flex items-center">orders</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Load Factor (Avg)</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">{loading ? '...' : data?.loadFactor || '0%'}</h3>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Weight</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">{loading ? '...' : data?.avgLoadingTime || '0 KG'}</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Successful Deliveries (OTIF)</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-[#111] dark:text-white">{loading ? '...' : data?.otifRate || '0%'}</h3>
                </div>
            </div>
        </div>
    );
}