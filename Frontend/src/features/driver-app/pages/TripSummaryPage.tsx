import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappButton } from '../components';

export default function TripSummaryPage() {
    const { endTrip } = useDriverappFlow();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="Trip Summary" />
            <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center">
                <div className="bg-white dark:bg-[#2c2e33] rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-8 w-full">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[80px] font-bold">thumb_up</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold dark:text-white leading-tight">Pengiriman Selesai!</h2>
                        <p className="text-sm font-medium text-slate-400">Kerja bagus untuk hari ini.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary mb-2">route</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jarak</p>
                            <p className="text-2xl font-bold text-primary">45 KM</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary mb-2">check_circle</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selesai</p>
                            <p className="text-2xl font-bold text-primary">15 / 15</p>
                        </div>
                    </div>
                    <div className="w-full pt-4">
                        <DriverappButton onClick={endTrip} text="AKHIRI PERJALANAN" />
                    </div>
                </div>
            </main>
        </div>
    );
}