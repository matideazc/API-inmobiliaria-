import { Request, Response } from 'express';
import prisma from '../prisma';
import { ActividadTipo } from '@prisma/client';

// Tipos de actividad en orden fijo
const TIPOS_ACTIVIDAD: ActividadTipo[] = [
  'CONTACTOS',
  'REUNION_PRELISTING',
  'REUNION_PREBUYING',
  'ACM',
  'CAPTACIONES',
  'BUSQUEDAS',
  'RESERVA_COMPRADOR',
  'RESERVA_VENDEDOR',
  'BAJA_PRECIO',
];

/**
 * GET /admin/objetivos-anuales?año=2026
 * Obtiene los objetivos anuales de todos los asesores para un año específico
 * Solo accesible para ADMIN
 */
export const obtenerObjetivosAnuales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { año } = req.query;

    // Validar año
    if (!año || typeof año !== 'string') {
      res.status(400).json({ error: 'El parámetro año es requerido' });
      return;
    }

    const añoNum = parseInt(año);
    if (isNaN(añoNum) || añoNum < 2020 || añoNum > 2100) {
      res.status(400).json({ error: 'Año inválido' });
      return;
    }

    // 1. Obtener todos los asesores
    const asesores = await prisma.usuario.findMany({
      where: { rol: 'ASESOR' },
      select: {
        id: true,
        nombre: true,
        email: true,
      },
      orderBy: { nombre: 'asc' },
    });

    // 2. Obtener todos los objetivos anuales del año
    const objetivos = await prisma.objetivoAnual.findMany({
      where: { año: añoNum },
    });

    // 3. Crear mapa de objetivos por asesor y tipo de actividad
    const objetivoMap = new Map<string, number>();
    objetivos.forEach((obj) => {
      const key = `${obj.asesorId}-${obj.tipoActividad}`;
      objetivoMap.set(key, obj.objetivoAnual);
    });

    // 4. Formatear respuesta: array de asesores con sus objetivos
    const resultado = asesores.map((asesor) => {
      const objetivosAsesor: Record<string, number> = {};
      
      TIPOS_ACTIVIDAD.forEach((tipo) => {
        const key = `${asesor.id}-${tipo}`;
        objetivosAsesor[tipo] = objetivoMap.get(key) ?? 0;
      });

      return {
        asesorId: asesor.id,
        nombre: asesor.nombre,
        email: asesor.email,
        objetivos: objetivosAsesor,
      };
    });

    res.json({ año: añoNum, asesores: resultado });
  } catch (error) {
    console.error('Error al obtener objetivos anuales:', error);
    res.status(500).json({ error: 'Error al obtener objetivos anuales' });
  }
};

/**
 * PUT /admin/objetivos-anuales
 * Guarda/actualiza los objetivos anuales de todos los asesores
 * Body: { año: 2026, objetivos: [{ asesorId, tipoActividad, objetivoAnual }] }
 * Solo accesible para ADMIN
 */
export const guardarObjetivosAnuales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { año, objetivos } = req.body;

    // Validar body
    if (!año || !Array.isArray(objetivos)) {
      res.status(400).json({ 
        error: 'Body inválido. Se requiere: { año, objetivos: [...] }' 
      });
      return;
    }

    // Validar año
    if (typeof año !== 'number' || año < 2020 || año > 2100) {
      res.status(400).json({ error: 'Año inválido' });
      return;
    }

    // Validar y procesar cada objetivo
    const promises = objetivos.map((obj: any) => {
      const { asesorId, tipoActividad, objetivoAnual } = obj;

      // Validaciones
      if (!asesorId || !tipoActividad || objetivoAnual === undefined) {
        throw new Error('Cada objetivo debe tener asesorId, tipoActividad y objetivoAnual');
      }

      if (!TIPOS_ACTIVIDAD.includes(tipoActividad)) {
        throw new Error(`Tipo de actividad inválido: ${tipoActividad}`);
      }

      if (typeof objetivoAnual !== 'number' || objetivoAnual < 0) {
        throw new Error('objetivoAnual debe ser un número positivo');
      }

      // Upsert: crear o actualizar
      return prisma.objetivoAnual.upsert({
        where: {
          asesorId_tipoActividad_año: {
            asesorId,
            tipoActividad,
            año,
          },
        },
        update: {
          objetivoAnual,
        },
        create: {
          asesorId,
          tipoActividad,
          año,
          objetivoAnual,
        },
      });
    });

    await Promise.all(promises);

    res.json({ 
      message: 'Objetivos anuales guardados correctamente',
      cantidad: objetivos.length
    });
  } catch (error: any) {
    console.error('Error al guardar objetivos anuales:', error);
    res.status(500).json({ 
      error: 'Error al guardar objetivos anuales',
      details: error.message 
    });
  }
};
