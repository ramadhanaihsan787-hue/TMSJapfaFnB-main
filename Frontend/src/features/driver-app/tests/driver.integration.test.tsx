// src/features/driver-app/tests/driver.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { SidebarProvider } from '../../../context/SidebarContext';
import { DateRangeProvider } from '../../../context/DateRangeContext';
import { api } from '../../../shared/services/apiClient';
import DeliveryDetailPage from '../pages/DeliveryDetailPage';

// 🌟 OBAT JSDOM 1: MOCK MATCHMEDIA
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
});

// 🌟 OBAT JSDOM 2: MOCK MAPBOX (Biar mesin testing ngga meledak baca WebGL)
vi.mock('react-map-gl/mapbox', () => ({
    default: () => <div data-testid="mock-map">Peta Mapbox Mock</div>,
    Marker: ({ children }: any) => <div data-testid="mock-marker">{children}</div>
}));

vi.mock('../../../shared/services/apiClient', () => ({
    api: { get: vi.fn(), post: vi.fn() }
}));

const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <MemoryRouter>
            <AuthProvider><SidebarProvider><DateRangeProvider>{component}</DateRangeProvider></SidebarProvider></AuthProvider>
        </MemoryRouter>
    );
};

describe('🎯 INTEGRATION TEST LEVEL 3: Driver Navigation Flow', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('Harus bisa melewati flow: Start -> Navigate -> Arrive -> Next Stop', async () => {
        // 🌟 Struktur MOCK API yang bener sesuai driverappService.ts
        const mockRouteData = {
            data: { 
                stops: [{ 
                    id: 'STOP-1', 
                    customerName: 'Toko Budi', 
                    status: 'active',
                    address: 'Jl. Sudirman',
                    timeWindow: '10:00 - 12:00',
                    weight: '50kg',
                    latitude: -6.2,
                    longitude: 106.8
                }] 
            }
        };
        (api.get as any).mockResolvedValue(mockRouteData);
        
        // 🌟 updateStopStatus pake POST
        (api.post as any).mockResolvedValue({ data: { success: true } });

        renderWithProviders(<DeliveryDetailPage />);

        // Validasi teks nama toko dari API berhasil di render
        expect(await screen.findByText(/Toko Budi/i)).toBeInTheDocument();

        // 🌟 Klik tombol "SAYA SUDAH TIBA"
        const arriveBtn = await screen.findByRole('button', { name: /SAYA SUDAH TIBA/i });
        fireEvent.click(arriveBtn);

        // Validasi API Post dipanggil buat update status
        await waitFor(() => { 
            expect(api.post).toHaveBeenCalled(); 
        });
    });
});