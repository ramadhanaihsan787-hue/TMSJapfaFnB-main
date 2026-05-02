// src/features/finance/hooks/useExpenses.ts
import { useState } from 'react';
import { toast } from 'sonner';
import { financeService } from '../services/financeService';
import type { ExpenseEntry } from '../types';

export const useExpenses = () => {
    const [entries, setEntries] = useState<ExpenseEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchToday = async () => {
        setIsLoading(true);
        try {
            const data = await financeService.getTodayExpenses();
            setEntries(data || []);
        } catch (error) {
            toast.error("Gagal menarik data kasir hari ini");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistory = async (start: string, end: string) => {
        if (!start || !end) return;
        
        setIsLoading(true);
        try {
            const data = await financeService.getExpenseHistory(start, end);
            setEntries(data || []);
        } catch (error) {
            toast.error("Gagal menarik riwayat data kasir!");
        } finally {
            setIsLoading(false);
        }
    };

    const saveEntry = async (payload: ExpenseEntry) => {
        setIsLoading(true);
        try {
            await financeService.saveExpense(payload);
            toast.success(`Biaya untuk ${payload.plate} berhasil ${payload.id ? 'diupdate' : 'dicatat'}!`);
            return true; // Return true kalau sukses
        } catch (error) {
            toast.error('Terjadi kesalahan saat menyimpan data ke server!');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEntry = async (id: string) => {
        if (!window.confirm('Yakin ingin menghapus entry ini?')) return false;
        
        try {
            await financeService.deleteExpense(id);
            toast.success('Data berhasil dihapus!');
            return true;
        } catch (error) {
            toast.error('Gagal menghapus data dari server!');
            return false;
        }
    };

    return {
        entries,
        isLoading,
        fetchToday,
        fetchHistory,
        saveEntry,
        deleteEntry
    };
};