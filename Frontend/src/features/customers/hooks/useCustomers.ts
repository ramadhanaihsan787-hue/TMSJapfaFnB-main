// src/features/customers/hooks/useCustomers.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner"; // 🌟 SUNTIKAN SONNER
import { customerService } from "../services/customerService";
import type { Customer, CustomerFormData, ViewMode } from "../types";

const defaultForm: CustomerFormData = {
    code: "", name: "", status: "Active", admin: "", 
    address: "", district: "", city: "", lat: "", lon: ""
};

export const useCustomers = () => {
    // State Utama
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // State UI & Form
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [formData, setFormData] = useState<CustomerFormData>(defaultForm);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const resData = await customerService.getCustomers();
            const actualData = resData?.data?.data || resData?.data || resData;

            if (actualData && Array.isArray(actualData)) {
                const mappedCustomers = actualData.map((cust: any) => ({
                    ...cust,
                    code: cust.kodeCustomer || cust.kode_customer || cust.code || "-",
                    name: cust.storeName || cust.store_name || cust.name || "-",
                    admin: cust.adminName || cust.admin_name || cust.admin || "-",
                    lat: cust.latitude || cust.lat || 0,
                    lon: cust.longitude || cust.lon || 0,
                    address: cust.address || "-",
                    district: cust.district || "-",
                    city: cust.city || "-",
                    status: cust.status || "Active",
                    tier: cust.tier || 'Retailer • Tier 1'
                }));
                setCustomers(mappedCustomers);
            }
        } catch (error) {
            console.error("Gagal load customer:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goToList = () => { setViewMode('list'); setFormData(defaultForm); };
    const goToAdd = () => { setFormData(defaultForm); setViewMode('add'); };
    const goToEdit = (cust: Customer) => {
        setFormData({
            code: cust.code,
            name: cust.name,
            status: cust.status,
            admin: cust.admin,
            address: cust.address,
            district: cust.district,
            city: cust.city,
            lat: String(cust.lat),
            lon: String(cust.lon)
        });
        setViewMode('edit');
    };

    const saveCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            let res;
            if (viewMode === 'add') {
                res = await customerService.createCustomer(formData);
            } else {
                res = await customerService.updateCustomer(formData.code, formData);
            }

            if (res && res.status === "success") {
                setNotificationMessage(viewMode === 'add' ? "Customer Profile Created" : "Customer Profile Updated");
                setShowNotification(true);
                await fetchCustomers(); 

                setTimeout(() => {
                    setShowNotification(false);
                    goToList();
                }, 1500);
            } else {
                // 🌟 FIX CTO: Ganti alert jadi toast.error
                toast.error(`Gagal menyimpan data: ${res?.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error saving customer:", error);
            // 🌟 FIX CTO: Ganti alert jadi toast.error
            toast.error("Terjadi kesalahan saat menyambung ke server.");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        customers, loading, isSaving,
        viewMode, showNotification, notificationMessage,
        formData, setFormData,
        goToList, goToAdd, goToEdit, saveCustomer,
        refreshData: fetchCustomers
    };
};