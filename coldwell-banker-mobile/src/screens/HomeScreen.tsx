/**
 * Pantalla Home
 * Pantalla de bienvenida con acceso a propiedades
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton } from '../components';
import { colors, typography, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Ícono */}
        <Text style={styles.icon}>🏢</Text>

        {/* Título de bienvenida */}
        <Text style={styles.title}>
          Bienvenido al Sistema Inmobiliario
        </Text>

        {/* Subtítulo personalizado */}
        <Text style={styles.subtitle}>
          {user?.nombre} {user?.apellido || ''}
        </Text>
        <Text style={styles.role}>
          {user?.rol === 'ASESOR' ? 'Asesor Inmobiliario' : 'Administrador'}
        </Text>

        {/* Descripción */}
        <Text style={styles.description}>
          Gestiona propiedades, mandatos y toda la información necesaria desde tu dispositivo móvil.
        </Text>

        {/* Botón principal: PROPIEDADES */}
        <PrimaryButton
          title="PROPIEDADES"
          onPress={() => navigation.navigate('PropertiesList')}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  role: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    marginBottom: spacing['2xl'],
    maxWidth: 300,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
});

export default HomeScreen;
