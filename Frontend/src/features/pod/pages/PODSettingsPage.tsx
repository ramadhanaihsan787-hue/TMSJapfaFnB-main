import React, { useState, useEffect, useRef } from "react";
import Header from "../../../shared/components/Header";
// 🌟 FIX CTO #7: Pake API Client, bukan LocalStorage!
import { api } from "../../../shared/services/apiClient";
// 🌟 FIX CTO #5: Pake Toast yang elegan, buang alert() primitif!
import toast, { Toaster } from "react-hot-toast";

export default function PodSettingsPage() {
    // ==========================================
    // 1. STATE PREFERENSI UI/UX (API Driven)
    // ==========================================
    const [autoAdvance, setAutoAdvance] = useState(false);
    const [dataDensity, setDataDensity] = useState("normal");
    const [soundAlert, setSoundAlert] = useState(true);
    const [isUiSaving, setIsUiSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 NYEDOT DATA DARI BACKEND, BUKAN BROWSER!
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                // Asumsi kita bakal bikin endpoint ini di backend nanti
                const res = await api.get('/auth/preferences');
                if (res.data && res.data.data) {
                    const prefs = res.data.data;
                    setAutoAdvance(prefs.autoAdvance ?? false);
                    setSoundAlert(prefs.soundAlert ?? true);
                    setDataDensity(prefs.dataDensity ?? 'normal');
                    document.documentElement.setAttribute('data-density', prefs.dataDensity ?? 'normal');
                }
            } catch (error) {
                console.warn("Gagal narik API preferences, pake default / local sementara");
                // Fallback sementara kalau endpoint belum dibikin
                setAutoAdvance(localStorage.getItem('pref_autoAdvance') === 'true');
                setSoundAlert(localStorage.getItem('pref_soundAlert') !== 'false');
                setDataDensity(localStorage.getItem('pref_density') || 'normal');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    // 🌟 SIMPAN KE BACKEND
    const handleSavePreferences = async () => {
        setIsUiSaving(true);
        
        try {
            // Nembak API update preferensi
            await api.put('/auth/preferences', {
                autoAdvance,
                soundAlert,
                dataDensity
            });

            // Terapin ke tampilan global
            document.documentElement.setAttribute('data-density', dataDensity);
            
            // Backup ke localstorage buat jaga-jaga offline mode
            localStorage.setItem('pref_autoAdvance', String(autoAdvance));
            localStorage.setItem('pref_soundAlert', String(soundAlert));
            localStorage.setItem('pref_density', dataDensity);

            // 🔥 TOAST NOTIFICATION MENGGANTIKAN ALERT()
            toast.success("Pengaturan Tampilan & Interaksi berhasil disimpan! 🚀");
        } catch (error) {
            toast.error("Gagal menyimpan pengaturan ke server!");
        } finally {
            setIsUiSaving(false);
        }
    };

    // ==========================================
    // 2. STATE AKUN (Password & Foto Profil)
    // ==========================================
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Password baru dan konfirmasi tidak cocok!");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password baru minimal 6 karakter!");
            return;
        }

        setIsPasswordSaving(true);
        try {
            // Nembak API ubah password
            await api.post('/auth/change-password', {
                old_password: currentPassword,
                new_password: newPassword
            });
            
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password berhasil diperbarui! 🔒");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Gagal mengubah password!");
        } finally {
            setIsPasswordSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfilePic(imageUrl);
            
            // Logika upload foto ke API (FormData)
            const formData = new FormData();
            formData.append('profile_picture', file);
            
            toast.promise(
                api.post('/auth/upload-avatar', formData),
                {
                    loading: 'Mengunggah foto profil...',
                    success: 'Foto profil berhasil diperbarui! 📸',
                    error: 'Gagal mengunggah foto!'
                }
            );
        }
    };

    if (isLoading) return <div className="p-10 text-center">Memuat pengaturan...</div>;

    return (
        <React.Fragment>
            <Header title="Pengaturan & Preferensi" />
            
            {/* 🌟 INIT TOASTER BUAT NAMPILIN NOTIFIKASI */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
                
                {/* ACCOUNT PREFERENCES SECTION */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#222]/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">manage_accounts</span>
                            Preferensi Akun
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-[#222] shadow-sm shrink-0 relative group">
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Foto Profil</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Unggah foto baru untuk mengubah avatar Anda. (Maks 2MB)</p>
                                <div className="flex gap-3">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/png, image/jpeg" 
                                        onChange={handleFileChange} 
                                    />
                                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
                                        Ubah Foto
                                    </button>
                                    <button onClick={() => setProfilePic(null)} className="px-4 py-2 bg-white dark:bg-[#222] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-[#333] transition-colors shadow-sm active:scale-95">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        {/* Change Password Form */}
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ubah Password</h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Password Saat Ini</label>
                                <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none transition-colors dark:text-white" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Password Baru</label>
                                <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none transition-colors dark:text-white" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Konfirmasi Password Baru</label>
                                <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary outline-none transition-colors dark:text-white" />
                            </div>

                            <button type="submit" disabled={isPasswordSaving} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm mt-2 disabled:opacity-70 active:scale-95">
                                {isPasswordSaving ? 'Menyimpan...' : 'Simpan Password'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* UI/UX PREFERENCES SECTION */}
                <section className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#222]/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            Pengaturan Tampilan & Interaksi
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sesuaikan kenyamanan ruang kerja Anda.</p>
                    </div>
                    
                    <div className="p-6 space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">skip_next</span>
                                    Auto-Advance Dokumen
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Otomatis memuat dokumen berikutnya setelah Anda menekan tombol "Setuju" atau "Tolak". Mempercepat proses verifikasi.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" className="sr-only peer" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">notifications_active</span>
                                    Notifikasi Suara (Sound Alert)
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Mainkan suara "Ping!" setiap kali ada foto e-POD baru masuk ke antrean Live Verification.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input type="checkbox" className="sr-only peer" checked={soundAlert} onChange={(e) => setSoundAlert(e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">density_medium</span>
                                    Ukuran Font Tabel (Data Density)
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Pilih seberapa padat baris tabel ditampilkan. Sangat berguna untuk kenyamanan membaca di layar berjam-jam.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Pilihan Rapat, Normal, Longgar tetep persis sama UI-nya... */}
                                <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-colors ${dataDensity === 'rapat' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#222] hover:border-primary/50'}`}>
                                    <input type="radio" name="density" value="rapat" className="sr-only" checked={dataDensity === 'rapat'} onChange={(e) => setDataDensity(e.target.value)} />
                                    <span className="material-symbols-outlined text-3xl text-slate-400">density_small</span>
                                    <div className="text-center">
                                        <span className="block font-bold text-slate-900 dark:text-white">Rapat</span>
                                        <span className="text-xs text-slate-500">Teks kecil, banyak data</span>
                                    </div>
                                </label>

                                <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-colors ${dataDensity === 'normal' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#222] hover:border-primary/50'}`}>
                                    <input type="radio" name="density" value="normal" className="sr-only" checked={dataDensity === 'normal'} onChange={(e) => setDataDensity(e.target.value)} />
                                    <span className="material-symbols-outlined text-3xl text-slate-400">density_medium</span>
                                    <div className="text-center">
                                        <span className="block font-bold text-slate-900 dark:text-white">Normal</span>
                                        <span className="text-xs text-slate-500">Standar UI bawaan</span>
                                    </div>
                                </label>

                                <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-colors ${dataDensity === 'longgar' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#222] hover:border-primary/50'}`}>
                                    <input type="radio" name="density" value="longgar" className="sr-only" checked={dataDensity === 'longgar'} onChange={(e) => setDataDensity(e.target.value)} />
                                    <span className="material-symbols-outlined text-3xl text-slate-400">density_large</span>
                                    <div className="text-center">
                                        <span className="block font-bold text-slate-900 dark:text-white">Longgar</span>
                                        <span className="text-xs text-slate-500">Teks besar, mudah dibaca</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#222]/50 flex justify-end gap-3">
                        <button className="px-6 py-2 bg-white dark:bg-[#222] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-[#333] transition-colors shadow-sm active:scale-95">
                            Batal
                        </button>
                        <button onClick={handleSavePreferences} disabled={isUiSaving} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 active:scale-95">
                            <span className="material-symbols-outlined text-sm">save</span>
                            {isUiSaving ? 'Menyimpan...' : 'Simpan Pengaturan UI'}
                        </button>
                    </div>
                </section>

            </div>
        </React.Fragment>
    );
}