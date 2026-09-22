import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load competition details. Please check your network connection.',
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
