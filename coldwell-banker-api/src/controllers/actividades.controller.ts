import { Request, Response } from 'express';
import prisma from '../prisma';
import { ActividadTipo } from '@prisma/client';

// Tipos de actividad en orden fijo para la tabla
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
 * GET /actividades-semanales?weekStart=YYYY-MM-DD
 * Obtiene las actividades semanales del asesor autenticado
 * Sin efectos secundarios: solo lee de BD y completa en memoria lo que falta
 */
export const obtenerActividadesSemana = async (req: Request, res: Response): Promise<void> => {
  try {
    const { weekStart } = req.query;
    const asesorId = req.usuario?.id;

    // Validar que el usuario está autenticado
    if (!asesorId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    // Validar que weekStart es una fecha válida
    if (!weekStart || typeof weekStart !== 'string') {
      res.status(400).json({ error: 'weekStart es requerido (formato YYYY-MM-DD)' });
      return;
    }

    // Parsear fecha y calcular semanaFin (+6 días)
    const semanaInicio = new Date(weekStart);
    const semanaFin = new Date(semanaInicio);
    semanaFin.setDate(semanaFin.getDate() + 6);

    // Validar que es una fecha válida
    if (isNaN(semanaInicio.getTime())) {
      res.status(400).json({ error: 'weekStart debe ser una fecha válida (YYYY-MM-DD)' });
      return;
    }

    // 1. Leer de BD lo que hay para esta semana
    const actividadesDB = await prisma.actividadSemanal.findMany({
      where: {
        asesorId,
        semanaInicio,
      },
    });

    // 2. NUEVO: Obtener objetivos semanales del asesor
    const año = semanaInicio.getFullYear();
    const objetivosConfig = await prisma.objetivoConfiguracion.findMany({
      where: {
        asesorId,
        año,
      },
    });

    // Crear mapa de objetivos semanales (directo desde configuración)
    const objetivosPorTipo: Record<string, number> = {};
    objetivosConfig.forEach(obj => {
      objetivosPorTipo[obj.tipoActividad] = obj.objetivoSemanal; // Directo!
    });

    // 3. En memoria, armar las 9 filas y completar con 0 lo que falta
    const actividadesCompletas = TIPOS_ACTIVIDAD.map(tipo => {
      // Buscar si existe en BD
      const existente = actividadesDB.find((a: any) => a.tipoActividad === tipo);

      // MODIFICADO: Objetivo viene de ObjetivoAnual, no de ActividadSemanal
      return {
        tipoActividad: tipo,
        objetivo: objetivosPorTipo[tipo] ?? 0,  // Calculado desde objetivo anual
        planificado: existente?.planificado ?? 0,
        realizado: existente?.realizado ?? 0,
      };
    });

    // 4. Devolver al front
    res.json(actividadesCompletas);
  } catch (error) {
    console.error('Error al obtener actividades semanales:', error);
    res.status(500).json({ error: 'Error al obtener actividades semanales' });
  }
};

/**
 * PUT /actividades-semanales
 * Guarda/actualiza objetivos, planificados y realizados de la semana
 * Body: { semanaInicio, semanaFin, actividades: [{ tipoActividad, objetivo, planificado, realizado }] }
 */
export const guardarActividadesSemana = async (req: Request, res: Response): Promise<void> => {
  try {
    const { semanaInicio: semanaInicioStr, actividades } = req.body;
    const asesorId = req.usuario?.id;

    // Validar autenticación
    if (!asesorId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    // Validar body
    if (!semanaInicioStr || !Array.isArray(actividades)) {
      res.status(400).json({ 
        error: 'Body inválido. Se requiere: { semanaInicio, actividades: [...] }' 
      });
      return;
    }

    // Parsear fecha y recalcular semanaFin en backend (seguridad)
    const semanaInicio = new Date(semanaInicioStr);
    const semanaFin = new Date(semanaInicio);
    semanaFin.setDate(semanaFin.getDate() + 6);

    // Validar fecha
    if (isNaN(semanaInicio.getTime())) {
      res.status(400).json({ error: 'semanaInicio debe ser una fecha válida (YYYY-MM-DD)' });
      return;
    }

    // Procesar cada actividad con upsert
    const promises = actividades.map((act: any) => {
      const { tipoActividad, planificado, realizado } = act;

      // Validar que el tipo de actividad sea válido
      if (!TIPOS_ACTIVIDAD.includes(tipoActividad)) {
        throw new Error(`Tipo de actividad inválido: ${tipoActividad}`);
      }

      // Upsert: where = (asesorId, semanaInicio, tipoActividad)
      // MODIFICADO: Ya NO guardamos objetivo (se calcula desde ObjetivoAnual en GET)
      // Solo guardamos planificado y realizado
      return prisma.actividadSemanal.upsert({
        where: {
          asesorId_semanaInicio_tipoActividad: {
            asesorId,
            semanaInicio,
            tipoActividad,
          },
        },
        update: {
          // objetivo: NO SE ACTUALIZA, se calcula en GET desde ObjetivoAnual
          planificado: planificado ?? 0,
          realizado: realizado ?? 0,
        },
        create: {
          asesorId,
          semanaInicio,
          semanaFin,
          tipoActividad,
          objetivo: 0, // Se ignora, se calcula en GET desde ObjetivoAnual
          planificado: planificado ?? 0,
          realizado: realizado ?? 0,
        },
      });
    });

    await Promise.all(promises);

    res.json({ message: 'Actividades guardadas correctamente' });
  } catch (error: any) {
    console.error('Error al guardar actividades semanales:', error);
    res.status(500).json({ 
      error: 'Error al guardar actividades semanales',
      details: error.message 
    });
  }
};
