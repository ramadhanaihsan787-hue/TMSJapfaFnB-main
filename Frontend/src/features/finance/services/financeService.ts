// src/features/finance/services/financeService.ts
import { api } from '../../../shared/services/apiClient';
import type { ExpenseEntry } from '../types';

export const financeService = {
    // 🌟 SUNTIKAN BARU: Tarik Master Data Truk & Driver
    getMasterData: async () => {
        // 🌟 FIX CTO: Udah ditambahin /api/ 
        const [fleetRes, driverRes] = await Promise.all([
            api.get('/api/fleet/vehicles').catch(() => ({ data: { data: [] } })),
            api.get('/api/hr/drivers').catch(() => ({ data: { data: [] } }))
        ]);
        
        // Normalisasi data biar UI ga bingung
        const fleets = (fleetRes.data.data || []).map((v: any) => ({
            plate: v.license_plate || v.plate,
            type: v.type || v.vehicle_type || 'CDD'
        }));
        
        const drivers = (driverRes.data.data || []).map((d: any) => d.name);
        
        return { fleets, drivers };
    },

    getTodayExpenses: async () => {
        // 🌟 FIX CTO: Tambah /api/
        const res = await api.get('/api/finance/expenses/today');
        return res.data.data;
    },

    getExpenseHistory: async (startDate: string, endDate: string) => {
        // 🌟 FIX CTO: Tambah /api/
        const res = await api.get('/api/finance/expenses', { 
            params: { start_date: startDate, end_date: endDate } 
        });
        return res.data.data;
    },

    saveExpense: async (payload: ExpenseEntry) => {
        if (payload.id) {
            // 🌟 FIX CTO: Tambah /api/
            const res = await api.put(`/api/finance/expenses/${payload.id}`, payload);
            return res.data;
        } else {
            // 🌟 FIX CTO: Tambah /api/
            const res = await api.post('/api/finance/expenses', payload);
            return res.data;
        }
    },

    deleteExpense: async (id: string) => {
        // 🌟 FIX CTO: Tambah /api/
        const res = await api.delete(`/api/finance/expenses/${id}`);
        return res.data;
    }
};