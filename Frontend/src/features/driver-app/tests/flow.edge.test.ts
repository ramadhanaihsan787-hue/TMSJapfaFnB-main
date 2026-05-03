import { renderHook, act } from '@testing-library/react';
import { useDriverappFlow } from '../hooks/useDriverappFlow';
import { driverappService } from '../services/driverappService';
import { useDriverStore } from '../../../store/useDriverStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 🌟 1. MOCKING REACT ROUTER
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

// 🌟 2. MOCKING ZUSTAND STORE
vi.mock('../../../store/useDriverStore', () => ({
    useDriverStore: vi.fn()
}));

// 🌟 3. MOCKING API SERVICE
vi.mock('../services/driverappService', () => ({
    driverappService: {
        updateStopStatus: vi.fn(),
        submitEpod: vi.fn(),
        getMyRoute: vi.fn()
    }
}));

describe('Driver Flow Edge Cases', () => {
    let mockFetchMyRoute: any;
    let mockSetActiveStop: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFetchMyRoute = vi.fn();
        mockSetActiveStop = vi.fn();

        // Setup default return untuk Zustand Store
        (useDriverStore as any).mockReturnValue({
            tripData: { stops: [] },
            activeStop: null,
            isLoading: false,
            setActiveStop: mockSetActiveStop,
            fetchMyRoute: mockFetchMyRoute
        });
    });

    it('🔥 1. JANGAN nembak API Arrive kalau activeStop itu NULL (Supir belum pilih rute)', async () => {
        const { result } = renderHook(() => useDriverappFlow());

        await act(async () => {
            await result.current.arriveAtLocation();
        });

        // Ekspektasi: Karena activeStop null, API dan Navigasi NGGA BOLEH JALAN!
        expect(driverappService.updateStopStatus).not.toHaveBeenCalled();
        expect(mockFetchMyRoute).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('🔥 2. Harus nembak API, refresh data, dan pindah ke /pod kalau activeStop ADA', async () => {
        // Kita timpa mock-nya khusus buat tes ini, seolah-olah activeStop ada isinya
        (useDriverStore as any).mockReturnValue({
            tripData: { stops: [] },
            activeStop: { id: "STOP-999", customerName: "Toko Sinar Jaya" },
            isLoading: false,
            setActiveStop: mockSetActiveStop,
            fetchMyRoute: mockFetchMyRoute
        });

        const { result } = renderHook(() => useDriverappFlow());

        await act(async () => {
            await result.current.arriveAtLocation();
        });

        // Ekspektasi: Alurnya harus urut -> Update API -> Fetch Ulang -> Pindah Halaman
        expect(driverappService.updateStopStatus).toHaveBeenCalledWith("STOP-999", 'arrived');
        expect(mockFetchMyRoute).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/driver/pod');
    });

    it('🔥 3. submitPod harus refresh data dari backend dan pindah ke summary', async () => {
        const { result } = renderHook(() => useDriverappFlow());

        await act(async () => {
            await result.current.submitPod();
        });

        // Ekspektasi: fetchMyRoute jalan, lalu navigate
        expect(mockFetchMyRoute).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/driver/summary');
    });
});