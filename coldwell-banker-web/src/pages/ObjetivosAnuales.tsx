import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerObjetivosAnuales, guardarObjetivosAnuales, type ObjetivoAnualData } from '../services/api';
import styles from './ObjetivosAnuales.module.css';
import orbeLogo from '../assets/images/orbe_sin_fondo_blanco.png';
import logoutIcon from '../assets/icons/cerrar-sesion.png';

// Tipos de actividad en orden fijo
const ACTIVIDADES = [
  { key: 'CONTACTOS', nombre: 'Contactos' },
  { key: 'REUNION_PRELISTING', nombre: 'Prelisting' },
  { key: 'REUNION_PREBUYING', nombre: 'Prebuying' },
  { key: 'ACM', nombre: 'ACM' },
  { key: 'CAPTACIONES', nombre: 'Captaciones' },
  { key: 'BUSQUEDAS', nombre: 'Búsquedas' },
  { key: 'RESERVA_COMPRADOR', nombre: 'Res. Comp.' },
  { key: 'RESERVA_VENDEDOR', nombre: 'Res. Vend.' },
  { key: 'BAJA_PRECIO', nombre: 'Bajas' },
];

export const ObjetivosAnuales: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [añoActual] = useState(new Date().getFullYear());
  const [asesores, setAsesores] = useState<ObjetivoAnualData[]>([]);
  const [asesoresFiltrados, setAsesoresFiltrados] = useState<ObjetivoAnualData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [objetivosEditados, setObjetivosEditados] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    cargarObjetivos();
  }, []);

  useEffect(() => {
    // Filtrar asesores por nombre o email
    if (searchTerm.trim() === '') {
      setAsesoresFiltrados(asesores);
    } else {
      const term = searchTerm.toLowerCase();
      const filtrados = asesores.filter(
        (asesor) =>
          asesor.nombre.toLowerCase().includes(term) ||
          asesor.email.toLowerCase().includes(term)
      );
      setAsesoresFiltrados(filtrados);
    }
  }, [searchTerm, asesores]);

  const cargarObjetivos = async () => {
    try {
      setCargando(true);
      const data = await obtenerObjetivosAnuales(añoActual);
      setAsesores(data.asesores);
      setAsesoresFiltrados(data.asesores);
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
      alert('Error al cargar objetivos anuales');
    } finally {
      setCargando(false);
    }
  };

  const handleObjetivoChange = (asesorId: number, tipoActividad: string, valor: string) => {
    const key = `${asesorId}-${tipoActividad}`;
    const valorNum = parseInt(valor) || 0;
    
    // Guardar en mapa de ediciones
    setObjetivosEditados(new Map(objetivosEditados.set(key, valorNum)));
    
    // Actualizar estado local
    setAsesores(asesores.map(asesor => {
      if (asesor.asesorId === asesorId) {
        return {
          ...asesor,
          objetivos: {
            ...asesor.objetivos,
            [tipoActividad]: valorNum,
          },
        };
      }
      return asesor;
    }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      
      // Convertir todos los objetivos a formato para el backend
      const objetivosParaGuardar = asesores.flatMap((asesor) =>
        ACTIVIDADES.map((act) => ({
          asesorId: asesor.asesorId,
          tipoActividad: act.key,
          objetivoAnual: asesor.objetivos[act.key] || 0,
        }))
      );

      await guardarObjetivosAnuales({
        año: añoActual,
        objetivos: objetivosParaGuardar,
      });

      alert(`✅ Objetivos ${añoActual} guardados correctamente`);
      setObjetivosEditados(new Map());
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar objetivos');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  if (!user || user.rol !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <img src={orbeLogo} alt="Orbe" className={styles.navLogo} />
          <div className={styles.navRight}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{user.nombre.charAt(0).toUpperCase()}</div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.nombre}</span>
                <span className={styles.userRole}>{user.rol}</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Cerrar sesión">
              <img src={logoutIcon} alt="Logout" className={styles.logoutIcon} />
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <button onClick={() => navigate('/admin/actividades')} className={styles.backBtn}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Objetivos Anuales {añoActual}</h1>
            <p className={styles.cardSubtitle}>
              Configura los objetivos anuales de cada asesor. Los objetivos semanales se calculan automáticamente (anual ÷ 52).
            </p>
          </div>

          {/* Búsqueda */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar asesor por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <span className={styles.searchResults}>
                {asesoresFiltrados.length} resultado{asesoresFiltrados.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {cargando ? (
            <div className={styles.loading}>Cargando objetivos...</div>
          ) : (
            <>
              {/* Tabla con scroll */}
              <div className={styles.tableWrapper}>
                <table className={styles.objetivosTable}>
                  <thead>
                    <tr>
                      <th className={styles.stickyCol}>Asesor</th>
                      {ACTIVIDADES.map((act) => (
                        <th key={act.key} title={act.nombre}>
                          {act.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {asesoresFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={10} className={styles.emptyMessage}>
                          No se encontraron asesores
                        </td>
                      </tr>
                    ) : (
                      asesoresFiltrados.map((asesor) => (
                        <tr key={asesor.asesorId}>
                          <td className={styles.stickyCol}>
                            <div className={styles.asesorInfo}>
                              <strong>{asesor.nombre}</strong>
                              <small>{asesor.email}</small>
                            </div>
                          </td>
                          {ACTIVIDADES.map((act) => (
                            <td key={act.key}>
                              <input
                                type="number"
                                min="0"
                                max="99999"
                                value={asesor.objetivos[act.key] || 0}
                                onChange={(e) =>
                                  handleObjetivoChange(asesor.asesorId, act.key, e.target.value)
                                }
                                className={styles.inputObjetivo}
                              />
                              <div className={styles.semanal}>
                                ≈ {Math.round((asesor.objetivos[act.key] || 0) / 52)}/sem
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Info y botones */}
              <div className={styles.footer}>
                <p className={styles.infoText}>
                  Total de asesores: <strong>{asesores.length}</strong> | 
                  Mostrando: <strong>{asesoresFiltrados.length}</strong>
                  {objetivosEditados.size > 0 && (
                    <span className={styles.cambiosPendientes}>
                      {' '}| ⚠️ {objetivosEditados.size} cambios sin guardar
                    </span>
                  )}
                </p>
                <div className={styles.buttonGroup}>
                  {objetivosEditados.size > 0 && (
                    <button
                      onClick={() => {
                        setObjetivosEditados(new Map());
                        cargarObjetivos();
                      }}
                      className={styles.cancelBtn}
                    >
                      Cancelar Cambios
                    </button>
                  )}
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className={styles.saveBtn}
                  >
                    <Save size={20} />
                    {guardando ? 'Guardando...' : 'Guardar Objetivos'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
