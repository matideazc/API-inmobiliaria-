/**
 * Helpers para determinar el color (semáforo) de las celdas
 * en la tabla de actividades semanales
 */

export type ColorStatus = 'neutral' | 'green' | 'yellow' | 'red';

/**
 * Determina el color para la celda de "Planificado"
 * comparándola con el "Objetivo"
 * 
 * @param objetivo - Meta definida por la oficina
 * @param planificado - Lo que el asesor planea hacer
 * @returns Color status: neutral | green | yellow | red
 */
export function getPlannedColor(objetivo: number, planificado: number): ColorStatus {
  if (objetivo === 0) return 'neutral';
  
  const ratio = planificado / objetivo;
  
  if (ratio >= 1) return 'green';       // 100% o más → verde ✅
  if (ratio >= 0.7) return 'yellow';    // 70%-99% → amarillo ⚠️
  return 'red';                         // <70% → rojo ❌
}

/**
 * Determina el color para la celda de "Realizado"
 * comparándola con el "Objetivo" (la meta que importa)
 * 
 * @param objetivo - Meta definida por el asesor/oficina
 * @param realizado - Lo que realmente hizo
 * @returns Color status: neutral | green | yellow | red
 */
export function getActualColor(objetivo: number, realizado: number): ColorStatus {
  // Caso especial: ambos en 0
  if (objetivo === 0 && realizado === 0) return 'neutral';
  
  // Caso especial: sin objetivo pero hiciste algo → verde (bonus)
  if (objetivo === 0 && realizado > 0) return 'green';
  
  const ratio = realizado / objetivo;
  
  if (ratio >= 1) return 'green';       // 100% o más del objetivo → verde ✅
  if (ratio >= 0.7) return 'yellow';    // 70%-99% del objetivo → amarillo ⚠️
  return 'red';                         // <70% del objetivo → rojo ❌
}

/**
 * Convierte el ColorStatus en el nombre de clase CSS Module
 * @param color - Color status
 * @returns Nombre de clase para aplicar (sin el prefijo "styles")
 */
export function getColorClassName(color: ColorStatus): string {
  switch (color) {
    case 'green':
      return 'cellGreen';
    case 'yellow':
      return 'cellYellow';
    case 'red':
      return 'cellRed';
    case 'neutral':
    default:
      return 'cellNeutral';
  }
}
