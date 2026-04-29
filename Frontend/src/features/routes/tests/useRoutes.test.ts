import { renderHook, act } from "@testing-library/react";
import { useRoutes } from "../hooks/useRoutes";
import { expect, test, vi } from "vitest";

vi.mock("shared/services/apiClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "shared/services/apiClient";

test("initial routes kosong", () => {
  const { result } = renderHook(() => useRoutes());
  expect(result.current.routesData).toEqual([]);
});

test("fetchRoutes success", async () => {
  (api.get as any).mockResolvedValue({
    data: {
      routes: [{ route_id: "R1" }],
      dropped_nodes: []
    }
  });

  const { result } = renderHook(() => useRoutes());

  // 🌟 FIX: Bungkus pake act biar state sempet ke-update!
  await act(async () => {
    await result.current.fetchRoutes("2024-01-01");
  });

  expect(result.current.routesData.length).toBe(1);
});

test("fetchRoutes empty", async () => {
  (api.get as any).mockResolvedValue({
    data: { routes: [] }
  });

  const { result } = renderHook(() => useRoutes());

  await act(async () => {
    await result.current.fetchRoutes("2024-01-01");
  });

  expect(result.current.routesData).toEqual([]);
});

test("fetchRoutes error", async () => {
  (api.get as any).mockRejectedValue(new Error("API error"));

  const { result } = renderHook(() => useRoutes());

  await act(async () => {
    await result.current.fetchRoutes("2024-01-01");
  });

  expect(result.current.routesData).toEqual([]);
});