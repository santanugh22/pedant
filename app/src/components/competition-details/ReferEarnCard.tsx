import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useReferral } from '../../hooks/useCompetition';
import { colors, radius, spacing, typography } from '../../constants/theme';

export const ReferEarnCard: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useReferral();
  const [copied, setCopied] = useState(false);

  const referralCode = data?.referralCode || 'FEED123';
  const referralLink = data?.referralLink || `https://feedants.com/r/${referralCode}`;
  const rewardAmount = data?.rewardAmount || 10;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Feedants and compete in classical dance & music competitions! Use my referral link: ${referralLink}`,
        url: referralLink,
      });
    } catch {
      // Ignored
    }
  };

  return (
    <View style={styles.card}>
      {/* Heading with Megaphone */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t('referEarnDiscount')}</Text>
      </View>

      {/* Referral Link & Buttons Row */}
      <View style={styles.actionRow}>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText} numberOfLines={1}>
            {referralLink}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.7}>
            <Text style={styles.copyButtonText}>{copied ? 'Copied!' : t('copyLink')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.referNowButton} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.referNowText}>{t('referNow')}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer reward notice */}
      <Text style={styles.footerNote}>
        {t('earnPerSignup', { amount: rewardAmount })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8F5F3',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D4EBE7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: '#D7EFEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CFE6E1',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: 4,
    marginRight: spacing.sm,
  },
  linkText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.xs,
  },
  copyButton: {
    backgroundColor: '#F0F4F7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  referNowButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  referNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
