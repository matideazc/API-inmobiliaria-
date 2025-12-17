// src/pages/GestionUsuarios.tsx
import { useState, useEffect } from 'react';
import { Plus, UserCog, Trash2, Shield, User, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import styles from './GestionUsuarios.module.css';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'REVISOR' | 'ASESOR';
  createdAt: string;
}

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️ Nuevo estado
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'ASESOR' as 'ADMIN' | 'REVISOR' | 'ASESOR'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data.usuarios);
    } catch (err: any) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/usuarios', formData);
      setSuccess('✅ Usuario creado exitosamente');
      setFormData({ nombre: '', email: '', password: '', rol: 'ASESOR' });
      setShowForm(false);
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const iniciarEliminacion = (usuario: Usuario) => {
    setUsuarioAEliminar(usuario);
    setConfirmText('');
    setShowDeleteModal(true);
    setError('');
  };

  const confirmarEliminacion = async () => {
    if (!usuarioAEliminar) return;

    const textoValido = confirmText.toLowerCase() === 'borrar' || confirmText.toLowerCase() === 'eliminar';
    
    if (!textoValido) {
      setError('Debes escribir "borrar" o "eliminar" para confirmar');
      return;
    }

    try {
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      setSuccess(`✅ Usuario ${usuarioAEliminar.nombre} eliminado exitosamente`);
      setShowDeleteModal(false);
      setUsuarioAEliminar(null);
      setConfirmText('');
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return <Shield size={18} color="#00AEEF" />;
      case 'REVISOR':
        return <UserCog size={18} color="#7C3AED" />;
      default:
        return <User size={18} color="#64748b" />;
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return 'Administrador';
      case 'REVISOR':
        return 'Revisor';
      default:
        return 'Asesor';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Usuarios</h1>
        <button 
          className={styles.btnPrimary}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className={styles.alert} data-type="error">
          {error}
        </div>
      )}
      
      {success && (
        <div className={styles.alert} data-type="success">
          {success}
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h2>Crear Nuevo Usuario</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Nombre Completo</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@cbdelaveracruz.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Contraseña</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
              >
                <option value="ASESOR">Asesor</option>
                <option value="REVISOR">Revisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} className={styles.btnSecondary}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>EMAIL</th>
              <th>ROL</th>
              <th>FECHA DE CREACIÓN</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>
                  <div className={styles.rolBadge}>
                    {getRolIcon(usuario.rol)}
                    <span>{getRolLabel(usuario.rol)}</span>
                  </div>
                </td>
                <td>{new Date(usuario.createdAt).toLocaleDateString('es-AR')}</td>
                <td>
                  <button
                    className={styles.btnDelete}
                    onClick={() => iniciarEliminacion(usuario)}
                    title="Eliminar usuario"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && usuarioAEliminar && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={48} color="#ef4444" />
              <h2>Confirmar Eliminación</h2>
            </div>
            
            <p className={styles.modalText}>
              Estás a punto de eliminar al usuario <strong>{usuarioAEliminar.nombre}</strong> ({usuarioAEliminar.email}).
            </p>
            
            <p className={styles.modalWarning}>
             Esta acción es permanente y no se puede deshacer.
            </p>

            <div className={styles.formGroup}>
              <label>Escribe "borrar" o "eliminar" para confirmar:</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="borrar o eliminar"
                autoFocus
              />
            </div>

            <div className={styles.modalActions}>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                  setError('');
                }}
                className={styles.btnSecondary}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEliminacion}
                className={styles.btnDanger}
                disabled={!confirmText}
              >
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
