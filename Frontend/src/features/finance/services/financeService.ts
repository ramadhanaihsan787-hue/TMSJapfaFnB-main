// src/features/finance/services/financeService.ts
import { api } from '../../../shared/services/apiClient';
import type { ExpenseEntry } from '../types';

export const financeService = {
    // Tarik data hari ini buat Kasir Dashboard
    getTodayExpenses: async () => {
        const res = await api.get('/finance/expenses/today');
        return res.data.data; // Balikin array data-nya
    },

    // Tarik data rentang tanggal buat Kasir History
    getExpenseHistory: async (startDate: string, endDate: string) => {
        const res = await api.get('/finance/expenses', { 
            params: { start_date: startDate, end_date: endDate } 
        });
        return res.data.data;
    },

    // Save (Create / Update)
    saveExpense: async (payload: ExpenseEntry) => {
        if (payload.id) {
            const res = await api.put(`/finance/expenses/${payload.id}`, payload);
            return res.data;
        } else {
            const res = await api.post('/finance/expenses', payload);
            return res.data;
        }
    },

    // Delete
    deleteExpense: async (id: string) => {
        const res = await api.delete(`/finance/expenses/${id}`);
        return res.data;
    }
};