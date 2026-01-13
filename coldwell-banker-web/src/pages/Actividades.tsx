import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerActividadesSemana, guardarActividadesSemana, type ActividadSemanal } from '../services/api';
import { getPlannedColor, getActualColor } from '../utils/activityColors';
import styles from './Actividades.module.css';
import orbeLogo from '../assets/images/orbe_sin_fondo_blanco.png';
import logoutIcon from '../assets/icons/cerrar-sesion.png';

// Mapeo de nombres técnicos a nombres amigables
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

// Array base con las 9 actividades que SIEMPRE se mostrarán
const BASE_ACTIVITIES: ActividadSemanal[] = [
  { tipoActividad: 'CONTACTOS', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'REUNION_PRELISTING', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'REUNION_PREBUYING', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'ACM', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'CAPTACIONES', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'BUSQUEDAS', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'RESERVA_COMPRADOR', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'RESERVA_VENDEDOR', objetivo: 0, planificado: 0, realizado: 0 },
  { tipoActividad: 'BAJA_PRECIO', objetivo: 0, planificado: 0, realizado: 0 },
];

const Actividades = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  // Estado de la semana actual (lunes)
  const [semanaInicio, setSemanaInicio] = useState<Date>(obtenerInicioSemana(new Date()));
  // IMPORTANTE: inicializar con las 9 actividades base
  const [actividades, setActividades] = useState<ActividadSemanal[]>(BASE_ACTIVITIES);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  // Cargar actividades cuando cambie la semana
  useEffect(() => {
    cargarActividades();
  }, [semanaInicio]);

  const cargarActividades = async () => {
    try {
      setLoading(true);
      const weekStartStr = formatearFecha(semanaInicio);
      const data = await obtenerActividadesSemana(weekStartStr);
      
      // Merge: tomar BASE_ACTIVITIES y actualizar con lo que venga de la API
      const merged = BASE_ACTIVITIES.map((base) => {
        const match = data.find((a) => a.tipoActividad === base.tipoActividad);
        return {
          ...base,
          objetivo: match?.objetivo ?? 0,
          planificado: match?.planificado ?? 0,
          realizado: match?.realizado ?? 0,
        };
      });
      
      setActividades(merged);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      // En caso de error, dejamos las actividades base con 0s
      setActividades(BASE_ACTIVITIES);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      const semanaFin = new Date(semanaInicio);
      semanaFin.setDate(semanaFin.getDate() + 6);

      await guardarActividadesSemana({
        semanaInicio: formatearFecha(semanaInicio),
        semanaFin: formatearFecha(semanaFin),
        actividades: actividades.map(a => ({
          tipoActividad: a.tipoActividad,
          objetivo: a.objetivo,
          planificado: a.planificado,
          realizado: a.realizado, // Ahora también guardamos el realizado
        })),
      });

      alert('✅ Cambios guardados correctamente');
      await cargarActividades(); // Recargar para confirmar
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarSemana = (direccion: number) => {
    const nuevaFecha = new Date(semanaInicio);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
    setSemanaInicio(nuevaFecha);
  };

  const actualizarValor = (index: number, campo: 'objetivo' | 'planificado' | 'realizado', valor: number) => {
    const nuevas = [...actividades];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setActividades(nuevas);
  };

  // Calcular totales
  const totales = actividades.reduce(
    (acc, act) => ({
      objetivo: acc.objetivo + act.objetivo,
      planificado: acc.planificado + act.planificado,
      realizado: acc.realizado + act.realizado,
    }),
    { objetivo: 0, planificado: 0, realizado: 0 }
  );

  // Calcular % de cumplimiento (realizado / planificado)
  const porcentajeCumplimiento = totales.planificado > 0
    ? Math.round((totales.realizado / totales.planificado) * 100)
    : 0;

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
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user?.nombre || 'Usuario'}</div>
                <div className={styles.userRole}>{user?.rol || 'ASESOR'}</div>
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

        {/* Card principal */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Planificación semanal de actividades</h2>

          {loading ? (
            <div className={styles.loading}>Cargando...</div>
          ) : (
            <>
              {/* Panel de Análisis/Insights - Colapsable */}
              <div className={styles.insightsPanel}>
                <button 
                  className={styles.insightsToggle}
                  onClick={() => setInsightsOpen(!insightsOpen)}
                >
                  <div className={styles.insightsHeader}>
                    <span className={styles.insightsTitle}>📊 Análisis de tu semana</span>
                    <div className={styles.insightsSummary}>
                      {(() => {
                        const cumplidos = actividades.filter(a => a.objetivo > 0 && (a.realizado / a.objetivo) >= 1).length;
                        const pendientes = actividades.filter(a => a.objetivo > 0 && (a.realizado / a.objetivo) < 1).length;
                        return (
                          <>
                            <span className={styles.summaryBadge} style={{background: 'rgba(56, 206, 119, 0.2)', color: '#38CE77'}}>
                              ✓ {cumplidos} cumplidos
                            </span>
                            {pendientes > 0 && (
                               <span className={styles.summaryBadge} style={{background: 'rgba(255, 203, 0, 0.2)', color: '#FFCB00'}}>
                                 ⚠ {pendientes} no cumplidos
                               </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <span className={styles.toggleIcon}>{insightsOpen ? '▼' : '▶'}</span>
                </button>

                {insightsOpen && (
                  <div className={styles.insightsContent}>
                    {/* Actividades cumplidas */}
                    {(() => {
                      const cumplidas = actividades.filter(a => {
                        if (a.objetivo === 0) return false;
                        const porcentaje = (a.realizado / a.objetivo) * 100;
                        return porcentaje >= 100;
                      });

                      if (cumplidas.length > 0) {
                        return (
                          <div className={styles.insightsGroup}>
                            <h4 className={styles.groupTitle}>✅ Objetivos Cumplidos</h4>
                            {cumplidas.map((act) => {
                              const porcentaje = Math.round((act.realizado / act.objetivo) * 100);
                              const nombre = ACTIVIDAD_NOMBRES[act.tipoActividad] || act.tipoActividad;
                              const exceso = act.realizado - act.objetivo;
                              
                              let mensaje = '';
                              if (porcentaje > 150) {
                                mensaje = `🎉 ¡Increíble! Superaste tu objetivo por ${exceso}. Excelente desempeño (${porcentaje}%).`;
                              } else if (porcentaje > 120) {
                                mensaje = `🌟 ¡Muy bien! Superaste tu meta por ${exceso}. Vas ${porcentaje}% del objetivo.`;
                              } else if (porcentaje > 100) {
                                mensaje = `👏 ¡Excelente! Cumpliste y superaste tu objetivo (${porcentaje}%). Sigue así!`;
                              } else {
                                mensaje = `✓ ¡Logrado! Cumpliste tu objetivo de ${act.objetivo}. ¡Bien hecho!`;
                              }
                              
                              return (
                                <div key={act.tipoActividad} className={`${styles.insightItem} ${styles.insightSuccess}`}>
                                  <span className={styles.insightText}>
                                    <strong>{nombre}:</strong> {mensaje}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Actividades pendientes */}
                    {(() => {
                      const pendientes = actividades.filter(a => {
                        if (a.objetivo === 0) return false;
                        const porcentaje = (a.realizado / a.objetivo) * 100;
                        return porcentaje < 100;
                      }).sort((a, b) => {
                        // Ordenar por porcentaje ascendente (más críticos primero)
                        const pctA = (a.realizado / a.objetivo) * 100;
                        const pctB = (b.realizado / b.objetivo) * 100;
                        return pctA - pctB;
                      });

                      if (pendientes.length > 0) {
                        return (
                          <div className={styles.insightsGroup}>
                            <h4 className={styles.groupTitle}>⚠️ Objetivos No Cumplidos</h4>
                            {pendientes.map((act) => {
                              const porcentaje = Math.round((act.realizado / act.objetivo) * 100);
                              const diferencia = act.objetivo - act.realizado;
                              const nombre = ACTIVIDAD_NOMBRES[act.tipoActividad] || act.tipoActividad;
                              
                              // Determinar mensaje según porcentaje
                              let mensaje = '';
                              let isWarning = false;
                              
                              if (porcentaje >= 80) {
                                isWarning = true;
                                mensaje = `¡Casi lo logras! Te faltan solo ${diferencia} para cumplir tu meta. ${porcentaje}% completado.`;
                              } else if (porcentaje >= 60) {
                                isWarning = true;
                                mensaje = `Vas bien, pero necesitas reforzar esta actividad. Te faltan ${diferencia} (${porcentaje}% completado).`;
                              } else if (porcentaje >= 40) {
                                mensaje = `Refuerza esta actividad esta semana. Necesitas ${diferencia} más para llegar al objetivo (${porcentaje}% completado).`;
                              } else if (porcentaje >= 20) {
                                mensaje = `Actividad crítica: Te faltan ${diferencia} para el objetivo. Prioriza esta tarea (${porcentaje}% completado).`;
                              } else {
                                mensaje = `⚠️ Atención urgente: Solo lograste ${porcentaje}%. Necesitas ${diferencia} más para cumplir tu objetivo.`;
                              }
                              
                              return (
                                <div key={act.tipoActividad} className={`${styles.insightItem} ${isWarning ? styles.insightWarning : styles.insightDanger}`}>
                                  <span className={styles.insightIcon}>{isWarning ? '⚠️' : '🔴'}</span>
                                  <span className={styles.insightText}>
                                    <strong>{nombre}:</strong> {mensaje}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Tabla de actividades */}
              <div className={styles.tableWrapper}>
                <table className={styles.activityTable}>
                  <thead>
                    <tr>
                      <th>Actividad</th>
                      <th>Objetivo</th>
                      <th>Planificado</th>
                      <th>Realizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividades.map((act, index) => (
                      <tr key={act.tipoActividad}>
                        <td className={styles.activityName}>
                          {ACTIVIDAD_NOMBRES[act.tipoActividad] || act.tipoActividad}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={act.objetivo}
                            disabled
                            className={`${styles.input} ${styles.inputReadonly}`}
                            title="Objetivo configurado por el administrador" />
                        </td>
                        <td className={styles[`cell${getPlannedColor(act.objetivo, act.planificado).charAt(0).toUpperCase() + getPlannedColor(act.objetivo, act.planificado).slice(1)}`]}>
                          <input
                            type="number"
                            min="0"
                            value={act.planificado}
                            onChange={(e) => actualizarValor(index, 'planificado', parseInt(e.target.value) || 0)}
                            className={styles.input}
                          />
                        </td>
                        <td className={styles[`cell${getActualColor(act.objetivo, act.realizado).charAt(0).toUpperCase() + getActualColor(act.objetivo, act.realizado).slice(1)}`]}>
                          <input
                            type="number"
                            min="0"
                            value={act.realizado}
                            onChange={(e) => actualizarValor(index, 'realizado', parseInt(e.target.value) || 0)}
                            className={styles.input}
                          />
                        </td>
                      </tr>
                    ))}
                    
                    {/* Fila de totales */}
                    <tr className={styles.totalsRow}>
                      <td><strong>Total</strong></td>
                      <td><strong>{totales.objetivo}</strong></td>
                      <td><strong>{totales.planificado}</strong></td>
                      <td><strong>{totales.realizado}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.summary}>
                Esta semana tenías como objetivo <strong>{totales.objetivo}</strong> actividades, planificaste{' '}
                <strong>{totales.planificado}</strong> y realizaste <strong>{totales.realizado}</strong>.<br/>
                Cumpliste <strong>{Math.round((totales.realizado / totales.objetivo) * 100) || 0}%</strong> de tus objetivos y{' '}
                <strong>{porcentajeCumplimiento}%</strong> de tu planificación.
              </div>

              {/* Botón guardar */}
              <button
                onClick={handleGuardarCambios}
                disabled={guardando}
                className={styles.saveBtn}
              >
                <Save size={20} />
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// ===== HELPERS =====

/**
 * Obtiene el lunes de la semana de una fecha dada
 */
function obtenerInicioSemana(fecha: Date): Date {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Si es domingo, retroceder 6 días
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtiene el domingo de la semana (lunes + 6 días)
 */
function obtenerFinSemana(inicioSemana: Date): Date {
  const d = new Date(inicioSemana);
  d.setDate(d.getDate() + 6);
  return d;
}

/**
 * Formatea fecha como YYYY-MM-DD para la API
 */
function formatearFecha(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea fecha como DD/MM para mostrar al usuario
 */
function formatearFechaLegible(fecha: Date): string {
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export default Actividades;
