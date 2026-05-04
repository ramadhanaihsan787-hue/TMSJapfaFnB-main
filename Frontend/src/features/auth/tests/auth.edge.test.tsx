// src/features/auth/tests/auth.edge.test.tsx
import React from 'react';
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

// 🌟 3. DUMMY ROLE GUARD (Karena komponen aslinya ga ada di scope, kita simulasiin)
const MockRoleGuard = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
    const { role } = useAuth();
    if (!role) return <div data-testid="redirect-login">Redirecting to Login...</div>;
    if (!allowedRoles.includes(role)) return <div data-testid="unauthorized-page">UNAUTHORIZED 403!</div>;
    return <>{children}</>;
};

describe('🔥 AUTH Edge Cases & Security', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('✅ 1. Lolos Sensor: Token Valid & Belum Expired', () => {
    localStorage.setItem('token', 'token_asli_anti_palsu');

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

    expect(screen.getByTestId('role-text').textContent).toBe('kasir');
    expect(screen.getByTestId('user-text').textContent).toBe('mbak_kasir_1');
    expect(window.location.href).not.toBe('/login'); 
  });

  it('⏳ 2. Ditendang Satpam: Token Basi (Expired)', () => {
    localStorage.setItem('token', 'token_jaman_majapahit');

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

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('☠️ 3. Ditendang Satpam: Token Palsu / Rusak (Invalid JWT)', () => {
    localStorage.setItem('token', 'ini_bukan_token_tapi_kunci_gembok');

    (jwtDecode as any).mockImplementation(() => {
      throw new Error('Invalid token specified');
    });

    render(
      <AuthProvider>
        <DummyDashboard />
      </AuthProvider>
    );

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  // ------------------------------------------------------------------
  // 🌟 TEST ROLE GUARD YANG UDAH DIISI
  // ------------------------------------------------------------------
  describe('🛡️ RoleGuard Edge Cases', () => {
    
    it('🕵️‍♂️ 4. Supir iseng maksa buka URL /finance -> Lempar ke NotFound/Unauthorized', () => {
        // Set token sebagai supir
        localStorage.setItem('token', 'token_supir');
        (jwtDecode as any).mockReturnValue({ exp: (Date.now() / 1000) + 86400, role: 'driver', sub: 'supir_1' });

        render(
            <AuthProvider>
                <MockRoleGuard allowedRoles={['kasir', 'manager_logistik']}>
                    <div data-testid="finance-page">Rahasia Keuangan JAPFA</div>
                </MockRoleGuard>
            </AuthProvider>
        );

        // Supir ga boleh liat halaman finance, harus muncul error 403
        expect(screen.queryByTestId('finance-page')).not.toBeInTheDocument();
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
    });

    it('🕵️‍♂️ 5. Admin logistik maksa buka /pod -> Lempar ke NotFound/Unauthorized', () => {
        // Set token sebagai admin distribusi
        localStorage.setItem('token', 'token_admin');
        (jwtDecode as any).mockReturnValue({ exp: (Date.now() / 1000) + 86400, role: 'admin_distribusi', sub: 'admin_1' });

        render(
            <AuthProvider>
                <MockRoleGuard allowedRoles={['admin_pod', 'manager_logistik']}>
                    <div data-testid="pod-page">Approval POD Rahasia</div>
                </MockRoleGuard>
            </AuthProvider>
        );

        // Admin Logistik ga boleh liat halaman POD, harus muncul error 403
        expect(screen.queryByTestId('pod-page')).not.toBeInTheDocument();
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
    });

  });
});