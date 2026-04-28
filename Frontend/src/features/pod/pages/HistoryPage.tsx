import React, { useState } from "react";
import Header from "../../../shared/components/Header";
import ActionMenu from "../components/ActionMenu";
import { usePod } from '../hooks/usePod'; // 🌟 Mesin sedot data

export default function HistoryPage() {
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [openActionId, setOpenActionId] = useState<number | null>(null);

    // 🌟 Sedot semua data DO
    const { orders, isLoading, error } = usePod();

    // 🌟 Filter murni untuk data riwayat (Selesai atau Gagal)
    // Asumsi status lu: 'pod_verified' (Success) atau 'do_failed' (Return)
    const historyOrders = orders.filter(o => 
        o.status === 'pod_verified' || o.status === 'do_failed'
    );

    // Hitung statistik harian (Contoh)
    const totalDocs = historyOrders.length;
    const successDocs = historyOrders.filter(o => o.status === 'pod_verified').length;
    const failedDocs = totalDocs - successDocs;
    const efficiency = totalDocs === 0 ? 0 : ((successDocs / totalDocs) * 100).toFixed(1);

    // Get today's date format
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <React.Fragment>
            <Header title="Riwayat & Arsip Dokumen" />

            <div className="p-8 space-y-6">
                {/* Toolbar (Tetep persis desain lu) */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Periode</span>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#222] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-sm text-slate-500">calendar_today</span>
                            <span className="text-sm font-medium dark:text-slate-300">Bulan Ini</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                        <select className="bg-slate-50 dark:bg-[#222] dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-primary focus:border-primary transition-colors outline-none px-3 py-2">
                            <option>Semua Status</option>
                            <option>Selesai (Success)</option>
                            <option>Gagal (Failed)</option>
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Cari Data</span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#222] dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary transition-colors outline-none" placeholder="Cari No. DO, Nama Toko, atau Driver..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-end self-stretch relative">
                        <button onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-all h-[42px] cursor-pointer active:scale-95">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Unduh Laporan
                        </button>
                        {isDownloadMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl shadow-lg z-20 overflow-hidden text-left">
                                <div className="p-2 flex flex-col gap-1">
                                    <button onClick={() => alert('Fitur Export segera hadir!')} className="flex items-center gap-3 p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222] hover:text-primary rounded-lg transition-colors active:scale-95 text-left font-medium">
                                        <span className="material-symbols-outlined text-[18px]">summarize</span> Excel (CSV)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🌟 Daily Summary Card - SEKARANG LIVE DARI DATA! */}
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined">fact_check</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{today}</h3>
                            <p className="text-slate-600 dark:text-slate-300 font-medium">
                                {isLoading ? '...' : `${successDocs}/${totalDocs} Document Riwayat.`} 
                                {failedDocs > 0 && <span className="text-red-500 ml-1">{failedDocs} Returns</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase font-bold">Total Efisiensi</div>
                            <div className="text-2xl font-black text-primary">{isLoading ? '...' : `${efficiency}%`}</div>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#222]/80 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No. Delivery Order</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nama Toko</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Driver</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Berat Barang</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                
                                {isLoading && (
                                    <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-bold">Menarik arsip data... ⏳</td></tr>
                                )}
                                {error && (
                                    <tr><td colSpan={6} className="py-8 text-center text-red-500 font-bold">🚨 {error}</td></tr>
                                )}
                                {!isLoading && !error && historyOrders.length === 0 && (
                                    <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-medium italic">Belum ada riwayat dokumen yang selesai atau gagal.</td></tr>
                                )}

                                {/* 🌟 LOOPING DATA RIWAYAT ASLI */}
                                {!isLoading && !error && historyOrders.map((order, idx) => {
                                    const isSuccess = order.status === 'pod_verified';
                                    
                                    return (
                                        <tr key={order.order_id} className="hover:bg-slate-50 dark:hover:bg-[#222]/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-primary whitespace-nowrap">{order.order_id}</td>
                                            <td className="px-6 py-4 text-sm dark:text-slate-300 min-w-[200px]">{order.customer_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 italic whitespace-nowrap">Menunggu Supir...</td>
                                            <td className="px-6 py-4 text-sm dark:text-slate-300 whitespace-nowrap">{order.weight_total} KG</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isSuccess ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Success</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed (Return)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <ActionMenu 
                                                    id={idx as any} 
                                                    currentOpenId={openActionId} 
                                                    setOpenId={setOpenActionId} 
                                                    items={[
                                                        { icon: 'description', label: 'Lihat Arsip e-POD', onClick: () => alert('Buka Arsip: ' + order.order_id) }
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Menampilkan {historyOrders.length} data riwayat</span>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}