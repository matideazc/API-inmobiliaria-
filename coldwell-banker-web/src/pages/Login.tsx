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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validación de campos vacíos
    const errors = {
      email: !email.trim(),
      password: !password.trim()
    };
    setFieldErrors(errors);
    
    if (errors.email || errors.password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
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

      navigate('/');
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
      {/* Columna izquierda - Hero */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <img src="/cb-logo.png" alt="Coldwell Banker" className={styles.heroLogo} />
          </div>
          
          <h1 className={styles.heroTitle}>
            Bienvenido a<br />Coldwell Banker
          </h1>
          
          <p className={styles.heroSubtitle}>
            Gestiona tus propiedades y mandatos desde un solo lugar
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Administra propiedades</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Aprueba mandatos</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Centraliza documentación</span>
            </div>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className={styles.heroPattern}></div>
      </div>

      {/* Columna derecha - Formulario */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Iniciar sesión</h2>
              <p className={styles.cardSubtitle}>
                Acceso exclusivo para asesores y administradores
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors(prev => ({ ...prev, email: false }));
                  }}
                  required
                  className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <span className={styles.fieldError}>Este campo es requerido</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Contraseña
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors(prev => ({ ...prev, password: false }));
                    }}
                    required
                    className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePassword}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className={styles.fieldError}>Este campo es requerido</span>
                )}
              </div>

              {error && (
                <div className={styles.errorBanner}>
                  <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <div className={styles.formFooter}>
                <a href="#" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;