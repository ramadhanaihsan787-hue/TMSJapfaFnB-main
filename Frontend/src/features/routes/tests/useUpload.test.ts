import { renderHook, act } from "@testing-library/react";
import { useUpload } from "../hooks/useUpload";
import { vi, test, expect } from "vitest";

vi.mock("shared/services/apiClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "shared/services/apiClient";

test("upload success", async () => {
  (api.post as any).mockResolvedValue({
    data: {
      success_list: [],
      failed_list: []
    }
  });

  const { result } = renderHook(() => useUpload());
  const file = new File(["test"], "test.xlsx");

  let res;
  // 🌟 FIX: Bungkus pake act!
  await act(async () => {
    res = await result.current.uploadFile(file);
  });

  expect(res).toBe(true);
});