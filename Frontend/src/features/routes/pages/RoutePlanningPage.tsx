// src/features/routes/pages/RoutePlanningPage.tsx
import React, { useState, useEffect } from "react";
// Sesuaikan path Header lu, naik 3 lantai ke folder utama src/components
import Header from "../../../shared/components/Header"; 

// 🌟 IMPORT 3 HOOKS SAKTI
import { useRoutes } from "../hooks/useRoutes";
import { useUpload } from "../hooks/useUpload";
import { useRouteOptimization } from "../hooks/useRouteOptimization";

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import RouteToolbar from "../components/RouteToolbar";
import RouteSummaryCards from "../components/RouteSummaryCards";
import TruckList from "../components/TruckList";
import RouteDetailPanel from "../components/RouteDetailPanel";
import RouteMap from "../components/RouteMap";
import RouteLoadingOverlay from "../components/RouteLoadingOverlay";
import UploadVerificationModal from "../components/UploadVerificationModal";
import RoutePreviewModal from "../components/RoutePreviewModal";

export default function RoutePlanningPage() {
    // ================= STATE LOKAL HALAMAN =================
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showMapView, setShowMapView] = useState(false);
    const [activeModal, setActiveModal] = useState<'cost' | 'distance' | 'fleet' | 'stops' | null>(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [routeMessage, setRouteMessage] = useState('');

    const truckColors = ['#e11d48', '#0284c7', '#16a34a', '#d97706', '#9333ea', '#0d9488', '#0891b2'];

    // ================= PANGGIL HOOKS =================
    const { routesData, droppedNodes, selectedRouteId, setSelectedRouteId, fetchRoutes } = useRoutes();
    const { isUploading, uploadReport, setUploadReport, uploadFile, updateTime, saveCoord } = useUpload();
    const { isOptimizing, previewData, setPreviewData, loadingProgress, optimize, confirm } = useRouteOptimization();

    // ================= EFEK AWAL (LOAD DATA) =================
    useEffect(() => {
        fetchRoutes(selectedDate);
    }, [selectedDate, fetchRoutes]);

    // ================= HANDLERS =================
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const success = await uploadFile(file);
        if (success) setShowVerificationModal(true);
        
        // Reset input file biar bisa upload file yang sama lagi
        event.target.value = ''; 
    };

    const handleOptimize = async () => {
        setShowVerificationModal(false);
        try {
            await optimize();
        } catch (error) {
            alert('Gagal melakukan optimasi rute!');
        }
    };

    const handleConfirm = async () => {
        try {
            await confirm();
            setRouteMessage('Rute berhasil dikunci & disimpan ke Database!');
            const todayStr = new Date().toISOString().split('T')[0];
            setSelectedDate(todayStr);
            await fetchRoutes(todayStr);
        } catch (error) {
            alert('Gagal menyimpan rute permanen!');
        }
    };

    // ================= KALKULASI KPI =================
    // 🌟 SAFETY NET TAHAP 2: Paksa jadi array kosong kalau tiba-tiba datanya undefined
    const safeRoutesData = Array.isArray(routesData) ? routesData : [];

    const totalFleet = safeRoutesData.length;
    const totalOrders = safeRoutesData.reduce((sum, route) => sum + (route.destinationCount || 0), 0);
    const totalCost = totalFleet > 0 ? (totalFleet * 1250000).toLocaleString('id-ID') : "0";
    const totalRealDistance = safeRoutesData.reduce((sum, route) => sum + (route.totalDistanceKm || 0), 0).toFixed(1);
    
    // Cari rute yang lagi di-klik
    const selectedRouteData = safeRoutesData.find(r => r.routeId === selectedRouteId);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            <Header title="Route Planning Dashboard" />

            {/* 🌟 OVERLAYS & MODALS */}
            <RouteLoadingOverlay 
                isUploading={isUploading} 
                isOptimizing={isOptimizing} 
                loadingProgress={loadingProgress} 
            />

            {showVerificationModal && uploadReport && (
                <UploadVerificationModal 
                    uploadReport={uploadReport}
                    onClose={() => {
                        setShowVerificationModal(false);
                        setUploadReport(null);
                    }}
                    onSaveCoord={saveCoord}
                    onUpdateTime={updateTime}
                    onOptimize={handleOptimize}
                />
            )}

            {previewData && (
                <RoutePreviewModal 
                    previewData={previewData}
                    truckColors={truckColors}
                    onCancel={() => {
                        setPreviewData(null);
                        setShowVerificationModal(true); // Balik ke tabel ijo/merah kalau batal
                    }}
                    onConfirmSave={handleConfirm}
                />
            )}

            {/* 🌟 KONTEN UTAMA (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {/* Pesan Sukses */}
                {routeMessage && (
                    <div className="px-5 py-3 rounded-xl text-sm font-bold border flex items-center gap-3 shadow-sm bg-emerald-50 text-emerald-700 border-emerald-300">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        {routeMessage}
                    </div>
                )}

                {/* Toolbar Atas */}
                <RouteToolbar 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    isUploading={isUploading}
                    onFileUpload={handleFileUpload}
                />

                {/* 4 Kartu KPI */}
                <RouteSummaryCards 
                    totalCost={totalCost}
                    totalDistance={totalRealDistance}
                    totalFleet={totalFleet}
                    totalOrders={totalOrders}
                    onCardClick={setActiveModal}
                />

                {/* Grid Kiri Kanan (Truck List & Detail Sequence) */}
                <div className="grid grid-cols-12 gap-8 items-start pb-4">
                    {!isFocusMode && (
                        <div className="col-span-3 space-y-4 transition-all duration-300">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">local_shipping</span> Today's Fleet
                            </h3>
                            <TruckList 
                                routesData={routesData}
                                selectedRouteId={selectedRouteId}
                                onSelectRoute={setSelectedRouteId}
                            />
                        </div>
                    )}

                    <div className={`${isFocusMode ? 'col-span-12' : 'col-span-9'} space-y-4 transition-all duration-300`}>
                        <RouteDetailPanel 
                            selectedRoute={selectedRouteData}
                            isFocusMode={isFocusMode}
                            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                            showMapView={showMapView}
                            onToggleMapView={() => setShowMapView(!showMapView)}
                            // Injeksi MapComponent ke dalem panel biar ngga usah mikirin logic Leaflet di UI teks
                            mapComponent={
                                <RouteMap 
                                    routesData={routesData}
                                    selectedRouteId={selectedRouteId}
                                    truckColors={truckColors}
                                    onSelectRoute={setSelectedRouteId}
                                />
                            }
                        />
                    </div>
                </div>

                {/* Peta Gede di Bawah */}
                <div className="w-full mt-8 bg-white dark:bg-[#1F1F1F] border border-slate-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden flex flex-col h-[70vh] min-h-[600px]">
                    <div className="p-5 border-b border-slate-200 dark:border-[#333] shrink-0 flex justify-between items-center bg-slate-50 dark:bg-[#1A1A1A]">
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">map</span> Live Route Map
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-[#333] px-2 py-1 rounded">Semua Rute Aktif</span>
                    </div>

                    <div className="flex-1 relative bg-slate-100 dark:bg-[#0a0a0a]">
                        <RouteMap 
                            routesData={routesData}
                            selectedRouteId={selectedRouteId}
                            truckColors={truckColors}
                            droppedNodesData={droppedNodes}
                            onSelectRoute={setSelectedRouteId}
                        />
                        
                        {/* Alert Toko Gagal Routing */}
                        {droppedNodes.length > 0 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-red-200 dark:border-red-900 flex items-center gap-2 animate-bounce cursor-pointer hover:scale-105 transition-transform" onClick={() => alert(`Ada ${droppedNodes.length} toko yang gagal di-routing. Silahkan cek data.`)}>
                                <span className="material-symbols-outlined text-red-600 text-lg">warning</span>
                                <span className="text-xs font-black text-red-600 uppercase tracking-wider">{droppedNodes.length} Toko Gagal AI!</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modal KPI Sederhana (Cost, Distance, dll) */}
            {activeModal && (
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 text-center" onClick={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-5xl text-primary mb-2">info</span>
                        <h3 className="text-lg font-bold mb-4">Fitur Rincian KPI</h3>
                        <p className="text-sm text-slate-500 mb-6">Tampilan rincian {activeModal} sedang dalam tahap pengembangan UI terpisah Bos!</p>
                        <button onClick={() => setActiveModal(null)} className="w-full bg-slate-100 dark:bg-[#333] font-bold py-2 rounded-lg">Tutup</button>
                    </div>
                </div>
            )}

        </div>
    );
}