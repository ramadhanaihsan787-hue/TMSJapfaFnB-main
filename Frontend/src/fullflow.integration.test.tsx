// src/app/tests/fullflow.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { DateRangeProvider } from './context/DateRangeContext';
import { api } from './shared/services/apiClient';

import RoutePlanningPage from './features/routes/pages/RoutePlanningPage';
import DeliveryDetailPage from './features/driver-app/pages/DeliveryDetailPage';
import PodCapturePage from './features/driver-app/pages/PodCapturePage';

// 🌟 KUMPULAN OBAT JSDOM ANTI MELEDAK
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
});

vi.mock('react-signature-canvas', async () => {
    const react = await import('react');
    return {
        default: react.forwardRef((_props: any, ref: any) => {
            react.useImperativeHandle(ref, () => ({
                isEmpty: () => false, toDataURL: () => 'data:image/png;base64,dummy', clear: () => {}
            }));
            return react.createElement('div', { 'data-testid': 'mock-signature-canvas' });
        })
    };
});

vi.mock('react-map-gl/mapbox', () => ({
    default: () => <div data-testid="mock-map">MapBox</div>,
    Marker: ({ children }: any) => <div data-testid="mock-marker">{children}</div>
}));

vi.mock('./shared/services/apiClient', () => ({
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn() }
}));

const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <MemoryRouter>
            <AuthProvider><SidebarProvider><DateRangeProvider>{component}</DateRangeProvider></SidebarProvider></AuthProvider>
        </MemoryRouter>
    );
};

describe('👑 BOSS LEVEL INTEGRATION TEST: FULL JAPFA FLOW', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('Validasi Flow End-to-End: Admin Upload -> Driver Arrive -> Driver POD Submit', async () => {
        // ==========================================
        // STAGE 1: ADMIN ROUTE PLANNING
        // ==========================================
        (api.get as any).mockResolvedValueOnce({ data: { data: [] } }); 
        (api.post as any).mockResolvedValueOnce({ 
            data: { success_list: [{ order_id: 'O-001', kode_customer: 'C-01', nama_toko: 'Toko Budi', berat: 50, kordinat: '-6.2, 106.8' }], failed_list: [] } 
        });

        const { container: containerAdmin, unmount: unmountAdmin } = renderWithProviders(<RoutePlanningPage />);
        
        // 🌟 FIX CTO: Sama kayak di atas, kita ganti nyari "Filter Jadwal"
        expect(await screen.findByText(/Filter Jadwal/i)).toBeInTheDocument();

        const fileInput = containerAdmin.querySelector('input[type="file"]');
        if (fileInput) {
            const fakeFile = new File(['dummy'], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fireEvent.change(fileInput, { target: { files: [fakeFile] } });
        } else {
            const uploadBtn = screen.getByRole('button', { name: /Upload SAP Excel/i });
            fireEvent.click(uploadBtn);
        }

        await waitFor(() => { expect(api.post).toHaveBeenCalled(); });
        expect(await screen.findByText(/Toko Budi/i)).toBeInTheDocument();
        unmountAdmin();

        // ==========================================
        // STAGE 2: DRIVER NAVIGATE & ARRIVE
        // ==========================================
        (api.get as any).mockResolvedValueOnce({ 
            data: { stops: [{ id: 'STOP-1', customerName: 'Toko Budi', status: 'active', latitude: -6.2, longitude: 106.8 }] } 
        });
        (api.post as any).mockResolvedValueOnce({ data: { success: true } }); 
        
        const { unmount: unmountDriver } = renderWithProviders(<DeliveryDetailPage />);
        expect(await screen.findByText(/Toko Budi/i)).toBeInTheDocument();
        
        const arriveBtn = await screen.findByRole('button', { name: /SAYA SUDAH TIBA/i });
        fireEvent.click(arriveBtn);
        
        await waitFor(() => { expect(api.post).toHaveBeenCalled(); });
        unmountDriver();

        // ==========================================
        // STAGE 3: DRIVER POD SUBMIT
        // ==========================================
        (api.get as any).mockResolvedValueOnce({ 
            data: { stops: [{ id: 'STOP-1', customerName: 'Toko Budi', status: 'active' }] } 
        });
        (api.post as any).mockResolvedValueOnce({ data: { success: true, message: 'POD Uploaded' } }); 
        
        const { container: containerPod } = renderWithProviders(<PodCapturePage />);
        
        const captureInput = containerPod.querySelector('input[type="file"]');
        if (captureInput) {
            const fakeFile = new File(['dummy'], 'pod.png', { type: 'image/png' });
            fireEvent.change(captureInput, { target: { files: [fakeFile] } });
        }
        
        const submitPodBtn = await screen.findByRole('button', { name: /KIRIM BUKTI/i });
        await waitFor(() => { expect(submitPodBtn).not.toBeDisabled(); });
        fireEvent.click(submitPodBtn);
        
        await waitFor(() => { expect(api.post).toHaveBeenCalled(); });
    });
});