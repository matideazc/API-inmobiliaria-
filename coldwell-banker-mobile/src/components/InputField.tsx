/**
 * Input de texto reutilizable
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required = false,
  style,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textDisabled}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
