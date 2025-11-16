/**
 * Navegador raíz
 * Alterna entre AuthStack y AppStack según el estado de autenticación
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { colors } from '../theme';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
