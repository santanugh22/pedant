import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface ScreenHeaderProps {
  onBack: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>{t('goBack')}</Text>
      </TouchableOpacity>

      <View style={styles.languagePillContainer}>
        <TouchableOpacity
          style={[styles.langSegment, currentLang === 'en' && styles.activeLangSegment]}
          onPress={() => toggleLanguage('en')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langText, currentLang === 'en' && styles.activeLangText]}>
            ENG
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langSegment, currentLang === 'hi' && styles.activeLangSegment]}
          onPress={() => toggleLanguage('hi')}
          activeOpacity={0.8}
        >
          <Text style={[styles.langText, currentLang === 'hi' && styles.activeLangText]}>
            हिंदी
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  languagePillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: '#DFE5EA',
  },
  langSegment: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  activeLangSegment: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeLangText: {
    color: '#FFFFFF',
  },
});
