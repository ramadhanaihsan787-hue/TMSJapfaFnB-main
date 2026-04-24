// src/features/customers/services/customerService.ts
import { api } from "shared/services/apiClient";
import type { CustomerFormData } from "../types";

export const customerService = {
    getCustomers: async () => {
        const res = await api.get('/api/customers');
        return res.data;
    },

    createCustomer: async (data: CustomerFormData) => {
        const res = await api.post('/api/customers', data);
        return res.data;
    },

    updateCustomer: async (code: string, data: CustomerFormData) => {
        const res = await api.put(`/api/customers/${code}`, data);
        return res.data;
    }
};