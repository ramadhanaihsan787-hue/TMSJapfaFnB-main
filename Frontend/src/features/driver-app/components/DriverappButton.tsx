interface DriverButtonProps {
    onClick: () => void;
    text: string;
    icon?: string;
    variant?: 'primary' | 'outline';
}

export default function DriverButton({ onClick, text, icon, variant = 'primary' }: DriverButtonProps) {
    if (variant === 'outline') {
        return (
            <button 
                onClick={onClick}
                className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
                {icon && <span className="material-symbols-outlined text-xl">{icon}</span>}
                {text}
            </button>
        );
    }

    return (
        <button 
            onClick={onClick}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wide"
        >
            {icon && <span className="material-symbols-outlined text-2xl">{icon}</span>}
            {text}
        </button>
    );
}