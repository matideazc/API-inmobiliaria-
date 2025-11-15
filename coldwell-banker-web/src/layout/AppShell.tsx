// src/layout/AppShell.tsx
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Topbar from './Topbar';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();

  // No mostrar shell en login
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shellNoSidebar}>
      <Topbar />
      <div className={styles.contentNoSidebar}>{children}</div>
    </div>
  );
}
