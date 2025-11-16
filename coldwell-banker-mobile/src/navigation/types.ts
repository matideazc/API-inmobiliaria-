/**
 * Tipos de navegación
 * Define las rutas y parámetros de cada stack
 */

import { Property } from '../types';

/**
 * Stack de autenticación (sin sesión)
 */
export type AuthStackParamList = {
  Login: undefined;
};

/**
 * Stack de la aplicación (con sesión iniciada)
 */
export type AppStackParamList = {
  Home: undefined;
  PropertiesList: undefined;
  PropertyDetail: { propertyId: string };
  PropertyForm: { propertyId?: string }; // undefined = crear nueva
  MandateForm: { propertyId: string };
};

/**
 * Navegación raíz
 */
export type RootStackParamList = AuthStackParamList & AppStackParamList;
