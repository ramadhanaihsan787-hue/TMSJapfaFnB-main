// src/features/driver-app/pages/PodCapturePage.tsx
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner'; // 🌟 SUNTIKAN SONNER!
import Header from '../../../shared/components/Header';

import { driverappService } from '../services/driverappService';
import { useDriverappFlow } from '../hooks/useDriverappFlow';

const DriverPodCapture: React.FC = () => {
    const navigate = useNavigate();
    const { activeStop, submitPod } = useDriverappFlow(); 
    
    const sigCanvas = useRef<SignatureCanvas>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Return (Retur) States
    const [hasReturn, setHasReturn] = useState(false);
    const [returnProduct, setReturnProduct] = useState('');
    const [returnQty, setReturnQty] = useState('');
    const [returnReason, setReturnReason] = useState('');

    const mockProducts = [
        "Karkas Ayam Broiler 1.0 - 1.2kg",
        "Boneless Dada Ayam (BLD)",
        "Boneless Paha Ayam (BLP)",
        "Sayap Ayam (Wings)",
        "Ati Ampela Ayam (Pack)"
    ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPhotoFile(file); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string); 
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerCamera = () => fileInputRef.current?.click();
    const clearSignature = () => sigCanvas.current?.clear();

    const removePhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCapturedImage(null);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isFormValid = capturedImage && (!hasReturn || (returnProduct && returnQty && returnReason));

    const handleSubmit = async () => {
        if (!isFormValid || !activeStop || !photoFile) return;
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', photoFile);
            formData.append('has_return', hasReturn ? 'true' : 'false');
            
            if (hasReturn) {
                formData.append('return_product', returnProduct);
                formData.append('return_qty', returnQty);
                formData.append('return_reason', returnReason);
            }

            await driverappService.submitEpod(activeStop.id, formData);
            
            // 🌟 FIX CTO: Ganti alert jadi toast.success
            toast.success("Berhasil ngirim bukti pengiriman!");
            submitPod(); 
            navigate('/driver/routes'); 
        } catch (error) {
            console.error(error);
            // 🌟 FIX CTO: Ganti alert jadi toast.error
            toast.error("Gagal ngirim data, coba lagi bos!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] font-sans transition-colors duration-300">
            <Header title="e-POD Capture" />

            <main className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-80px)]">
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5 space-y-8">

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold dark:text-white">Apakah ada barang retur?</h3>
                                <p className="text-[10px] text-slate-400 font-medium">Informasikan jika ada pengembalian barang</p>
                            </div>
                            <div className="flex bg-slate-200 dark:bg-white/10 p-1 rounded-xl">
                                <button
                                    onClick={() => setHasReturn(false)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!hasReturn ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500'}`}
                                >
                                    TIDAK
                                </button>
                                <button
                                    onClick={() => setHasReturn(true)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${hasReturn ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500'}`}
                                >
                                    ADA
                                </button>
                            </div>
                        </div>

                        {hasReturn && (
                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Produk Retur</label>
                                    <select
                                        value={returnProduct}
                                        onChange={(e) => setReturnProduct(e.target.value)}
                                        className="w-full h-12 bg-white dark:bg-[#1A1A1A] border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                    >
                                        <option value="">Pilih Produk...</option>
                                        {mockProducts.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Quantity (KG)</label>
                                        <input
                                            type="number"
                                            value={returnQty}
                                            onChange={(e) => setReturnQty(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full h-12 bg-white dark:bg-[#1A1A1A] border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Alasan Retur</label>
                                        <select
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            className="w-full h-12 bg-white dark:bg-[#1A1A1A] border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                        >
                                            <option value="">Pilih Alasan...</option>
                                            <option value="Barang Rusak">Barang Rusak</option>
                                            <option value="Packaging Bocor">Packaging Bocor</option>
                                            <option value="Kadaluarsa">Kadaluarsa</option>
                                            <option value="Salah Produk">Salah Produk</option>
                                            <option value="Customer Tidak Ada">Customer Tidak Ada</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                    />

                    <div
                        onClick={triggerCamera}
                        className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer group active:scale-[0.98] overflow-hidden ${capturedImage
                            ? 'border-green-500/50 bg-green-50/10'
                            : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                            }`}
                    >
                        {capturedImage ? (
                            <div className="relative w-full aspect-video">
                                <img src={capturedImage} alt="Captured POD" className="w-full h-full object-cover rounded-2xl" />
                                <button
                                    onClick={removePhoto}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl font-bold">add_a_photo</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold dark:text-white mb-1">Ambil Foto Surat Jalan</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Pastikan teks terlihat jelas & tidak buram</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold dark:text-white">Tanda Tangan Penerima</p>
                                <p className="text-[10px] text-slate-400 font-medium">Tanda tangan di dalam kotak</p>
                            </div>
                            <button
                                onClick={clearSignature}
                                className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Hapus
                            </button>
                        </div>

                        <div className="h-48 bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl border border-slate-100 dark:border-white/10 relative shadow-inner overflow-hidden">
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="white"
                                canvasProps={{
                                    className: "signature-canvas w-full h-full",
                                    style: { width: '100%', height: '100%' }
                                }}
                            />
                            {!sigCanvas.current?.isEmpty() && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <span className="text-slate-300 dark:text-slate-700 font-bold select-none">AREA TANDA TANGAN</span>
                                </div>
                            )}
                            <div className="absolute bottom-6 left-6 right-6 h-px border-b border-dashed border-slate-200 dark:border-white/10 pointer-events-none"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 pb-8 space-y-4">
                    <button
                        onClick={handleSubmit} 
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full h-16 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 uppercase tracking-wide ${isFormValid && !isSubmitting
                            ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isSubmitting ? 'MENGIRIM...' : 'KIRIM BUKTI (SUBMIT)'}
                    </button>

                    <button className="w-full py-2 text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors">
                        Lapor Kendala Pengiriman
                    </button>
                </div>
            </main>
        </div>
    );
};

export default DriverPodCapture;