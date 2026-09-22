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
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetIso, serverTimeIso, onExpired);

  if (!visible || isExpired) return null;

  return (
    <View style={styles.banner}>
      {/* Top Row: Label & Hurry Up Badge */}
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          <Ionicons name="hourglass-outline" size={15} color={colors.primary} style={styles.icon} />
          <Text style={styles.labelText}>{t('registrationClosesIn')}</Text>
        </View>

        <View style={styles.rightSection}>
          <MaterialCommunityIcons name="timer-sand" size={14} color={colors.primary} style={styles.icon} />
          <Text style={styles.hurryUpText}>{t('hurryUp')}</Text>
        </View>
      </View>

      {/* Bottom Row: Centered, High-Legibility Timer Badges */}
      <View style={styles.timerContainer}>
        <View style={styles.timerUnit}>
          <Text style={styles.timerDigit}>{days}</Text>
          <Text style={styles.timerUnitLabel}>d</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timerUnit}>
          <Text style={styles.timerDigit}>{hours}</Text>
          <Text style={styles.timerUnitLabel}>h</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timerUnit}>
          <Text style={styles.timerDigit}>{minutes}</Text>
          <Text style={styles.timerUnitLabel}>m</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timerUnit}>
          <Text style={styles.timerDigit}>{seconds}</Text>
          <Text style={styles.timerUnitLabel}>s</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D4EBE7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9ECE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  icon: {
    marginRight: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hurryUpText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#D4EBE7',
    alignSelf: 'center',
    minWidth: 220,
  },
  timerUnit: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timerDigit: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timerUnitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 2,
    marginRight: 4,
  },
  separator: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginHorizontal: 4,
    opacity: 0.6,
  },
});
