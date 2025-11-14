// src/pages/Login.tsx
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth, type AuthUser } from '../context/AuthContext';
import styles from './Login.module.css';

interface LoginResponse {
  token: string;
  user?: {
    id: number;
    nombre: string;
    email: string;
    rol: 'ADMIN' | 'REVISOR' | 'ASESOR';
  };
}

// Función para decodificar JWT sin librerías externas
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      let user: AuthUser;

      // Si el backend trae el usuario completo, lo usamos
      if (data.user) {
        user = data.user;
      } else {
        // Si no, decodificamos el JWT para extraer la info del usuario
        const payload = decodeJWT(data.token);
        
        if (!payload || !payload.rol || !payload.email || !payload.id) {
          throw new Error('Token JWT inválido o sin información necesaria');
        }

        user = {
          id: payload.id,
          nombre: payload.nombre || payload.email.split('@')[0], // Fallback al email si no hay nombre
          email: payload.email,
          rol: payload.rol,
        };
      }

      // Guardar token + usuario en el contexto (y localStorage automáticamente)
      setAuth(data.token, user);

      navigate('/expedientes');
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.mensaje ||
          err?.message ||
          'Error al iniciar sesión. Verificá tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Coldwell Banker</h1>
        <h2 className={styles.subtitle}>Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="********"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.note}>* Más adelante vamos a usar login con Microsoft/Azure AD.</p>
      </div>
    </div>
  );
};

export default Login;