/**
 * Pantalla de Login
 * Permite al usuario iniciar sesión en el sistema
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton, InputField } from '../components';
import { colors, typography, spacing } from '../theme';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // La navegación se maneja automáticamente por el AuthContext
    } catch (error: any) {
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'Credenciales incorrectas. Por favor, verifica tus datos.',
        [{ text: 'Aceptar' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏢</Text>
          <Text style={styles.title}>Coldwell Banker</Text>
          <Text style={styles.subtitle}>Sistema Inmobiliario</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Iniciar sesión</Text>

          <InputField
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: undefined });
            }}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            required
          />

          <View style={styles.passwordContainer}>
            <InputField
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              error={errors.password}
              required
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title="Ingresar"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: spacing.md,
    top: 38,
  },
  showPasswordText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
  },
  loginButton: {
    marginTop: spacing.md,
  },
});

export default LoginScreen;
