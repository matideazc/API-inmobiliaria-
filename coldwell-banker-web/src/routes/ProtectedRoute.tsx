import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Mientras verifica la sesión, mostrar nada (o podrías mostrar un spinner)
  if (loading) {
    return null; // O <div>Cargando...</div>
  }

  // Si no hay usuario después de cargar, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderizar el componente hijo (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
