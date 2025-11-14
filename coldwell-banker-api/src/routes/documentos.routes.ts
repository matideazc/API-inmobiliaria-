import { Router } from 'express';
import {
  listarDocumentosPorExpediente,
  crearDocumento,
  eliminarDocumento
} from '../controllers/documentos.controller';
import { autenticar, esAdmin } from '../middlewares/auth.middleware';
import { uploadSinglePDF } from '../config/multer.config';

const router = Router();

/**
 * GET /documentos/:expedienteId
 * Lista todos los documentos de un expediente
 * Requiere autenticación
 */
router.get('/:expedienteId', autenticar, listarDocumentosPorExpediente);

/**
 * POST /documentos
 * Crea un nuevo documento asociado a un expediente
 * Requiere autenticación
 * 
 * SOPORTA 2 FORMATOS:
 * 
 * 1) JSON (modo tradicional - para URLs de OneDrive):
 *    Content-Type: application/json
 *    Body: { expedienteId, tipo, nombre?, rutaArchivo }
 * 
 * 2) MULTIPART (modo nuevo - subida de archivo PDF):
 *    Content-Type: multipart/form-data
 *    Fields: 
 *      - expedienteId (obligatorio)
 *      - tipo (opcional, default: PDF_COMPLETO)
 *      - nombre (opcional)
 *      - archivo (file, solo PDF)
 * 
 * El middleware uploadSinglePDF de multer se ejecuta condicionalmente:
 * - Si viene multipart/form-data → procesa el archivo
 * - Si viene application/json → pasa directo al controller
 */
router.post('/', 
  autenticar, 
  (req, res, next) => {
    // Solo aplicar multer si el Content-Type es multipart/form-data
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      uploadSinglePDF(req, res, (err) => {
        if (err) {
          // Error de multer (archivo muy grande, no es PDF, etc.)
          res.status(400).json({
            error: err.message || 'Error al procesar el archivo'
          });
          return;
        }
        next();
      });
    } else {
      // Modo JSON, no usar multer
      next();
    }
  },
  crearDocumento
);

/**
 * DELETE /documentos/:id
 * Elimina un documento
 * Requiere autenticación y rol ADMIN
 */
router.delete('/:id', autenticar, esAdmin, eliminarDocumento);

export default router;
