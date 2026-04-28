import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappCard, DriverappBottomNav } from '../components';

export default function RouteListPage() {
    const { tripData, isLoading, viewStopDetail } = useDriverappFlow();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="Daily Route" />
            <main className="max-w-md mx-auto px-4 py-6 space-y-4 pb-24">
                
                {isLoading && (
                    <div className="py-10 text-center text-slate-400 font-bold">Mencari tugas rute... 🚛</div>
                )}

                {!isLoading && (!tripData || tripData.stops.length === 0) && (
                    <div className="py-20 text-center space-y-4">
                        <span className="material-symbols-outlined text-6xl text-slate-300">bakery_dining</span>
                        <p className="text-slate-500 font-medium">Belum ada tugas rute untuk Anda hari ini.</p>
                    </div>
                )}

                {!isLoading && tripData?.stops.map(stop => (
                    <DriverappCard 
                        key={String(stop.id)} 
                        stop={{
                            ...stop,
                            id: typeof stop.id === 'string' ? parseInt(stop.id, 10) || 0 : stop.id,
                            status: (stop.status === 'failed' ? 'pending' : stop.status) as any
                        }} 
                        onClick={() => viewStopDetail(stop)}
                        onNavigate={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
                            window.open(url, '_blank');
                        }}
                    />
                ))}
            </main>
            <DriverappBottomNav />
        </div>
    );
}