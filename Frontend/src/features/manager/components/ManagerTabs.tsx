import type { ManagerTabId } from '../types';

interface ManagerTabsProps {
    activeTab: ManagerTabId;
    setActiveTab: (tab: ManagerTabId) => void;
}

export default function ManagerTabs({ activeTab, setActiveTab }: ManagerTabsProps) {
    const tabs: { id: ManagerTabId; label: string }[] = [
        { id: "overview", label: "Overview" },
        { id: "return", label: "Return Performance" },
        { id: "efficiency", label: "Logistics Efficiency" }
    ];

    return (
        <nav className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-950/95 backdrop-blur-sm -mx-8 px-8 border-b border-gray-200 dark:border-white/10 pt-8">
            <div className="flex items-center gap-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-5 text-sm transition-all border-b-4 ${activeTab === tab.id
                            ? "text-japfa-orange border-japfa-orange font-extrabold"
                            : "text-japfa-gray dark:text-gray-400 border-transparent hover:text-japfa-dark dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 font-semibold"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}