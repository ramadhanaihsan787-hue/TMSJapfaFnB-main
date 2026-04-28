import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappButton, DriverappProgress } from '../components';
// 🌟 FIX: Import tipe data RouteStop
import { type RouteStop } from '../services/driverappService';

export default function DriverDashboardPage() {
    const { startRoute, stops, isLoading } = useDriverappFlow();
    
    // 🌟 FIX: Kasih tipe (s: RouteStop) biar ngga error 'any'
    const completedCount = stops.filter((s: RouteStop) => s.status === 'completed').length;
    const totalStops = stops.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="Dashboard" />
            <main className="max-w-md mx-auto px-4 py-6 space-y-6">
                <div className="bg-white dark:bg-[#2c2e33] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold dark:text-white mb-2">Truck ID: <span className="text-primary">B 9044 JXS</span></h3>
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold tracking-wide">
                        {isLoading ? 'MEMUAT DATA...' : 'SIAP JALAN'}
                    </div>
                    <div className="mt-6 aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
                        <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075" alt="Truck" className="w-full h-full object-cover"/>
                    </div>
                </div>

                <DriverappProgress 
                    {...({ 
                        value: totalStops > 0 ? (completedCount / totalStops) * 100 : 0 
                    } as any)} 
                />

                <div className="pt-4 pb-12">
                    <DriverappButton onClick={startRoute} text="MULAI PERJALANAN" icon="play_arrow" />
                </div>
            </main>
        </div>
    );
}