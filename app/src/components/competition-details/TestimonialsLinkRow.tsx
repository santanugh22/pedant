import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface TestimonialsLinkRowProps {
  competitionId: string;
}

export const TestimonialsLinkRow: React.FC<TestimonialsLinkRowProps> = ({ competitionId }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(app)/competitions/${competitionId}/testimonials` as any);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={22}
          color={colors.textPrimary}
          style={styles.icon}
        />
        <View>
          <Text style={styles.title}>{t('hearFromUsers')}</Text>
          <Text style={styles.subtitle}>{t('seeParticipantsSay')}</Text>
        </View>
      </View>

      <Feather name="chevron-right" size={20} color={colors.textPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
