// src/features/analytics/tests/useAnalytics.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useAnalytics } from "../hooks/useAnalytics"; 
import { analyticsService } from "../services/analyticsService";
import { toast } from "sonner"; // 🌟 IMPORT TOAST BUAT DI-TEST

// MOCK SERVICE ANALYTICS
vi.mock("../services/analyticsService", () => ({
  analyticsService: {
    fetchAnalyticsData: vi.fn(),
    exportReport: vi.fn(),
  },
}));

// 🌟 FIX CTO: MOCK SONNER (Gantiin mockAlert lama)
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}));

window.URL.createObjectURL = vi.fn() as any;

describe("🔥 FEATURE: ANALYTICS DASHBOARD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("1. fetch data - nyedot 4 jenis data sekaligus (KPI, Fleet, Volume, Driver)", async () => {
    const mockData = {
      summary: { data: { totalShipments: 150 } },
      utilization: { data: { activeTrucks: 10 } },
      volume: { data: [{ time: "10:00", count: 20 }], max: 50 },
      drivers: { data: [{ driver_name: "Udin" }] }
    };
    (analyticsService.fetchAnalyticsData as any).mockResolvedValue(mockData);

    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useAnalytics());
      resultHook = result;
    });

    expect(analyticsService.fetchAnalyticsData).toHaveBeenCalled();
    expect(resultHook.current.kpiData?.totalShipments).toBe(150);
    expect(resultHook.current.fleetData?.activeTrucks).toBe(10);
    expect(resultHook.current.volumeData.length).toBe(1);
    expect(resultHook.current.driverData[0].driver_name).toBe("Udin");
    expect(resultHook.current.summaryLoading).toBe(false);
  });

  test("2. handle tanggal error - start > end dilarang", async () => {
    (analyticsService.fetchAnalyticsData as any).mockResolvedValue({});
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useAnalytics());
      resultHook = result;
    });

    await act(async () => {
      // Set start date lebih masa depan dari end date
      resultHook.current.setStartDate("2026-12-31");
      resultHook.current.setEndDate("2026-01-01");
    });

    // 🌟 FIX CTO: Cek apakah toast.error dipanggil (bukan mockAlert)
    expect(toast.error).toHaveBeenCalledWith("Tanggal Mulai tidak boleh lebih besar dari Tanggal Akhir Bos!");
  });

  test("3. getBarHeight logic", async () => {
    (analyticsService.fetchAnalyticsData as any).mockResolvedValue({});
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useAnalytics());
      resultHook = result;
    });

    expect(resultHook.current.getBarHeight(0, 100)).toBe("5%"); // Kondisi nol
    expect(resultHook.current.getBarHeight(50, 100)).toBe("50%"); // Normal
  });
});