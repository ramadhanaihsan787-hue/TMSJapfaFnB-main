import type { Customer } from '../types';
import CustomerActionMenu from './CustomerActionMenu';

interface CustomerTableRowProps {
    customer: Customer;
    openActionId: string | null;
    setOpenActionId: (id: string | null) => void;
    onEdit: (customer: Customer) => void;
}

export default function CustomerTableRow({ customer, openActionId, setOpenActionId, onEdit }: CustomerTableRowProps) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-[#222] transition-colors group">
            <td className="px-6 py-4 text-xs font-bold font-mono text-[#FF7A00]">{customer.code}</td>
            <td className="px-6 py-4">
                <span className="text-sm font-bold text-slate-900 dark:text-white block">{customer.name}</span>
                <span className="text-[10px] text-slate-500">{customer.tier || 'Retailer • Tier 1'}</span>
            </td>
            <td className="px-6 py-4">
                {customer.status === 'Active' ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide">Active</span>
                ) : (
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide">Inactive</span>
                )}
            </td>
            <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">{customer.admin}</td>
            <td className="px-6 py-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">{customer.address}</p>
            </td>
            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{customer.district}</td>
            <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{customer.city}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                    <span>{customer.lat}° S</span>
                    <span>{customer.lon}° E</span>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <CustomerActionMenu 
                    customerId={customer.code} 
                    openId={openActionId} 
                    setOpenId={setOpenActionId} 
                    onEdit={() => onEdit(customer)} 
                />
            </td>
        </tr>
    );
}