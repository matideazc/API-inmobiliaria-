// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAuthClearCallback } from '../services/api';
import api from '../services/api';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'REVISOR' | 'ASESOR';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean; // Nuevo: indica si estamos verificando la sesión
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Iniciamos en true mientras cargamos

  const clearAuth = () => {
    setUser(null);
    // No necesitamos limpiar localStorage porque usamos cookies
  };

  // Verificar si hay sesión válida al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Llamar al endpoint /auth/me que valida la cookie
        const response = await api.get('/auth/me');
        if (response.data?.usuario) {
          setUser(response.data.usuario);
        }
      } catch (error) {
        // Si falla (401 o cualquier otro), no hay sesión válida
        console.log('No hay sesión activa');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Configurar el callback de clearAuth en el interceptor de axios
    setAuthClearCallback(clearAuth);
  }, []);

  const setAuth = (newUser: AuthUser) => {
    setUser(newUser);
    // No guardamos en localStorage, la cookie se maneja automáticamente
  };

  return (
    <AuthContext.Provider value={{ user, loading, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
