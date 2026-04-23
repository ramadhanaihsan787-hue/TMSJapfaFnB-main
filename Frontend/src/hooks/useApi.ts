import { useState, useCallback } from 'react';

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
 * Custom hook buat narik data API. Sudah otomatis bawa JWT Token!
 */
export function useApi<T>(url: string, initialOptions: UseApiOptions = {}): UseApiResponse<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const execute = useCallback(async (overrideOptions: UseApiOptions = {}) => {
        const options = { ...initialOptions, ...overrideOptions };
        const { method = 'GET', body, headers = {} } = options;

        setLoading(true);
        setError(null);

        try {
            // 🌟 CARA BARU YANG DISUKAI TYPESCRIPT
            const token = localStorage.getItem('token');
            
            // 1. Bikin tas (object) khusus buat headers yang isinya pasti Teks (String)
            const fetchHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                ...headers,
            };

            // 2. Kalau KTP-nya (Token) ada, baru kita masukin ke dalem tas
            if (token) {
                fetchHeaders['Authorization'] = `Bearer ${token}`;
            }

            // 3. Tembak API-nya
            const response = await fetch(`http://127.0.0.1:8000${url}`, {
                method,
                headers: fetchHeaders,
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                // Kalau satpam Backend nolak karena KTP mati/rusak, langsung tendang ke halaman login
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
            return result;
        } catch (err) {
            const errorInstance = err instanceof Error ? err : new Error(String(err));
            setError(errorInstance);
            return null;
        } finally {
            setLoading(false);
        }
    }, [url, initialOptions]);

    return { data, error, loading, execute };
}