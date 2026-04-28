import { Outlet } from 'react-router-dom';
import PodSidebar from './PodSidebar';

export default function PodLayout() {
    return (
        <div className="flex h-screen overflow-hidden relative bg-background-light dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 antialiased font-display transition-colors">
            {/* Sidebar Cukup Dipanggil Di Sini Sekali Seumur Hidup! */}
            <PodSidebar />
            
            {/* Konten Halaman Bakal Dirender di dalem Tag MAIN ini! */}
            <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50 dark:bg-[#111111] transition-colors">
                <Outlet />
            </main>
        </div>
    );
}