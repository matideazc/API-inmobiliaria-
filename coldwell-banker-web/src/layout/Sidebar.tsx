// src/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import styles from './Sidebar.module.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/expedientes', label: 'Expedientes', icon: '📁' },
  { path: '/propiedades', label: 'Propiedades', icon: '🏠', disabled: true },
  { path: '/contactos', label: 'Contactos', icon: '👥', disabled: true },
  { path: '/tareas', label: 'Tareas', icon: '✓', disabled: true },
  { path: '/reportes', label: 'Reportes', icon: '📊', disabled: true },
  { path: '/configuracion', label: 'Configuración', icon: '⚙️', disabled: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header con toggle */}
      <div className={styles.header}>
        {!collapsed && <h1 className={styles.logo}>CB CRM</h1>}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navegación */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''} ${
                item.disabled ? styles.disabled : ''
              }`
            }
            onClick={(e) => item.disabled && e.preventDefault()}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
            {!collapsed && item.disabled && (
              <span className={styles.badge}>Próximamente</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className={styles.footer}>
          <p className={styles.footerText}>Coldwell Banker</p>
          <p className={styles.footerVersion}>v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
