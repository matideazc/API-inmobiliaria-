import { Request, Response } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

// Tipos de documento permitidos
const TIPOS_DOCUMENTO = [
  'ESCRITURA',
  'DNI',
  'API',
  'TGI',
  'PLANOS',
  'MENSURA',
  'TASA',
  'OTRO',
  'PDF_COMPLETO'  // PDF único con toda la info de la propiedad
] as const;

type TipoDocumento = typeof TIPOS_DOCUMENTO[number];

/**
 * GET /documentos/:expedienteId
 * Lista todos los documentos de un expediente
 */
export const listarDocumentosPorExpediente = async (req: Request, res: Response) => {
  try {
    const { expedienteId } = req.params;
    const expId = parseInt(expedienteId);

    // Validar que el ID sea un número válido
    if (isNaN(expId)) {
      res.status(400).json({
        error: 'ID de expediente inválido'
      });
      return;
    }

    // Verificar que el expediente existe
    const expediente = await prisma.expediente.findUnique({
      where: { id: expId }
    });

    if (!expediente) {
      res.status(404).json({
        error: 'Expediente no encontrado'
      });
      return;
    }

    // Obtener todos los documentos del expediente
    const documentos = await prisma.documento.findMany({
      where: { expedienteId: expId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      expedienteId: expId,
      total: documentos.length,
      documentos
    });
  } catch (error) {
    console.error('Error al listar documentos:', error);
    res.status(500).json({
      error: 'Error interno del servidor al listar documentos'
    });
  }
};

/**
 * POST /documentos
 * Crea un nuevo documento asociado a un expediente
 * 
 * SOPORTA 2 MODOS:
 * 
 * 1) MODO JSON (compatibilidad con código existente):
 *    Content-Type: application/json
 *    Body: { expedienteId, tipo, nombre?, rutaArchivo }
 *    Uso: Cuando ya tenés una URL de OneDrive o ruta externa
 * 
 * 2) MODO ARCHIVO (nuevo - subida de PDF):
 *    Content-Type: multipart/form-data
 *    Fields: expedienteId, tipo?, nombre?
 *    File: archivo (campo multer)
 *    Uso: Cuando el asesor sube un PDF desde su PC
 * 
 * Validaciones:
 * - expedienteId: obligatorio (en ambos modos)
 * - expediente debe existir
 * - tipo: opcional en modo archivo (default: PDF_COMPLETO), obligatorio en modo JSON
 * - archivo: solo PDF (application/pdf)
 * 
 * TODO: Integrar OneDrive para reemplazar guardado local
 */
export const crearDocumento = async (req: Request, res: Response) => {
  try {
    // Detectar si viene un archivo (modo multipart) o JSON (modo tradicional)
    const esArchivoSubido = req.file !== undefined;

    // ========== VALIDACIONES COMUNES ==========

    // Soportar tanto 'expedienteId' (legacy) como 'propiedadId' (nuevo)
    const { expedienteId: expedienteIdLegacy, propiedadId, tipo, nombre } = req.body;
    const expedienteId = propiedadId || expedienteIdLegacy;

    // Validación: expedienteId (o propiedadId) es obligatorio (en ambos modos)
    if (!expedienteId) {
      res.status(400).json({
        error: 'El campo "propiedadId" o "expedienteId" es obligatorio'
      });
      return;
    }

    // Validar que el expedienteId sea un número
    const expId = parseInt(expedienteId);
    if (isNaN(expId)) {
      res.status(400).json({
        error: 'El "expedienteId" debe ser un número válido'
      });
      return;
    }

    // Verificar que el expediente existe
    const expedienteExistente = await prisma.expediente.findUnique({
      where: { id: expId }
    });

    if (!expedienteExistente) {
      res.status(404).json({
        error: 'El expediente especificado no existe'
      });
      return;
    }

    // ========== MODO 1: ARCHIVO SUBIDO (multipart/form-data) ==========

    if (esArchivoSubido) {
      const archivo = req.file!;

      // El tipo es opcional, por defecto es PDF_COMPLETO
      const tipoDocumento = tipo || 'PDF_COMPLETO';

      // Validar que el tipo sea permitido
      if (!TIPOS_DOCUMENTO.includes(tipoDocumento as TipoDocumento)) {
        res.status(400).json({
          error: `Tipo de documento inválido. Tipos permitidos: ${TIPOS_DOCUMENTO.join(', ')}`
        });
        return;
      }

      // Usar la ruta del archivo que ya guardó multer
      // Convertir a ruta relativa desde la raíz del proyecto
      // archivo.path viene como ruta absoluta, necesitamos solo "uploads/propiedades/X/archivo.pdf"
      const rutaAbsoluta = archivo.path.replace(/\\/g, '/');
      const rutaRelativa = rutaAbsoluta.split('/uploads/')[1]; // Extraer solo "propiedades/X/archivo.pdf"
      const rutaArchivo = `uploads/${rutaRelativa}`; // Resultado: "uploads/propiedades/X/archivo.pdf"

      // Crear el documento en la base de datos
      const nuevoDocumento = await prisma.documento.create({
        data: {
          expedienteId: expId,
          tipo: tipoDocumento,
          nombre: nombre?.trim() || archivo.originalname,
          rutaArchivo: rutaArchivo
        },
        include: {
          expediente: {
            select: {
              id: true,
              titulo: true,
              propietarioNombre: true
            }
          }
        }
      });

      res.status(201).json({
        mensaje: 'Documento subido y creado exitosamente',
        documento: nuevoDocumento,
        archivoInfo: {
          nombreOriginal: archivo.originalname,
          tamaño: archivo.size,
          mimetype: archivo.mimetype,
          rutaLocal: rutaArchivo
        }
      });
      return;
    }

    // ========== MODO 2: JSON (compatibilidad con código existente) ==========

    const { rutaArchivo } = req.body;

    // Validación: tipo es obligatorio en modo JSON
    if (!tipo) {
      res.status(400).json({
        error: 'El campo "tipo" es obligatorio'
      });
      return;
    }

    // Validación: el tipo debe ser uno de los permitidos
    if (!TIPOS_DOCUMENTO.includes(tipo as TipoDocumento)) {
      res.status(400).json({
        error: `Tipo de documento inválido. Tipos permitidos: ${TIPOS_DOCUMENTO.join(', ')}`
      });
      return;
    }

    // Validación: rutaArchivo es obligatorio en modo JSON
    if (!rutaArchivo || rutaArchivo.trim() === '') {
      res.status(400).json({
        error: 'El campo "rutaArchivo" es obligatorio cuando no se sube un archivo'
      });
      return;
    }

    // Crear el documento (modo tradicional)
    const nuevoDocumento = await prisma.documento.create({
      data: {
        expedienteId: expId,
        tipo,
        nombre: nombre?.trim() || null,
        rutaArchivo: rutaArchivo.trim()
      },
      include: {
        expediente: {
          select: {
            id: true,
            titulo: true,
            propietarioNombre: true
          }
        }
      }
    });

    res.status(201).json({
      mensaje: 'Documento creado exitosamente',
      documento: nuevoDocumento
    });

  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear el documento'
    });
  }
};

/**
 * DELETE /documentos/:id
 * Elimina un documento (solo ADMIN)
 */
export const eliminarDocumento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docId = parseInt(id);

    // Validar que el ID sea un número válido
    if (isNaN(docId)) {
      res.status(400).json({
        error: 'ID de documento inválido'
      });
      return;
    }

    // Verificar que el documento existe
    const documentoExistente = await prisma.documento.findUnique({
      where: { id: docId }
    });

    if (!documentoExistente) {
      res.status(404).json({
        error: 'Documento no encontrado'
      });
      return;
    }

    // Eliminar el documento
    await prisma.documento.delete({
      where: { id: docId }
    });

    res.json({
      mensaje: 'Documento eliminado exitosamente',
      documentoId: docId
    });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({
      error: 'Error interno del servidor al eliminar el documento'
    });
  }
};
