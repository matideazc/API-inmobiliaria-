import { Request, Response } from 'express';
import prisma from '../prisma';
import ExcelJS from 'exceljs';

// Mapeo de nombres amigables para el Excel
const ACTIVIDAD_NOMBRES: Record<string, string> = {
  CONTACTOS: 'Contactos',
  REUNION_PRELISTING: 'Reuniones Prelisting',
  REUNION_PREBUYING: 'Reuniones Prebuying',
  ACM: 'ACM',
  CAPTACIONES: 'Captaciones',
  BUSQUEDAS: 'Búsquedas',
  RESERVA_COMPRADOR: 'Reservas Comprador',
  RESERVA_VENDEDOR: 'Reservas Vendedor',
  BAJA_PRECIO: 'Bajas de Precio',
};

/**
 * GET /admin/actividades-semanales?weekStart=YYYY-MM-DD&asesorId=OPCIONAL
 * Lista las actividades semanales de todos los asesores (o de uno específico)
 * Solo accesible para ADMIN
 */
export const obtenerActividadesSemanaAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { weekStart, asesorId } = req.query;

    // Validar weekStart
    if (!weekStart || typeof weekStart !== 'string') {
      res.status(400).json({ error: 'weekStart es requerido (formato YYYY-MM-DD)' });
      return;
    }

    // Parsear fecha y calcular weekEnd
    const semanaInicio = new Date(weekStart);
    const semanaFin = new Date(semanaInicio);
    semanaFin.setDate(semanaFin.getDate() + 6);

    if (isNaN(semanaInicio.getTime())) {
      res.status(400).json({ error: 'weekStart debe ser una fecha válida (YYYY-MM-DD)' });
      return;
    }

    // Construir filtro (con o sin asesorId)
    const where: any = {
      semanaInicio,
    };

    if (asesorId) {
      where.asesorId = parseInt(asesorId as string);
    }

    // Query con datos del asesor incluidos
    const actividades = await prisma.actividadSemanal.findMany({
      where,
      include: {
        asesor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: [
        { asesorId: 'asc' },
        { tipoActividad: 'asc' },
      ],
    });

    // Formatear respuesta
    const resultado = actividades.map((act) => ({
      asesorId: act.asesorId,
      asesor: act.asesor,
      tipoActividad: act.tipoActividad,
      objetivo: act.objetivo,
      planificado: act.planificado,
      realizado: act.realizado,
      semanaInicio: act.semanaInicio,
      semanaFin: act.semanaFin,
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener actividades (admin):', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};

/**
 * GET /admin/asesores
 * Lista todos los asesores para llenar el dropdown
 * Solo accesible para ADMIN
 */
export const obtenerAsesores = async (req: Request, res: Response): Promise<void> => {
  try {
    const asesores = await prisma.usuario.findMany({
      where: {
        rol: 'ASESOR',
      },
      select: {
        id: true,
        nombre: true,
        email: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(asesores);
  } catch (error) {
    console.error('Error al obtener asesores:', error);
    res.status(500).json({ error: 'Error al obtener asesores' });
  }
};

/**
 * GET /admin/actividades-semanales/export?weekStart=YYYY-MM-DD&asesorId=OPCIONAL
 * Exporta las actividades semanales a Excel
 * Solo accesible para ADMIN
 */
export const exportarActividadesExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { weekStart, asesorId } = req.query;

    // Validar weekStart
    if (!weekStart || typeof weekStart !== 'string') {
      res.status(400).json({ error: 'weekStart es requerido (formato YYYY-MM-DD)' });
      return;
    }

    const semanaInicio = new Date(weekStart);
    const semanaFin = new Date(semanaInicio);
    semanaFin.setDate(semanaFin.getDate() + 6);

    if (isNaN(semanaInicio.getTime())) {
      res.status(400).json({ error: 'weekStart debe ser una fecha válida (YYYY-MM-DD)' });
      return;
    }

    // Reutilizar la misma query
    const where: any = { semanaInicio };
    if (asesorId) {
      where.asesorId = parseInt(asesorId as string);
    }

    const actividades = await prisma.actividadSemanal.findMany({
      where,
      include: {
        asesor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: [
        { asesorId: 'asc' },
        { tipoActividad: 'asc' },
      ],
    });

    // Crear workbook con exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Actividades');

    // Definir columnas (SIN EMAIL)
    worksheet.columns = [
      { header: 'Asesor', key: 'asesor', width: 25 },
      { header: 'Actividad', key: 'actividad', width: 25 },
      { header: 'Objetivo', key: 'objetivo', width: 12 },
      { header: 'Planificado', key: 'planificado', width: 12 },
      { header: 'Realizado', key: 'realizado', width: 12 },
      { header: '% Cumplimiento', key: 'porcentaje', width: 15 },
      { header: 'Semana desde', key: 'semanaDesde', width: 15 },
      { header: 'Semana hasta', key: 'semanaHasta', width: 15 },
    ];

    // Estilizar encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00AEEF' }, // Azul Orbe
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Agregar bordes al header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });


    // Agrupar actividades por asesor
    const actividadesPorAsesor = actividades.reduce((acc, act) => {
      const asesorId = act.asesorId;
      if (!acc[asesorId]) {
        acc[asesorId] = {
          nombre: act.asesor.nombre,
          actividades: [],
        };
      }
      acc[asesorId].actividades.push(act);
      return acc;
    }, {} as Record<number, { nombre: string; actividades: any[] }>);

    // Iterar por cada asesor
    Object.entries(actividadesPorAsesor).forEach(([asesorIdKey], asesorIndex) => {
      const { nombre, actividades: acts } = (actividadesPorAsesor as any)[asesorIdKey];
      
      // Agregar fila en blanco como separador (excepto para el primer asesor)
      if (asesorIndex > 0) {
        worksheet.addRow({});
      }

      let totalObjetivo = 0;
      let totalPlanificado = 0;
      let totalRealizado = 0;

      // Agregar actividades del asesor
      acts.forEach((act: any, index: number) => {
        const porcentaje = act.objetivo > 0  
          ? Math.round((act.realizado / act.objetivo) * 100) 
          : 0;

        totalObjetivo += act.objetivo;
        totalPlanificado += act.planificado;
        totalRealizado += act.realizado;

        const row = worksheet.addRow({
          asesor: nombre,
          actividad: ACTIVIDAD_NOMBRES[act.tipoActividad] || act.tipoActividad,
          objetivo: act.objetivo,
          planificado: act.planificado,
          realizado: act.realizado,
          porcentaje: porcentaje,
          semanaDesde: formatearFecha(act.semanaInicio),
          semanaHasta: formatearFecha(act.semanaFin),
        });

        // Alineación
        row.getCell('objetivo').alignment = { horizontal: 'center' };
        row.getCell('planificado').alignment = { horizontal: 'center' };
        row.getCell('realizado').alignment = { horizontal: 'center' };
        row.getCell('porcentaje').alignment = { horizontal: 'center' };

        // Color condicional para porcentaje
        const porcentajeCell = row.getCell('porcentaje');
        porcentajeCell.font = { bold: true };
        
        if (porcentaje >= 100) {
          porcentajeCell.font = { ...porcentajeCell.font, color: { argb: 'FF38CE77' } }; // Verde
        } else if (porcentaje >= 70) {
          porcentajeCell.font = { ...porcentajeCell.font, color: { argb: 'FFFFCB00' } }; // Amarillo
        } else {
          porcentajeCell.font = { ...porcentajeCell.font, color: { argb: 'FFFF5858' } }; // Rojo
        }

        // Agregar bordes a todas las celdas
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          };
        });

        // Alternar colores de fila
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' },
          };
        }
      });

      // Agregar fila de totales para este asesor
      const porcentajeTotal = totalObjetivo > 0 
        ? Math.round((totalRealizado / totalObjetivo) * 100) 
        : 0;
      
      const totalsRow = worksheet.addRow({
        asesor: 'TOTAL',
        actividad: '',
        objetivo: totalObjetivo,
        planificado: totalPlanificado,
        realizado: totalRealizado,
        porcentaje: porcentajeTotal,
        semanaDesde: '',
        semanaHasta: '',
      });

      // Estilo para fila de totales
      totalsRow.font = { bold: true };
      totalsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00AEEF' }, // Azul Orbe
      };
      totalsRow.getCell('asesor').font = { bold: true, color: { argb: 'FFFFFFFF' } };
      totalsRow.getCell('objetivo').alignment = { horizontal: 'center' };
      totalsRow.getCell('planificado').alignment = { horizontal: 'center' };
      totalsRow.getCell('realizado').alignment = { horizontal: 'center' };
      totalsRow.getCell('porcentaje').alignment = { horizontal: 'center' };

      // Color para porcentaje total
      const porcentajeTotalCell = totalsRow.getCell('porcentaje');
      if (porcentajeTotal >= 100) {
        porcentajeTotalCell.font = { bold: true, color: { argb: 'FF38CE77' } };
      } else if (porcentajeTotal >= 70) {
        porcentajeTotalCell.font = { bold: true, color: { argb: 'FFFFCB00' } };
      } else {
        porcentajeTotalCell.font = { bold: true, color: { argb: 'FFFF5858' } };
      }

      // Bordes para fila de totales
      totalsRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thick', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thick', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } },
        };
      });
    });


    // Generar nombre del archivo con nombre del asesor si aplica
    let filename = `actividades_${weekStart}.xlsx`;
    
    if (asesorId) {
      // Buscar el nombre del asesor
      const asesorNombre = actividades.length > 0 
        ? actividades[0].asesor.nombre.replace(/\s+/g, '_')
        : `asesor_${asesorId}`;
      filename = `actividades_${weekStart}_${asesorNombre}.xlsx`;
    }

    // Configurar headers HTTP
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Escribir el archivo al response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({ error: 'Error al exportar Excel' });
  }
};

// Helper para formatear fecha como YYYY-MM-DD
function formatearFecha(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
