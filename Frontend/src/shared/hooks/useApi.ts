// src/shared/hooks/useApi.ts (Sesuaikan path-nya ya Bos)
import { useState, useCallback } from 'react';
// 🌟 IMPORT MESIN AXIOS KITA (Sesuaikan path ke apiClient.ts lu)
import { api } from '../services/apiClient'; 

interface UseApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

interface UseApiResponse<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
    execute: (overrideOptions?: UseApiOptions) => Promise<T | null>;
}

/**
 * Custom hook buat narik data API. 
 * 🌟 SEKARANG UDAH PAKE MESIN AXIOS (apiClient) DI DALEMNYA!
 */
export function useApi<T>(url: string, initialOptions: UseApiOptions = {}): UseApiResponse<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Pake stringify buat trik dependency array biar TS anteng
    const optionsString = JSON.stringify(initialOptions);

    const execute = useCallback(async (overrideOptions: UseApiOptions = {}) => {
        const parsedInitial = JSON.parse(optionsString);
        const options = { ...parsedInitial, ...overrideOptions };
        const { method = 'GET', body, headers = {} } = options;

        setLoading(true);
        setError(null);

        try {
            // 🌟 1. TEMBAK PAKE AXIOS (apiClient)
            // KTP (Token), Base URL, dan tendangan 401 udah diurus otomatis sama apiClient!
            // Jadi kodingan lu jauh lebih bersih!
            const response = await api({
                method,
                url,
                data: body, // Axios pakenya 'data', bukan 'body'
                headers
            });

            // 🌟 2. AMBIL HASILNYA
            const result = response.data;
            setData(result);
            return result;

        } catch (err: any) {
            // 🌟 3. TANGKAP ERROR AXIOS
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Terjadi kesalahan API Bos!";
            const errorInstance = new Error(errorMessage);
            setError(errorInstance);
            return null;
        } finally {
            setLoading(false);
        }
    }, [url, optionsString]);

    return { data, error, loading, execute };
}