// src/utils/validation.ts
/**
 * Utilidades de validación y sanitización de inputs
 * Previene XSS y asegura datos limpios
 */

/**
 * Sanitiza un string removiendo tags HTML y caracteres peligrosos
 * Previene XSS básico
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/[<>'"]/g, ''); // Remover caracteres peligrosos
};

/**
 * Valida que un string esté dentro de un rango de longitud
 */
export const validateLength = (
  str: string, 
  min: number, 
  max: number
): boolean => {
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Valida formato de email básico
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un string solo contenga letras, números, espacios y guiones
 * Útil para nombres, títulos, etc.
 */
export const validateAlphanumeric = (str: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑüÜ]+$/;
  return alphanumericRegex.test(str);
};

/**
 * Valida que un número esté dentro de un rango
 */
export const validateNumberRange = (
  num: number, 
  min: number, 
  max: number
): boolean => {
  return num >= min && num <= max;
};

/**
 * Sanitiza y valida un input de texto general
 * Retorna el texto sanitizado o null si no es válido
 */
export const sanitizeAndValidate = (
  str: string,
  minLength: number = 1,
  maxLength: number = 500
): string | null => {
  const sanitized = sanitizeString(str);
  
  if (!validateLength(sanitized, minLength, maxLength)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Valida DNI argentino (solo números, 7-8 dígitos)
 */
export const validateDNI = (dni: string): boolean => {
  const dniRegex = /^\d{7,8}$/;
  return dniRegex.test(dni.replace(/\./g, '')); // Permite puntos como separadores
};

/**
 * Valida teléfono (formato flexible argentino)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,15}$/;
  return phoneRegex.test(phone);
};
