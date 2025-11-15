import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PropiedadesList from './pages/PropiedadesList';
import PropiedadDetail from './pages/PropiedadDetail';
import UploadDocument from './pages/UploadDocument';
import NuevaPropiedad from './pages/NuevaPropiedad';
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
            <Route path="/" element={<Home />} />
            <Route path="/propiedades" element={<PropiedadesList />} />
            <Route path="/propiedades/nueva" element={<NuevaPropiedad />} />
            <Route path="/propiedades/:id" element={<PropiedadDetail />} />
            <Route path="/propiedades/:id/mandato" element={<MandatoForm />} />
            <Route path="/propiedades/:id/upload" element={<UploadDocument />} />
          </Route>

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/propiedades" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
