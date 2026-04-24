import type { RejectionData } from "../hooks/useDashboardData";

interface RejectionListProps {
    rejections: RejectionData[];
    isLoading: boolean;
}

export default function RejectionList({ rejections, isLoading }: RejectionListProps) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Rejection Reasons</h3>
                <span className="text-xs text-slate-400 font-medium">Month to Date</span>
            </div>
            <div className="space-y-6">
                {isLoading ? (
                    <span className="font-bold text-slate-400 text-sm">Menarik data retur...</span>
                ) : Array.isArray(rejections) && rejections.length === 0 ? (
                    <span className="font-bold text-slate-400 text-sm">Belum ada laporan barang diretur hari ini.</span>
                ) : (
                    Array.isArray(rejections) && rejections.map((item, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.reason}</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}