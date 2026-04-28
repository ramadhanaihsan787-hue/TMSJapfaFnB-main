import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappButton } from '../components';

export default function DeliveryDetailPage() {
    const { activeStop, arriveAtLocation } = useDriverappFlow();

    // Proteksi kalau supir langsung tembak URL tanpa klik list
    if (!activeStop) return <div className="p-10 text-center">Memuat detail...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="Stop Detail" />
            <main className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-80px)]">
                <div className="bg-white dark:bg-[#2c2e33] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Customer Name</p>
                        <h3 className="text-lg font-bold dark:text-white">{activeStop.customerName}</h3>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Address</p>
                        <p className="text-sm font-medium dark:text-slate-300 leading-relaxed">
                            {activeStop.address || 'Alamat tidak tersedia di sistem.'}
                        </p>
                    </div>
                    <button className="w-full h-12 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-lg">call</span> Call PIC
                    </button>
                    <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative">
                        <img src="https://images.unsplash.com/photo-1526772662000-3f88f10c05fe?q=80" alt="Map" className="w-full h-full object-cover opacity-80"/>
                    </div>
                </div>

                <div className="mt-auto pt-8 space-y-4 pb-8">
                    <DriverappButton onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeStop.latitude},${activeStop.longitude}`)} text="BUKA GOOGLE MAPS" icon="map" variant="outline" />
                    <DriverappButton onClick={arriveAtLocation} text="SAYA SUDAH TIBA" />
                </div>
            </main>
        </div>
    );
}