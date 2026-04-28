// src/features/auth/services/authService.ts
import axios from "axios";
import type { LoginCredentials } from "../types";

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username); 
        formData.append('password', credentials.password); 

        const response = await axios.post('http://127.0.0.1:8000/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    }
};