import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useCustomers } from "../hooks/useCustomers"; 
import { customerService } from "../services/customerService";

// MOCK SERVICE CUSTOMER
vi.mock("../services/customerService", () => ({
  customerService: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
  },
}));

vi.stubGlobal('alert', vi.fn());

describe("🔥 FEATURE: MASTER CUSTOMERS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("1. fetch - ambil list customer dan translate data kotor", async () => {
    // Data backend berantakan (kodeCustomer, storeName)
    const mockData = { data: [{ kodeCustomer: "C001", storeName: "Toko A", latitude: -6.1 }] };
    (customerService.getCustomers as any).mockResolvedValue(mockData);

    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useCustomers());
      resultHook = result;
    });

    expect(customerService.getCustomers).toHaveBeenCalled();
    // Harus udah berubah jadi data bersih Frontend (code, name, lat)
    expect(resultHook.current.customers[0].code).toBe("C001");
    expect(resultHook.current.customers[0].name).toBe("Toko A");
    expect(resultHook.current.customers[0].lat).toBe(-6.1);
  });

  test("2. ui state - fungsi navigasi form (goToAdd, goToList, goToEdit)", async () => {
    (customerService.getCustomers as any).mockResolvedValue({ data: [] });
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useCustomers());
      resultHook = result;
    });

    act(() => { resultHook.current.goToAdd(); });
    expect(resultHook.current.viewMode).toBe('add');
    expect(resultHook.current.formData.code).toBe('');

    act(() => { resultHook.current.goToEdit({ code: "C99", name: "Jaya" } as any); });
    expect(resultHook.current.viewMode).toBe('edit');
    expect(resultHook.current.formData.code).toBe("C99");

    act(() => { resultHook.current.goToList(); });
    expect(resultHook.current.viewMode).toBe('list');
  });

  test("3. add - saveCustomer mode 'add'", async () => {
    (customerService.getCustomers as any).mockResolvedValue({ data: [] });
    (customerService.createCustomer as any).mockResolvedValue({ status: "success" });
    
    let resultHook: any;
    await act(async () => {
      const { result } = renderHook(() => useCustomers());
      resultHook = result;
    });

    act(() => { resultHook.current.goToAdd(); });
    
    await act(async () => {
      // Mock dummy event biar preventDefault ga error
      const mockEvent = { preventDefault: vi.fn() } as any; 
      await resultHook.current.saveCustomer(mockEvent);
    });

    expect(customerService.createCustomer).toHaveBeenCalled();
    expect(resultHook.current.showNotification).toBe(true);
    expect(resultHook.current.notificationMessage).toBe("Customer Profile Created");
  });
});