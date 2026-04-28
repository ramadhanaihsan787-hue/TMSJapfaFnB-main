import React, { useState } from 'react';
import Header from "../../../shared/components/Header";
import { usePod } from '../hooks/usePod';
import type { DeliveryOrder } from '../services/podService'; // 🌟 Import tipe datanya

export default function VerificationPage() {
    // 🌟 1. Sedot data antrean dari backend
    const { orders, isLoading, error } = usePod();
    
    // 🌟 2. Bikin state buat nyimpen DO mana yang lagi diklik sama Admin
    const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);

    return (
        <React.Fragment>
            <Header title="Admin Portal" />
            
            <div className="flex-1 flex overflow-hidden">
                {/* ========================================== */}
                {/* PANEL 1: LIVE QUEUE (20%) */}
                {/* ========================================== */}
                <section className="w-1/4 xl:w-1/5 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Queue</h2>
                        <p className="text-xs text-slate-400 mt-1">{orders.length} Pending Verifications</p>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        
                        {/* Status Loading/Error/Kosong tetep cakep */}
                        {isLoading && <div className="p-4 text-sm text-slate-500 font-bold text-center">Memuat antrean... ⏳</div>}
                        {error && <div className="p-4 text-sm text-red-500 font-bold text-center">🚨 Gagal memuat data</div>}
                        {!isLoading && orders.length === 0 && (
                            <div className="p-4 text-sm text-slate-500 font-medium text-center italic">Antrean kosong.</div>
                        )}

                        {/* 🌟 3. LOOPING DATA ANTREAN ASLI */}
                        {orders.map((order) => {
                            // Cek apakah item ini yang lagi dipilih
                            const isSelected = selectedOrder?.order_id === order.order_id;
                            
                            return (
                                <div 
                                    key={order.order_id}
                                    onClick={() => setSelectedOrder(order)} // 🌟 Pas diklik, masukin ke state!
                                    className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                                        isSelected 
                                        ? 'bg-primary/5 border-l-4 border-primary' 
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 opacity-70'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                                            {order.order_id}
                                        </span>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                    </div>
                                    <p className={`text-sm ${isSelected ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                        {order.customer_name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{order.weight_total} KG • Menunggu Supir</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ========================================== */}
                {/* PANEL 2: DATA SISTEM (30%) */}
                {/* ========================================== */}
                <section className="w-1/3 xl:w-[30%] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#111111]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Data Sistem DO</h2>
                        {selectedOrder && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold rounded">TERPILIH</span>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                        {!selectedOrder ? (
                            // 🌟 KALO BELUM ADA YANG DIKLIK: Tampilan Kosong yang Elegan
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50">
                                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">inventory_2</span>
                                <p className="text-sm font-medium text-slate-500">Pilih tiket dari Live Queue untuk melihat detail muatan.</p>
                            </div>
                        ) : (
                            // 🌟 KALO ADA YANG DIKLIK: Tampilkan tabel items dari database
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Item Name</th>
                                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase text-right">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 text-xs font-medium text-slate-800 dark:text-slate-200">{item.nama_barang}</td>
                                                <td className="p-3 text-xs font-bold text-slate-900 dark:text-slate-100 text-right">{item.qty}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="p-3 text-xs text-center text-slate-500 italic">Tidak ada detail item</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Catatan Supir tetep nongol kalo ada order terpilih */}
                    {selectedOrder && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-slate-400 text-sm">chat_bubble</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">System Info</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                Pengiriman ke: {selectedOrder.customer_name}. Total beban: {selectedOrder.weight_total} KG.
                            </p>
                        </div>
                    )}
                </section>

                {/* ========================================== */}
                {/* PANEL 3: DOCUMENT VIEWER (50%) */}
                {/* ========================================== */}
                <section className="flex-1 bg-slate-100 dark:bg-[#0a0a0a] flex flex-col relative">
                    
                    {/* Toolbar & Viewer cuma aktif kalau ada order terpilih */}
                    {!selectedOrder ? (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">document_scanner</span>
                            <p className="text-lg font-bold text-slate-400">Viewer Standby</p>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <button className="w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">zoom_in</span>
                                </button>
                                <button className="w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">zoom_out</span>
                                </button>
                                <button className="w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">rotate_right</span>
                                </button>
                                <button className="w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">fullscreen</span>
                                </button>
                            </div>

                            {/* Document Image - Nanti diganti src-nya dari data foto supir kalau udah ada */}
                            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden mb-20">
                                <div className="bg-white dark:bg-[#1a1a1a] shadow-2xl rounded-lg w-full h-full max-w-[600px] flex items-center justify-center relative border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center pointer-events-none p-8 bg-black/40 rounded-xl backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-6xl text-white">image</span>
                                        <span className="text-xs text-white mt-2 font-bold tracking-widest text-center">FOTO BELUM DIUNGGAH<br/>OLEH SUPIR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Header */}
                            <div className="absolute top-4 left-4 z-10">
                                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3 shadow-lg">
                                    <span className="material-symbols-outlined text-primary">pending</span>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Status Dokumen</p>
                                        <p className="text-white text-xs font-medium mt-1">Menunggu Foto e-POD</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action Bar */}
                            <footer className="h-20 bg-white dark:bg-[#111111] border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 w-full z-20">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Live Connection Active</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">Reviewing: {selectedOrder.order_id}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-8 py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">cancel</span>
                                        TOLAK DOKUMEN
                                    </button>
                                    <button className="px-8 py-3 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        VERIFIKASI COCOK
                                    </button>
                                </div>
                            </footer>
                        </>
                    )}
                </section>
            </div>
        </React.Fragment>
    );
}