// src/features/finance/pages/KasirHistory.tsx
import React, { useState, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { formatRp } from '../constants';
import type { ExpenseEntry } from '../types';

export default function KasirHistory() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [detailEntry, setDetailEntry] = useState<ExpenseEntry | null>(null);

    // 🌟 SUNTIKAN HOOK SAKTI KITA!
    const { entries, isLoading, fetchHistory } = useExpenses();

    useEffect(() => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, []);

    // Auto-fetch setiap tanggal di-ubah
    useEffect(() => {
        if (startDate && endDate) {
            fetchHistory(startDate, endDate);
        }
    }, [startDate, endDate]);

    const totalExpense = entries.reduce((sum, e) => sum + e.total, 0);

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Riwayat Cost</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        Filter dan tinjau riwayat input biaya operasional.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Tanggal Awal
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="w-full sm:w-auto bg-gradient-to-r from-[#994700] to-[#FF7A00] px-8 py-3 rounded-lg text-white shadow-lg flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-white/80">summarize</span>
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 leading-none">Total Filter</span>
                                <span className="font-extrabold text-lg leading-none mt-1">{formatRp(totalExpense)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date / Time</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Plate</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Driver</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Expense</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                        <span className="material-symbols-outlined text-5xl mb-4 block animate-spin">refresh</span>
                                        <p className="font-semibold">Memuat data dari server...</p>
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                        <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">history</span>
                                        <p className="font-semibold">Tidak ada data untuk rentang tanggal ini</p>
                                    </td>
                                </tr>
                            ) : entries.map((e, i) => (
                                <tr key={e.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}`}>
                                    <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-300">
                                        <div>{new Date(e.date).toLocaleDateString('id-ID')}</div>
                                        <div className="text-xs text-slate-400">{e.time}</div>
                                    </td>
                                    <td className="py-5 px-6 font-bold text-slate-900 dark:text-white">
                                        {e.plate}
                                        {e.isOncall && <span className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">ONCALL</span>}
                                    </td>
                                    <td className="py-5 px-6 text-slate-600 dark:text-slate-400">{e.driver}</td>
                                    <td className="py-5 px-6 font-bold text-slate-900 dark:text-white cursor-pointer hover:text-primary transition-colors" onClick={() => setDetailEntry(e)}>
                                        <div className="flex items-center gap-2">
                                            {formatRp(e.total)}
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail Biaya */}
            {detailEntry && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setDetailEntry(null)}>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
                        <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Rincian Biaya</h3>
                            <button onClick={() => setDetailEntry(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm mb-4">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Armada / Waktu</p>
                                    <p className="font-bold text-slate-900 dark:text-white mt-1">{detailEntry.plate} • {detailEntry.time} ({new Date(detailEntry.date).toLocaleDateString('id-ID')})</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Driver</p>
                                    <p className="font-bold text-slate-900 dark:text-white mt-1">{detailEntry.driver}</p>
                                </div>
                            </div>
                            {detailEntry.helperName && (
                                <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Helper</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{detailEntry.helperName}</span>
                                </div>
                            )}
                            <div className="space-y-3">
                                {[
                                    { label: 'BBM (Solar)', val: detailEntry.bbm },
                                    { label: 'Total Tol', val: detailEntry.tol },
                                    { label: 'Parkir Resmi', val: detailEntry.parkir },
                                    { label: 'Parkir Liar', val: detailEntry.parkirLiar },
                                    { label: 'Kuli Angkut/DLL', val: detailEntry.kuliAngkut },
                                    { label: 'Helper Harian', val: detailEntry.lainLain }
                                ].map(item => item.val > 0 && (
                                    <div key={item.label} className="flex justify-between text-sm items-center">
                                        <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{formatRp(item.val)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                <span className="font-bold text-slate-500 dark:text-slate-400">Grand Total</span>
                                <span className="text-2xl font-black text-primary">{formatRp(detailEntry.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}