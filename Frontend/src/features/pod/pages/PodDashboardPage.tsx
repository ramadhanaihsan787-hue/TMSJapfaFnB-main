import React from 'react';
import Header from "../../../shared/components/Header";
import { usePod } from '../hooks/usePod'; 

export default function PodDashboardPage() {
    const { orders, isLoading, error } = usePod();

    return (
        <React.Fragment>
            <Header title="Daily POD Verification Dashboard" />

            <div className="p-8 flex flex-col gap-8">
                {/* KPI Cards Row */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Verification</span>
                            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg text-primary">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {isLoading ? '...' : orders.length}
                            </h3>
                            <span className="text-slate-400 text-sm font-bold flex items-center">
                                Queue
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Requires manual review</p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auto-Verified</span>
                            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-500 dark:text-green-400">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">85.4%</h3>
                            <span className="text-green-500 dark:text-green-400 text-sm font-bold flex items-center">
                                <span className="material-symbols-outlined text-xs">arrow_upward</span> 2.1%
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">System approved PODs</p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected PODs</span>
                            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-500 dark:text-red-400">
                                <span className="material-symbols-outlined">cancel</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">24</h3>
                            <span className="text-red-500 dark:text-red-400 text-sm font-bold flex items-center">
                                <span className="material-symbols-outlined text-xs">arrow_upward</span> 5
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Today's invalid submissions</p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Processing</span>
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500 dark:text-blue-400">
                                <span className="material-symbols-outlined">speed</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">1.2 <span className="text-xl">mins</span></h3>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Per manual verification</p>
                    </div>
                </div>

                {/* Middle Section: Verification Queue */}
                <div className="flex gap-6">
                    <div className="w-full bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Needs Manual Verification</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Review driver submitted proof of deliveries</p>
                            </div>
                            <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors">
                                Start Queue
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                                        <th className="pb-3 font-semibold whitespace-nowrap">Resi Number</th>
                                        {/* 🌟 TAMBAH: Kolom Customer dan Berat */}
                                        <th className="pb-3 font-semibold whitespace-nowrap">Customer / Toko</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">Berat</th>
                                        
                                        <th className="pb-3 font-semibold whitespace-nowrap">Driver</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">Time Uploaded</th>
                                        <th className="pb-3 font-semibold whitespace-nowrap">Status</th>
                                        <th className="pb-3 font-semibold text-right whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                                    
                                    {/* 🌟 Colspan diubah jadi 7 karena kolomnya nambah */}
                                    {isLoading && (
                                        <tr><td colSpan={7} className="py-8 text-center text-slate-500 font-bold">Menyedot data dari server... ⏳</td></tr>
                                    )}

                                    {error && (
                                        <tr><td colSpan={7} className="py-8 text-center text-red-500 font-bold">🚨 {error}</td></tr>
                                    )}

                                    {!isLoading && !error && orders.length === 0 && (
                                        <tr><td colSpan={7} className="py-8 text-center text-slate-500 font-bold">🎉 Hore! Antrean kosong, gaada kerjaan!</td></tr>
                                    )}

                                    {!isLoading && !error && orders.map((order) => (
                                        <tr key={order.order_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 font-bold text-primary whitespace-nowrap">{order.order_id}</td>
                                            
                                            {/* 🌟 TAMBAH: Data Customer dan Berat dengan min-width biar proporsional */}
                                            <td className="py-4 min-w-[200px] font-medium">{order.customer_name}</td>
                                            <td className="py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{order.weight_total} KG</td>
                                            
                                            <td className="py-4 text-slate-500 italic whitespace-nowrap">Menunggu Supir...</td>
                                            <td className="py-4 text-slate-500 whitespace-nowrap">-</td>
                                            
                                            <td className="py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    order.status === 'do_verified' 
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' 
                                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                                                }`}>
                                                    {order.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            
                                            <td className="py-4 text-right whitespace-nowrap">
                                                <button className="text-primary hover:text-primary/80 font-semibold px-3 py-1 border border-primary/20 rounded-md transition-colors">
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}