// src/layout/PageContainer.tsx
import type { ReactNode } from 'react';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  title,
  actions,
  className = '',
}: PageContainerProps) {
  const containerClass = `${styles.container} ${className}`;

  return (
    <div className={containerClass}>
      {(title || actions) && (
        <div className={styles.header}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
