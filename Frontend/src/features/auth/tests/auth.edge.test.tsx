// src/features/auth/tests/auth.edge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// 🌟 1. MOCK JWT DECODE
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// 🌟 2. KOMPONEN DUMMY BUAT NGINTEP ISI CONTEXT
const DummyDashboard = () => {
  const { role, user } = useAuth();
  return (
    <div>
      <span data-testid="role-text">{role || 'KOSONG'}</span>
      <span data-testid="user-text">{user ? user.username : 'KOSONG'}</span>
    </div>
  );
};

describe('🔥 AUTH Edge Cases & Security', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Bersihin ingatan browser palsu kita
    vi.clearAllMocks();
    localStorage.clear();

    // 🌟 JURUS MOCK WINDOW.LOCATION (Biar test ga beneran reload)
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  afterEach(() => {
    // Balikin window.location ke aslinya biar ga ngerusak test lain
    (window as any).location = originalLocation;
  });

  it('✅ 1. Lolos Sensor: Token Valid & Belum Expired', () => {
    // Ceritanya ada token di LocalStorage
    localStorage.setItem('token', 'token_asli_anti_palsu');

    // Kita setting waktu expired-nya besok (+ 1 hari)
    const futureTime = (Date.now() / 1000) + 86400; 
    (jwtDecode as any).mockReturnValue({
      exp: futureTime,
      role: 'kasir',
      sub: 'mbak_kasir_1'
    });

    render(
      <AuthProvider>
        <DummyDashboard />
      </AuthProvider>
    );

    // Ekspektasi: Role dan User langsung keisi dari token!
    expect(screen.getByTestId('role-text').textContent).toBe('kasir');
    expect(screen.getByTestId('user-text').textContent).toBe('mbak_kasir_1');
    expect(window.location.href).not.toBe('/login'); // Ngga ditendang
  });

  it('⏳ 2. Ditendang Satpam: Token Basi (Expired)', () => {
    localStorage.setItem('token', 'token_jaman_majapahit');

    // Kita setting waktu expired-nya KEMARIN (- 1 hari)
    const pastTime = (Date.now() / 1000) - 86400; 
    (jwtDecode as any).mockReturnValue({
      exp: pastTime,
      role: 'driver',
      sub: 'supir_budi'
    });

    render(
      <AuthProvider>
        <DummyDashboard />
      </AuthProvider>
    );

    // Ekspektasi: Token dihapus dan ditendang ke halaman login
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('☠️ 3. Ditendang Satpam: Token Palsu / Rusak (Invalid JWT)', () => {
    localStorage.setItem('token', 'ini_bukan_token_tapi_kunci_gembok');

    // Ceritanya jwtDecode error karena tokennya ga bisa dibelah
    (jwtDecode as any).mockImplementation(() => {
      throw new Error('Invalid token specified');
    });

    render(
      <AuthProvider>
        <DummyDashboard />
      </AuthProvider>
    );

    // Ekspektasi: Otomatis buang token error dan paksa login
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  // ------------------------------------------------------------------
  // SCAFFOLDING BUAT NGETES ROLE GUARD (KOMPONEN LU YANG LAIN)
  // ------------------------------------------------------------------
  describe('🛡️ RoleGuard Edge Cases (Scaffolding)', () => {
    it.todo('🕵️‍♂️ 4. Supir iseng maksa buka URL /finance -> Lempar ke NotFound/Unauthorized');
    it.todo('🕵️‍♂️ 5. Admin logistik maksa buka /pod -> Lempar ke NotFound/Unauthorized');
  });
});