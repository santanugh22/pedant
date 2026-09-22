import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/Card';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

interface RewardTier {
  position: number;
  label: string;
  amount: number;
}

interface RewardsCardProps {
  rewards: RewardTier[];
  isMultiWin?: boolean;
}

export const RewardsCard: React.FC<RewardsCardProps> = ({ rewards, isMultiWin = true }) => {
  const { t } = useTranslation();
  // If not multi-win, only show 1st place reward
  const displayedRewards = isMultiWin ? rewards : rewards.filter((r) => r.position === 1);

  const getPositionIcon = (pos: number) => {
    switch (pos) {
      case 1:
        return <Text style={styles.medalEmoji}>🏆</Text>;
      case 2:
        return <Text style={styles.medalEmoji}>🥈</Text>;
      case 3:
        return <Text style={styles.medalEmoji}>🥉</Text>;
      default:
        return <Ionicons name="star-outline" size={18} color={colors.primary} style={{ marginRight: 2 }} />;
    }
  };

  return (
    <Card padding="lg" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <Text style={styles.subtitle}> {isMultiWin ? '(All Positions)' : '(1st Place Only)'}</Text>
      </View>

      <View style={styles.list}>
        {displayedRewards.map((reward, idx) => (
          <View key={idx} style={styles.row}>
            <View style={styles.leftRow}>
              {getPositionIcon(reward.position)}
              <Text style={styles.winnerLabel}>{reward.label}</Text>
            </View>
            <Text style={styles.rewardAmount}>{formatCurrency(reward.amount)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  list: {
    paddingTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F8F9',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  winnerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: 2,
  },
  rewardAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});
