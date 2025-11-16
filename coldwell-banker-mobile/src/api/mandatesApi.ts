/**
 * Servicio de mandatos
 * Conecta con los endpoints de mandatos del backend
 */

import { apiClient } from './client';
import { Mandate, CreateMandateDto } from '../types';

/**
 * API de mandatos
 * ⚠️ Ajustar rutas según tu backend real
 */
export const mandatesApi = {
  /**
   * Obtener mandato de una propiedad
   * ⚠️ Ruta ejemplo: GET /mandatos/propiedad/:propiedadId
   */
  getMandateByPropertyId: async (propertyId: string): Promise<Mandate | null> => {
    try {
      const response = await apiClient.get<Mandate>(`/mandatos/propiedad/${propertyId}`);
      return response.data;
    } catch (error: any) {
      // Si no existe mandato, retornar null
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Crear/generar mandato para una propiedad
   * POST /propiedades/:id/mandato
   */
  createMandate: async (propertyId: string, data: CreateMandateDto): Promise<Mandate> => {
    console.log('📝 Creando mandato para propiedad:', propertyId, data);
    try {
      const response = await apiClient.post<any>(`/propiedades/${propertyId}/mandato`, data);
      console.log('✅ Respuesta del backend:', response.data);
      
      // El backend puede devolver { data: {...} } o { message: "...", mandato: {...} }
      const mandato = response.data.data || response.data.mandato || response.data;
      
      if (!mandato || !mandato.id) {
        console.warn('⚠️ Backend no devolvió el objeto mandato, creando uno temporal');
        // Si el backend no devuelve el mandato, crear uno temporal
        return {
          id: 'temp-' + Date.now(),
          propiedadId: propertyId,
          monto: data.monto,
          plazoDias: data.plazoDias,
          observaciones: data.observaciones,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Mandate;
      }
      
      return mandato;
    } catch (error: any) {
      console.error('❌ Error al crear mandato:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Actualizar mandato existente
   * ⚠️ Ruta ejemplo: PUT /mandatos/:id
   */
  updateMandate: async (id: string, data: Partial<CreateMandateDto>): Promise<Mandate> => {
    const response = await apiClient.put<Mandate>(`/mandatos/${id}`, data);
    return response.data;
  },

  /**
   * Obtener URL del PDF del mandato
   * ⚠️ Ruta ejemplo: GET /mandatos/:id/pdf
   */
  getMandatePdfUrl: async (id: string): Promise<string> => {
    const response = await apiClient.get<{ url: string }>(`/mandatos/${id}/pdf`);
    return response.data.url;
  },
};
