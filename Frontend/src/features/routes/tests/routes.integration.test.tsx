// src/features/routes/tests/routes.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { SidebarProvider } from '../../../context/SidebarContext';
import { DateRangeProvider } from '../../../context/DateRangeContext';
import LogisticsRoutePlanning from '../pages/RoutePlanningPage';
import { api } from '../../../shared/services/apiClient';

// 🌟 OBAT JSDOM
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
});

vi.mock('../../../shared/services/apiClient', () => ({
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn() }
}));

const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <BrowserRouter>
            <AuthProvider><SidebarProvider><DateRangeProvider>{component}</DateRangeProvider></SidebarProvider></AuthProvider>
        </BrowserRouter>
    );
};

describe('🎯 INTEGRATION TEST LEVEL 3: Route Planning Flow', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('Harus bisa melewati full flow: Upload -> Tampil Modal Verifikasi', async () => {
        (api.get as any).mockResolvedValue({ data: { data: [] } }); 
        
        (api.post as any).mockResolvedValue({ 
            data: { 
                success_list: [
                    { order_id: 'O-001', kode_customer: 'C-01', nama_toko: 'Toko Budi', berat: 50, kordinat: '-6.2, 106.8' }
                ],
                failed_list: []
            } 
        });

        const { container } = renderWithProviders(<LogisticsRoutePlanning />);
        
        // 🌟 FIX CTO: Kita ganti nyari text "Filter Jadwal" karena "Route Planning" udah pindah ke Layout
        expect(await screen.findByText(/Filter Jadwal/i)).toBeInTheDocument();

        const fileInput = container.querySelector('input[type="file"]');
        if (fileInput) {
            const fakeFile = new File(['dummy data'], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fireEvent.change(fileInput, { target: { files: [fakeFile] } });
        } else {
            const uploadBtn = screen.getByRole('button', { name: /Upload SAP Excel/i });
            fireEvent.click(uploadBtn);
        }

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled(); 
        });

        expect(await screen.findByText(/Toko Budi/i)).toBeInTheDocument();
    });
});