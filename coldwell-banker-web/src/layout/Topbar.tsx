// src/layout/Topbar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Topbar.module.css';
import orbeLogo from '../assets/images/orbe_sin_fondo_blanco.png';
import logoutIcon from '../assets/icons/cerrar-sesion.png';

export default function Topbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className={styles.topbar}>
      {/* Logo Orbe */}
      <div className={styles.brand} onClick={() => navigate('/')}>
        <img src={orbeLogo} alt="Orbe" className={styles.brandLogo} />
      </div>

      {/* Menú de navegación */}
      <nav className={styles.nav}>
        {/* Solo ADMIN y REVISOR ven el botón de Propiedades */}
        {(user?.rol === 'ADMIN' || user?.rol === 'REVISOR') && (
          <button 
            onClick={() => navigate('/propiedades')}
            className={styles.navLink}
          >
            Propiedades
          </button>
        )}
        {user?.rol === 'ADMIN' && (
          <button 
            onClick={() => navigate('/usuarios')}
            className={styles.navLink}
          >
            Usuarios
          </button>
        )}
      </nav>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* User info + Logout */}
      <div className={styles.actions}>
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.nombre || 'Usuario'}</span>
              <span className={styles.userRole}>{user?.rol || 'ASESOR'}</span>
            </div>
          </div>

          {/* Logout Icon Button */}
          <button 
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Cerrar sesión"
          >
            <img src={logoutIcon} alt="Logout" className={styles.logoutIcon} />
          </button>
        </div>
      </div>
    </header>
  );
}
