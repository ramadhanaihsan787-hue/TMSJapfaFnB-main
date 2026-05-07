// src/features/routes/pages/RoutePlanningPage.tsx
import React, { useState, useEffect } from "react";
import { toast } from 'sonner'; 

import { useRoutes } from "../hooks/useRoutes";
import { useUpload } from "../hooks/useUpload";
import { useRouteOptimization } from "../hooks/useRouteOptimization";

import RouteToolbar from "../components/RouteToolbar";
import RouteSummaryCards from "../components/RouteSummaryCards";
import TruckList from "../components/TruckList";
import RouteDetailPanel from "../components/RouteDetailPanel";
import RouteMap from "../components/RouteMap";
import RouteLoadingOverlay from "../components/RouteLoadingOverlay";
import UploadVerificationModal from "../components/UploadVerificationModal";
import RoutePreviewModal from "../components/RoutePreviewModal";
// 🌟 FIX CTO: JANGAN LUPA IMPORT MODAL DISPATCH-NYA!
import RouteDispatchModal from "../components/RouteDispatchModal";

import { useHeaderStore } from "../../../store/useHeaderStore";

export default function RoutePlanningPage() {
    const { setTitle } = useHeaderStore();

    useEffect(() => {
        setTitle("Route Planning Dashboard");
    }, [setTitle]);

    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showMapView, setShowMapView] = useState(false);
    const [activeModal, setActiveModal] = useState<'cost' | 'distance' | 'fleet' | 'stops' | null>(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const truckColors = ['#e11d48', '#0284c7', '#16a34a', '#d97706', '#9333ea', '#0d9488', '#0891b2'];

    const { routesData, droppedNodes, selectedRouteId, setSelectedRouteId, fetchRoutes } = useRoutes();
    
    const { 
        isUploading, uploadReport, setUploadReport, uploadFile, 
        updateTime, saveCoord, updateWeight, updateSuccessCoord 
    } = useUpload();
    
    // 🌟 FIX CTO: Tarik resequenceRoute dari hook!
    const { isOptimizing, previewData, setPreviewData, loadingProgress, optimize, confirm, resequenceRoute } = useRouteOptimization();

    useEffect(() => {
        fetchRoutes(selectedDate);
    }, [selectedDate, fetchRoutes]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const success = await uploadFile(file);
        if (success) setShowVerificationModal(true);
        
        event.target.value = ''; 
    };

    const handleOptimize = async () => {
        setShowVerificationModal(false);
        try {
            await optimize();
        } catch (error) {
            toast.error('Gagal melakukan optimasi rute!');
        }
    };

    const safeRoutesData = Array.isArray(routesData) ? routesData : [];
    const totalFleet = safeRoutesData.length;
    const totalOrders = safeRoutesData.reduce((sum, route: any) => sum + (route.destinationCount || route.destinasi_jumlah || 0), 0);
    const totalCostRaw = safeRoutesData.reduce((sum, route: any) => sum + (route.transportCost || route.transport_cost || 0), 0);
    const totalCost = totalCostRaw.toLocaleString('id-ID');
    const totalRealDistance = safeRoutesData.reduce((sum, route: any) => sum + (route.totalDistanceKm || route.total_distance_km || 0), 0).toFixed(1);
    
    const selectedRouteData = safeRoutesData.find((r: any) => (r.routeId || r.route_id) === selectedRouteId);

    const [dispatchData, setDispatchData] = useState<any>(null);
    const [isSavingRoute, setIsSavingRoute] = useState(false);
    
    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">

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
                    onUpdateWeight={updateWeight}
                    onUpdateSuccessCoord={updateSuccessCoord}
                    onOptimize={handleOptimize}
                />
            )}

            {previewData && !dispatchData && (
                <RoutePreviewModal 
                    previewData={previewData}
                    truckColors={truckColors}
                    onCancel={() => {
                        setPreviewData(null);
                        setShowVerificationModal(true);
                    }}
                    onProceedDispatch={(draft) => {
                        setDispatchData(draft);
                    }}
                    onResequence={async (draft) => {
                        await resequenceRoute(draft);
                    }}
                />
            )}

            {dispatchData && (
                <RouteDispatchModal 
                    draftData={dispatchData}
                    isSaving={isSavingRoute}
                    onBack={() => setDispatchData(null)}
                    onConfirmSave={async (finalDataWithKru: any) => { // 🌟 FIX CTO: Kasih tipe any biar TS ga bawel
                        setIsSavingRoute(true);
                        try {
                            await confirm(finalDataWithKru);
                            toast.success('Rute berhasil dikunci & Armada diberangkatkan! 🚀');
                            const todayStr = new Date().toISOString().split('T')[0];
                            setSelectedDate(todayStr);
                            await fetchRoutes(todayStr);
                            setDispatchData(null);
                            setPreviewData(null);
                        } catch (error) {
                            toast.error('Gagal menyimpan rute permanen!');
                        } finally {
                            setIsSavingRoute(false);
                        }
                    }}
                />
            )}

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <RouteToolbar 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    isUploading={isUploading}
                    onFileUpload={handleFileUpload}
                />

                <RouteSummaryCards 
                    totalCost={totalCost}
                    totalDistance={totalRealDistance}
                    totalFleet={totalFleet}
                    totalOrders={totalOrders}
                    onCardClick={setActiveModal}
                />

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
                        
                        {droppedNodes.length > 0 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-red-200 dark:border-red-900 flex items-center gap-2 animate-bounce cursor-pointer hover:scale-105 transition-transform" onClick={() => toast.warning(`Ada ${droppedNodes.length} toko yang gagal di-routing. Silahkan cek data.`)}>
                                <span className="material-symbols-outlined text-red-600 text-lg">warning</span>
                                <span className="text-xs font-black text-red-600 uppercase tracking-wider">{droppedNodes.length} Toko Gagal AI!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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