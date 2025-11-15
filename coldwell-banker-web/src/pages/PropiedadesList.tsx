// src/pages/PropiedadesList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExpedientes } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../layout/PageContainer';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import styles from './PropiedadesList.module.css';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'REVISOR' | 'ASESOR';
}

interface Mandato {
  id: number;
  plazo: string;
  monto: number;
  observaciones?: string | null;
  createdAt: string;
}

interface Propiedad {
  id: number;
  titulo: string;
  propietarioNombre: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observaciones?: string | null;
  createdAt: string;
  asesor?: Usuario | null;
  mandato?: Mandato | null;
}

const PropiedadesList: React.FC = () => {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadPropiedades(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user]);

  const loadPropiedades = async (pageToLoad: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Si es ASESOR, filtrar por su ID
      const params: { page: number; limit: number; asesorId?: number } = {
        page: pageToLoad,
        limit: limit,
      };

      if (user.rol === 'ASESOR') {
        params.asesorId = user.id;
      }

      const response = await fetchExpedientes(params);

      let lista: Propiedad[] = response.data || [];

      // Filtro client-side adicional para ASESOR (red de contención)
      if (user.rol === 'ASESOR') {
        lista = lista.filter(exp => exp.asesor?.id === user.id);
      }

      setPropiedades(lista);

      // Leer paginación del backend
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar propiedades');
      setPropiedades([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const getEstadoBadgeVariant = (estado: string): 'success' | 'danger' | 'warning' => {
    switch (estado) {
      case 'APROBADO':
        return 'success';
      case 'RECHAZADO':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const formatMonto = (monto: number) => {
    return monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    });
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Cargando propiedades...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>❌ {error}</p>
          <Button onClick={() => loadPropiedades(page)} variant="secondary">
            Reintentar
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Propiedades"
      actions={
        <Button onClick={() => navigate('/propiedades/nueva')} variant="primary">
          <span>+</span> Nueva propiedad
        </Button>
      }
    >
      {propiedades.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No hay propiedades para mostrar</p>
          <Button onClick={() => navigate('/propiedades/nueva')} variant="primary">
            ➕ Crear la primera propiedad
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {propiedades.map((prop) => (
              <Card
                key={prop.id}
                hover
                onClick={() => navigate(`/propiedades/${prop.id}`)}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{prop.titulo}</h3>
                  <Badge variant={getEstadoBadgeVariant(prop.estado)}>
                    {prop.estado}
                  </Badge>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Propietario:</span>
                    <span className={styles.cardValue}>{prop.propietarioNombre}</span>
                  </div>

                  {prop.asesor && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Asesor:</span>
                      <span className={styles.cardValue}>{prop.asesor.nombre}</span>
                    </div>
                  )}

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Fecha:</span>
                    <span className={styles.cardValue}>{formatFecha(prop.createdAt)}</span>
                  </div>

                  {prop.mandato && (
                    <div className={styles.mandatoChip}>
                      <span className={styles.mandatoIcon}>📄</span>
                      <span className={styles.mandatoText}>
                        Mandato: {formatMonto(prop.mandato.monto)} • {prop.mandato.plazo}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          <div className={styles.pagination}>
            <Button
              onClick={handlePrev}
              disabled={page === 1}
              variant="secondary"
              size="sm"
            >
              ← Anterior
            </Button>
            <span className={styles.pageInfo}>
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={handleNext}
              disabled={page === totalPages}
              variant="secondary"
              size="sm"
            >
              Siguiente →
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default PropiedadesList;
