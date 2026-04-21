import React, { useState } from "react";
import Header from "../../components/Header";

type ViewMode = 'list' | 'add' | 'edit';

// =======================================================================
// KOMPONEN ACTION MENU (Diambil dari kodingan temen lu, dimodif dikit)
// =======================================================================
const ActionMenu = ({ 
    customerId, 
    openId, 
    setOpenId, 
    onEdit 
}: { 
    customerId: string, 
    openId: string | null, 
    setOpenId: (id: string | null) => void, 
    onEdit: () => void 
}) => {
    const isOpen = openId === customerId;
    return (
        <div className="relative inline-block text-left">
            <button
                onClick={(e) => { e.stopPropagation(); setOpenId(isOpen ? null : customerId); }}
                className="material-symbols-outlined text-slate-400 hover:text-primary dark:hover:text-[#FF7A00] transition-colors text-[20px] active:scale-95 cursor-pointer"
            >
                more_vert
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#1A1A1A] ring-1 ring-black ring-opacity-5 z-10 border border-slate-200 dark:border-[#333]">
                    <div className="py-1" role="menu">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); setOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Customer
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); alert('View Details'); setOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">visibility</span> View Details
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); alert('Deactivate'); setOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">block</span> Deactivate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function CustomerDirectory() {
    // STATE DARI KODINGAN LU (Ditambah state ActionMenu)
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // State form untuk dipake di Add dan Edit
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        status: "Active",
        admin: "",
        address: "",
        district: "",
        city: "",
        lat: "",
        lon: ""
    });

    // --------------------------------------------------------
    // FUNGSI NAVIGASI / GANTI MODE (DARI KODINGAN LU)
    // --------------------------------------------------------
    const goToList = () => {
        setViewMode('list');
        setFormData({ code: "", name: "", status: "Active", admin: "", address: "", district: "", city: "", lat: "", lon: "" });
    };

    const goToAdd = () => {
        setFormData({ code: "", name: "", status: "Active", admin: "", address: "", district: "", city: "", lat: "", lon: "" });
        setViewMode('add');
    };

    const goToEdit = (custData: any) => {
        setFormData({
            code: custData.code || "C1092-JKT",
            name: custData.name || "TOKO MAJU JAYA",
            status: custData.status || "Active",
            admin: custData.admin || "Budi Santoso",
            address: custData.address || "Jl. Panjang No. 45, Kebon Jeruk",
            district: custData.district || "Kebon Jeruk / 04 / 02",
            city: custData.city || "Jakarta Barat",
            lat: custData.lat || "-6.1944",
            lon: custData.lon || "106.7621"
        });
        setViewMode('edit');
    };

    // --------------------------------------------------------
    // FUNGSI SUBMIT FORM 
    // --------------------------------------------------------
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (viewMode === 'add') {
            setNotificationMessage("Customer Profile Created");
        } else {
            setNotificationMessage("Customer Profile Updated");
        }

        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
            goToList(); 
        }, 1500);
    };

    // =======================================================================
    // RENDER: MODE FORM (ADD & EDIT) - (FULL DARI KODINGAN LU KARENA LEBIH LENGKAP)
    // =======================================================================
    if (viewMode === 'add' || viewMode === 'edit') {
        const isEdit = viewMode === 'edit';
        return (
            <>
                <Header title={`Data Customer / ${isEdit ? 'Edit Customer' : 'Add New'}`} />
                <div className="p-4 md:p-10 max-w-5xl mx-auto w-full relative">
                    
                    {/* Success Notification */}
                    {showNotification && (
                        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#F0FDF4] dark:bg-green-900/30 border border-[#DCFCE7] dark:border-green-800 text-[#15803D] dark:text-green-400 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                            <div>
                                <p className="font-bold text-sm">{notificationMessage}</p>
                                <p className="text-xs mt-0.5">Redirecting to directory...</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Customer Profile' : 'Create New Customer Profile'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {isEdit ? 'Update the logistic node details in the JAPFA industrial network.' : 'Initialize a new logistic node in the JAPFA industrial network.'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FF7A00]"></div>
                        <form className="p-8 space-y-12" onSubmit={handleFormSubmit}>
                            {/* Section: General Identity */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Entity Identity</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Basic identification for the industrial catalog.</p>
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Customer Code</label>
                                        <input required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="JAP-XXXX" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Store Name</label>
                                        <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="Official Commercial Name" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none">
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Admin Name</label>
                                        <input value={formData.admin} onChange={(e) => setFormData({...formData, admin: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="Primary Contact Person" type="text" />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                            {/* Section: Geographic Positioning */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Geospatial Data</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Precise location for kinetic route optimization.</p>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Full Address</label>
                                        <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none resize-none" placeholder="Street, Building, Landmark..." rows={3}></textarea>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">District / RT / RW</label>
                                            <input value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="e.g. Kebayoran, 004/012" type="text" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">City / Regency</label>
                                            <input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="Central Jakarta" type="text" />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-orange-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Coordinates Mapping</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Latitude</label>
                                                <input required value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="-6.1754" type="text" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Longitude</label>
                                                <input required value={formData.lon} onChange={(e) => setFormData({...formData, lon: e.target.value})} className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-sm py-3 px-4 font-medium transition-all dark:text-white outline-none" placeholder="106.8272" type="text" />
                                            </div>
                                        </div>
                                        {/* Mock Map Visual */}
                                        <div className="h-48 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-800">
                                            <img className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30" alt="Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBksDPjW0G30QTXgkCV1SfVmkqCx7A7onJqH5GqHT3RoNersCJtDHegmfH7XXxpbHcMnM6GUcVRLaa2xc0-sRsWeVfYMdGY5LUiU-cgdVWh1MQtZaUUXZikkvJhBJf8DN1ma2R2UeWxG-YyElTTu8uqxCwOfxbtpb5mN2LtF8SUF5T17sswhfotRu08OpeAtpFnTVyEkhpaYwuSfemsGZJFyZOGYY5EyCKcdr1eXO9NawMmu3MV9gXmDx9ooJ7bzWei5Gj4_9H6mlA" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-orange-500/20 p-8 rounded-full border border-orange-500/50 animate-pulse"></div>
                                                <span className="material-symbols-outlined text-orange-600 absolute text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
                                <button type="button" onClick={goToList} className="px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors tracking-tight">
                                    Cancel
                                </button>
                                <button className="px-10 py-4 bg-[#FF7A00] hover:opacity-90 text-white rounded-xl font-bold tracking-tight shadow-lg shadow-orange-500/20 active:scale-95 transition-all duration-150" type="submit">
                                    {isEdit ? 'Update Customer' : 'Save Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        );
    }

    // =======================================================================
    // RENDER: MODE LIST (TABEL DATA CUSTOMER) - DARI KODINGAN TEMEN LU 
    // =======================================================================
    return (
        <>
            <Header title="Customer Directory" />

            {/* Content Area */}
            <div className="p-4 md:p-8 max-w-[1600px] w-full mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Data Customer Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Managing 1,284 verified merchant partners across Indonesia</p>
                </div>

                {/* Unified Search and Action Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="flex-1 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-4 border border-slate-200 dark:border-slate-800">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="w-full bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 placeholder:text-slate-400 dark:text-white outline-none"
                                placeholder="Search customer name, code or full address..."
                                type="text"
                            />
                        </div>
                    </div>
                    {/* BUTTON ADD NYA DIGANTI PAKE LOGIKA LU */}
                    <button
                        onClick={goToAdd}
                        className="bg-[#FF7A00] text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all font-bold tracking-tight">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                        Add New Customer
                    </button>
                </div>

                {/* Data Table Container */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-slate-50 dark:bg-[#222]">
                                <tr>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            CUST CODE
                                            <span className="material-symbols-outlined text-[14px]">filter_list</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            NAMA TOKO
                                            <span className="material-symbols-outlined text-[14px]">filter_list</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            STATUS
                                            <span className="material-symbols-outlined text-[14px]">filter_list</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ADMIN</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ALAMAT</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KECAMATAN/RT/RW</th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            KOTA/KAB
                                            <span className="material-symbols-outlined text-[14px]">filter_list</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">COORDINATES</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {/* Row 1 */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-[#FF7A00]">C1092-JKT</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block">TOKO MAJU JAYA</span>
                                        <span className="text-[10px] text-slate-500">Retailer • Tier 1</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">Budi Santoso</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">Jl. Panjang No. 45, Kebon Jeruk</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">Kebon Jeruk / 04 / 02</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">Jakarta Barat</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                                            <span>-6.1944° S</span>
                                            <span>106.7621° E</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* LOGIKA EDIT LU DIMASUKIN KE KOMPONEN TEMEN LU */}
                                        <ActionMenu 
                                            customerId="C1092-JKT" 
                                            openId={openActionId} 
                                            setOpenId={setOpenActionId} 
                                            onEdit={() => goToEdit({ code: "C1092-JKT", name: "TOKO MAJU JAYA", lat: "-6.1944", lon: "106.7621", district: "Kebon Jeruk / 04 / 02", city: "Jakarta Barat" })} 
                                        />
                                    </td>
                                </tr>
                                {/* Row 2 */}
                                <tr className="bg-slate-50/50 dark:bg-[#1f1f1f] hover:bg-slate-50 dark:hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-[#FF7A00]">C2415-TNG</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block">FARM FRESH INDO</span>
                                        <span className="text-[10px] text-slate-500">Distributor • Tier 2</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">Siti Aminah</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">Ruko Modernland Blok AR/12</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">Cipondoh / 01 / 05</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">Tangerang</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                                            <span>-6.1783° S</span>
                                            <span>106.6319° E</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ActionMenu 
                                            customerId="C2415-TNG" 
                                            openId={openActionId} 
                                            setOpenId={setOpenActionId} 
                                            onEdit={() => goToEdit({ code: "C2415-TNG", name: "FARM FRESH INDO", lat: "-6.1783", lon: "106.6319", district: "Cipondoh / 01 / 05", city: "Tangerang" })} 
                                        />
                                    </td>
                                </tr>
                                {/* Row 3 */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-[#FF7A00]">C0882-JKT</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block">BERKAH ABADI</span>
                                        <span className="text-[10px] text-slate-500">Retailer • Tier 3</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide">Inactive</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">Andi Wijaya</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">Jl. Raden Inten II No. 8</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">Duren Sawit / 07 / 03</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">Jakarta Timur</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                                            <span>-6.2341° S</span>
                                            <span>106.9186° E</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ActionMenu 
                                            customerId="C0882-JKT" 
                                            openId={openActionId} 
                                            setOpenId={setOpenActionId} 
                                            onEdit={() => goToEdit({ code: "C0882-JKT", name: "BERKAH ABADI", lat: "-6.2341", lon: "106.9186", district: "Duren Sawit / 07 / 03", city: "Jakarta Timur" })} 
                                        />
                                    </td>
                                </tr>
                                {/* Row 4 */}
                                <tr className="bg-slate-50/50 dark:bg-[#1f1f1f] hover:bg-slate-50 dark:hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-[#FF7A00]">C5521-BKS</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block">SUMBER REJEKI</span>
                                        <span className="text-[10px] text-slate-500">Partner • Key Account</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">Linda Sari</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">Kawasan Industri Jababeka V</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">Cikarang / 02 / 10</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">Bekasi</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                                            <span>-6.2856° S</span>
                                            <span>107.1706° E</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ActionMenu 
                                            customerId="C5521-BKS" 
                                            openId={openActionId} 
                                            setOpenId={setOpenActionId} 
                                            onEdit={() => goToEdit({ code: "C5521-BKS", name: "SUMBER REJEKI", lat: "-6.2856", lon: "107.1706", district: "Cikarang / 02 / 10", city: "Bekasi" })} 
                                        />
                                    </td>
                                </tr>
                                {/* Row 5 */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold font-mono text-[#FF7A00]">C9902-SOU</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block">SENTRA PANGAN</span>
                                        <span className="text-[10px] text-slate-500">Distributor • Tier 1</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium dark:text-slate-300">Herry Pratama</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">Jl. Fatmawati Raya No. 12B</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">Cilandak / 05 / 01</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">Jakarta Selatan</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
                                            <span>-6.2731° S</span>
                                            <span>106.7968° E</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ActionMenu 
                                            customerId="C9902-SOU" 
                                            openId={openActionId} 
                                            setOpenId={setOpenActionId} 
                                            onEdit={() => goToEdit({ code: "C9902-SOU", name: "SENTRA PANGAN", lat: "-6.2731", lon: "106.7968", district: "Cilandak / 05 / 01", city: "Jakarta Selatan" })} 
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-8 py-4 bg-slate-50 dark:bg-[#222] flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Showing <span className="font-bold text-slate-900 dark:text-white">5</span> of <span className="font-bold text-slate-900 dark:text-white">1,284</span> entries</p>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#222] border border-slate-200 dark:border-slate-700 rounded-lg transition-colors active:scale-95 duration-150">
                                    <span className="material-symbols-outlined text-base">filter_list</span> Filter
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl shadow-lg z-20 overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 dark:border-[#333]">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter By Type</p>
                                        </div>
                                        <div className="p-2 flex flex-col gap-1">
                                            <label className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-[#222] rounded-lg cursor-pointer">
                                                <input type="checkbox" className="rounded text-[#FF7A00] focus:ring-[#FF7A00]" />
                                                <span className="text-sm dark:text-slate-300">Retail Partner</span>
                                            </label>
                                            <label className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-[#222] rounded-lg cursor-pointer">
                                                <input type="checkbox" className="rounded text-[#FF7A00] focus:ring-[#FF7A00]" />
                                                <span className="text-sm dark:text-slate-300">Wholesale</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => alert("Export functionality coming soon")} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#FF7A00] rounded-lg hover:bg-[#e66a00] transition-colors active:scale-95 duration-150">
                                <span className="material-symbols-outlined text-base">download</span> Export
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#FF7A00] transition-all">
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="px-3 py-1 text-xs font-bold bg-[#FF7A00] text-white rounded shadow-sm border border-[#FF7A00]">1</button>
                            <button className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">2</button>
                            <button className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">3</button>
                            <span className="text-slate-400">...</span>
                            <button className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">128</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#FF7A00] transition-all">
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}