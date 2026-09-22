import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { VideoModal } from '../common/VideoModal';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface InfoRowProps {
  prizeMoneyInfoVideoUrl?: string;
  refundPolicyUrl?: string;
  paymentPartner?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  prizeMoneyInfoVideoUrl,
  refundPolicyUrl,
  paymentPartner = 'Razorpay',
}) => {
  const { t } = useTranslation();
  const [videoOpen, setVideoOpen] = useState(false);

  const videoTarget =
    prizeMoneyInfoVideoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

  const handleRefundPress = () => {
    if (refundPolicyUrl) {
      Linking.openURL(refundPolicyUrl).catch(() => {});
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Left Box: Prize Money Explainer Video */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => setVideoOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.playIconContainer}>
            <Ionicons name="play" size={18} color={colors.primary} style={{ marginLeft: 2 }} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.prizeTitle}>{t('howReceivePrize')}</Text>
            <Text style={styles.prizeSubtitle}>{t('watchVideoMore')}</Text>
          </View>
        </TouchableOpacity>

        {/* Right Box: Refund Policy & Razorpay Secure */}
        <View style={styles.box}>
          <TouchableOpacity
            style={styles.policyRow}
            onPress={handleRefundPress}
            activeOpacity={0.7}
          >
            <Feather name="shield" size={16} color={colors.textPrimary} style={styles.shieldIcon} />
            <Text style={styles.policyText}>{t('refundPolicy')}</Text>
          </TouchableOpacity>

          <View style={[styles.policyRow, { marginTop: spacing.sm }]}>
            <Feather name="shield" size={16} color={colors.textPrimary} style={styles.shieldIcon} />
            <View style={styles.paymentRow}>
              <Text style={styles.secureText}>{t('securePayments')}</Text>
              <Text style={styles.razorpayBrand}> {paymentPartner}</Text>
            </View>
          </View>
        </View>
      </View>

      <VideoModal
        visible={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={videoTarget}
        title={t('howReceivePrize')}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  prizeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 16,
    marginBottom: 2,
  },
  prizeSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    marginRight: 6,
  },
  policyText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  secureText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  razorpayBrand: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C2340', // Razorpay navy brand color
  },
});
