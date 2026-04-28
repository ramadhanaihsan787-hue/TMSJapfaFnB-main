// 🌟 1. Import 'api' yang udah kita racik pake interceptor
import { api } from '../../../shared/services/apiClient'; 
import type { LoginCredentials } from '../types';

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username); 
        formData.append('password', credentials.password); 

        // 🌟 2. Tembak pake 'api', ngga usah tulis http://localhost lagi karena udah diurus .env
        const response = await api.post('/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        return response.data;
    }
};