// src/layout/Breadcrumbs.tsx
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

interface Breadcrumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs() {
  const location = useLocation();
  const params = useParams();

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];

    // Home / Inicio
    if (pathSegments.length > 0) {
      breadcrumbs.push({ label: 'Inicio', path: '/' });
    }

    // Construir breadcrumbs basados en la ruta
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');

      // Mapeo de segmentos a labels
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Casos especiales
      if (segment === 'expedientes') {
        label = 'Expedientes';
      } else if (segment === 'nuevo') {
        label = 'Nuevo';
      } else if (segment === 'mandato') {
        label = 'Mandato';
      } else if (segment === 'upload') {
        label = 'Subir documento';
      } else if (params.id && segment === params.id) {
        label = `#EXP-${segment}`;
      } else if (params.expedienteId && segment === params.expedienteId) {
        label = `#EXP-${segment}`;
      }

      // Último breadcrumb no tiene link
      const isLast = index === pathSegments.length - 1;
      breadcrumbs.push({
        label,
        path: isLast ? undefined : path,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // No mostrar breadcrumbs en login
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className={styles.item}>
            {crumb.path ? (
              <Link to={crumb.path} className={styles.link}>
                {crumb.label}
              </Link>
            ) : (
              <span className={styles.current}>{crumb.label}</span>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className={styles.separator}>/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
