import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useDriverappFlow } from "../hooks/useDriverappFlow"; 
import { driverappService } from "../services/driverappService";
import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../services/driverappService", () => ({
  driverappService: {
    getMyRoute: vi.fn(),
    updateStopStatus: vi.fn(),
  },
}));

describe("🔥 FEATURE: DRIVER APP FLOW", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  test("1. fetch my-route success on mount", async () => {
    const mockData = { stops: [{ id: 1, status: 'pending' }, { id: 2, status: 'active' }] };
    (driverappService.getMyRoute as any).mockResolvedValue(mockData);
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useDriverappFlow());
      resultHook = result;
    });

    expect(driverappService.getMyRoute).toHaveBeenCalled();
    expect(resultHook.current.tripData).toEqual(mockData);
    expect(resultHook.current.activeStop?.id).toBe(2); 
  });

  test("2. navigate page - startRoute", async () => {
    (driverappService.getMyRoute as any).mockResolvedValue({ stops: [] });
    
    let resultHook: any;
    // 🌟 FIX: Tunggu useEffect kelar dulu!
    await act(async () => {
      const { result } = renderHook(() => useDriverappFlow());
      resultHook = result;
    });
    
    act(() => { resultHook.current.startRoute(); });
    expect(mockNavigate).toHaveBeenCalledWith('/driver/routes');
  });

  test("3. viewStopDetail - set active stop and navigate", async () => {
    (driverappService.getMyRoute as any).mockResolvedValue({ stops: [] });
    
    let resultHook: any;
    // 🌟 FIX: Tunggu useEffect kelar dulu!
    await act(async () => {
      const { result } = renderHook(() => useDriverappFlow());
      resultHook = result;
    });
    
    act(() => { resultHook.current.viewStopDetail({ id: 99, status: 'pending' } as any); });
    expect(resultHook.current.activeStop?.id).toBe(99);
    expect(mockNavigate).toHaveBeenCalledWith('/driver/detail');
  });

  test("4. arriveAtLocation - update status and navigate to pod", async () => {
    const mockData = { stops: [{ id: 123, status: 'active' }] };
    (driverappService.getMyRoute as any).mockResolvedValue(mockData);
    (driverappService.updateStopStatus as any).mockResolvedValue(true);
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useDriverappFlow());
      resultHook = result;
    });

    await act(async () => {
      await resultHook.current.arriveAtLocation();
    });

    expect(driverappService.updateStopStatus).toHaveBeenCalledWith(123, 'arrived');
    expect(mockNavigate).toHaveBeenCalledWith('/driver/pod');
  });

  test("5. basic navigations - submitPod, endTrip, goToHistory", async () => {
    (driverappService.getMyRoute as any).mockResolvedValue({ stops: [] });
    
    let resultHook: any;
    // 🌟 FIX: Tunggu useEffect kelar dulu!
    await act(async () => {
      const { result } = renderHook(() => useDriverappFlow());
      resultHook = result;
    });
    
    act(() => { resultHook.current.submitPod(); });
    expect(mockNavigate).toHaveBeenCalledWith('/driver/summary');

    act(() => { resultHook.current.endTrip(); });
    expect(mockNavigate).toHaveBeenCalledWith('/driver');
  });
});