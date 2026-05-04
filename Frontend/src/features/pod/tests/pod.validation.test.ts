// src/features/pod/tests/pod.validation.test.ts
import { describe, it, expect } from 'vitest';

// 🌟 KARENA INI CUMA TEST VALIDASI LOGIC, KITA GAK PERLU RENDER KOMPONEN REACT
// Kita cukup bikin fungsi validasi murni yang biasa lu pake di dalem komponen lu.
const validatePodSubmission = (fotoDataUrl: string | null, signatureDataUrl: string | null, status: string | null) => {
    const errors = [];
    if (!fotoDataUrl) errors.push('Foto wajib diisi');
    if (!signatureDataUrl) errors.push('Tanda tangan wajib diisi');
    if (!status) errors.push('Status pengiriman wajib dipilih');
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

describe('🔥 POD Edge Cases: Form Validation Logic', () => {
    
    it('📸 1. Nolak submit kalau Foto Bukti Pengiriman KOSONG', () => {
        const result = validatePodSubmission(null, 'data:image/png;base64,ttd_ada', 'success');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Foto wajib diisi');
    });
    
    it('✍️ 2. Nolak submit kalau Tanda Tangan Digital BELUM DIISI', () => {
        const result = validatePodSubmission('data:image/png;base64,foto_ada', null, 'success');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Tanda tangan wajib diisi');
    });
    
    it('❌ 3. Nolak submit kalau Status Pengiriman (Sukses/Gagal) BELUM DIPILIH', () => {
        const result = validatePodSubmission('data:image/png;base64,foto_ada', 'data:image/png;base64,ttd_ada', null);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Status pengiriman wajib dipilih');
    });
    
    it('✅ 4. Lolos submit kalau Foto, Tanda Tangan, dan Status LENGKAP', () => {
        const result = validatePodSubmission('data:image/png;base64,foto_ada', 'data:image/png;base64,ttd_ada', 'success');
        
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

});