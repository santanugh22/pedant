import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCountdown } from '../../hooks/useCountdown';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface CountdownBannerProps {
  targetIso: string;
  serverTimeIso?: string;
  visible?: boolean;
  onExpired?: () => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  targetIso,
  serverTimeIso,
  visible = true,
  onExpired,
}) => {
  const { t } = useTranslation();
  const { formatted, isExpired } = useCountdown(targetIso, serverTimeIso, onExpired);

  if (!visible || isExpired) return null;

  return (
    <View style={styles.banner}>
      {/* Left: Hourglass + Registration Closes In */}
      <View style={styles.leftSection}>
        <Ionicons name="hourglass-outline" size={17} color={colors.primary} style={styles.icon} />
        <Text style={styles.labelText}>{t('registrationClosesIn')}</Text>
      </View>

      {/* Center: Dynamic Countdown */}
      <Text style={styles.timerText}>{formatted}</Text>

      {/* Right: Stopwatch + Hurry Up! */}
      <View style={styles.rightSection}>
        <MaterialCommunityIcons name="timer-sand" size={16} color={colors.primary} style={styles.icon} />
        <Text style={styles.hurryUpText}>{t('hurryUp')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D4EBE7',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  icon: {
    marginRight: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xs,
  },
  hurryUpText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});
