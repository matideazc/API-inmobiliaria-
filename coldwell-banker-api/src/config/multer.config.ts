import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

/**
 * Configuración de multer para subida de archivos PDF
 * 
 * Almacenamiento:
 * - Por ahora guarda los archivos localmente en: uploads/propiedades/{expedienteId}/
 * - TODO: Reemplazar por subida a OneDrive cuando esté listo
 * 
 * Validaciones:
 * - Solo acepta archivos PDF (application/pdf o .pdf)
 * - Genera nombres únicos con timestamp para evitar sobrescrituras
 * - Crea carpetas automáticamente si no existen
 * - SEGURIDAD: Previene path traversal validando expedienteId
 */

// Configuración del almacenamiento
const storage = multer.diskStorage({
  // Determinar la carpeta de destino según el expedienteId o propiedadId
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Soportar tanto 'expedienteId' (legacy) como 'propiedadId' (nuevo)
    const expedienteIdRaw = req.body.propiedadId || req.body.expedienteId;

    if (!expedienteIdRaw) {
      cb(new Error('El campo propiedadId o expedienteId es obligatorio'), '');
      return;
    }

    // SEGURIDAD: Validar que sea un número entero positivo para prevenir path traversal
    const expedienteId = parseInt(expedienteIdRaw);
    if (isNaN(expedienteId) || expedienteId <= 0) {
      cb(new Error('El expedienteId debe ser un número positivo válido'), '');
      return;
    }

    // Usar ruta absoluta para mayor seguridad
    const uploadPath = path.join(process.cwd(), 'uploads', 'propiedades', expedienteId.toString());

    // SEGURIDAD: Validar que la ruta final está dentro de uploads/
    const uploadsBase = path.join(process.cwd(), 'uploads');
    if (!uploadPath.startsWith(uploadsBase)) {
      cb(new Error('Ruta de archivo inválida'), '');
      return;
    }

    // Crear la carpeta si no existe (recursive: true crea toda la ruta)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  // Generar nombre de archivo único
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Soportar tanto 'expedienteId' (legacy) como 'propiedadId' (nuevo)
    const expedienteIdRaw = req.body.propiedadId || req.body.expedienteId;

    // SEGURIDAD: Validar que sea un número entero positivo
    const expedienteId = parseInt(expedienteIdRaw);
    if (isNaN(expedienteId) || expedienteId <= 0) {
      cb(new Error('El expedienteId debe ser un número positivo válido'), '');
      return;
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const extension = path.extname(file.originalname);

    // Formato: propiedad-{id}-{timestamp}.pdf
    const filename = `propiedad-${expedienteId}-${timestamp}${extension}`;

    cb(null, filename);
  }
});

// Filtro para validar que solo se suban archivos PDF
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Validar por mimetype
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }

  // Validar por extensión (fallback)
  const extension = path.extname(file.originalname).toLowerCase();
  if (extension === '.pdf') {
    cb(null, true);
    return;
  }

  // Rechazar el archivo
  cb(new Error('Solo se permiten archivos PDF'));
};

// Configuración de multer
export const uploadPDF = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo
    // TODO: Ajustar este límite según las necesidades
    // Para archivos muy grandes (>10MB) considerar streaming o chunks
  }
});

// Middleware para un solo archivo PDF
export const uploadSinglePDF = uploadPDF.single('archivo');
