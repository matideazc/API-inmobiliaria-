import { Router } from 'express';
import { autenticar, esAdmin } from '../middlewares/auth.middleware';
import {
  obtenerActividadesSemanaAdmin,
  obtenerAsesores,
  exportarActividadesExcel,
} from '../controllers/actividades-admin.controller';

const router = Router();

// Rutas admin (requieren autenticación + rol ADMIN)
router.get('/actividades-semanales', autenticar, esAdmin, obtenerActividadesSemanaAdmin);
router.get('/asesores', autenticar, esAdmin, obtenerAsesores);
router.get('/actividades-semanales/export', autenticar, esAdmin, exportarActividadesExcel);

export default router;
