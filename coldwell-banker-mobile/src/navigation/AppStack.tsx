/**
 * Stack de aplicación
 * Pantallas para usuarios autenticados
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { AppStackParamList } from './types';
import { colors, typography } from '../theme';
import { useAuth } from '../contexts/AuthContext';

// Importar screens desde index
import {
  HomeScreen,
  PropertiesListScreen,
  PropertyDetailScreen,
  PropertyFormScreen,
  MandateFormScreen,
} from '../screens';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
  const { logout, user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundCard,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Coldwell Banker',
          headerRight: () => (
            <TouchableOpacity
              onPress={logout}
              style={{ paddingHorizontal: 16 }}
            >
              <Text style={{ color: colors.error, fontSize: typography.sizes.sm }}>
                Salir
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="PropertiesList" 
        component={PropertiesListScreen}
        options={{
          title: 'Propiedades',
        }}
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen}
        options={{
          title: 'Detalle de Propiedad',
        }}
      />
      <Stack.Screen 
        name="PropertyForm" 
        component={PropertyFormScreen}
        options={({ route }) => ({
          title: route.params?.propertyId ? 'Editar Propiedad' : 'Nueva Propiedad',
        })}
      />
      <Stack.Screen 
        name="MandateForm" 
        component={MandateFormScreen}
        options={{
          title: 'Generar Mandato',
        }}
      />
    </Stack.Navigator>
  );
};
