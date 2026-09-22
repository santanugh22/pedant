import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompetitions, useOverviewStats } from '../../../src/hooks/useCompetition';
import { colors, radius, spacing, typography } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/formatters';
import { VideoModal } from '../../../src/components/common/VideoModal';
import { CompetitionDetailsSkeleton } from '../../../src/components/common/Skeleton';

const CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'Dance', label: 'Classical Dance' },
  { id: 'Music', label: 'Music & Vocal' },
  { id: 'Instrumental', label: 'Instrumental' },
  { id: 'Folk', label: 'Folk Dance' },
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All Battles' },
  { id: 'open', label: 'Open Now' },
  { id: 'closing_soon', label: 'Closing Soon' },
  { id: 'concluded', label: 'Concluded' },
];

const SORT_OPTIONS = [
  { id: 'closing_soon', label: 'Closing Soon' },
  { id: 'prize_high', label: 'Highest Prize' },
  { id: 'fee_low', label: 'Lowest Fee' },
  { id: 'spots_left', label: 'Most Booked' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'closing_soon' | 'prize_high' | 'fee_low' | 'spots_left'>('closing_soon');
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const queryParams = useMemo(() => {
    return {
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: search.trim() || undefined,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      sortBy: selectedSort,
      limit: 25,
    };
  }, [selectedCategory, search, selectedStatus, selectedSort]);

  const { data, isLoading, error, refetch, isRefetching } = useCompetitions(queryParams as any);
  const { data: statsData } = useOverviewStats();

  const competitions = data?.data || [];
  const reels = statsData?.recentWinners || [];

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setSelectedSort('closing_soon');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.screenTitle}>Explore Battles</Text>
      <Text style={styles.screenSubtitle}>Search and discover premier classical competitions</Text>

      {/* 1. Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, dance/music style, or guru..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Category Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Secondary Status & Sort Filter Row */}
      <View style={styles.subFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusPillsScroll}>
          {STATUS_FILTERS.map((st) => {
            const isSelected = selectedStatus === st.id;
            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.statusPill, isSelected && styles.statusPillActive]}
                onPress={() => setSelectedStatus(st.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusPillText, isSelected && styles.statusPillTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Performance Reels Showcase */}
      {reels.length > 0 && (
        <View style={styles.reelsSection}>
          <View style={styles.reelsHeader}>
            <Text style={styles.reelsTitle}>✨ Spotlight Performances</Text>
            <Text style={styles.reelsSubtitle}>Watch previous winning entries</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reelsScroll}>
            {reels.map((reel: any) => (
              <TouchableOpacity
                key={reel.id}
                style={styles.reelCard}
                activeOpacity={0.85}
                onPress={() =>
                  setActiveVideo({
                    url: reel.videoUrl,
                    title: `${reel.name} – Winning Performance`,
                  })
                }
              >
                <Image source={{ uri: reel.photoUrl }} style={styles.reelImage} />
                <View style={styles.reelPlayIcon}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.reelInfo}>
                  <Text style={styles.reelName} numberOfLines={1}>{reel.name}</Text>
                  <Text style={styles.reelTag}>Rank #{reel.position}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Header Count */}
      <View style={styles.resultsCountRow}>
        <Text style={styles.resultsCountText}>
          {competitions.length} {competitions.length === 1 ? 'Battle Found' : 'Battles Found'}
        </Text>

        {/* Sort selector pill */}
        <View style={styles.sortSelector}>
          <Text style={styles.sortLabel}>Sort: </Text>
          <TouchableOpacity
            onPress={() => {
              const order: Array<'closing_soon' | 'prize_high' | 'fee_low' | 'spots_left'> = [
                'closing_soon',
                'prize_high',
                'fee_low',
                'spots_left',
              ];
              const nextIndex = (order.indexOf(selectedSort) + 1) % order.length;
              setSelectedSort(order[nextIndex]);
            }}
          >
            <Text style={styles.sortValue}>
              {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label} ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCompetitionCard = ({ item }: { item: any }) => {
    const isFull = item.spotsLeft <= 0;
    const isLimited = item.spotsLeft > 0 && item.spotsLeft <= 5;
    const progress = item.totalSpots > 0 ? Math.min(1, item.bookedSpots / item.totalSpots) : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/(app)/competitions/${item.slug || item.id}`)}
      >
        <View style={styles.cardCoverContainer}>
          <Image
            source={{ uri: item.coverImageUrl || 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&q=80' }}
            style={styles.cardCover}
          />
          <View style={styles.cardBadges}>
            <View style={styles.badgeCategory}>
              <Text style={styles.badgeCategoryText}>{item.category}</Text>
            </View>
            {item.isMultiWin && (
              <View style={styles.badgeMultiWin}>
                <Ionicons name="trophy" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.badgeMultiWinText}>Multi-Win</Text>
              </View>
            )}
          </View>

          {/* Status Overlay */}
          <View style={styles.statusBadgeOverlay}>
            {isFull ? (
              <View style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.statusChipText, { color: '#DC2626' }]}>Full Capacity</Text>
              </View>
            ) : isLimited ? (
              <View style={[styles.statusChip, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.statusChipText, { color: '#D97706' }]}>Only {item.spotsLeft} Left!</Text>
              </View>
            ) : (
              <View style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.statusChipText, { color: '#16A34A' }]}>Registration Open</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {item.judge && (
            <View style={styles.judgeSnippet}>
              <Image
                source={{ uri: item.judge.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' }}
                style={styles.judgeSnippetImg}
              />
              <Text style={styles.judgeSnippetText} numberOfLines={1}>
                Judge: <Text style={{ fontWeight: '700' }}>{item.judge.name}</Text> • {item.judge.title}
              </Text>
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.bookedText}>
                {item.bookedSpots}/{item.totalSpots} booked
              </Text>
              <Text style={[styles.spotsLeftText, isLimited && { color: '#D97706', fontWeight: '800' }]}>
                {isFull ? 'No spots left' : `${item.spotsLeft} spots remaining`}
              </Text>
            </View>
          </View>

          {/* Footer: Prize Pool & Entry Fee */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>Prize Pool</Text>
              <Text style={styles.footerPrize}>{formatCurrency(item.prizePool)}</Text>
            </View>

            <View style={styles.footerRight}>
              <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                <Text style={styles.footerLabel}>Entry Fee</Text>
                <Text style={styles.footerFee}>{formatCurrency(item.entryFee)}</Text>
              </View>
              <View style={styles.arrowCircle}>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return <CompetitionDetailsSkeleton />;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="search-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No battles found</Text>
        <Text style={styles.emptyDesc}>
          We couldn't find any competitions matching your current filters.
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
          <Text style={styles.resetButtonText}>Reset All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={competitions}
        keyExtractor={(item) => item.id}
        renderItem={renderCompetitionCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      />

      {/* Video Playback Modal */}
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
  listContent: {
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D4E2DE',
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  filterPillsScroll: {
    gap: spacing.xs + 2,
    paddingBottom: spacing.xs,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#D4E2DE',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subFilterRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  statusPillsScroll: {
    gap: 6,
  },
  statusPill: {
    backgroundColor: '#EEF4F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusPillActive: {
    backgroundColor: '#D1EAE4',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  reelsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2EBE8',
    marginBottom: spacing.md,
  },
  reelsHeader: {
    marginBottom: spacing.sm,
  },
  reelsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reelsSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  reelsScroll: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  reelCard: {
    width: 90,
    height: 120,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  reelImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  reelPlayIcon: {
    position: 'absolute',
    top: '40%',
    left: '35%',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelInfo: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
  },
  reelName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reelTag: {
    fontSize: 9,
    color: '#FCD34D',
    fontWeight: '700',
  },
  resultsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sortSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sortValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EBE8',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardCoverContainer: {
    height: 140,
    position: 'relative',
  },
  cardCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBadges: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: 6,
  },
  badgeCategory: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeCategoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeMultiWin: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeMultiWinText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadgeOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  judgeSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  judgeSnippetImg: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    marginRight: 6,
  },
  judgeSnippetText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBarTrack: {
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
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookedText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  spotsLeftText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF3F1',
    paddingTop: spacing.sm,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  footerPrize: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerFee: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
