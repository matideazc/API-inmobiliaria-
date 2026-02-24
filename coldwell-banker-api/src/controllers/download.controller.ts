import { Request, Response } from 'express';
import prisma from '../prisma';
import path from 'path';
import fs from 'fs';

/**
 * GET /documentos/:id/download
 * Descarga un documento de forma segura validando permisos
 * 
 * SEGURIDAD:
 * - Valida que el usuario tenga permisos para acceder al documento
 * - ASESOR solo puede descargar documentos de sus propios expedientes
 * - ADMIN/REVISOR pueden descargar cualquier documento
 * - Previene path traversal validando que el archivo existe
 */
export const descargarDocumento = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const usuario = req.usuario!;

        // Validar ID
        if (isNaN(docId)) {
            res.status(400).json({ error: 'ID de documento inválido' });
            return;
        }

        // Buscar el documento con su expediente
        const documento = await prisma.documento.findUnique({
            where: { id: docId },
            include: {
                expediente: {
                    select: { id: true, asesorId: true, titulo: true }
                }
            }
        });

        if (!documento) {
            res.status(404).json({ error: 'Documento no encontrado' });
            return;
        }

        // SEGURIDAD: Validar autorización por rol
        if (usuario.rol === 'ASESOR' && documento.expediente.asesorId !== usuario.id) {
            res.status(403).json({
                error: 'No tienes permisos para descargar este documento'
            });
            return;
        }

        // SEGURIDAD: Validar que el archivo existe y está dentro de uploads/
        // Usar __dirname para obtener la ruta absoluta correcta en Railway
        const projectRoot = path.resolve(__dirname, '..', '..');
        const uploadsBase = path.join(projectRoot, 'uploads');
        const rutaCompleta = path.join(projectRoot, documento.rutaArchivo);

        if (!rutaCompleta.startsWith(uploadsBase)) {
            console.error('Intento de acceso fuera de uploads:', rutaCompleta);
            res.status(403).json({ error: 'Acceso denegado' });
            return;
        }

        if (!fs.existsSync(rutaCompleta)) {
            res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
            return;
        }

        // Enviar el archivo
        const nombreArchivo = documento.nombre || `documento_${docId}.pdf`;
        res.download(rutaCompleta, nombreArchivo);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({ error: 'Error al descargar el documento' });
    }
};
