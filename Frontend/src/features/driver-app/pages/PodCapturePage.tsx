import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappButton } from '../components';

export default function PodCapturePage() {
    const { submitPod } = useDriverappFlow();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="e-POD Capture" />
            <main className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-80px)]">
                <div className="bg-white dark:bg-[#2c2e33] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                    <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer active:scale-[0.98]">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl font-bold">add_a_photo</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold dark:text-white mb-1">Ambil Foto Surat Jalan</p>
                            <p className="text-[10px] text-slate-400 font-medium">Pastikan teks terlihat jelas</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div><p className="text-sm font-bold dark:text-white">Tanda Tangan</p></div>
                        </div>
                        <div className="h-48 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 flex items-center justify-center">
                            <span className="text-slate-300 dark:text-slate-700 font-bold">AREA TANDA TANGAN</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 pb-8 space-y-4">
                    <DriverappButton onClick={submitPod} text="KIRIM BUKTI (SUBMIT)" />
                    <button className="w-full py-2 text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors">
                        Lapor Kendala Pengiriman
                    </button>
                </div>
            </main>
        </div>
    );
}