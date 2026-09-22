import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';

export const AdPlaceholder: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons name="megaphone-outline" size={18} color={colors.textSecondary} style={styles.icon} />
      <Text style={styles.text}>{t('adHere')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BAC7D5',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: '#FAFCFD',
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
