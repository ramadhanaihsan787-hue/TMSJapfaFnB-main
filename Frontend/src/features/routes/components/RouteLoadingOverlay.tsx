interface RouteLoadingOverlayProps {
    isUploading: boolean;
    isOptimizing: boolean;
    loadingProgress: number;
}

export default function RouteLoadingOverlay({ isUploading, isOptimizing, loadingProgress }: RouteLoadingOverlayProps) {
    if (!isUploading && !isOptimizing) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            {/* Ikon Animasi Berbeda Tergantung Status */}
            {isUploading ? (
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-6"></div>
            ) : (
                <div className="text-6xl animate-bounce mb-6">🚚</div>
            )}

            <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-2 text-center">
                {isUploading ? 'MENGUNGGAH SAP KE DATABASE...' : 'AI SEDANG MENGHITUNG RUTE TERBAIK...'}
            </h3>

            {isOptimizing && (
                <p className="text-slate-400 mb-8 text-sm animate-pulse">
                    Memproses matriks jalan dan menyeimbangkan beban JAPFA
                </p>
            )}

            {/* Bar Loading (Hanya Muncul Pas Optimizing/Mikir AI) */}
            {isOptimizing && (
                <div className="w-full max-w-md bg-slate-800 rounded-full h-6 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-slate-700">
                    <div
                        className="bg-primary h-full transition-all duration-300 ease-out flex items-center justify-end relative"
                        style={{ width: `${loadingProgress}%` }}
                    >
                        {/* Efek Cahaya di ujung bar */}
                        <div className="absolute right-0 top-0 bottom-0 w-10 bg-white/20 blur-sm"></div>
                        <span className="text-[10px] text-white font-black mr-3 drop-shadow-md">
                            {loadingProgress}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}