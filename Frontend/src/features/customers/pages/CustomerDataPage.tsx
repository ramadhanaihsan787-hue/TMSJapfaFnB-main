import Header from "../../../components/Header"; 

// 🌟 IMPORT HOOK SAKTI KITA
import { useCustomers } from "../hooks";

// 🌟 IMPORT SEMUA KOMPONEN UI YANG UDAH KITA PECAH
import { 
    CustomerToolbar, 
    CustomerTable, 
    CustomerPagination,
    CustomerForm
} from "../components";

export default function CustomerDirectoryPage() {
    // 🌟 PANGGIL SEMUA DATA DARI HOOK PUSAT
    const { 
        customers, loading, isSaving,
        viewMode, showNotification, notificationMessage,
        formData, setFormData,
        goToList, goToAdd, goToEdit, saveCustomer
    } = useCustomers();

    // =======================================================================
    // RENDER 1: MODE FORM (ADD / EDIT)
    // =======================================================================
    if (viewMode === 'add' || viewMode === 'edit') {
        const isEdit = viewMode === 'edit';
        
        return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
                <Header title={`Data Customer / ${isEdit ? 'Edit Customer' : 'Add New'}`} />

                {/* 🌟 Notifikasi Sukses Mengambang (Floating) */}
                {showNotification && (
                    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#F0FDF4] dark:bg-green-900/30 border border-[#DCFCE7] dark:border-green-800 text-[#15803D] dark:text-green-400 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                        <div>
                            <p className="font-bold text-sm">{notificationMessage}</p>
                            <p className="text-xs mt-0.5">Redirecting to directory...</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <CustomerForm 
                        isEdit={isEdit}
                        isSaving={isSaving}
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={saveCustomer}
                        onCancel={goToList}
                    />
                </div>
            </div>
        );
    }

    // =======================================================================
    // RENDER 2: MODE LIST (TABEL DATA CUSTOMER)
    // =======================================================================
    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0A0A]">
            <Header title="Customer Directory" />

            {/* Content Area */}
            <div className="p-4 md:p-8 max-w-[1600px] w-full mx-auto flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Judul, Search, dan Tombol Add */}
                <CustomerToolbar 
                    customerCount={customers.length}
                    onAdd={goToAdd}
                />

                {/* Bungkus Tabel Utama */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                    
                    {/* Komponen Tabel Jeroan */}
                    <CustomerTable 
                        loading={loading}
                        customers={customers}
                        onEdit={goToEdit}
                    />

                    {/* Pagination & Filter Bawah */}
                    <CustomerPagination 
                        totalItems={customers.length}
                    />

                </div>
            </div>
        </div>
    );
}