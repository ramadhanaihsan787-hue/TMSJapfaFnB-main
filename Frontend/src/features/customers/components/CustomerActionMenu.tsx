import { toast } from 'sonner'; // 🌟 SUNTIKAN SONNER

interface CustomerActionMenuProps {
    customerId: string;
    openId: string | null;
    setOpenId: (id: string | null) => void;
    onEdit: () => void;
}

export default function CustomerActionMenu({ customerId, openId, setOpenId, onEdit }: CustomerActionMenuProps) {
    const isOpen = openId === customerId;
    
    return (
        <div className="relative inline-block text-left">
            <button
                onClick={(e) => { e.stopPropagation(); setOpenId(isOpen ? null : customerId); }}
                className="material-symbols-outlined text-slate-400 hover:text-primary dark:hover:text-[#FF7A00] transition-colors text-[20px] active:scale-95 cursor-pointer"
            >
                more_vert
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#1A1A1A] ring-1 ring-black ring-opacity-5 z-10 border border-slate-200 dark:border-[#333]">
                    <div className="py-1" role="menu">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); setOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Customer
                        </button>
                        {/* 🌟 FIX CTO: Ganti alert jadi toast.info */}
                        <button onClick={(e) => { e.stopPropagation(); toast.info('Fitur View Details segera hadir!'); setOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">visibility</span> View Details
                        </button>
                        {/* 🌟 FIX CTO: Ganti alert jadi toast.warning */}
                        <button onClick={(e) => { e.stopPropagation(); toast.warning('Fitur Deactivate segera hadir!'); setOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">block</span> Deactivate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}