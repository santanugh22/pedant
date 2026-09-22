import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/Card';
import { Chip } from '../common/Chip';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

interface CompetitionInfoCardProps {
  title: string;
  tags: string[];
  winnersGetCertificate?: boolean;
  prizePool: number;
  entryFee: number;
  currency?: string;
  totalSpots: number;
  bookedSpots: number;
  spotsLeft: number;
  isRegistered?: boolean;
}

export const CompetitionInfoCard: React.FC<CompetitionInfoCardProps> = ({
  title,
  tags,
  winnersGetCertificate,
  prizePool,
  entryFee,
  currency = 'INR',
  totalSpots,
  bookedSpots,
  spotsLeft,
  isRegistered = false,
}) => {
  const { t } = useTranslation();
  const progressRatio = totalSpots > 0 ? Math.min(1, Math.max(0, bookedSpots / totalSpots)) : 0;

  return (
    <Card padding="lg" style={styles.card}>
      {/* Title & Registered Badge Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {isRegistered && (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.badgeIcon} />
            <Text style={styles.registeredText}>{t('registered')}</Text>
          </View>
        )}
      </View>

      {/* Tags & Certificate Row */}
      <View style={styles.tagsRow}>
        {tags.map((tag, idx) => (
          <Chip key={idx} label={tag} style={styles.tagChip} />
        ))}

        {winnersGetCertificate && (
          <View style={styles.certificateContainer}>
            <Ionicons name="trophy-outline" size={16} color={colors.primary} />
            <Text style={styles.certificateText}>{t('winnersGetCertificate')}</Text>
          </View>
        )}
      </View>

      {/* Stats Section: Prize Pool, Entry Fee, Spots Left */}
      <View style={styles.statsRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>{t('prizePool')}</Text>
          <Text style={[styles.statValue, styles.prizePoolValue]}>
            {formatCurrency(prizePool, currency)}
          </Text>
        </View>

        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>{t('entryFee')}</Text>
          <Text style={styles.statValue}>
            {formatCurrency(entryFee, currency)}
          </Text>
        </View>

        <View style={styles.spotsColumn}>
          <View style={styles.spotsHeader}>
            <Ionicons name="people" size={15} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.spotsLeftText}>
              {spotsLeft <= 0
                ? t('registrationFull')
                : t('spotsLeft', { count: spotsLeft })}
            </Text>
          </View>

          {/* Thin Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
          </View>

          <Text style={styles.bookedText}>
            {t('bookedOf', { booked: bookedSpots, total: totalSpots })}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    flex: 1,
    marginRight: spacing.sm,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  badgeIcon: {
    marginRight: 4,
  },
  registeredText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tagChip: {
    backgroundColor: '#F0F4F7',
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  certificateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  certificateText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  statColumn: {
    marginRight: spacing.md,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  prizePoolValue: {
    color: colors.primary,
  },
  spotsColumn: {
    flex: 1,
    maxWidth: 140,
    alignItems: 'flex-end',
  },
  spotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  spotsLeftText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5EBF0',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  bookedText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
