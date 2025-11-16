/**
 * Servicio de autenticación
 * Conecta con los endpoints de login/logout del backend
 */

import { apiClient } from './client';
import { LoginResponse } from '../types';

/**
 * Realiza el login de usuario
 * 
 * ⚠️ ENDPOINT: Ajustar la ruta según tu backend
 * Ejemplo común: POST /auth/login o POST /login
 */
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // ⚠️ Ajustar la ruta del endpoint según tu backend
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    return response.data;
  },

  /**
   * Logout (si tu backend tiene endpoint de logout)
   */
  logout: async (): Promise<void> => {
    // ⚠️ Si tienes endpoint de logout, descomentarlo:
    // await apiClient.post('/auth/logout');
  },

  /**
   * Verificar/refrescar token (si lo implementas)
   */
  verifyToken: async (): Promise<LoginResponse> => {
    // ⚠️ Si tienes endpoint para verificar token válido:
    const response = await apiClient.get<LoginResponse>('/auth/verify');
    return response.data;
  },
};
