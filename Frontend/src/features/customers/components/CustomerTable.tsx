import { useState } from 'react';
import type { Customer } from '../types';
import CustomerTableRow from './CustomerTableRow';

interface CustomerTableProps {
    loading: boolean;
    customers: Customer[];
    onEdit: (customer: Customer) => void;
}

export default function CustomerTable({ loading, customers, onEdit }: CustomerTableProps) {
    const [openActionId, setOpenActionId] = useState<string | null>(null);

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 dark:bg-[#222]">
                    <tr>
                        <th className="px-6 py-4"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CUST CODE<span className="material-symbols-outlined text-[14px]">filter_list</span></div></th>
                        <th className="px-6 py-4"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NAMA TOKO<span className="material-symbols-outlined text-[14px]">filter_list</span></div></th>
                        <th className="px-6 py-4"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">STATUS<span className="material-symbols-outlined text-[14px]">filter_list</span></div></th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ADMIN</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ALAMAT</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KECAMATAN/RT/RW</th>
                        <th className="px-6 py-4"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KOTA/KAB<span className="material-symbols-outlined text-[14px]">filter_list</span></div></th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">COORDINATES</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">ACTION</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {loading ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-10 text-center text-slate-500 font-bold">
                                <div className="flex justify-center items-center gap-2">
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Memuat Data Customer...
                                </div>
                            </td>
                        </tr>
                    ) : customers.length > 0 ? (
                        customers.map((cust) => (
                            <CustomerTableRow 
                                key={cust.code} 
                                customer={cust} 
                                openActionId={openActionId}
                                setOpenActionId={setOpenActionId}
                                onEdit={onEdit}
                            />
                        ))
                    ) : (
                        <tr><td colSpan={9} className="text-center py-10 font-bold text-slate-500">Belum ada customer yang terdaftar!</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}