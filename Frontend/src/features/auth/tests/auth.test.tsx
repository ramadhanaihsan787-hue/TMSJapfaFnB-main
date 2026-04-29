import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom"; 
import { api } from "../../../shared/services/apiClient";
import LoginPage from "../pages/LoginPage"; 

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 🌟 1. MOCK ROUTER
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// 🌟 2. MOCK API CLIENT
vi.mock("../../../shared/services/apiClient", () => ({
  api: { post: vi.fn() },
}));

// 🌟 3. MOCK AUTH CONTEXT
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false
  }),
  AuthProvider: ({ children }: any) => <>{children}</>
}));

describe("🔥 FEATURE: REAL AUTHENTICATION", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("1. form submission - login sukses & redirect role admin", async () => {
    (api.post as any).mockResolvedValue({
      data: { access_token: "token_rahasia_123", role: "admin_distribusi", full_name: "Bos Ihsan" }
    });

    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    // 🌟 FIX: Sesuaikan pencarian elemen dengan UI asli lu!
    const usernameInput = screen.getByPlaceholderText("manager / admin_distribusi");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(usernameInput, { target: { value: "admin_tester" } });
    fireEvent.change(passwordInput, { target: { value: "pass123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled(); 
      
      // Pastikan dia pindah ke halaman yang bener sesuai role!
      expect(mockNavigate).toHaveBeenCalledWith("/logistik"); 
    });
  });

  test("2. login gagal - nampilin pesan error", async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { detail: "Username atau password salah!" } }
    });

    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    // 🌟 FIX: Sesuaikan pencarian elemen dengan UI asli lu!
    fireEvent.change(screen.getByPlaceholderText("manager / admin_distribusi"), { target: { value: "salah_orang" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "ngasal" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username atau password salah!/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled(); 
    });
  });
});