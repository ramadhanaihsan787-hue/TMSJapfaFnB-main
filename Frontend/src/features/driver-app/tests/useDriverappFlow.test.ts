import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useDriverappFlow } from "../hooks/useDriverappFlow"; 
import { driverappService } from "../services/driverappService";
import { useNavigate } from "react-router-dom";

// 🌟 FIX CTO: Wajib Import Zustand Store lu!
import { useDriverStore } from "../../../store/useDriverStore"; 

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../services/driverappService", () => ({
  driverappService: {
    getMyRoute: vi.fn(),
    updateStopStatus: vi.fn(),
  },
}));

// 🌟 FIX CTO: Mock Zustand biar state ngga nyangkut antar test!
vi.mock("../../../store/useDriverStore", () => ({
  useDriverStore: vi.fn(),
}));

describe("🔥 FEATURE: DRIVER APP FLOW", () => {
  const mockNavigate = vi.fn();
  let mockFetchMyRoute: any;
  let mockSetActiveStop: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);

    mockFetchMyRoute = vi.fn();
    mockSetActiveStop = vi.fn();

    // Setup nilai default Zustand sebelum tiap test jalan
    (useDriverStore as any).mockReturnValue({
      tripData: null,
      activeStop: null,
      isLoading: false,
      setActiveStop: mockSetActiveStop,
      fetchMyRoute: mockFetchMyRoute,
    });
  });

  test("1. fetch my-route success on mount", async () => {
    await act(async () => {
      renderHook(() => useDriverappFlow());
    });

    // Karena tripData null, hook harusnya otomatis manggil fetchMyRoute
    expect(mockFetchMyRoute).toHaveBeenCalled();
  });

  test("2. navigate page - startRoute", async () => {
    const { result } = renderHook(() => useDriverappFlow());
    
    act(() => { result.current.startRoute(); });
    expect(mockNavigate).toHaveBeenCalledWith('/driver/routes');
  });

  test("3. viewStopDetail - set active stop and navigate", async () => {
    const { result } = renderHook(() => useDriverappFlow());
    
    act(() => { result.current.viewStopDetail({ id: 99, status: 'pending' } as any); });
    
    // Pastikan dia manggil setActiveStop dari Zustand!
    expect(mockSetActiveStop).toHaveBeenCalledWith({ id: 99, status: 'pending' });
    expect(mockNavigate).toHaveBeenCalledWith('/driver/detail');
  });

  test("4. arriveAtLocation - update status and navigate to pod", async () => {
    // 🌟 FIX CTO: Kita manipulasi Zustand khusus test ini, biar activeStop-nya 123
    (useDriverStore as any).mockReturnValue({
      tripData: { stops: [{ id: 123, status: 'active' }] },
      activeStop: { id: 123, status: 'active' }, 
      isLoading: false,
      setActiveStop: mockSetActiveStop,
      fetchMyRoute: mockFetchMyRoute,
    });

    (driverappService.updateStopStatus as any).mockResolvedValue(true);
    
    const { result } = renderHook(() => useDriverappFlow());

    // 🌟 FIX CTO: Wajib di-await karena arriveAtLocation sekarang async!
    await act(async () => {
      await result.current.arriveAtLocation();
    });

    expect(driverappService.updateStopStatus).toHaveBeenCalledWith(123, 'arrived');
    expect(mockNavigate).toHaveBeenCalledWith('/driver/pod');
  });

  test("5. basic navigations - submitPod, endTrip, goToHistory", async () => {
    const { result } = renderHook(() => useDriverappFlow());
    
    // 🌟 FIX CTO: Wajib di-await karena submitPod sekarang async!
    await act(async () => { 
        await result.current.submitPod(); 
    });
    expect(mockNavigate).toHaveBeenCalledWith('/driver/summary');

    // Yang ini tetep sync ngga apa-apa
    act(() => { result.current.endTrip(); });
    expect(mockNavigate).toHaveBeenCalledWith('/driver');

    act(() => { result.current.goToHistory(); });
    expect(mockNavigate).toHaveBeenCalledWith('/driver');
  });
});