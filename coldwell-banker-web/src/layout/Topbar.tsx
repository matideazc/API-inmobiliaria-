// src/layout/Topbar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import styles from './Topbar.module.css';

export default function Topbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getBadgeVariant = (rol: string): 'success' | 'danger' | 'warning' => {
    switch (rol) {
      case 'ADMIN':
        return 'danger';
      case 'REVISOR':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <header className={styles.topbar}>
      {/* Logo / Nombre del sistema */}
      <div className={styles.brand} onClick={() => navigate('/')}>
        <img src="/cb-logo.png" alt="Coldwell Banker" className={styles.brandLogo} />
        <span className={styles.brandName}>CB Inmobiliaria</span>
      </div>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Acciones principales */}
      <div className={styles.actions}>
        {/* Usuario */}
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.nombre || 'Usuario'}</span>
              {user?.rol && (
                <Badge variant={getBadgeVariant(user.rol)}>{user.rol}</Badge>
              )}
            </div>
          </div>

          {/* Botón de logout */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            🚪 Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
