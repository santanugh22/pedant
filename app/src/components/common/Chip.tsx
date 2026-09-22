import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface ChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'badge';
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({ label, variant = 'default', style, icon }) => {
  const isPrimary = variant === 'primary';
  const isBadge = variant === 'badge';

  return (
    <View
      style={[
        styles.chip,
        isPrimary && styles.primaryChip,
        isBadge && styles.badgeChip,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.chipText,
          isPrimary && styles.primaryText,
          isBadge && styles.badgeText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
  },
  primaryChip: {
    backgroundColor: colors.primaryTint,
  },
  badgeChip: {
    backgroundColor: colors.primaryTint,
    borderColor: '#BFE7E2',
    borderWidth: 1,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  primaryText: {
    color: colors.primary,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: 4,
  },
});
