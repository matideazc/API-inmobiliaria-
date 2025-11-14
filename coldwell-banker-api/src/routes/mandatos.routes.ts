import { Router } from 'express';
import {
  crearMandatoDesdeExpediente,
  obtenerMandatoPorExpediente,
  actualizarEstadoMandato,
  descargarPdfMandato
} from '../controllers/mandatos.controller';
import { autenticar, esAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /expedientes/:id/mandato
 * Crea un mandato para un expediente APROBADO
 * Requiere autenticación
 * Body: { plazoDias, monto, observaciones? }
 */
router.post('/expedientes/:id/mandato', autenticar, crearMandatoDesdeExpediente);

/**
 * GET /expedientes/:id/mandato/pdf
 * Genera y descarga el PDF del mandato dinámicamente
 * Requiere autenticación
 * ⚠️ IMPORTANTE: Esta ruta DEBE ir ANTES de GET /expedientes/:id/mandato
 */
router.get('/expedientes/:id/mandato/pdf', autenticar, descargarPdfMandato);

/**
 * GET /expedientes/:id/mandato
 * Obtiene el mandato de un expediente
 * Requiere autenticación
 * ⚠️ IMPORTANTE: Esta ruta debe ir DESPUÉS de las rutas más específicas (/pdf)
 */
router.get('/expedientes/:id/mandato', autenticar, obtenerMandatoPorExpediente);

/**
 * PUT /mandatos/:id/estado
 * Actualiza el estado de un mandato
 * Requiere autenticación y rol ADMIN
 * Body: { estado, firmadoPor?, documentoUrl? }
 */
router.put('/mandatos/:id/estado', autenticar, esAdmin, actualizarEstadoMandato);

export default router;
