import axios from 'axios';

// Crear instancia de axios con la URL base desde variables de entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // CRÍTICO: Enviar cookies en requests cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para guardar la función de clearAuth
let clearAuthCallback: (() => void) | null = null;

// Función para configurar el callback de logout desde el contexto
export const setAuthClearCallback = (callback: () => void) => {
  clearAuthCallback = callback;
};

// Interceptor para manejar respuestas y errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos 401, el token expiró o es inválido
    if (error.response?.status === 401) {
      // Llamar al callback de clearAuth si está configurado
      if (clearAuthCallback) {
        clearAuthCallback();
      }
      // NO redirigir aquí - ProtectedRoute ya maneja eso
      // window.location.href = '/login'; ← ESTO CAUSABA EL LOOP INFINITO
    }
    return Promise.reject(error);
  }
);

// Helper para obtener expedientes con filtros opcionales
interface FetchExpedientesParams {
  page?: number;
  limit?: number;
  asesorId?: number;
}

export const fetchExpedientes = async (params?: FetchExpedientesParams) => {
  const response = await api.get('/expedientes', { params });
  return response.data;
};

// Helper para crear mandato
export const crearMandato = (
  expedienteId: number,
  data: { plazoDias: number; monto: number; moneda?: string; observaciones?: string }
) => api.post(`/expedientes/${expedienteId}/mandato`, data);

// Helper para descargar documento Word del mandato (con datos autocompletados)
export const descargarMandatoWord = async (
  expedienteId: number,
  tituloExpediente: string
): Promise<void> => {
  const response = await api.get(`/expedientes/${expedienteId}/mandato/word-completo`, {
    responseType: 'blob',
  });

  // Crear slug del título para el nombre del archivo
  const slug = tituloExpediente
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '_') // reemplazar espacios/símbolos por _
    .replace(/^_+|_+$/g, ''); // quitar _ al inicio/final

  const filename = `mandato_${expedienteId}_${slug}.docx`;

  // Crear URL del blob y descargar
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Descarga un documento PDF de forma segura
 * Usa el endpoint protegido que valida permisos
 */
export const descargarDocumento = async (documentoId: number): Promise<void> => {
  try {
    const response = await api.get(`/documentos/${documentoId}/download`, {
      responseType: 'blob',
    });

    // Obtener el nombre del archivo del header Content-Disposition si existe
    const contentDisposition = response.headers['content-disposition'];
    let filename = `documento_${documentoId}.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    throw error;
  }
};

// ===== Actividades Semanales =====

export interface ActividadSemanal {
  tipoActividad: string;
  objetivo: number;
  planificado: number;
  realizado: number;
}

/**
 * Obtiene las actividades de la semana especificada
 * @param weekStart - Fecha de inicio de semana (lunes) en formato YYYY-MM-DD
 */
export const obtenerActividadesSemana = async (weekStart: string): Promise<ActividadSemanal[]> => {
  const response = await api.get(`/actividades-semanales?weekStart=${weekStart}`);
  return response.data;
};

/**
 * Guarda o actualiza las actividades de una semana
 * @param data - Datos de la semana con array de actividades
 */
export const guardarActividadesSemana = async (data: {
  semanaInicio: string;
  semanaFin: string;
  actividades: Array<{
    tipoActividad: string;
    objetivo: number;
    planificado: number;
    realizado: number; // Ahora también se guarda el realizado
  }>;
}) => {
  const response = await api.put('/actividades-semanales', data);
  return response.data;
};

// ===== Admin - Actividades Semanales =====

export interface ActividadAdmin {
  asesorId: number;
  asesor: {
    id: number;
    nombre: string;
    email: string;
  };
  tipoActividad: string;
  objetivo: number;
  planificado: number;
  realizado: number;
  semanaInicio: string;
  semanaFin: string;
}

export interface Asesor {
  id: number;
  nombre: string;
  email: string;
}

export const obtenerActividadesAdmin = async (params: {
  weekStart: string;
  asesorId?: number;
}): Promise<ActividadAdmin[]> => {
  const response = await api.get('/admin/actividades-semanales', { params });
  return response.data;
};

export const obtenerAsesores = async (): Promise<Asesor[]> => {
  const response = await api.get('/admin/asesores');
  return response.data;
};

export const exportarActividadesExcel = async (params: {
  weekStart: string;
  asesorId?: number;
}): Promise<void> => {
  const response = await api.get('/admin/actividades-semanales/export', {
    params,
    responseType: 'blob',
  });

  const filename = params.asesorId
    ? `actividades_${params.weekStart}_asesor_${params.asesorId}.xlsx`
    : `actividades_${params.weekStart}.xlsx`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ==================== OBJETIVOS ANUALES (ADMIN) ====================

export interface ObjetivoAnualData {
  asesorId: number;
  nombre: string;
  email: string;
  objetivos: Record<string, number>;
}

export interface ObjetivosAnualesResponse {
  año: number;
  asesores: ObjetivoAnualData[];
}

export const obtenerObjetivosAnuales = async (año: number): Promise<ObjetivosAnualesResponse> => {
  const response = await api.get(`/admin/objetivos-anuales?año=${año}`);
  return response.data;
};

export const guardarObjetivosAnuales = async (data: {
  año: number;
  objetivos: Array<{
    asesorId: number;
    tipoActividad: string;
    objetivoAnual: number;
  }>;
}) => {
  const response = await api.put('/admin/objetivos-anuales', data);
  return response.data;
};

export default api;