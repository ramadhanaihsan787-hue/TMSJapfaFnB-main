import { useDriverappFlow } from '../hooks/useDriverappFlow';

export default function DriverBottomNav() {
    const { goToHistory } = useDriverappFlow();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2c2e33] border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-10 py-3 pb-safe z-50">
            <div className="flex flex-col items-center gap-1 text-primary cursor-pointer">
                <span className="material-symbols-outlined">route</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Route</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer transition-colors hover:text-primary" onClick={goToHistory}>
                <span className="material-symbols-outlined">history</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer transition-colors hover:text-primary">
                <span className="material-symbols-outlined">person</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
            </div>
        </div>
    );
}