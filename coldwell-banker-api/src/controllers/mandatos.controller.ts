import { Request, Response } from 'express';
import prisma from '../prisma';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

// Estados permitidos del mandato
const ESTADOS_MANDATO = ['BORRADOR', 'ENVIADO', 'FIRMADO', 'ANULADO'] as const;
type EstadoMandato = typeof ESTADOS_MANDATO[number];

/**
 * POST /expedientes/:id/mandato
 * Crea un mandato para un expediente APROBADO
 * Body: { plazoDias, monto, observaciones? }
 * 
 * Permisos:
 * - ASESOR: Solo puede crear mandatos para sus propios expedientes
 * - REVISOR/ADMIN: Pueden crear mandatos para cualquier expediente
 */
export const crearMandatoDesdeExpediente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plazoDias, monto, observaciones } = req.body;
    const expedienteId = parseInt(id);

    // Validar ID del expediente
    if (isNaN(expedienteId)) {
      res.status(400).json({
        error: 'ID de expediente inválido'
      });
      return;
    }

    // Validación: plazoDias es obligatorio y debe ser positivo
    if (!plazoDias || typeof plazoDias !== 'number' || plazoDias <= 0) {
      res.status(400).json({
        error: 'El campo "plazoDias" es obligatorio y debe ser un número positivo'
      });
      return;
    }

    // Validación: monto es obligatorio y debe ser positivo
    if (!monto || typeof monto !== 'number' || monto <= 0) {
      res.status(400).json({
        error: 'El campo "monto" es obligatorio y debe ser un número positivo'
      });
      return;
    }

    // Obtener el usuario autenticado
    const usuario = req.usuario;
    
    if (!usuario) {
      res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    // Construir el where según el rol
    const where: any = { id: expedienteId };
    
    // Si es ASESOR, solo puede crear mandatos para sus expedientes
    if (usuario.rol === 'ASESOR') {
      where.asesorId = usuario.id;
    }
    // ADMIN y REVISOR pueden crear mandatos para cualquier expediente

    // Verificar que el expediente existe y el usuario tiene permisos
    const expediente = await prisma.expediente.findUnique({
      where,
      include: { mandato: true }
    });

    if (!expediente) {
      res.status(404).json({
        error: 'Expediente no encontrado o no tienes permisos para crear mandatos en él'
      });
      return;
    }

    // Validar que el expediente está APROBADO
    if (expediente.estado !== 'APROBADO') {
      res.status(400).json({
        error: 'Solo se puede crear un mandato para expedientes APROBADOS',
        estadoActual: expediente.estado
      });
      return;
    }

    // Validar que el expediente no tenga ya un mandato
    if (expediente.mandato) {
      res.status(400).json({
        error: 'Este expediente ya tiene un mandato asociado',
        mandatoExistente: {
          id: expediente.mandato.id,
          estado: expediente.mandato.estado
        }
      });
      return;
    }

    // Crear el mandato
    // @ts-ignore - Los tipos de Prisma se actualizan al reiniciar VS Code
    const nuevoMandato = await prisma.mandato.create({
      data: {
        expedienteId,
        plazoDias,
        monto,
        observaciones: observaciones?.trim() || null,
        estado: 'BORRADOR'
      },
      include: {
        expediente: {
          select: {
            id: true,
            titulo: true,
            propietarioNombre: true,
            estado: true
          }
        }
      }
    });

    res.status(201).json({
      mensaje: 'Mandato creado exitosamente',
      mandato: nuevoMandato
    });
  } catch (error) {
    console.error('Error al crear mandato:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear el mandato'
    });
  }
};

/**
 * GET /expedientes/:id/mandato
 * Obtiene el mandato de un expediente
 * 
 * Permisos:
 * - ASESOR: Solo puede ver mandatos de sus propios expedientes
 * - REVISOR/ADMIN: Pueden ver mandatos de todos los expedientes
 */
export const obtenerMandatoPorExpediente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expedienteId = parseInt(id);

    // Validar ID del expediente
    if (isNaN(expedienteId)) {
      res.status(400).json({
        error: 'ID de expediente inválido'
      });
      return;
    }

    // Obtener el usuario autenticado
    const usuario = req.usuario;
    
    if (!usuario) {
      res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    // Construir el where según el rol
    const where: any = { id: expedienteId };
    
    // Si es ASESOR, solo puede ver mandatos de sus expedientes
    if (usuario.rol === 'ASESOR') {
      where.asesorId = usuario.id;
    }
    // ADMIN y REVISOR pueden ver todos los mandatos (sin filtro adicional)

    // Verificar que el expediente existe y el usuario tiene permisos
    const expediente = await prisma.expediente.findUnique({
      where,
      include: {
        mandato: true
      }
    });

    if (!expediente) {
      res.status(404).json({
        error: 'Expediente no encontrado o no tienes permisos para verlo'
      });
      return;
    }

    // Verificar que el expediente tiene mandato
    if (!expediente.mandato) {
      res.status(404).json({
        error: 'Este expediente no tiene mandato asociado'
      });
      return;
    }

    res.json({
      mandato: expediente.mandato
    });
  } catch (error) {
    console.error('Error al obtener mandato:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener el mandato'
    });
  }
};

/**
 * PUT /mandatos/:id/estado
 * Actualiza el estado de un mandato (solo ADMIN)
 * Body: { estado, firmadoPor?, documentoUrl? }
 */
export const actualizarEstadoMandato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, firmadoPor, documentoUrl } = req.body;
    const mandatoId = parseInt(id);

    // Validar ID del mandato
    if (isNaN(mandatoId)) {
      res.status(400).json({
        error: 'ID de mandato inválido'
      });
      return;
    }

    // Validación: estado es obligatorio
    if (!estado) {
      res.status(400).json({
        error: 'El campo "estado" es obligatorio'
      });
      return;
    }

    // Validar que el estado sea uno de los permitidos
    if (!ESTADOS_MANDATO.includes(estado as EstadoMandato)) {
      res.status(400).json({
        error: `Estado inválido. Estados permitidos: ${ESTADOS_MANDATO.join(', ')}`
      });
      return;
    }

    // Verificar que el mandato existe
    const mandatoExistente = await prisma.mandato.findUnique({
      where: { id: mandatoId }
    });

    if (!mandatoExistente) {
      res.status(404).json({
        error: 'Mandato no encontrado'
      });
      return;
    }

    // Preparar los datos a actualizar
    const dataToUpdate: any = {
      estado
    };

    // Si el estado pasa a FIRMADO, guardar firmadoPor y firmadoFecha
    if (estado === 'FIRMADO') {
      dataToUpdate.firmadoFecha = new Date();
      
      if (firmadoPor) {
        dataToUpdate.firmadoPor = firmadoPor.trim();
      }
    }

    // Si viene documentoUrl, actualizarlo
    if (documentoUrl) {
      dataToUpdate.documentoUrl = documentoUrl.trim();
    }

    // Actualizar el mandato
    const mandatoActualizado = await prisma.mandato.update({
      where: { id: mandatoId },
      data: dataToUpdate,
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

    res.json({
      mensaje: 'Estado del mandato actualizado exitosamente',
      mandato: mandatoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado del mandato:', error);
    res.status(500).json({
      error: 'Error interno del servidor al actualizar el estado del mandato'
    });
  }
};

/**
 * GET /expedientes/:id/mandato/pdf
 * Genera y descarga el PDF del mandato dinámicamente
 * 
 * Permisos:
 * - ASESOR: Solo puede descargar PDFs de mandatos de sus expedientes
 * - REVISOR/ADMIN: Pueden descargar PDFs de cualquier mandato
 */
export const descargarPdfMandato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expedienteId = parseInt(id);

    // Validar ID del expediente
    if (isNaN(expedienteId)) {
      res.status(400).json({
        error: 'ID de expediente inválido'
      });
      return;
    }

    // Obtener el usuario autenticado
    const usuario = req.usuario;
    
    if (!usuario) {
      res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    // Construir el where según el rol
    const where: any = { id: expedienteId };
    
    // Si es ASESOR, solo puede descargar PDFs de sus expedientes
    if (usuario.rol === 'ASESOR') {
      where.asesorId = usuario.id;
    }
    // ADMIN y REVISOR pueden descargar PDFs de cualquier mandato

    // Verificar que el expediente existe y el usuario tiene permisos
    const expediente = await prisma.expediente.findUnique({
      where,
      include: {
        mandato: true,
        asesor: {
          select: {
            nombre: true,
            email: true
          }
        }
      }
    });

    if (!expediente) {
      res.status(404).json({
        error: 'Expediente no encontrado o no tienes permisos para verlo'
      });
      return;
    }

    // Verificar que el expediente tiene mandato
    if (!expediente.mandato) {
      res.status(404).json({
        error: 'Este expediente no tiene mandato asociado'
      });
      return;
    }

    const mandato = expediente.mandato;

    // Generar el PDF dinámicamente
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="mandato-expediente-${expedienteId}.pdf"`);

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // ==========================================
    // CONTENIDO DEL PDF
    // ==========================================

    // Logo o header (opcional)
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('MANDATO DE VENTA', { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(12)
       .font('Helvetica')
       .text('Coldwell Banker', { align: 'center' })
       .moveDown(2);

    // Información del expediente
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Datos del Expediente', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica');

    doc.text(`Expediente N°: ${expediente.id}`, { continued: false });
    doc.text(`Título: ${expediente.titulo}`, { continued: false });
    doc.text(`Propietario: ${expediente.propietarioNombre}`, { continued: false });
    doc.text(`Estado: ${expediente.estado}`, { continued: false });
    
    if (expediente.descripcion) {
      doc.text(`Descripción: ${expediente.descripcion}`, { continued: false });
    }

    doc.moveDown(1.5);

    // Información del mandato
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Datos del Mandato', { underline: true })
       .moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica');

    doc.text(`Mandato N°: ${mandato.id}`, { continued: false });
    doc.text(`Plazo: ${mandato.plazoDias} días`, { continued: false });
    doc.text(`Monto: $${mandato.monto.toLocaleString('es-AR')} ARS`, { continued: false });
    doc.text(`Estado: ${mandato.estado}`, { continued: false });
    
    if (mandato.observaciones) {
      doc.text(`Observaciones: ${mandato.observaciones}`, { continued: false });
    }

    doc.moveDown(1);

    // Fecha de creación
    const createdAt = new Date(mandato.createdAt);
    doc.text(`Fecha de creación: ${createdAt.toLocaleDateString('es-AR')} ${createdAt.toLocaleTimeString('es-AR')}`, { continued: false });

    // Si está firmado, mostrar datos de firma
    if (mandato.estado === 'FIRMADO' && mandato.firmadoPor) {
      doc.moveDown(1);
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('Firma:', { continued: false })
         .font('Helvetica');
      
      doc.text(`Firmado por: ${mandato.firmadoPor}`, { continued: false });
      
      if (mandato.firmadoFecha) {
        const firmadoFecha = new Date(mandato.firmadoFecha);
        doc.text(`Fecha de firma: ${firmadoFecha.toLocaleDateString('es-AR')} ${firmadoFecha.toLocaleTimeString('es-AR')}`, { continued: false });
      }
    }

    doc.moveDown(2);

    // Información del asesor
    if (expediente.asesor) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Asesor Responsable', { underline: true })
         .moveDown(0.5);

      doc.fontSize(11)
         .font('Helvetica');

      doc.text(`Nombre: ${expediente.asesor.nombre}`, { continued: false });
      doc.text(`Email: ${expediente.asesor.email}`, { continued: false });
    }

    // Pie de página
    doc.moveDown(3);
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Este documento es estilizado automáticamente por el sistema de gestión de expedientes.`, { 
         align: 'center'
       })
       .text(`Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`, {
         align: 'center'
       });

    // Finalizar el PDF
    doc.end();

  } catch (error) {
    console.error('Error al generar PDF del mandato:', error);
    
    // Solo enviar error si no se envió la respuesta aún
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error interno del servidor al generar el PDF del mandato'
      });
    }
  }
};
