import { Router } from 'express';
import { obtenerActividadesSemana, guardarActividadesSemana } from '../controllers/actividades.controller';
import { autenticar } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /actividades-semanales?weekStart=YYYY-MM-DD
 * Obtiene las actividades de la semana especificada para el asesor autenticado
 * Requiere autenticación
 */
router.get('/', autenticar, obtenerActividadesSemana);

/**
 * PUT /actividades-semanales
 * Guarda/actualiza los objetivos y planificados de la semana
 * Requiere autenticación
 * Body: {
 *   semanaInicio: "YYYY-MM-DD",
 *   semanaFin: "YYYY-MM-DD", // Opcional, se recalcula en backend
 *   actividades: [
 *     { tipoActividad: "CONTACTOS", objetivo: 30, planificado: 40 },
 *     ...
 *   ]
 * }
 */
router.put('/', autenticar, guardarActividadesSemana);

export default router;
