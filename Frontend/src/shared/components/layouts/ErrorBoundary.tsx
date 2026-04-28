import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorMsg: ''
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state biar render berikutnya nampilin UI Error
        return { hasError: true, errorMsg: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Lu bisa kirim error ini ke Sentry/Analytics di sini
        console.error('🚨 REACT CRASH CAUGHT BY BOUNDARY:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-4 text-center transition-colors">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4">warning</span>
                    <h1 className="text-2xl font-bold mb-2">Waduh! Sistem Mengalami Kendala</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                        Ada sedikit gangguan pada tampilan komponen ini. Kesalahan tercatat: <br/>
                        <code className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded mt-2 block text-xs">
                            {this.state.errorMsg}
                        </code>
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg transition-all"
                    >
                        Muat Ulang Halaman
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}