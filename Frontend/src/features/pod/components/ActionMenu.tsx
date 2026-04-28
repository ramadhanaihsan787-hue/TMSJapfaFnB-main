export interface ActionItem {
    icon: string;
    label: string;
    onClick: () => void;
}

interface ActionMenuProps {
    id: number;
    currentOpenId: number | null;
    setOpenId: (id: number | null) => void;
    items?: ActionItem[];
}

export default function ActionMenu({ id, currentOpenId, setOpenId, items }: ActionMenuProps) {
    // Menu default kalau ngga diisi dari luar
    const defaultItems: ActionItem[] = [
        { icon: 'visibility', label: 'Lihat Detail', onClick: () => alert('Lihat Detail') },
        { icon: 'picture_as_pdf', label: 'Unduh PDF', onClick: () => alert('Unduh PDF') },
        { icon: 'print', label: 'Cetak Arsip', onClick: () => alert('Cetak Arsip') },
    ];

    const displayItems = items || defaultItems;

    return (
        <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); setOpenId(currentOpenId === id ? null : id); }} 
                className="text-slate-400 hover:text-primary transition-colors cursor-pointer active:scale-95 flex items-center justify-center p-1 rounded-full ml-auto"
            >
                <span className="material-symbols-outlined">more_vert</span>
            </button>
            {currentOpenId === id && (
                <div 
                    className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl shadow-lg z-20 overflow-hidden text-left" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-2 flex flex-col">
                        {displayItems.map((item, idx) => (
                            <button 
                                key={idx} 
                                onClick={(e) => { e.stopPropagation(); item.onClick(); setOpenId(null); }} 
                                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222] hover:text-primary dark:hover:text-primary rounded-lg transition-colors text-left group active:scale-95 font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">{item.icon}</span> 
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}