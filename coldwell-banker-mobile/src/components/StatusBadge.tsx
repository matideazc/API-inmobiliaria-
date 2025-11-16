/**
 * Badge de estado de propiedad
 * Muestra el estado con color apropiado
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PropertyStatus } from '../types';
import { colors, typography, spacing } from '../theme';

interface StatusBadgeProps {
  status: PropertyStatus;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case PropertyStatus.APPROVED:
        return colors.statusApproved;
      case PropertyStatus.PENDING:
        return colors.statusPending;
      case PropertyStatus.REJECTED:
        return colors.statusRejected;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case PropertyStatus.APPROVED:
        return 'Aprobado';
      case PropertyStatus.PENDING:
        return 'Pendiente';
      case PropertyStatus.REJECTED:
        return 'Rechazado';
      default:
        return status;
    }
  };

  const badgeStyles = [
    styles.badge,
    styles[`badge_${size}`],
    { backgroundColor: getStatusColor() + '20' }, // 20% opacity
    { borderColor: getStatusColor() },
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    { color: getStatusColor() },
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badge_small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badge_medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  badge_large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
  },
  text_small: {
    fontSize: typography.sizes.xs,
  },
  text_medium: {
    fontSize: typography.sizes.sm,
  },
  text_large: {
    fontSize: typography.sizes.base,
  },
});
