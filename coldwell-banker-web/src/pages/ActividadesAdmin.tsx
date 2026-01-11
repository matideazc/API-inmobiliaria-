import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  obtenerActividadesAdmin,
  obtenerAsesores,
  exportarActividadesExcel,
  type ActividadAdmin,
  type Asesor,
} from '../services/api';
import styles from './ActividadesAdmin.module.css';
import orbeLogo from '../assets/images/orbe_sin_fondo_blanco.png';
import coldwellLogo from '../assets/images/logo_cb.png';
import logoutIcon from '../assets/icons/cerrar-sesion.png';

// Mapeo de nombres amigables
const ACTIVIDAD_NOMBRES: Record<string, string> = {
  CONTACTOS: 'Contactos',
  REUNION_PRELISTING: 'Reuniones Prelisting',
  REUNION_PREBUYING: 'Reuniones Prebuying',
  ACM: 'ACM',
  CAPTACIONES: 'Captaciones',
  BUSQUEDAS: 'Búsquedas',
  RESERVA_COMPRADOR: 'Reservas Comprador',
  RESERVA_VENDEDOR: 'Reservas Vendedor',
  BAJA_PRECIO: 'Bajas de Precio',
};

// Tipo para agrupar actividades por asesor
interface ActividadesPorAsesor {
  asesor: {
    id: number;
    nombre: string;
    email: string;
  };
  actividades: ActividadAdmin[];
  totales: {
    objetivo: number;
    planificado: number;
    realizado: number;
  };
}

const ActividadesAdmin = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const [semanaInicio, setSemanaInicio] = useState<Date>(obtenerInicioSemana(new Date()));
  const [asesorSeleccionado, setAsesorSeleccionado] = useState<number | null>(null);
  const [actividades, setActividades] = useState<ActividadAdmin[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  // Cargar lista de asesores al montar
  useEffect(() => {
    cargarAsesores();
  }, []);

  // Cargar actividades cuando cambie semana o filtro
  useEffect(() => {
    cargarActividades();
  }, [semanaInicio, asesorSeleccionado]);

  const cargarAsesores = async () => {
    try {
      const data = await obtenerAsesores();
      setAsesores(data);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
    }
  };

  const cargarActividades = async () => {
    try {
      setLoading(true);
      const weekStartStr = formatearFecha(semanaInicio);
      const params: any = { weekStart: weekStartStr };
      
      if (asesorSeleccionado !== null) {
        params.asesorId = asesorSeleccionado;
      }

      const data = await obtenerActividadesAdmin(params);
      setActividades(data);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarSemana = (direccion: number) => {
    const nuevaFecha = new Date(semanaInicio);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
    setSemanaInicio(nuevaFecha);
  };

  const handleExportarExcel = async () => {
    try {
      setExportando(true);
      const weekStartStr = formatearFecha(semanaInicio);
      const params: any = { weekStart: weekStartStr };
      
      if (asesorSeleccionado !== null) {
        params.asesorId = asesorSeleccionado;
      }

      await exportarActividadesExcel(params);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('❌ Error al exportar Excel');
    } finally {
      setExportando(false);
    }
  };

  // Agrupar actividades por asesor (solo cuando se ven todos)
  const agruparPorAsesor = (): ActividadesPorAsesor[] => {
    const grupos = new Map<number, ActividadesPorAsesor>();

    actividades.forEach((act) => {
      if (!grupos.has(act.asesorId)) {
        grupos.set(act.asesorId, {
          asesor: act.asesor,
          actividades: [],
          totales: {
            objetivo: 0,
            planificado: 0,
            realizado: 0,
          },
        });
      }

      const grupo = grupos.get(act.asesorId)!;
      grupo.actividades.push(act);
      grupo.totales.objetivo += act.objetivo;
      grupo.totales.planificado += act.planificado;
      grupo.totales.realizado += act.realizado;
    });

    return Array.from(grupos.values());
  };

  // Calcular totales generales
  const totales = actividades.reduce(
    (acc, act) => ({
      objetivo: acc.objetivo + act.objetivo,
      planificado: acc.planificado + act.planificado,
      realizado: acc.realizado + act.realizado,
    }),
    { objetivo: 0, planificado: 0, realizado: 0 }
  );

  // Obtener nombre del asesor seleccionado
  const nombreAsesorSeleccionado = asesorSeleccionado
    ? asesores.find((a) => a.id === asesorSeleccionado)?.nombre || 'Asesor'
    : null;

  // Determinar si estamos viendo un asesor específico
  const vistaAsesorEspecifico = asesorSeleccionado !== null;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <img src={orbeLogo} alt="Orbe" className={styles.navLogo} />
          
          <div className={styles.navRight}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user?.nombre?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user?.nombre || 'Admin'}</div>
                <div className={styles.userRole}>{user?.rol || 'ADMIN'}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className={styles.logoutBtn}
              title="Cerrar sesión"
            >
              <img src={logoutIcon} alt="Logout" className={styles.logoutIcon} />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className={styles.main}>
        <button onClick={() => navigate('/')} className={styles.backBtn}>
          ← Volver al inicio
        </button>

        {/* Selector de semana */}
        <div className={styles.weekSelector}>
          <button onClick={() => cambiarSemana(-1)} className={styles.weekBtn}>
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.weekDisplay}>
            <Calendar size={20} />
            <span>
              Semana del {formatearFechaLegible(semanaInicio)} al {formatearFechaLegible(obtenerFinSemana(semanaInicio))}
            </span>
          </div>

          <button onClick={() => cambiarSemana(1)} className={styles.weekBtn}>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Filtro de asesor */}
        <div className={styles.filterContainer}>
          <label className={styles.filterLabel}>Filtrar por asesor:</label>
          <select
            value={asesorSeleccionado ?? ''}
            onChange={(e) => setAsesorSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
            className={styles.filterSelect}
          >
            <option value="">Todos los asesores</option>
            {asesores.map((asesor) => (
              <option key={asesor.id} value={asesor.id}>
                {asesor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Card principal */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {vistaAsesorEspecifico 
                ? `Planificación semanal de ${nombreAsesorSeleccionado}`
                : 'Planificación semanal de asesores'}
            </h2>
            <p className={styles.cardSubtitle}>
              {vistaAsesorEspecifico
                ? 'Actividades planificadas y realizadas para la semana seleccionada'
                : 'Visualizá y exportá la planificación y resultados semanales de los asesores'}
            </p>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando...</div>
          ) : (
            <>
              {/* Tabla de actividades */}
              <div className={styles.tableWrapper}>
                <table className={styles.activityTable}>
                  <thead>
                    <tr>
                      {!vistaAsesorEspecifico && <th>Asesor</th>}
                      <th>Actividad</th>
                      <th>Objetivo</th>
                      <th>Planificado</th>
                      <th>Realizado</th>
                      <th>% Cumplimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividades.length === 0 ? (
                      <tr>
                        <td colSpan={vistaAsesorEspecifico ? 5 : 6} className={styles.emptyMessage}>
                          No hay actividades registradas para esta semana
                        </td>
                      </tr>
                    ) : vistaAsesorEspecifico ? (
                      // Vista de asesor específico: sin columna "Asesor"
                      <>
                        {actividades.map((act, index) => {
                          const cumplimiento = act.objetivo > 0 
                            ? Math.round((act.realizado / act.objetivo) * 100)
                            : 0;
                          
                          return (
                            <tr key={`${act.asesorId}-${act.tipoActividad}-${index}`}>
                              <td>{ACTIVIDAD_NOMBRES[act.tipoActividad] || act.tipoActividad}</td>
                              <td className={styles.numberCell}>{act.objetivo}</td>
                              <td className={styles.numberCell}>{act.planificado}</td>
                              <td className={styles.numberCell}>{act.realizado}</td>
                              <td className={styles.percentCell}>
                                <span className={getCumplimientoClass(cumplimiento)}>
                                  {cumplimiento}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        
                        {/* Fila de totales */}
                        <tr className={styles.totalsRow}>
                          <td><strong>Total</strong></td>
                          <td className={styles.numberCell}><strong>{totales.objetivo}</strong></td>
                          <td className={styles.numberCell}><strong>{totales.planificado}</strong></td>
                          <td className={styles.numberCell}><strong>{totales.realizado}</strong></td>
                          <td className={styles.percentCell}>
                            <strong>
                              {totales.objetivo > 0 
                                ? Math.round((totales.realizado / totales.objetivo) * 100)
                                : 0}%
                            </strong>
                          </td>
                        </tr>
                      </>
                    ) : (
                      // Vista de todos los asesores: agrupado por asesor
                      <>
                        {agruparPorAsesor().map((grupo) => {
                          const cumplimientoGrupo = grupo.totales.objetivo > 0
                            ? Math.round((grupo.totales.realizado / grupo.totales.objetivo) * 100)
                            : 0;

                          return (
                            <React.Fragment key={grupo.asesor.id}>
                              {/* Fila de cabecera del grupo */}
                              <tr className={styles.advisorGroupRow}>
                                <td className={styles.advisorGroupName}>{grupo.asesor.nombre}</td>
                                <td className={styles.advisorGroupCell}></td>
                                <td className={`${styles.numberCell} ${styles.advisorGroupCell}`}>
                                  {grupo.totales.objetivo}
                                </td>
                                <td className={`${styles.numberCell} ${styles.advisorGroupCell}`}>
                                  {grupo.totales.planificado}
                                </td>
                                <td className={`${styles.numberCell} ${styles.advisorGroupCell}`}>
                                  {grupo.totales.realizado}
                                </td>
                                <td className={`${styles.percentCell} ${styles.advisorGroupCell}`}>
                                  <span className={getCumplimientoClass(cumplimientoGrupo)}>
                                    {cumplimientoGrupo}%
                                  </span>
                                </td>
                              </tr>

                              {/* Filas de actividades del grupo */}
                              {grupo.actividades.map((act, index) => {
                                const cumplimiento = act.objetivo > 0 
                                  ? Math.round((act.realizado / act.objetivo) * 100)
                                  : 0;
                                
                                return (
                                  <tr key={`${act.asesorId}-${act.tipoActividad}-${index}`}>
                                    <td className={styles.activityDetailCell}></td>
                                    <td>{ACTIVIDAD_NOMBRES[act.tipoActividad] || act.tipoActividad}</td>
                                    <td className={styles.numberCell}>{act.objetivo}</td>
                                    <td className={styles.numberCell}>{act.planificado}</td>
                                    <td className={styles.numberCell}>{act.realizado}</td>
                                    <td className={styles.percentCell}>
                                      <span className={getCumplimientoClass(cumplimiento)}>
                                        {cumplimiento}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                        
                        {/* Fila de totales generales */}
                        <tr className={styles.totalsRow}>
                          <td colSpan={2}><strong>Total</strong></td>
                          <td className={styles.numberCell}><strong>{totales.objetivo}</strong></td>
                          <td className={styles.numberCell}><strong>{totales.planificado}</strong></td>
                          <td className={styles.numberCell}><strong>{totales.realizado}</strong></td>
                          <td className={styles.percentCell}>
                            <strong>
                              {totales.objetivo > 0 
                                ? Math.round((totales.realizado / totales.objetivo) * 100)
                                : 0}%
                            </strong>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Botón exportar Excel */}
              <button
                onClick={handleExportarExcel}
                disabled={exportando || actividades.length === 0}
                className={styles.exportBtn}
              >
                <Download size={20} />
                {exportando ? 'Exportando...' : 'Descargar Excel'}
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <img src={coldwellLogo} alt="Coldwell Banker" className={styles.footerLogo} />
      </footer>
    </div>
  );
};

// ===== HELPERS =====

function obtenerInicioSemana(fecha: Date): Date {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function obtenerFinSemana(inicioSemana: Date): Date {
  const d = new Date(inicioSemana);
  d.setDate(d.getDate() + 6);
  return d;
}

function formatearFecha(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatearFechaLegible(fecha: Date): string {
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function getCumplimientoClass(cumplimiento: number): string {
  if (cumplimiento >= 100) return 'cumplimientoGreen';
  if (cumplimiento >= 70) return 'cumplimientoYellow';
  return 'cumplimientoRed';
}

export default ActividadesAdmin;
