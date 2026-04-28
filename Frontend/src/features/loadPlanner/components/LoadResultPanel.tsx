export default function LoadResultPanel() {
    const feedbackItems = [
        { icon: 'check_circle', label: 'Stack Integrity', value: 'OK', ok: true },
        { icon: 'check_circle', label: 'Payload Balance', value: '94%', ok: true },
        { icon: 'warning', label: 'Block Sequence', value: 'CHECK', ok: false },
    ];

    return (
        <div className="p-5 flex-1 overflow-y-auto">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Real-time Feedback</h2>
            <div className="space-y-2">
                {feedbackItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1A1A1A] rounded-lg border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-sm ${item.ok ? 'text-green-500' : 'text-amber-500'}`}>{item.icon}</span>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}