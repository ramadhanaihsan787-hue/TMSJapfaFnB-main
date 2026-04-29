import { renderHook, act } from "@testing-library/react";
import { useRouteOptimization } from "../hooks/useRouteOptimization";
import { vi, test, expect } from "vitest";

vi.mock("shared/services/apiClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "shared/services/apiClient";

test("optimize success", async () => {
  (api.post as any).mockResolvedValue({
    data: { routes: [] }
  });

  const { result } = renderHook(() => useRouteOptimization());

  let data;
  // 🌟 FIX: Bungkus pake act!
  await act(async () => {
    data = await result.current.optimize();
  });

  expect(data).toBeDefined();
});