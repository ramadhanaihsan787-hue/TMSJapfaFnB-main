export default function DriverProgress() {
    return (
        <div className="bg-white dark:bg-[#2c2e33] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl font-bold">route</span>
                <h4 className="text-lg font-bold dark:text-white">Route Progress</h4>
            </div>
            
            <div className="flex justify-between items-end mb-2">
                <p className="text-2xl font-bold dark:text-white">0 <span className="text-slate-400 text-base font-normal">of 10 visits completed</span></p>
                <p className="text-xl font-bold text-primary">0%</p>
            </div>
            
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: '5%' }}></div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Distance</span>
                    <span className="text-lg font-bold dark:text-white">124 km</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Est. Time</span>
                    <span className="text-lg font-bold dark:text-white">4h 30m</span>
                </div>
            </div>
        </div>
    );
}