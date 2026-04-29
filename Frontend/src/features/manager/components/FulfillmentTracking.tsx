import { TrendingUp, Check, Navigation } from 'lucide-react';

export default function FulfillmentTracking() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-japfa-orange/10 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-japfa-orange" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-japfa-dark dark:text-white">Live Fulfillment Tracking</h3>
                        <p className="text-[10px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-0.5">Unit: KG • Real-time Operations</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center px-6 border-r border-gray-100 dark:border-white/5">
                        <p className="text-[9px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-[0.1em] mb-1">Total Target</p>
                        <p className="text-xl font-black text-japfa-navy dark:text-blue-400">45,280 <span className="text-[10px] opacity-70 font-bold">KG</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-japfa-gray dark:text-gray-500 uppercase tracking-[0.1em] mb-1">Remaining</p>
                        <p className="text-xl font-black text-japfa-gray dark:text-gray-400">12,140 <span className="text-[10px] opacity-70 font-bold">KG</span></p>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Completed */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className="text-[11px] font-black text-japfa-dark dark:text-white uppercase tracking-widest">Completed</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">72.3%</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-emerald-500/50 transition-all">
                        <p className="text-2xl font-black text-japfa-dark dark:text-white">32,740</p>
                        <p className="text-[10px] font-bold text-japfa-gray uppercase tracking-[0.1em] mt-1 inline-flex items-center gap-1.5">
                            KG DELIVERED <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> 184 DROPS
                        </p>
                        <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>
                </div>

                {/* In-Transit */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-500" />
                            <span className="text-[11px] font-black text-japfa-dark dark:text-white uppercase tracking-widest">In-Transit</span>
                        </div>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">18.5%</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-blue-500/50 transition-all">
                        <p className="text-2xl font-black text-japfa-dark dark:text-white">8,400</p>
                        <p className="text-[10px] font-bold text-japfa-gray uppercase tracking-[0.1em] mt-1 inline-flex items-center gap-1.5">
                            KG PROGRESS <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"></span> 42 LOADS
                        </p>
                        <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[18.5%] rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}