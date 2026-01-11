import { Router } from 'express';
import { autenticar, esAdmin } from '../middlewares/auth.middleware';
import {
  obtenerObjetivosAnuales,
  guardarObjetivosAnuales,
} from '../controllers/objetivos-anuales.controller';

const router = Router();

// Rutas para gestión de objetivos anuales (solo ADMIN)
router.get('/', autenticar, esAdmin, obtenerObjetivosAnuales);
router.put('/', autenticar, esAdmin, guardarObjetivosAnuales);

export default router;
