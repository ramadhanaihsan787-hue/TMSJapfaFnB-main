import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 🌟 PANGGIL BALIK NAVIGATE-NYA!
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../services/authService";

export const useLogin = () => {
    const navigate = useNavigate(); // 🌟 INISIALISASI NAVIGATE
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        try {
            const data = await authService.login({ username: email, password });
            
            // 1. Simpen token ke Context secara INSTAN
            login(data.access_token); 

            // 2. Pake Navigate biasa biar React ngga usah Refresh Browser!
            if (email === 'admin_pod') {
                navigate('/pod');
            } else if (email === 'manager') {
                navigate('/manager');
            } else if (email.includes('driver')) {
                navigate('/driver');
            } else {
                navigate('/logistik');
            }

        } catch (error) {
            console.error(error);
            setErrorMessage('Login gagal! Cek lagi Username atau Password lu.');
        } finally {
            setIsLoading(false); 
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        errorMessage,
        isLoading,
        handleSignIn
    };
};