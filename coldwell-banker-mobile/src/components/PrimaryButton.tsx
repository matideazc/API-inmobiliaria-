/**
 * Componente de botón primario reutilizable
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'large',
  disabled,
  style,
  ...rest
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_primary: {
    backgroundColor: colors.primary,
  },
  button_secondary: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button_danger: {
    backgroundColor: colors.error,
  },
  button_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button_medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button_large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  text_small: {
    fontSize: typography.sizes.sm,
  },
  text_medium: {
    fontSize: typography.sizes.base,
  },
  text_large: {
    fontSize: typography.sizes.lg,
  },
  textDisabled: {
    color: colors.textDisabled,
  },
});
