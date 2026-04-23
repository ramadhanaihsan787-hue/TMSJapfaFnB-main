import { useNavigate } from "react-router-dom";

/**
 * NotFound / 404 Page Component
 * Displayed when user navigates to a non-existent route
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 opacity-80">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-500/20 to-red-500/20 -z-10"></div>
        </div>

        {/* Message */}
        <h2 className="mt-6 text-3xl font-bold text-white">Halaman Tidak Ditemukan</h2>
        <p className="mt-3 text-lg text-slate-400 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. Silakan periksa URL atau kembali ke halaman utama.
        </p>

        {/* Illustration */}
        <div className="mt-8 mb-12">
          <svg
            className="w-48 h-48 mx-auto text-slate-700 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={0.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Kembali
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-sm text-slate-500">
          <p>Jika masalah terus berlanjut, silakan hubungi dukungan teknis kami.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
