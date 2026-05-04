// src/features/finance/pages/KasirHistory.tsx
import React, { useEffect, useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { formatRp } from '../constants';
import { useDateRange } from '../../../context/DateRangeContext'; // 🌟 IMPORT INI
import type { ExpenseEntry } from '../types';

export default function KasirHistory() {
    // 🌟 Tarik tanggal langsung dari Header temen lu!
    const { startDate, endDate } = useDateRange();
    
    const [detailEntry, setDetailEntry] = useState<ExpenseEntry | null>(null);
    const { entries, isLoading, fetchHistory } = useExpenses();

    // 🌟 Fetch data setiap kali kalender di Header diubah
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
                        Menampilkan data dari <span className="font-bold text-primary">{new Date(startDate).toLocaleDateString('id-ID')}</span> sampai <span className="font-bold text-primary">{new Date(endDate).toLocaleDateString('id-ID')}</span>. Ubah tanggal di pojok kanan atas layar.
                    </p>
                </div>
                
                {/* Kotak Total Expense */}
                <div className="w-full sm:w-auto bg-gradient-to-r from-[#994700] to-[#FF7A00] px-8 py-4 rounded-xl text-white shadow-lg flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <span className="material-symbols-outlined text-white text-3xl">summarize</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest text-white/80">Total Pengeluaran</span>
                        <span className="font-extrabold text-2xl">{formatRp(totalExpense)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                {/* 🌟 FORM FILTER TANGGAL LAMA UDAH DIHAPUS DARI SINI */}

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
                                        <span className="material-symbols-outlined text-5xl mb-4 block animate-spin text-primary">refresh</span>
                                        <p className="font-bold">Menarik data dari server...</p>
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 dark:text-slate-500">
                                        <div className="bg-slate-50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-4xl opacity-50">history</span>
                                        </div>
                                        <p className="font-bold text-lg text-slate-600 dark:text-slate-300">Tidak ada pengeluaran</p>
                                        <p className="text-sm mt-1">Pada rentang tanggal yang dipilih.</p>
                                    </td>
                                </tr>
                            ) : entries.map((e, i) => (
                                <tr key={e.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}`}>
                                    <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-300">
                                        <div>{new Date(e.date).toLocaleDateString('id-ID')}</div>
                                        <div className="text-xs text-slate-400 font-bold">{e.time}</div>
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

            {/* Modal Detail Biaya (Tetap Sama) */}
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
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Armada / Waktu</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{detailEntry.plate}</p>
                                    <p className="text-xs text-slate-500">{detailEntry.time} • {new Date(detailEntry.date).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Driver</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{detailEntry.driver}</p>
                                </div>
                            </div>
                            {detailEntry.helperName && (
                                <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Helper</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{detailEntry.helperName}</span>
                                </div>
                            )}
                            <div className="space-y-3 bg-slate-50 dark:bg-[#111] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                {[
                                    { label: 'BBM (Solar)', val: detailEntry.bbm },
                                    { label: 'Total Tol', val: detailEntry.tol },
                                    { label: 'Parkir Resmi', val: detailEntry.parkir },
                                    { label: 'Parkir Liar', val: detailEntry.parkirLiar },
                                    { label: 'Kuli Angkut/DLL', val: detailEntry.kuliAngkut },
                                    { label: 'Helper Harian', val: detailEntry.lainLain }
                                ].map(item => item.val > 0 && (
                                    <div key={item.label} className="flex justify-between text-sm items-center">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{formatRp(item.val)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 pt-2 flex justify-between items-center">
                                <span className="font-black uppercase tracking-widest text-slate-500">Grand Total</span>
                                <span className="text-2xl font-black text-primary">{formatRp(detailEntry.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}