// src/layout/Topbar.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../ui/Input';
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

  const getBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return 'danger';
      case 'REVISOR':
        return 'warning';
      case 'ASESOR':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <header className={styles.topbar}>
      {/* Buscador global */}
      <div className={styles.search}>
        <Input
          type="text"
          placeholder="Buscar expedientes, propiedades, contactos..."
          icon={<span>🔍</span>}
        />
      </div>

      {/* Acciones principales */}
      <div className={styles.actions}>
        {/* Botón principal CTA */}
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/expedientes/nuevo')}
        >
          <span>+</span> Crear
        </Button>

        {/* Notificaciones */}
        <button className={styles.iconBtn} title="Notificaciones">
          <span className={styles.notificationIcon}>🔔</span>
          <span className={styles.notificationBadge}>3</span>
        </button>

        {/* Usuario */}
        <div className={styles.userMenu}>
          <button className={styles.userBtn} title={user?.email || 'Usuario'}>
            <div className={styles.avatar}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.nombre || 'Usuario'}</span>
              {user?.rol && (
                <Badge variant={getBadgeVariant(user.rol)}>{user.rol}</Badge>
              )}
            </div>
          </button>

          {/* Dropdown menu (placeholder) */}
          <div className={styles.dropdown}>
            <button className={styles.dropdownItem} onClick={() => navigate('/configuracion')}>
              ⚙️ Configuración
            </button>
            <button className={styles.dropdownItem} onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
