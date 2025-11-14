// src/pages/MandatoForm.tsx
import React, { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearMandato } from '../services/api';
import styles from './MandatoForm.module.css';

const MandatoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plazoDias, setPlazoDias] = useState('');
  const [monto, setMonto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    const plazoDiasNum = Number(plazoDias);
    if (!plazoDias || plazoDiasNum <= 0) {
      setError('El plazo en días debe ser mayor a 0');
      return;
    }

    const montoNum = Number(monto);
    if (!monto || montoNum <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (!id) {
      setError('No se pudo identificar el expediente');
      return;
    }

    setLoading(true);

    try {
      const expedienteId = Number(id);
      
      const data: { plazoDias: number; monto: number; observaciones?: string } = {
        plazoDias: plazoDiasNum,
        monto: montoNum,
      };

      // Solo agregar observaciones si no está vacío
      if (observaciones.trim()) {
        data.observaciones = observaciones.trim();
      }

      await crearMandato(expedienteId, data);

      // Mostrar mensaje de éxito
      setSuccess('✅ Mandato creado correctamente');

      // Esperar 1 segundo y redirigir al detalle
      setTimeout(() => {
        navigate(`/expedientes/${expedienteId}`, { 
          state: { refetch: true, message: 'Mandato creado exitosamente' }
        });
      }, 1000);

    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Error al crear el mandato. Intentá nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/expedientes/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Crear mandato</h1>
          <p className={styles.subtitle}>
            Completá los datos del mandato para este expediente aprobado.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="plazoDias" className={styles.label}>
                Plazo en días <span className={styles.required}>*</span>
              </label>
              <input
                id="plazoDias"
                type="number"
                value={plazoDias}
                onChange={(e) => setPlazoDias(e.target.value)}
                disabled={loading}
                className={styles.input}
                placeholder="Ej: 60, 90, 120"
              />
              <span className={styles.hint}>
                Ingresá el plazo del mandato en días (debe ser mayor a 0)
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="monto" className={styles.label}>
                Monto (ARS) <span className={styles.required}>*</span>
              </label>
              <input
                id="monto"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={loading}
                className={styles.input}
                placeholder="Ej: 1500000"
              />
              <span className={styles.hint}>
                Ingresá el monto en pesos argentinos (sin puntos ni comas)
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="observaciones" className={styles.label}>
                Observaciones <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={loading}
                className={styles.textarea}
                placeholder="Notas adicionales sobre el mandato..."
                rows={4}
                maxLength={300}
              />
              <span className={styles.charCount}>
                {observaciones.length}/300
              </span>
            </div>

            {success && (
              <div className={styles.success}>
                {success}
              </div>
            )}

            {error && (
              <div className={styles.error}>
                ❌ {error}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Creando…' : '📄 Crear mandato'}
              </button>
            </div>
          </form>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              ℹ️ Solo se puede crear un mandato para expedientes que estén en estado <strong>APROBADO</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandatoForm;
