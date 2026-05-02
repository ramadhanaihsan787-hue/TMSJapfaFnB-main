// src/features/finance/pages/KasirDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useExpenses } from '../hooks/useExpenses';
import { FLEET_DATA, DRIVER_NAMES, HELPER_NAMES, formatRp } from '../constants';
import type { ExpenseEntry } from '../types';

export default function KasirDashboard() {
    const topRef = useRef<HTMLDivElement>(null);
    
    // 🌟 SUNTIKAN HOOK SAKTI KITA!
    const { entries, isLoading, fetchToday, saveEntry, deleteEntry } = useExpenses();

    // Form states
    const [selectedFleetIdx, setSelectedFleetIdx] = useState(0);
    const [isOncall, setIsOncall] = useState(false);
    const [oncallPlate, setOncallPlate] = useState('');
    const [selectedDriver, setSelectedDriver] = useState(DRIVER_NAMES[0]);
    const [customDriver, setCustomDriver] = useState('');
    const [selectedHelper, setSelectedHelper] = useState('');
    const [customHelper, setCustomHelper] = useState('');
    
    const [bbm, setBbm] = useState('');
    const [tol, setTol] = useState('');
    const [parkir, setParkir] = useState('');
    const [parkirLiar, setParkirLiar] = useState('');
    const [kuliAngkut, setKuliAngkut] = useState('');
    const [lainLain, setLainLain] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [detailEntry, setDetailEntry] = useState<ExpenseEntry | null>(null);

    const fleet = FLEET_DATA[selectedFleetIdx];
    const currentPlate = isOncall ? oncallPlate : fleet.plate;
    const currentDriver = selectedDriver === '__custom__' ? customDriver : selectedDriver;
    const currentHelper = selectedHelper === '__custom__' ? customHelper : selectedHelper;

    const n = (v: string | number) => Number(v) || 0;
    const total = n(bbm) + n(tol) + n(parkir) + n(parkirLiar) + n(kuliAngkut) + n(lainLain);

    // Ambil data hari ini saat halaman pertama dibuka
    useEffect(() => {
        fetchToday();
    }, []);

    const resetForm = () => {
        setBbm(''); setTol(''); setParkir(''); setParkirLiar('');
        setKuliAngkut(''); setLainLain('');
        setSelectedDriver(DRIVER_NAMES[0]); setCustomDriver('');
        setSelectedHelper(''); setCustomHelper('');
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (n(bbm) === 0 && n(tol) === 0 && n(parkir) === 0) {
            toast.error('Minimal salah satu biaya (BBM, Tol, atau Parkir) wajib diisi!');
            return;
        }
        if (!currentPlate || !currentDriver) {
            toast.error('Plat nomor dan nama driver wajib diisi!');
            return;
        }
        if (total === 0) return;

        const now = new Date();
        const originalEntry = editingId ? entries.find(e => e.id === editingId) : null;
        
        const payload: ExpenseEntry = {
            id: editingId || undefined,
            time: originalEntry ? originalEntry.time : now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            date: originalEntry ? originalEntry.date : now.toISOString().split('T')[0],
            plate: currentPlate,
            vehicleType: isOncall ? 'Oncall' : fleet.type,
            driver: currentDriver,
            isOncall,
            bbm: n(bbm), tol: n(tol), parkir: n(parkir),
            parkirLiar: n(parkirLiar), kuliAngkut: n(kuliAngkut), lainLain: n(lainLain),
            helperName: currentHelper, notes: '', total
        };

        // 🌟 Tembak fungsi save di hook
        const success = await saveEntry(payload);
        if (success) {
            resetForm();
            fetchToday();
        }
    };

    const handleEdit = (entry: ExpenseEntry) => {
        setEditingId(entry.id!);
        const idx = FLEET_DATA.findIndex(f => f.plate === entry.plate);
        if (idx >= 0) { setSelectedFleetIdx(idx); setIsOncall(false); }
        else { setIsOncall(true); setOncallPlate(entry.plate); }
        
        if (DRIVER_NAMES.includes(entry.driver)) { setSelectedDriver(entry.driver); }
        else { setSelectedDriver('__custom__'); setCustomDriver(entry.driver); }
        
        if (!entry.helperName) { setSelectedHelper(''); }
        else if (HELPER_NAMES.includes(entry.helperName)) { setSelectedHelper(entry.helperName); }
        else { setSelectedHelper('__custom__'); setCustomHelper(entry.helperName); }
        
        setBbm(entry.bbm ? String(entry.bbm) : '');
        setTol(entry.tol ? String(entry.tol) : '');
        setParkir(entry.parkir ? String(entry.parkir) : '');
        setParkirLiar(entry.parkirLiar ? String(entry.parkirLiar) : '');
        setKuliAngkut(entry.kuliAngkut ? String(entry.kuliAngkut) : '');
        setLainLain(entry.lainLain ? String(entry.lainLain) : '');
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        // 🌟 Tembak fungsi delete di hook
        const success = await deleteEntry(id);
        if (success) fetchToday();
    };

    return (
        <div ref={topRef} className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* KIRI: Formulir Input */}
                <div className="flex-1 space-y-8 min-w-0">
                    <div className="mb-2">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            Operational Expense Entry
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Input daily costs for fleet operations and deliveries.
                        </p>
                    </div>

                    <section className="bg-white dark:bg-[#111111] p-6 lg:p-8 rounded-xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fleet Information</h2>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox" checked={isOncall}
                                    onChange={e => setIsOncall(e.target.checked)}
                                    className="w-5 h-5 rounded text-primary focus:ring-primary/30 border-slate-300 dark:border-white/20 bg-white dark:bg-[#1A1A1A] transition-all"
                                />
                                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">TRUK ONCALL</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {isOncall ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Nopol Truk Oncall</label>
                                    <input
                                        type="text" placeholder="Contoh: B 1234 XYZ"
                                        value={oncallPlate} onChange={e => setOncallPlate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#1A1A1A] border-none rounded-lg py-4 px-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Nopol Armada</label>
                                    <div className="relative">
                                        <select
                                            value={selectedFleetIdx} onChange={e => setSelectedFleetIdx(Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-[#1A1A1A] border-none rounded-lg py-4 px-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                                        >
                                            {FLEET_DATA.map((f, i) => (
                                                <option key={f.plate} value={i}>{f.plate} — {f.type}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-4 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Driver</label>
                                <div className="relative">
                                    <select
                                        value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#1A1A1A] border-none rounded-lg py-4 px-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                                    >
                                        {DRIVER_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                                        <option value="__custom__">— Driver Pengganti —</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                                {selectedDriver === '__custom__' && (
                                    <input type="text" placeholder="Ketik nama driver" value={customDriver} onChange={e => setCustomDriver(e.target.value)}
                                        className="w-full mt-2 bg-slate-50 dark:bg-[#1A1A1A] border-none rounded-lg py-3 px-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Helper (Optional)</label>
                                <div className="relative">
                                    <select
                                        value={selectedHelper} onChange={e => setSelectedHelper(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#1A1A1A] border-none rounded-lg py-4 px-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                                    >
                                        <option value="">— Tidak ada helper —</option>
                                        {HELPER_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                                        <option value="__custom__">— Helper Pengganti —</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                                {selectedHelper === '__custom__' && (
                                    <input type="text" placeholder="Ketik nama helper" value={customHelper} onChange={e => setCustomHelper(e.target.value)}
                                        className="w-full mt-2 bg-slate-50 dark:bg-[#1A1A1A] border-none rounded-lg py-3 px-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30" />
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#111111] p-6 lg:p-8 rounded-xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Operational Expenses</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: 'gas_meter', label: 'BBM (Solar)', value: bbm, set: setBbm },
                                { icon: 'add_road', label: 'Tol', value: tol, set: setTol },
                                { icon: 'local_parking', label: 'Parkir Resmi', value: parkir, set: setParkir },
                                { icon: 'error_outline', label: 'Parkir Liar', value: parkirLiar, set: setParkirLiar },
                                { icon: 'group', label: 'Kuli Angkut/DLL', value: kuliAngkut, set: setKuliAngkut },
                                { icon: 'more_horiz', label: 'Helper Harian', value: lainLain, set: setLainLain },
                            ].map(field => (
                                <div key={field.label} className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-xl space-y-2 transition-all hover:bg-slate-100 dark:hover:bg-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-primary text-xl">{field.icon}</span>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{field.label}</label>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500 text-sm">Rp</span>
                                        <input
                                            type="text" inputMode="numeric" placeholder="0" 
                                            value={field.value ? new Intl.NumberFormat('id-ID').format(Number(String(field.value).replace(/[^0-9]/g, ''))) : ''}
                                            onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); field.set(v); }}
                                            className="w-full bg-transparent border-none focus:ring-0 pl-12 font-display text-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* KANAN: Summary Breakdown */}
                <aside className="w-full lg:w-96 sticky top-28 space-y-6 shrink-0">
                    <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#994700] to-[#FF7A00] p-6 text-white">
                            <h3 className="font-extrabold text-xl tracking-tight">Summary Breakdown</h3>
                            <p className="text-white/80 text-sm mt-1">Review expenses before submitting</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-500 dark:text-slate-400">Fleet Plate</span>
                                <span className="font-bold text-slate-900 dark:text-white">{currentPlate || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-500 dark:text-slate-400">Driver</span>
                                <span className="font-bold text-slate-900 dark:text-white">{currentDriver || '—'}</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />

                            {[
                                ['BBM (Solar)', bbm], ['Total Tol', tol],
                                ['Parkir Resmi', parkir], ['Parkir Liar', parkirLiar],
                                ['Kuli Angkut', kuliAngkut], ['Lain-lain', lainLain]
                            ].map(([label, val]) => (
                                <div key={label as string} className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{formatRp(n(val as string))}</span>
                                </div>
                            ))}

                            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Grand Total</span>
                                    <span className="text-3xl font-black text-primary">{formatRp(total)}</span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={total === 0 || isLoading}
                                    className="w-full bg-gradient-to-r from-[#994700] to-[#FF7A00] disabled:opacity-40 disabled:cursor-not-allowed text-white py-5 rounded-lg font-extrabold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <span>{isLoading ? 'Menyimpan...' : (editingId ? 'Update Biaya' : 'Submit Biaya')}</span>
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                                {editingId && (
                                    <button onClick={resetForm} className="w-full mt-3 py-3 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                        Batal Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* TABEL: Input Terakhir Hari Ini */}
            <section className="mt-12 bg-white dark:bg-[#111111] rounded-xl shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Input Terakhir Hari Ini</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {entries.length} entry tercatat hari ini — Total: {formatRp(entries.reduce((s, e) => s + e.total, 0))}
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Time</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Plate</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Driver</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Expense</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {isLoading && entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                        <span className="material-symbols-outlined text-5xl mb-4 block animate-spin">refresh</span>
                                        <p className="font-semibold">Memuat data dari server...</p>
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                        <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">receipt_long</span>
                                        <p className="font-semibold">Belum ada data</p>
                                    </td>
                                </tr>
                            ) : entries.slice(0, 10).map((e, i) => (
                                <tr key={e.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}`}>
                                    <td className="py-5 px-6 font-medium text-slate-700 dark:text-slate-300">{e.time}</td>
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
                                    <td className="py-5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-full">
                                                <span className="material-symbols-outlined text-xl">edit_note</span>
                                            </button>
                                            <button onClick={() => handleDelete(e.id!)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full">
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
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