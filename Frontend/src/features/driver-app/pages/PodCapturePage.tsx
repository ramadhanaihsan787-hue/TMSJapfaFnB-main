import React, { useState, useRef } from 'react';
import Header from '../../../shared/components/Header';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { DriverappButton } from '../components';
import { driverappService } from '../services/driverappService';

export default function PodCapturePage() {
    const { activeStop, submitPod } = useDriverappFlow();
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!photo || !activeStop) {
            alert("Harap ambil foto bukti pengiriman terlebih dahulu!");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', photo);
            await driverappService.submitEpod(activeStop.id, formData);
            submitPod();
        } catch (err) {
            alert("Gagal mengunggah foto, coba lagi Bos!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#1a1c1e] font-sans transition-colors duration-300">
            <Header title="e-POD Capture" />
            <main className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-80px)]">
                <div className="bg-white dark:bg-[#2c2e33] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                    <div 
                        onClick={() => !isSubmitting && fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-dashed transition-all active:scale-[0.98] overflow-hidden min-h-[200px] ${
                            previewUrl ? 'border-primary bg-white' : 'border-primary/30 bg-primary/5'
                        }`}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} />

                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-3xl font-bold">add_a_photo</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold dark:text-white mb-1">Ambil Foto Surat Jalan</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Klik untuk membuka kamera</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-bold dark:text-white">Tanda Tangan</p>
                        <div className="h-48 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            <span className="text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest text-xs italic">Area Tanda Tangan Customer</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 pb-8 space-y-4">
                    {/* 🌟 FIX: Bungkus dengan div untuk handling disabled state */}
                    <div className={isSubmitting ? "opacity-50 pointer-events-none" : ""}>
                        <DriverappButton 
                            onClick={handleSubmit} 
                            text={isSubmitting ? "MENGIRIM..." : "KIRIM BUKTI (SUBMIT)"} 
                        />
                    </div>
                    <button className="w-full py-2 text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors">
                        Lapor Kendala Pengiriman
                    </button>
                </div>
            </main>
        </div>
    );
}