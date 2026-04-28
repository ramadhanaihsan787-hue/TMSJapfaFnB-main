import KPICard from './ManagerKPICards';
import DelayTable from './DelayTable';
import MonitoringPanel from './MonitoringPanel';

export default function OverviewDashboard() {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* KPI Row (7 Cards) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                <KPICard label="OTIF Performance" value="94.2%" change="1.2%" trend="up" icon="schedule" bgColor="bg-blue-50" iconColor="text-blue-600" subtext="vs. last month avg" />
                <KPICard label="On-Time Delivery" value="96.8%" change="0.5%" trend="up" icon="check_circle" bgColor="bg-green-50" iconColor="text-green-600" subtext="Operational target: 95%" />
                <KPICard label="Fill Rate" value="98.1%" change="0.3%" trend="down" icon="inventory_2" bgColor="bg-orange-50" iconColor="text-japfa-orange" subtext="Stock availability index" />
                <KPICard label="Return Rate" value="1.2%" change="0.4%" trend="down" icon="assignment_return" bgColor="bg-red-50" iconColor="text-red-600" subtext="Rejected loads reduction" />
                <KPICard label="Transport Cost" value="4.2B" change="2.1%" trend="up" icon="payments" bgColor="bg-purple-50" iconColor="text-purple-600" subtext="Fuel surcharge impact" />
                <KPICard label="Load Utilization" value="89.4%" change="1.5%" trend="up" icon="local_shipping" bgColor="bg-teal-50" iconColor="text-teal-600" subtext="Capacity efficiency" />
                <KPICard label="Damage Rate" value="0.45%" change="0.05%" trend="down" icon="broken_image" bgColor="bg-amber-50" iconColor="text-amber-600" subtext="Product handling quality" />
            </section>

            {/* Distribution Performance Trend Section (SVG) */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl font-bold text-japfa-dark dark:text-white">Distribution Performance Trend</h2>
                        <p className="text-sm text-japfa-gray dark:text-gray-400">Daily fulfillment vs shipment volume (OTIF & Load Count)</p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-orange-100 dark:bg-orange-500/20"></span><span className="text-xs font-medium text-japfa-gray dark:text-gray-400">Shipment Volume</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-japfa-orange"></div><span className="text-xs font-medium text-japfa-gray dark:text-gray-400">OTIF Performance</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-0.5 border-t border-dashed border-red-400"></div><span className="text-xs font-medium text-japfa-gray dark:text-gray-400">95% Target</span></div>
                    </div>
                </div>

                <div className="relative w-full h-[300px] mb-4">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                        {[0, 60, 120, 180, 240, 300].map((y) => (
                            <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeDasharray="4" />
                        ))}
                        <line x1="0" x2="1000" y1="150" y2="150" stroke="#ef4444" strokeDasharray="6,4" strokeWidth="2" />
                        {[200, 240, 280, 180, 260, 220, 290].map((h, i) => (
                            <rect key={i} x={80 + i * 130} y={300 - h} width="40" height={h} fill="currentColor" className="text-orange-100 dark:text-orange-500/20 rounded-t-sm" />
                        ))}
                        <path d="M 100,200 C 150,200 180,160 230,160 C 280,160 310,120 360,120 C 410,120 440,220 490,220 C 540,220 570,110 620,110 C 670,110 700,140 750,140 C 800,140 830,90 880,90" fill="none" stroke="#F28C38" strokeWidth="4" />
                        {[{ x: 100, y: 200 }, { x: 230, y: 160 }, { x: 360, y: 120 }, { x: 490, y: 220 }, { x: 620, y: 110 }, { x: 750, y: 140 }, { x: 880, y: 90 }].map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke="#F28C38" strokeWidth="2" />
                        ))}
                    </svg>
                </div>
                <div className="flex justify-between px-10 text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-wider">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </section>

            {/* Delay Analysis Table Component */}
            <DelayTable />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Today’s Fulfillment Progress */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col h-full">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-japfa-dark dark:text-white">Today's Fulfillment</h2>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            </div>
                            <p className="text-xs font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest mt-1">Live Tracking</p>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-2">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <circle className="stroke-gray-100 dark:stroke-white/5" cx="18" cy="18" r="16" fill="transparent" strokeWidth="4"></circle>
                                <circle className="stroke-japfa-orange" cx="18" cy="18" r="16" fill="transparent" strokeWidth="4" strokeDasharray="75 25" strokeDashoffset="0"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-japfa-dark dark:text-white">425</span>
                                <span className="text-[10px] font-bold text-japfa-gray dark:text-gray-500 uppercase tracking-widest">Total Loads</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full">
                            {[
                                { label: "Completed", percent: "75%", count: "319", color: "bg-japfa-orange" },
                                { label: "In-Transit", percent: "20%", count: "85", color: "bg-slate-700 dark:bg-blue-400" },
                                { label: "Pending", percent: "5%", count: "21", color: "bg-red-500" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                        <span className="text-xs font-bold text-japfa-dark dark:text-white uppercase">{item.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-black text-japfa-dark dark:text-white">{item.percent}</span>
                                        <span className="text-[10px] font-bold text-japfa-gray">{item.count} Units</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Operational Monitoring Component */}
                <MonitoringPanel />
            </div>
        </div>
    );
}