import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useSettings } from "../hooks/useSettings"; 
import { settingsService } from "../services/settingsService";

// MOCK SERVICE BUKAN API CLIENT
vi.mock("../services/settingsService", () => ({
  settingsService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

describe("🔥 FEATURE: SYSTEM SETTINGS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("1. form render - fetch settings on mount", async () => {
    const mockSettings = { data: { vrp_start_time: "07:00", cost_driver_salary: 5000000 } };
    (settingsService.getSettings as any).mockResolvedValue(mockSettings);

    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useSettings());
      resultHook = result;
    });

    expect(settingsService.getSettings).toHaveBeenCalled();
    expect(resultHook.current.formData.vrp_start_time).toBe("07:00");
    expect(resultHook.current.formData.cost_driver_salary).toBe(5000000);
    expect(resultHook.current.isLoading).toBe(false);
  });

  test("2. update state - handleChange works correctly", async () => {
    (settingsService.getSettings as any).mockResolvedValue({ data: {} });
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useSettings());
      resultHook = result;
    });

    act(() => {
      resultHook.current.handleChange("vrp_end_time", "21:00");
    });

    expect(resultHook.current.formData.vrp_end_time).toBe("21:00");
  });

  test("3. submit - handleSave triggers API and updates status", async () => {
    (settingsService.getSettings as any).mockResolvedValue({ data: {} });
    (settingsService.updateSettings as any).mockResolvedValue({ status: 'success' });
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useSettings());
      resultHook = result;
    });

    await act(async () => {
      await resultHook.current.handleSave();
    });

    expect(settingsService.updateSettings).toHaveBeenCalled();
    expect(resultHook.current.saveStatus).toBe('success');
  });
});