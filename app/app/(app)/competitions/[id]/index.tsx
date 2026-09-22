import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCompetition, useRegister, useVerifyPayment } from '../../../../src/hooks/useCompetition';
import { useAuthStore } from '../../../../src/store/authStore';
import { ScreenHeader } from '../../../../src/components/competition-details/ScreenHeader';
import { CompetitionInfoCard } from '../../../../src/components/competition-details/CompetitionInfoCard';
import { JudgeCard } from '../../../../src/components/competition-details/JudgeCard';
import { CountdownBanner } from '../../../../src/components/competition-details/CountdownBanner';
import { ImportantDatesCard } from '../../../../src/components/competition-details/ImportantDatesCard';
import { PreviousWinnersCarousel } from '../../../../src/components/competition-details/PreviousWinnersCarousel';
import { CompetitionTabs } from '../../../../src/components/competition-details/CompetitionTabs';
import { RewardsCard } from '../../../../src/components/competition-details/RewardsCard';
import { DisclaimerBanner } from '../../../../src/components/competition-details/DisclaimerBanner';
import { InfoRow } from '../../../../src/components/competition-details/InfoRow';
import { ReferEarnCard } from '../../../../src/components/competition-details/ReferEarnCard';
import { TestimonialsLinkRow } from '../../../../src/components/competition-details/TestimonialsLinkRow';
import { AdPlaceholder } from '../../../../src/components/competition-details/AdPlaceholder';
import { StickyBottomCta, CtaButtonConfig } from '../../../../src/components/competition-details/StickyBottomCta';
import { RazorpayCheckoutModal } from '../../../../src/components/common/RazorpayCheckoutModal';
import { CompetitionDetailsSkeleton } from '../../../../src/components/common/Skeleton';
import { ErrorState } from '../../../../src/components/common/ErrorState';
import { colors, spacing } from '../../../../src/constants/theme';

export default function CompetitionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const { data: comp, isLoading, error, refetch, isRefetching } = useCompetition(id || '');
  const registerMutation = useRegister(id || '');
  const verifyPaymentMutation = useVerifyPayment(id || '');

  // Razorpay checkout state
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState<{
    registrationId: string;
    razorpayOrderId: string;
    amount: number;
    razorpayKeyId: string;
  } | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ScreenHeader onBack={() => router.back()} />
        <CompetitionDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !comp) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ScreenHeader onBack={() => router.back()} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // Derive CTA config from backend userContext or fallback to public CTA
  const defaultPublicCta: CtaButtonConfig = comp.lifecycle?.registrationOpen
    ? {
        label: `Register Now – ₹${comp.entryFee}`,
        action: 'REGISTER',
        enabled: true,
      }
    : comp.lifecycle?.isFull
    ? {
        label: 'Registration Full',
        action: 'NONE',
        enabled: false,
      }
    : {
        label: 'Registration Closed',
        action: 'NONE',
        enabled: false,
      };

  const ctaConfig: CtaButtonConfig = comp.userContext?.ctaButton || defaultPublicCta;
  const isRegisteredUser = comp.userContext?.registrationStatus === 'confirmed';

  // Dispatch sticky bottom CTA action based on server-computed state
  const handleCtaPress = async (action: string) => {
    // 1. If unauthenticated and tapping Register, redirect to Login preserving intent
    if (!user && (action === 'REGISTER' || action === 'RESUME_PAYMENT')) {
      router.push(`/(auth)/login?returnTo=/(app)/competitions/${id}`);
      return;
    }

    // 2. Action handlers
    switch (action) {
      case 'REGISTER': {
        try {
          const orderData = await registerMutation.mutateAsync();
          setActivePaymentOrder({
            registrationId: orderData.registrationId,
            razorpayOrderId: orderData.razorpayOrderId,
            amount: orderData.amount,
            razorpayKeyId: orderData.razorpayKeyId,
          });
          setCheckoutModalVisible(true);
        } catch (err: any) {
          const message = err.response?.data?.error?.message || 'Unable to register. Spot may no longer be available.';
          Alert.alert('Registration Error', message);
        }
        break;
      }

      case 'RESUME_PAYMENT': {
        if (activePaymentOrder) {
          setCheckoutModalVisible(true);
        } else {
          try {
            const orderData = await registerMutation.mutateAsync();
            setActivePaymentOrder({
              registrationId: orderData.registrationId,
              razorpayOrderId: orderData.razorpayOrderId,
              amount: orderData.amount,
              razorpayKeyId: orderData.razorpayKeyId,
            });
            setCheckoutModalVisible(true);
          } catch (err: any) {
            Alert.alert('Payment Error', err.response?.data?.error?.message || 'Failed to resume payment.');
          }
        }
        break;
      }

      case 'UPLOAD_SUBMISSION':
      case 'EDIT_SUBMISSION': {
        router.push(`/(app)/competitions/${id}/submit` as any);
        break;
      }

      case 'VIEW_RESULTS': {
        Alert.alert('Results Declared', 'Winners have been announced for this competition! Check the Previous Winners carousel to view winning entries.');
        break;
      }

      default:
        break;
    }
  };

  const handlePaymentSuccess = async (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    setCheckoutModalVisible(false);
    if (!activePaymentOrder) return;

    try {
      await verifyPaymentMutation.mutateAsync({
        registrationId: activePaymentOrder.registrationId,
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
      });

      Alert.alert(
        'Registration Confirmed! 🎉',
        'Your payment was verified successfully. You can now upload your dance entry!'
      );
      refetch();
    } catch (err: any) {
      Alert.alert(
        'Payment Verification',
        err.response?.data?.error?.message || 'Payment completed. Confirmation is updating.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 5.1 Top Navigation Bar: Go back + Language toggle */}
      <ScreenHeader onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* 5.2 Main Competition Info Card */}
        <CompetitionInfoCard
          title={comp.title}
          tags={comp.tags || []}
          winnersGetCertificate={comp.winnersGetCertificate}
          prizePool={comp.prizePool}
          entryFee={comp.entryFee}
          currency={comp.currency}
          totalSpots={comp.totalSpots}
          bookedSpots={comp.bookedSpots}
          spotsLeft={comp.spotsLeft}
          isRegistered={isRegisteredUser}
        />

        {/* 5.3 Judge Card */}
        {comp.judge && <JudgeCard judge={comp.judge} />}

        {/* 5.4 Countdown Banner (Anchored to serverTime) */}
        {comp.dates?.registrationEnd && (
          <CountdownBanner
            targetIso={comp.dates.registrationEnd}
            serverTimeIso={comp.serverTime}
            visible={comp.lifecycle?.registrationOpen}
            onExpired={refetch}
          />
        )}

        {/* 5.5 Important Dates Card (2x2 Grid with Cross Divider) */}
        {comp.dates && <ImportantDatesCard dates={comp.dates} />}

        {/* 5.6 Previous Winners Horizontal Carousel */}
        <PreviousWinnersCarousel competitionId={comp.id} />

        {/* 5.7 Tabs Card (About / Judging Parameters / Rules & Eligibility) */}
        <CompetitionTabs
          description={comp.description}
          descriptionFull={comp.descriptionFull}
          judgingParameters={comp.judgingParameters}
          rulesAndEligibility={comp.rulesAndEligibility}
        />

        {/* 5.8 Rewards Card */}
        <RewardsCard rewards={comp.rewards || []} isMultiWin={comp.isMultiWin} />

        {/* 5.9 Disclaimer Banner */}
        <DisclaimerBanner disclaimer={comp.disclaimer} />

        {/* 5.10 Info Row (Prize Video Explainer & Refund/Razorpay Shields) */}
        <InfoRow
          prizeMoneyInfoVideoUrl={comp.prizeMoneyInfoVideoUrl}
          refundPolicyUrl={comp.refundPolicyUrl}
          paymentPartner={comp.paymentPartner}
        />

        {/* 5.11 Refer & Earn Card */}
        <ReferEarnCard />

        {/* 5.12 "Hear From Our Users" Row */}
        <TestimonialsLinkRow competitionId={comp.id} />

        {/* 5.13 Ad Placeholder */}
        <AdPlaceholder />
      </ScrollView>

      {/* 5.14 Sticky Bottom CTA Button */}
      <StickyBottomCta
        config={ctaConfig}
        onPress={handleCtaPress}
        isLoading={registerMutation.isPending || verifyPaymentMutation.isPending}
      />

      {/* Razorpay Standard Checkout Modal (Approach A) */}
      {activePaymentOrder && (
        <RazorpayCheckoutModal
          visible={checkoutModalVisible}
          onClose={() => setCheckoutModalVisible(false)}
          onSuccess={handlePaymentSuccess}
          orderId={activePaymentOrder.razorpayOrderId}
          amount={activePaymentOrder.amount}
          keyId={activePaymentOrder.razorpayKeyId}
          userName={user?.name}
          userEmail={user?.email}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
