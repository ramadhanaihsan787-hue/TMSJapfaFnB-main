// src/features/pod/tests/pod.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { SidebarProvider } from '../../../context/SidebarContext';
import { DateRangeProvider } from '../../../context/DateRangeContext';
import { api } from '../../../shared/services/apiClient';
import PodCapturePage from '../../driver-app/pages/PodCapturePage'; 

// 🌟 OBAT JSDOM 1: MOCK MATCHMEDIA
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
});

// 🌟 OBAT JSDOM 2: MOCK CANVAS SIGNATURE (ASYNC MOCK BIAR VITEST NGGA NGAMBEK)
vi.mock('react-signature-canvas', async () => {
    // Kita import react di DALAM mock secara asinkron biar ngga kena masalah "hoisting"
    const react = await import('react');
    return {
        default: react.forwardRef((_props: any, ref: any) => {
            react.useImperativeHandle(ref, () => ({
                isEmpty: () => false, 
                toDataURL: () => 'data:image/png;base64,dummy_signature_data',
                clear: () => {}
            }));
            // Pake createElement murni, JANGAN pake JSX (<div />) di dalem mock!
            return react.createElement('div', { 'data-testid': 'mock-signature-canvas' });
        })
    };
});

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

describe('🎯 INTEGRATION TEST LEVEL 3: Proof of Delivery (POD) Flow', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('Harus bisa melewati flow: Capture -> Submit -> Success -> Next', async () => {
        const mockRouteData = {
            data: { 
                data: { stops: [{ id: 'STOP-1', customerName: 'Toko Budi', status: 'active' }] }, 
                stops: [{ id: 'STOP-1', customerName: 'Toko Budi', status: 'active' }] 
            }
        };
        (api.get as any).mockResolvedValue(mockRouteData);
        (api.post as any).mockResolvedValue({ data: { success: true, message: 'POD Uploaded' } });

        const { container } = renderWithProviders(<PodCapturePage />);

        // 1. UPLOAD FOTO 
        const captureInput = container.querySelector('input[type="file"]');
        if (captureInput) {
            const fakeFile = new File(['(⌐□_□)'], 'pod.png', { type: 'image/png' });
            fireEvent.change(captureInput, { target: { files: [fakeFile] } });
        }

        // 2. KLIK TOMBOL SUBMIT (Nunggu tombolnya aktif)
        const submitBtn = await screen.findByRole('button', { name: /KIRIM BUKTI/i });
        
        await waitFor(() => {
            expect(submitBtn).not.toBeDisabled();
        });

        fireEvent.click(submitBtn);

        // 3. VALIDASI API POST TERPANGGIL
        await waitFor(() => { expect(api.post).toHaveBeenCalled(); });
    });
});