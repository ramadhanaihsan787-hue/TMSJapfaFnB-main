import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
// 🌟 FIX CTO: Tarik data summary
import { useDriverappFlow } from '../hooks/useDriverappFlow';

const DriverTripSummary: React.FC = () => {
    const navigate = useNavigate();
    const { endTrip, tripData } = useDriverappFlow(); // 🌟 Nyawa API!
    
    const [endKm, setEndKm] = useState('');
    const [startKm, setStartKm] = useState(0);

    useEffect(() => {
        const storedStartKm = localStorage.getItem('driver_start_km');
        if (storedStartKm) {
            setStartKm(Number(storedStartKm));
        }
    }, []);

    const calculatedDistance = endKm && !isNaN(Number(endKm)) && Number(endKm) > startKm
        ? Number(endKm) - startKm
        : 0;

    const completed = tripData?.completed_stops || 0;
    const total = tripData?.total_stops || 0;

    const handleFinishTrip = () => {
        // Hapus cache KM dan panggil fungsi API endTrip
        localStorage.removeItem('driver_start_km');
        endTrip(); 
        navigate('/driver'); // Balik ke menu awal
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="Trip Summary" />
            
            <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center">
                <div className="bg-white dark:bg-[#2c2e33] rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-8 w-full">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[80px] font-bold">thumb_up</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold dark:text-white leading-tight">Pengiriman Hari Ini Selesai!</h2>
                        <p className="text-sm font-medium text-slate-400">Kerja bagus, {tripData?.driver_name || 'Driver'}. Silakan akhiri perjalanan Anda.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary mb-2">route</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Jarak</p>
                            <p className="text-2xl font-bold text-primary">{calculatedDistance > 0 ? calculatedDistance : tripData?.total_distance || 0} KM</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary mb-2">check_circle</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selesai</p>
                            <p className="text-2xl font-bold text-primary">{completed} / {total}</p>
                        </div>
                    </div>

                    <div className="w-full space-y-4 pt-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 text-left w-full">
                            <label htmlFor="endKm" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Catat Odometer Akhir (KM)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="endKm"
                                    value={endKm}
                                    onChange={(e) => setEndKm(e.target.value)}
                                    placeholder={`Awal: ${startKm} KM`}
                                    className="w-full bg-white dark:bg-[#1a1c1e] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-lg font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KM</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleFinishTrip}
                            disabled={!endKm || calculatedDistance <= 0}
                            className={`w-full h-16 ${endKm && calculatedDistance > 0 ? 'bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'} rounded-2xl font-bold text-lg transition-all active:scale-95 uppercase tracking-wide`}
                        >
                            AKHIRI PERJALANAN
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DriverTripSummary;