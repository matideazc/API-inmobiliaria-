import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, token } = useAuth();

  // Si no hay token o usuario, redirigir al login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token y usuario, renderizar el componente hijo (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
