import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "../services/api";
import { useAuth, type AuthUser } from "../context/AuthContext";
import { logger } from "../utils/logger";
import { validateEmail } from "../utils/validation";
import styles from "./Login.module.css";
import orbeLogo from "../assets/images/orbe_sin_fondo_blanco.png";
import coldwellLogo from "../assets/images/logo_cb.png";

interface LoginResponse {
  mensaje?: string;
  usuario?: AuthUser; // Renombrado de 'user' a 'usuario' para consistencia con backend nuevo
}


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validación mejorada
    if (!email.trim()) {
      setError("El email es obligatorio");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("El formato del email no es válido");
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // El backend ahora establece la cookie automáticamente
      // Solo necesitamos guardar el usuario en el contexto

      // Preferir usuario del backend si está disponible
      if (data.usuario) {
        setAuth(data.usuario);
        logger.debug('✅ Usuario recibido del backend y cookie configurada');
        logger.info('Login exitoso:', data.usuario.email);
        navigate("/");
      } else {
        // Si el backend no envía usuario, llamar a /auth/me para obtenerlo
        logger.warn('⚠️ Backend no envió usuario, consultando /auth/me...');
        const meResponse = await api.get('/auth/me');
        
        if (meResponse.data?.usuario) {
          setAuth(meResponse.data.usuario);
          logger.info('Login exitoso:', meResponse.data.usuario.email);
          navigate("/");
        } else {
          throw new Error("No se pudo obtener información del usuario");
        }
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.mensaje ||
          err?.message ||
          "Error al iniciar sesión. Verificá tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sparkles decorativos adicionales */}
      <span style={{position: 'absolute', top: '5%', right: '20%', fontSize: '22px', color: 'rgba(255,255,255,0.5)', animation: 'twinkle 3.2s ease-in-out infinite'}}>✦</span>
      <span style={{position: 'absolute', top: '30%', left: '15%', fontSize: '18px', color: 'rgba(255,255,255,0.6)', animation: 'twinkle 2.8s ease-in-out infinite', animationDelay: '0.8s'}}>✦</span>
      <span style={{position: 'absolute', bottom: '20%', left: '25%', fontSize: '20px', color: 'rgba(255,255,255,0.55)', animation: 'twinkle 3.5s ease-in-out infinite', animationDelay: '1.5s'}}>✦</span>
      <span style={{position: 'absolute', top: '45%', right: '8%', fontSize: '26px', color: 'rgba(255,255,255,0.65)', animation: 'twinkle 3s ease-in-out infinite', animationDelay: '2s'}}>✦</span>
      <span style={{position: 'absolute', bottom: '35%', right: '30%', fontSize: '16px', color: 'rgba(255,255,255,0.5)', animation: 'twinkle 2.5s ease-in-out infinite', animationDelay: '1s'}}>✦</span>
      
      {/* Lado Izquierdo - Branding */}
      <div className={styles.brandSection}>
        <div className={styles.logoContainer}>
          <img src={orbeLogo} alt="Orbe Logo" className={styles.mainLogo} />
        </div>

        <div className={styles.benefits}>
          <div className={styles.benefitItem}>
            <CheckCircle className={styles.icon} size={24} />
            <span>Simplificá tu día</span>
          </div>
          <div className={styles.benefitItem}>
            <CheckCircle className={styles.icon} size={24} />
            <span>Movete más</span>
          </div>
          <div className={styles.benefitItem}>
            <CheckCircle className={styles.icon} size={24} />
            <span>Vendé mejor</span>
          </div>
        </div>

        <div className={styles.footerLogo}>
          <img src={coldwellLogo} alt="Coldwell Banker" />
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className={styles.formSection}>
        <div className={styles.card}>
          <h2>Iniciar sesión</h2>
          <p className={styles.subtitle}>
            Acceso exclusivo para asesores y administradores
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <a
              href="#"
              className={styles.forgotPassword}
              onClick={(e) => e.preventDefault()}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
