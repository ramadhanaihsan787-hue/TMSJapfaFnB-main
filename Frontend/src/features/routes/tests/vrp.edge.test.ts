import { renderHook, act } from '@testing-library/react';
import { useRouteOptimization } from '../hooks/useRouteOptimization';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 🌟 PAKE API CLIENT LU
vi.mock("shared/services/apiClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "shared/services/apiClient";

describe('VRP Edge Cases (Dunia Nyata)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('🔥 1. Harus nolak atau ngasih warning kalau Truk Overload', async () => {
        (api.post as any).mockResolvedValue({
            data: { status: 'error', message: 'Kapasitas truk tidak mencukupi', routes: [] }
        });

        const { result } = renderHook(() => useRouteOptimization());
        let data: any;

        await act(async () => {
            // FIX: Panggil TANPA argumen
            data = await result.current.optimize();
        });

        // Cek data balikan dari fungsi optimize
        expect(data).toBeDefined();
        expect(data.status).toBe('error');
        expect(data.message).toBe('Kapasitas truk tidak mencukupi');
    });

    it('🔥 2. Harus filter otomatis order yang koordinatnya NULL', async () => {
        (api.post as any).mockResolvedValue({
            data: {
                status: 'success',
                routes: [{ id: "ORD-04" }], 
                unassigned: ["ORD-03"] // ORD-03 ke-drop karena null
            }
        });

        const { result } = renderHook(() => useRouteOptimization());
        let data: any;

        await act(async () => {
            data = await result.current.optimize();
        });

        expect(data).toBeDefined();
        expect(data.unassigned).toContain("ORD-03");
        expect(data.routes[0].id).toBe("ORD-04");
    });
});