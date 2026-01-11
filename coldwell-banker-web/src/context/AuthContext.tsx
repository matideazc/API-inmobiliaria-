// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { setAuthClearCallback } from '../services/api';
import api from '../services/api';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'REVISOR' | 'ASESOR';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const inactivityTimer = useRef<number | null>(null);

  const clearAuth = () => {
    setUser(null);
  };

  // Función de logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
    } catch (error) {
      console.error('Error en logout:', error);
      clearAuth(); // Limpiar igualmente si hay error
    }
  };

  // Verificar sesión inicial
  useEffect(() => {
    if (hasCheckedAuth.current) {
      return;
    }
    
    const checkAuth = async () => {
      hasCheckedAuth.current = true;
      
      try {
        const response = await api.get('/auth/me');
        if (response.data?.usuario) {
          setUser(response.data.usuario);
        }
      } catch (error) {
        console.log('No hay sesión activa');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    setAuthClearCallback(clearAuth);
  }, []);

  // Timer de inactividad (30 minutos)
  useEffect(() => {
    if (!user) {
      // Si no hay usuario, limpiar timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      return;
    }

    const resetTimer = () => {
      // Limpiar timer anterior
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      // Crear nuevo timer
      inactivityTimer.current = setTimeout(() => {
        console.log('Sesión expirada por inactividad');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Iniciar timer

    return () => {
      // Cleanup
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Logout al cerrar ventana
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      // Usar sendBeacon para garantizar que se envíe
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      navigator.sendBeacon(`${API_URL}/auth/logout`);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const setAuth = (newUser: AuthUser) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setAuth, clearAuth, logout }}>
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
