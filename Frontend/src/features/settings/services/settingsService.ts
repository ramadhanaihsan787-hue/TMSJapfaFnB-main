// src/features/settings/services/settingsService.ts
import { api } from "shared/services/apiClient";
import type { SettingsFormData } from "../types";

export const settingsService = {
    getSettings: async () => {
        const res = await api.get('/api/settings');
        return res.data;
    },

    updateSettings: async (data: SettingsFormData) => {
        const res = await api.put('/api/settings', data);
        return res.data;
    }
};