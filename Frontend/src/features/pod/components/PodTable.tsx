import React from 'react';

interface PodTableProps {
    headers: string[];
    children: React.ReactNode;
}

export default function PodTable({ headers, children }: PodTableProps) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-[#222]/80 border-b border-slate-200 dark:border-slate-700">
                            {headers.map((header, idx) => (
                                <th 
                                    key={idx} 
                                    className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${idx === headers.length - 1 ? 'text-right' : ''}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}