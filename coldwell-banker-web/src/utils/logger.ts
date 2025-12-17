// src/utils/logger.ts
/**
 * Logger utility - Solo logea en desarrollo, silencioso en producción
 * Previene exposición de información sensible en consola
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log general - solo en desarrollo
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Warning - solo en desarrollo
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Error - SIEMPRE logea (incluso en producción)
   * Los errores son importantes para debugging
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Info - solo en desarrollo
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Debug - solo en desarrollo
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  }
};
