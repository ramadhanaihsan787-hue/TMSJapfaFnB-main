// src/features/fleet/components/FleetTable.tsx
import type { FleetVehicle } from "../types";
import FleetTableRow from "./FleetTableRow";

interface FleetTableProps {
    loading: boolean;
    fleetList: FleetVehicle[];
    selectedTruck: FleetVehicle | null;
    onSelectTruck: (truck: FleetVehicle) => void;
}

export default function FleetTable({ loading, fleetList, selectedTruck, onSelectTruck }: FleetTableProps) {
    return (
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between bg-slate-50/50 dark:bg-[#111111]">
                <h3 className="font-bold text-lg text-[#111] dark:text-white">Fleet Status & Telematics</h3>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-[#333] text-slate-500 dark:text-slate-400 rounded hover:bg-slate-50 dark:hover:bg-[#1a1a1a] text-xs font-bold transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">filter_list</span> Filter
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left min-w-[800px] border-collapse">
                    <thead className="bg-slate-50 dark:bg-[#1a1a1a] sticky top-0 z-10 border-b border-slate-200 dark:border-[#333]">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Truck ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Model</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">License Plate</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mileage (KM)</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fuel Economy</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">Menarik Data Armada dari Server...</td>
                            </tr>
                        ) : fleetList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">Data Truk Belum Ada / Database Kosong!</td>
                            </tr>
                        ) : (
                            fleetList.map((truck, idx) => (
                                <FleetTableRow 
                                    key={truck.id}
                                    truck={truck}
                                    idx={idx}
                                    isSelected={selectedTruck?.id === truck.id}
                                    onSelect={() => onSelectTruck(truck)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}