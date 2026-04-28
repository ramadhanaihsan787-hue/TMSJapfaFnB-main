import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappCard, DriverappBottomNav } from '../components';
import type { RouteStop } from '../types';

export default function RouteListPage() {
    const { viewStopDetail } = useDriverappFlow();

    // Data Dummy (Bisa dipindah ke API nanti)
    const stops: RouteStop[] = [
        { id: 1, sequence: 0, customerName: "Gudang Pusat JAPFA", timeWindow: "04:00 - 05:30", weight: "", status: 'completed' },
        { id: 2, sequence: 1, customerName: "RS Mitra Keluarga Cikarang", timeWindow: "06:00 - 10:00", weight: "350 Kg", status: 'active' },
        { id: 3, sequence: 2, customerName: "RS Siloam Lippo Cikarang", timeWindow: "10:30 - 12:00", weight: "150 Kg", status: 'pending' },
        { id: 4, sequence: 3, customerName: "RS Harapan Keluarga", timeWindow: "13:00 - 15:00", weight: "200 Kg", status: 'pending' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="Daily Route" />
            <main className="max-w-md mx-auto px-4 py-6 space-y-4 pb-24">
                {stops.map(stop => (
                    <DriverappCard 
                        key={stop.id} 
                        stop={stop} 
                        onClick={viewStopDetail}
                        onNavigate={() => alert('Opening Navigation...')}
                    />
                ))}
            </main>
            <DriverappBottomNav />
        </div>
    );
}