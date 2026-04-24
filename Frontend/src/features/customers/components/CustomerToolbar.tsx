interface CustomerToolbarProps {
    customerCount: number;
    onAdd: () => void;
}

export default function CustomerToolbar({ customerCount, onAdd }: CustomerToolbarProps) {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold dark:text-white">Data Customer Directory</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                    Managing {customerCount > 0 ? customerCount.toLocaleString() : '1,284'} verified merchant partners across Indonesia
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-4 border border-slate-200 dark:border-slate-800">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 placeholder:text-slate-400 dark:text-white outline-none"
                            placeholder="Search customer name, code or full address..."
                            type="text"
                        />
                    </div>
                </div>
                <button
                    onClick={onAdd}
                    className="bg-[#FF7A00] text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all font-bold tracking-tight">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                    Add New Customer
                </button>
            </div>
        </>
    );
}