import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Alat buat ngebelah token

// 🌟 Sesuaikan sama enum UserRole di Backend lu!
export type Role = 'admin_distribusi' | 'manager_logistik' | 'admin_pod' | 'driver' | null;

interface UserData {
  username: string;
  role: Role;
}

interface AuthContextType {
  role: Role;
  user: UserData | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 🌟 JANGAN DI-BYPASS LAGI! Default-nya harus null (Belum Login)
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Pas aplikasi nyala, cek apakah ada token di kantong Browser
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        // Belah tokennya, liat KTP-nya
        const decodedToken: any = jwtDecode(savedToken);
        
        // Cek kalau token expired (opsional tapi bagus)
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
          return;
        }

        setToken(savedToken);
        setRole(decodedToken.role);
        setUser({ username: decodedToken.sub, role: decodedToken.role });
      } catch (error) {
        // Kalau tokennya palsu/rusak, langsung tendang!
        logout();
      }
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedToken: any = jwtDecode(newToken);
      
      localStorage.setItem('token', newToken); // Simpen ke kantong
      setToken(newToken);
      setRole(decodedToken.role);
      setUser({ username: decodedToken.sub, role: decodedToken.role });
    } catch (error) {
      console.error("Gagal membaca token JWT:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); // Buang KTP-nya
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ role, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};