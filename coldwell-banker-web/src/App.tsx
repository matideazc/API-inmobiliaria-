import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ExpedientesList from './pages/ExpedientesList';
import ExpedienteDetail from './pages/ExpedienteDetail';
import UploadDocument from './pages/UploadDocument';
import NewExpediente from './pages/NewExpediente';
import MandatoForm from './pages/MandatoForm';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './layout/AppShell';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/expedientes" element={<ExpedientesList />} />
            <Route path="/expedientes/nuevo" element={<NewExpediente />} />
            <Route path="/expedientes/:id" element={<ExpedienteDetail />} />
            <Route path="/expedientes/:id/mandato" element={<MandatoForm />} />
            <Route path="/expedientes/:expedienteId/upload" element={<UploadDocument />} />
          </Route>

          {/* Redirigir / a /expedientes */}
          <Route path="/" element={<Navigate to="/expedientes" replace />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/expedientes" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
