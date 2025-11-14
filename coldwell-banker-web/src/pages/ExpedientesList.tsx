// src/pages/ExpedientesList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExpedientes } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../layout/PageContainer';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import styles from './ExpedientesList.module.css';

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

interface Expediente {
  id: number;
  titulo: string;
  propietarioNombre: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observaciones?: string | null;
  createdAt: string;
  asesor?: Usuario | null;
  mandato?: Mandato | null;
}

const ExpedientesList: React.FC = () => {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadExpedientes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user]);

  const loadExpedientes = async (pageToLoad: number) => {
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

      let lista: Expediente[] = response.data || [];

      // Filtro client-side adicional para ASESOR (red de contención)
      if (user.rol === 'ASESOR') {
        lista = lista.filter(exp => exp.asesor?.id === user.id);
      }

      setExpedientes(lista);

      // Leer paginación del backend
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar expedientes');
      setExpedientes([]);
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
          <p className={styles.loadingText}>Cargando expedientes...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>❌ {error}</p>
          <Button onClick={() => loadExpedientes(page)} variant="secondary">
            Reintentar
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Expedientes"
      actions={
        <Button onClick={() => navigate('/expedientes/nuevo')} variant="primary">
          <span>+</span> Nuevo expediente
        </Button>
      }
    >
      {expedientes.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No hay expedientes para mostrar</p>
          <Button onClick={() => navigate('/expedientes/nuevo')} variant="primary">
            ➕ Crear el primer expediente
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {expedientes.map((exp) => (
              <Card
                key={exp.id}
                hover
                onClick={() => navigate(`/expedientes/${exp.id}`)}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{exp.titulo}</h3>
                  <Badge variant={getEstadoBadgeVariant(exp.estado)}>
                    {exp.estado}
                  </Badge>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Propietario:</span>
                    <span className={styles.cardValue}>{exp.propietarioNombre}</span>
                  </div>

                  {exp.asesor && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Asesor:</span>
                      <span className={styles.cardValue}>{exp.asesor.nombre}</span>
                    </div>
                  )}

                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Fecha:</span>
                    <span className={styles.cardValue}>{formatFecha(exp.createdAt)}</span>
                  </div>

                  {exp.mandato && (
                    <div className={styles.mandatoChip}>
                      <span className={styles.mandatoIcon}>📄</span>
                      <span className={styles.mandatoText}>
                        Mandato: {formatMonto(exp.mandato.monto)} • {exp.mandato.plazo}
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

export default ExpedientesList;
