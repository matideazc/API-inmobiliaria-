// src/pages/ExpedienteDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api, { descargarMandatoPdf } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChangeStatusModal from '../components/ChangeStatusModal';
import styles from './ExpedienteDetail.module.css';

interface Documento {
  id: number;
  tipo: string;
  rutaArchivo: string;
  createdAt: string;
}

interface Asesor {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface Mandato {
  id: number;
  plazoDias: number;
  monto: number;
  observaciones?: string | null;
  createdAt: string;
}

interface Expediente {
  id: number;
  titulo: string;
  descripcion: string | null;
  propietarioNombre: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observaciones: string | null;
  createdAt: string;
  asesor?: Asesor;
  documentos?: Documento[];
  mandato?: Mandato | null;
}

const ExpedienteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verificar si el usuario puede cambiar el estado
  const canChangeStatus = user?.rol === 'ADMIN' || user?.rol === 'REVISOR';

  // Verificar si el usuario puede crear un mandato
  const canCreateMandato = 
    user?.rol === 'ASESOR' && 
    expediente?.estado === 'APROBADO' && 
    !expediente?.mandato;

  // Verificar si el usuario puede descargar el mandato
  const canDownloadMandato = 
    expediente?.mandato &&
    (user?.rol === 'ADMIN' || 
     user?.rol === 'REVISOR' || 
     (user?.rol === 'ASESOR' && expediente?.asesor?.id === user?.id));

  useEffect(() => {
    if (id) {
      fetchExpediente();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Efecto separado para manejar el refetch después de crear mandato
  useEffect(() => {
    if (location.state?.refetch) {
      // Recargar datos del expediente
      if (id) {
        fetchExpediente();
      }
      
      // Mostrar mensaje de éxito
      if (location.state?.message) {
        setSuccessMessage(location.state.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
      // Limpiar el estado para que no se vuelva a ejecutar
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/expedientes/${id}`);
      setExpediente(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!id || !expediente) return;
    
    setDownloadingPdf(true);
    setDownloadError('');
    
    try {
      await descargarMandatoPdf(Number(id), expediente.titulo);
    } catch (err: any) {
      const errorMsg = err.response?.status === 403
        ? 'No tenés permisos para descargar este mandato'
        : err.response?.status === 404
        ? 'No se encontró el mandato'
        : 'No se pudo descargar el PDF. Intentá nuevamente.';
      
      setDownloadError(errorMsg);
      setTimeout(() => setDownloadError(''), 5000);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.loading}>Cargando…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.error}>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.notFound}>Expediente no encontrado</div>
        </div>
      </div>
    );
  }

  // helper para color según estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return '#10b981';
      case 'RECHAZADO':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const handleStatusChange = (nuevoEstado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO', observaciones: string | null) => {
    // Actualizar el estado local del expediente sin recargar toda la página
    setExpediente(prev => prev ? {
      ...prev,
      estado: nuevoEstado,
      observaciones
    } : null);
    
    // Mostrar mensaje de éxito
    setSuccessMessage('✅ Estado actualizado correctamente');
    setShowModal(false);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className={styles.successBanner}>
            <div className={styles.successContent}>
              <span className={styles.successIcon}>✅</span>
              <span className={styles.successText}>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Mensaje de error de descarga */}
        {downloadError && (
          <div className={styles.errorBanner}>
            ❌ {downloadError}
          </div>
        )}

        <div className={styles.headerActions}>
          <button onClick={() => navigate('/expedientes')} className={styles.backButton}>
            ← Volver
          </button>
          {canChangeStatus && (
            <button 
              onClick={() => setShowModal(true)} 
              className={styles.changeStatusButton}
            >
              🔄 Cambiar estado
            </button>
          )}
          {canCreateMandato && (
            <button 
              onClick={() => navigate(`/expedientes/${id}/mandato`)} 
              className={styles.mandatoButton}
            >
              📄 Crear mandato
            </button>
          )}
          <button 
            onClick={() => navigate(`/expedientes/${id}/upload`)} 
            className={styles.uploadButton}
          >
            📄 Subir documento
          </button>
        </div>

        <div className={styles.card}>
          <h1>{expediente.titulo}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Propietario: <strong>{expediente.propietarioNombre}</strong>
          </p>

          <div className={styles.section}>
            <h3>Estado</h3>
            <p className={styles.badge} style={{ backgroundColor: getEstadoColor(expediente.estado) }}>
              {expediente.estado}
            </p>
          </div>

          {expediente.observaciones && (
            <div className={styles.section}>
              <h3>Observaciones del revisor</h3>
              <p>{expediente.observaciones}</p>
            </div>
          )}

          {expediente.descripcion && (
            <div className={styles.section}>
              <h3>Descripción</h3>
              <p>{expediente.descripcion}</p>
            </div>
          )}

          <div className={styles.section}>
            <h3>Fecha de creación</h3>
            <p>{new Date(expediente.createdAt).toLocaleString()}</p>
          </div>

          {expediente.asesor && (
            <div className={styles.section}>
              <h3>Asesor</h3>
              <p>
                {expediente.asesor.nombre} ({expediente.asesor.email})
              </p>
            </div>
          )}

          {/* Sección de Mandato - DESTACADA */}
          {canDownloadMandato && expediente.mandato && (
            <div className={styles.mandatoSection}>
              <div className={styles.mandatoHeader}>
                <div className={styles.mandatoTitleGroup}>
                  <span className={styles.mandatoIcon}>📄</span>
                  <h3 className={styles.mandatoTitle}>Mandato</h3>
                </div>
                <button 
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className={styles.downloadPdfButton}
                  title="Descargar mandato en PDF"
                >
                  {downloadingPdf ? '⏳ Descargando…' : '� Descargar mandato'}
                </button>
              </div>
              <div className={styles.mandatoBox}>
                <div className={styles.mandatoRow}>
                  <span className={styles.mandatoLabel}>Plazo:</span>
                  <span className={styles.mandatoValue}>{expediente.mandato.plazoDias} días</span>
                </div>
                <div className={styles.mandatoRow}>
                  <span className={styles.mandatoLabel}>Monto:</span>
                  <span className={styles.mandatoValue}>
                    ${expediente.mandato.monto.toLocaleString('es-AR')} ARS
                  </span>
                </div>
                {expediente.mandato.observaciones && (
                  <div className={styles.mandatoRow}>
                    <span className={styles.mandatoLabel}>Observaciones:</span>
                    <span className={styles.mandatoValue}>{expediente.mandato.observaciones}</span>
                  </div>
                )}
                <div className={styles.mandatoRow}>
                  <span className={styles.mandatoLabel}>Fecha de creación:</span>
                  <span className={styles.mandatoValue}>
                    {new Date(expediente.mandato.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Documentos */}
          <div className={styles.section}>
            <h3>Documentos</h3>
            
            {expediente.documentos && expediente.documentos.length > 0 ? (
              <div className={styles.documentosTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Fecha de carga</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expediente.documentos.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.tipo}</td>
                        <td>{new Date(doc.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</td>
                        <td>
                          <a 
                            href={`${import.meta.env.VITE_API_URL}/${doc.rutaArchivo}`}
                            target="_blank" 
                            rel="noreferrer"
                            className={styles.viewButton}
                          >
                            👁️ Ver
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noDocumentsBox}>
                <p>No hay documentos cargados aún.</p>
                <button 
                  onClick={() => navigate(`/expedientes/${id}/upload`)}
                  className={styles.uploadFirstButton}
                >
                  📄 Subir el primer documento
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal para cambiar estado */}
        {showModal && (
          <ChangeStatusModal
            expedienteId={expediente.id}
            estadoActual={expediente.estado}
            onClose={() => setShowModal(false)}
            onSuccess={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
};

export default ExpedienteDetail;