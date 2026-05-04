// src/shared/components/Header.tsx (atau sesuaikan folder lu)
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDateRange } from '../../context/DateRangeContext'; 
import { useState, useEffect, useRef } from 'react';
import { Calendar, Check, X, Headset } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ title }: { title?: string }) {
    const location = useLocation();
    const { role, logout } = useAuth();
    const { startDate, endDate, setStartDate, setEndDate, setIsLoading } = useDateRange();
    const navigate = useNavigate();
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    // Mock notifications (Tampilan Mewah ala Enterprise)
    const notifications = [
        { id: 1, title: "New Route Assigned", time: "2 mins ago", type: "info", icon: "route" },
        { id: 2, title: "Vehicle Maintenance Alert", time: "1 hour ago", type: "warning", icon: "settings_alert" },
        { id: 3, title: "Delivery Delayed - #JKT001", time: "3 hours ago", type: "error", icon: "warning" },
        { id: 4, title: "New Message from Driver", time: "5 hours ago", type: "message", icon: "chat" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleApplyDate = () => {
        setIsLoading(true);
        setStartDate(localStartDate);
        setEndDate(localEndDate);
        setShowDatePicker(false);

        // Simulate loading delay for better UX
        setTimeout(() => {
            setIsLoading(false);
        }, 1200);
    };

    // Auto-Title Logic
    const segments = location.pathname.split('/').filter(Boolean);
    const getPageTitle = () => {
        if (title) return title;
        if (segments.length === 0) return "Dashboard";
        const lastSegment = segments[segments.length - 1];
        if (lastSegment === 'logistik') return "Logistics Dashboard";
        if (lastSegment === 'manager') return "Performance Dashboard";
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    };
    const displayTitle = getPageTitle();

    return (
        <header className="h-16 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors relative z-40">
            <div className="flex items-center gap-4">
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{displayTitle}</h2>
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-japfa-orange animate-pulse" style={{ backgroundColor: '#FF7A00' }}></div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Global Analysis Period Selector */}
                <div className="hidden lg:block relative">
                    <div
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-1.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${showDatePicker
                            ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/10"
                            : "border-slate-200 dark:border-white/10 hover:border-[#FF7A00]/50"
                            }`}
                    >
                        <div className="bg-[#FF7A00]/10 p-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" color="#FF7A00" />
                        </div>
                        <div className="flex flex-col pr-1">
                            <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest leading-none">Analysis Period</span>
                            <span className="text-[10px] font-bold text-slate-900 dark:text-white mt-0.5">
                                {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-0.5"></div>
                        <span className={`material-symbols-outlined text-slate-400 text-md transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>

                    {/* Mini Calendar Popover */}
                    {showDatePicker && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 p-4 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50 dark:border-white/5">
                                <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Select Date Range</h4>
                                <button onClick={() => setShowDatePicker(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest block mb-1">From</label>
                                        <input
                                            type="date"
                                            value={localStartDate}
                                            onChange={(e) => setLocalStartDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest block mb-1">To</label>
                                        <input
                                            type="date"
                                            value={localEndDate}
                                            onChange={(e) => setLocalEndDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#FF7A00] focus:border-[#FF7A00] outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleApplyDate}
                                    className="w-full h-9 bg-gradient-to-r from-[#994700] to-[#FF7A00] hover:opacity-90 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#FF7A00]/20"
                                >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    Update Analysis
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <div className="flex items-center gap-2 sm:gap-4 relative" ref={notificationRef}>
                        <a
                            href="https://wa.me/62895323055422"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-all rounded-lg group tooltip"
                        >
                            <Headset className="w-5 h-5" />
                        </a>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`relative p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-all rounded-lg ${showNotifications ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</h4>
                                    <span className="px-2 py-0.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-bold rounded-full">4 New</span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex gap-4">
                                            <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' :
                                                notif.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' :
                                                    'bg-[#FF7A00]/10 text-[#FF7A00]'
                                                }`}>
                                                <span className="material-symbols-outlined text-lg">{notif.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{notif.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-3 text-[10px] font-black text-[#FF7A00] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-50 dark:border-white/5">
                                    View All Notifications
                                </button>
                            </div>
                        )}

                        {role === 'driver' && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 p-2 px-3 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all font-bold text-xs"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}