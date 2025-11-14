// src/pages/NewExpediente.tsx
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './NewExpediente.module.css';

// lo que mandamos al backend
interface NewExpedienteData {
  titulo: string;
  propietarioNombre: string;
  descripcion?: string;
  estado: 'PENDIENTE';
}

// lo que (según tu backend) nos devuelve al crear
interface CreatedExpedienteResponse {
  mensaje: string;
  expediente: {
    id: number;
    titulo: string;
    propietarioNombre: string;
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    createdAt: string;
    descripcion?: string | null;
  };
}

const NewExpediente: React.FC = () => {
  const [titulo, setTitulo] = useState('');
  const [propietarioNombre, setPropietarioNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // validaciones básicas
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!propietarioNombre.trim()) {
      setError('El nombre del propietario es obligatorio');
      return;
    }

    setLoading(true);

    try {
      // armar body
      const body: NewExpedienteData = {
        titulo: titulo.trim(),
        propietarioNombre: propietarioNombre.trim(),
        estado: 'PENDIENTE',
      };

      if (descripcion.trim()) {
        body.descripcion = descripcion.trim();
      }

      // POST al backend
      const response = await api.post<CreatedExpedienteResponse>('/expedientes', body);

      // acá está el cambio importante 👉 tomamos el id desde response.data.expediente.id
      const expedienteId = response.data?.expediente?.id;

      if (!expedienteId) {
        // si por algún motivo no vino, volvemos a la lista
        navigate('/expedientes');
        return;
      }

      // redirigimos al detalle
      navigate(`/expedientes/${expedienteId}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.mensaje ||
          'Error al crear el expediente. Intentá nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expedientes');
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Crear nuevo expediente</h1>
          <p className={styles.subtitle}>
            Completá los datos del expediente. Después podrás subir los documentos necesarios.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="titulo" className={styles.label}>
                Título <span className={styles.required}>*</span>
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={loading}
                className={styles.input}
                placeholder="Ej: Casa en 9 de Julio"
                maxLength={200}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="propietarioNombre" className={styles.label}>
                Nombre del propietario <span className={styles.required}>*</span>
              </label>
              <input
                id="propietarioNombre"
                type="text"
                value={propietarioNombre}
                onChange={(e) => setPropietarioNombre(e.target.value)}
                disabled={loading}
                className={styles.input}
                placeholder="Ej: Juan Pérez"
                maxLength={150}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="descripcion" className={styles.label}>
                Descripción <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={loading}
                className={styles.textarea}
                placeholder="Ej: Documentación que envió el cliente"
                rows={4}
                maxLength={500}
              />
              <span className={styles.charCount}>{descripcion.length}/500</span>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Creando...' : '✅ Crear expediente'}
              </button>
            </div>
          </form>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              📘 El expediente se creará con estado <strong>PENDIENTE</strong>. Un revisor o
              administrador podrá cambiar el estado más adelante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExpediente;
