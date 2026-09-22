import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/authStore';
import { useOverviewStats } from '../../../src/hooks/useCompetition';
import { useCountdown } from '../../../src/hooks/useCountdown';
import { colors, radius, spacing, typography } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/formatters';
import { VideoModal } from '../../../src/components/common/VideoModal';
import { CompetitionDetailsSkeleton } from '../../../src/components/common/Skeleton';
import { ErrorState } from '../../../src/components/common/ErrorState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'All', label: 'All Battles', icon: 'sparkles' },
  { id: 'Dance', label: 'Classical Dance', icon: 'body-outline' },
  { id: 'Music', label: 'Music & Vocal', icon: 'musical-notes-outline' },
  { id: 'Instrumental', label: 'Instruments', icon: 'radio-outline' },
  { id: 'Folk', label: 'Regional Folk', icon: 'people-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch, isRefetching } = useOverviewStats();

  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const featured = data?.featuredCompetition;
  const stats = data?.stats || {
    totalPrizePool: 25000,
    activeCompetitions: 16,
    totalParticipants: 350,
    winnersAwarded: 48,
  };
  const trending = data?.trendingCompetitions || [];
  const recentWinners = data?.recentWinners || [];

  // Countdown timer for featured battle
  const { days, hours, minutes, seconds, isExpired } = useCountdown(
    featured?.dates?.registrationEnd,
    undefined,
    () => refetch()
  );

  if (isLoading && !isRefetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.brandTitle}>Feedants</Text>
        </View>
        <CompetitionDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const userDisplayName = user?.name ? user.name.split(' ')[0] : 'Artist';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* 1. Header Bar: Brand, Greeting, and User Profile */}
        <View style={styles.topBar}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="trophy" size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.brandTitle}>FEEDANTS</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveIndicatorText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.greetingText}>
              Namaste, <Text style={{ color: colors.primary }}>{userDisplayName}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/(app)/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {user?.profileImageUrl ? (
              <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Unified Hero Metric Dashboard (Redesigned Stat Card) */}
        <View style={styles.dashboardContainer}>
          <View style={styles.dashboardCard}>
            {/* Top Stat Row: Total Prize Pool */}
            <View style={styles.dashboardTopRow}>
              <View>
                <View style={styles.pulseChip}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.pulseChipText}>Platform Arena Stats</Text>
                </View>
                <Text style={styles.mainStatValue}>₹{stats.totalPrizePool.toLocaleString('en-IN')}+</Text>
                <Text style={styles.mainStatLabel}>Guaranteed Prize Pool Distributed</Text>
              </View>

              <View style={styles.trophyCircle}>
                <Ionicons name="gift-outline" size={26} color="#FFFFFF" />
              </View>
            </View>

            {/* Bottom 3-Column Metric Strip */}
            <View style={styles.dashboardDivider} />
            <View style={styles.dashboardMetricsRow}>
              <View style={styles.dashboardCol}>
                <Text style={styles.subStatValue}>{stats.activeCompetitions}</Text>
                <Text style={styles.subStatLabel}>Active Battles</Text>
              </View>

              <View style={styles.verticalDashDivider} />

              <View style={styles.dashboardCol}>
                <Text style={styles.subStatValue}>{stats.totalParticipants}+</Text>
                <Text style={styles.subStatLabel}>Performers</Text>
              </View>

              <View style={styles.verticalDashDivider} />

              <View style={styles.dashboardCol}>
                <Text style={styles.subStatValue}>{stats.winnersAwarded}+</Text>
                <Text style={styles.subStatLabel}>Medalists</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Grand Spotlight Hero Card (Featured Competition) */}
        {featured && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flame" size={18} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Featured Spotlight Battle</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/competitions')}>
                <Text style={styles.viewAllText}>All Battles →</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.featuredCard}
              activeOpacity={0.92}
              onPress={() => router.push(`/(app)/competitions/${featured.slug || featured.id}`)}
            >
              {/* Cover Image with Badges */}
              <View style={styles.featuredImageContainer}>
                <Image
                  source={{ uri: featured.coverImageUrl || 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80' }}
                  style={styles.featuredCover}
                />
                <View style={styles.featuredBadgeOverlay}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{featured.category || 'Classical Dance'}</Text>
                  </View>
                  <View style={styles.multiWinBadge}>
                    <Ionicons name="trophy" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text style={styles.multiWinBadgeText}>Multi-Win</Text>
                  </View>
                </View>

                {/* Live Countdown Overlay Bar */}
                {!isExpired && (
                  <View style={styles.countdownPillBar}>
                    <Ionicons name="hourglass-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.countdownPillText}>
                      Closes in {days}d : {hours}h : {minutes}m : {seconds}s
                    </Text>
                  </View>
                )}
              </View>

              {/* Content Body */}
              <View style={styles.featuredBody}>
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {featured.title}
                </Text>

                {/* Judge Info */}
                {featured.judge && (
                  <View style={styles.judgeRow}>
                    <Image
                      source={{ uri: featured.judge.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' }}
                      style={styles.judgeAvatar}
                    />
                    <View>
                      <Text style={styles.judgeName}>{featured.judge.name}</Text>
                      <Text style={styles.judgeTitle}>{featured.judge.title}</Text>
                    </View>
                  </View>
                )}

                {/* Financial & Spots Bar */}
                <View style={styles.pricingSpotsRow}>
                  <View style={styles.pricingCol}>
                    <Text style={styles.priceLabel}>Prize Pool</Text>
                    <Text style={styles.prizeAmount}>{formatCurrency(featured.prizePool)}</Text>
                  </View>

                  <View style={styles.colDivider} />

                  <View style={styles.pricingCol}>
                    <Text style={styles.priceLabel}>Entry Fee</Text>
                    <Text style={styles.entryFeeAmount}>{formatCurrency(featured.entryFee)}</Text>
                  </View>

                  <View style={styles.colDivider} />

                  <View style={styles.pricingCol}>
                    <Text style={styles.priceLabel}>Spots Left</Text>
                    <Text style={styles.spotsCountText}>
                      {featured.spotsLeft > 0 ? `${featured.spotsLeft} spots` : 'FULL'}
                    </Text>
                  </View>
                </View>

                {/* Enter Action Button */}
                <View style={styles.enterButton}>
                  <Text style={styles.enterButtonText}>Enter Battle & Showcase Talent</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Quick Category Discovery Chips */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Explore by Art Form</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryChip}
                onPress={() => router.push(`/(app)/(tabs)/explore?category=${cat.id}`)}
                activeOpacity={0.75}
              >
                <Ionicons name={cat.icon as any} size={15} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.categoryChipText}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Trending Battles Horizontal Carousel */}
        {trending.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trending-up" size={17} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Trending Battles</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/competitions')}>
                <Text style={styles.viewAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {trending.map((comp: any) => (
                <TouchableOpacity
                  key={comp.id}
                  style={styles.trendingCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/(app)/competitions/${comp.slug || comp.id}`)}
                >
                  <Image
                    source={{ uri: comp.coverImageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' }}
                    style={styles.trendingCover}
                  />
                  <View style={styles.trendingBadge}>
                    <Text style={styles.trendingBadgeText}>{comp.category}</Text>
                  </View>

                  <View style={styles.trendingBody}>
                    <Text style={styles.trendingTitle} numberOfLines={2}>
                      {comp.title}
                    </Text>

                    <View style={styles.trendingMetaRow}>
                      <View>
                        <Text style={styles.miniLabel}>Prize Pool</Text>
                        <Text style={styles.miniValue}>{formatCurrency(comp.prizePool)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.miniLabel}>Spots</Text>
                        <Text style={[styles.miniValue, { color: colors.primary }]}>
                          {comp.spotsLeft} left
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 6. Hall of Fame / Recent Winners Video Carousel */}
        {recentWinners.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ribbon-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Hall of Fame</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Recent Gold & Silver Medalists</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winnersScroll}>
              {recentWinners.map((winner: any) => (
                <TouchableOpacity
                  key={winner.id}
                  style={styles.winnerCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    setActiveVideo({
                      url: winner.videoUrl,
                      title: `${winner.name} – ${winner.edition || 'Performance'}`,
                    })
                  }
                >
                  <View style={styles.winnerImgContainer}>
                    <Image source={{ uri: winner.photoUrl }} style={styles.winnerImg} />
                    <View style={styles.playIconOverlay}>
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{winner.position}</Text>
                    </View>
                  </View>

                  <Text style={styles.winnerName} numberOfLines={1}>
                    {winner.name}
                  </Text>
                  <Text style={styles.winnerEdition}>{winner.edition || 'Winner'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 7. Host a Competition Promotional Banner */}
        <View style={styles.hostBanner}>
          <View style={styles.hostBannerContent}>
            <View style={styles.guruPill}>
              <Ionicons name="star" size={12} color="#FBBF24" style={{ marginRight: 4 }} />
              <Text style={styles.guruPillText}>For Gurus & Dance Academies</Text>
            </View>
            <Text style={styles.hostBannerTitle}>Host Your Classical Battle</Text>
            <Text style={styles.hostBannerDesc}>
              Organize national level competitions with automated spot booking, Razorpay payouts, and verified digital certificates.
            </Text>
            <TouchableOpacity
              style={styles.hostBannerButton}
              onPress={() => router.push('/(app)/(tabs)/create')}
              activeOpacity={0.8}
            >
              <Feather name="plus-circle" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.hostBannerButtonText}>Host a Competition</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Video Playback Modal for Winner Clips */}
      <VideoModal
        visible={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.url}
        title={activeVideo?.title}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  avatarBtn: {
    padding: 2,
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFE5DC',
  },

  /* Redesigned Unified Metric Dashboard */
  dashboardContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  dashboardCard: {
    backgroundColor: '#0D3B38',
    borderRadius: radius.lg,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: '#072A28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dashboardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pulseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 5,
  },
  pulseChipText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '700',
  },
  mainStatValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#A7F3D0',
    fontWeight: '500',
    marginTop: 2,
  },
  trophyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: spacing.md,
  },
  dashboardMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dashboardCol: {
    alignItems: 'center',
    flex: 1,
  },
  subStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subStatLabel: {
    fontSize: 11,
    color: '#99F6E4',
    marginTop: 2,
    fontWeight: '500',
  },
  verticalDashDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* Section Containers */
  sectionContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  /* Featured Spotlight Card */
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EBE8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  featuredImageContainer: {
    position: 'relative',
    height: 170,
    width: '100%',
  },
  featuredCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredBadgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  multiWinBadge: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  multiWinBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  countdownPillBar: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(10, 40, 35, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  countdownPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredBody: {
    padding: spacing.md,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  judgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  judgeAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    marginRight: 8,
  },
  judgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  judgeTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pricingSpotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F3F8F6',
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  pricingCol: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  prizeAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  entryFeeAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  spotsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1E3DF',
  },
  enterButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },

  /* Categories Strip */
  categoriesScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E6E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  /* Trending Carousel */
  trendingScroll: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  trendingCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EBE8',
  },
  trendingCover: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  trendingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  trendingBody: {
    padding: spacing.sm,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
    height: 36,
    marginBottom: 6,
  },
  trendingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: 6,
  },
  miniLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  miniValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* Hall of Fame */
  winnersScroll: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  winnerCard: {
    width: 96,
    alignItems: 'center',
  },
  winnerImgContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 6,
  },
  winnerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  winnerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  winnerEdition: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  /* Host Banner */
  hostBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  hostBannerContent: {
    alignItems: 'flex-start',
  },
  guruPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  guruPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  hostBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hostBannerDesc: {
    fontSize: 12,
    color: '#E0F2EE',
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  hostBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  hostBannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
