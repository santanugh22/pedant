import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

export interface CtaButtonConfig {
  label: string;
  subLabel?: string;
  action: 'REGISTER' | 'RESUME_PAYMENT' | 'UPLOAD_SUBMISSION' | 'EDIT_SUBMISSION' | 'VIEW_RESULTS' | 'NONE';
  enabled: boolean;
}

interface StickyBottomCtaProps {
  config: CtaButtonConfig;
  onPress: (action: string) => void;
  isLoading?: boolean;
}

export const StickyBottomCta: React.FC<StickyBottomCtaProps> = ({
  config,
  onPress,
  isLoading = false,
}) => {
  const isDisabled = !config.enabled || config.action === 'NONE' || isLoading;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={() => !isDisabled && onPress(config.action)}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.textContainer}>
            <Text style={[styles.label, isDisabled && styles.disabledText]}>
              {config.label}
            </Text>
            {config.subLabel ? (
              <Text style={[styles.subLabel, isDisabled && styles.disabledSubText]}>
                {config.subLabel}
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CB3B4', // muted teal for disabled state
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subLabel: {
    fontSize: 11,
    color: '#D1EAE7',
    marginTop: 2,
    fontWeight: '500',
  },
  disabledText: {
    color: '#FFFFFF',
  },
  disabledSubText: {
    color: '#E0EDED',
  },
});
