import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCompetitions } from '../../../src/hooks/useCompetition';
import { colors, radius, spacing, typography } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/formatters';
import { ErrorState } from '../../../src/components/common/ErrorState';
import { CompetitionDetailsSkeleton } from '../../../src/components/common/Skeleton';

const CATEGORIES = ['All', 'Dance', 'Music'];

export default function CompetitionsListScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoryParam = selectedCategory === 'All' ? undefined : selectedCategory;

  const { data, isLoading, error, refetch, isRefetching } = useCompetitions(categoryParam);

  const competitions = data?.data || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Competitions</Text>
        </View>
        <CompetitionDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Competitions</Text>
        <Text style={styles.headerSubtitle}>Discover & participate in skill battles</Text>

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.activeCategoryPill,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={competitions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          const spotsLeft = item.spotsLeft;
          const isRegistered = item.isRegistered;
          const progressRatio =
            item.totalSpots > 0 ? Math.min(1, item.bookedSpots / item.totalSpots) : 0;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/(app)/competitions/${item.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.tagRow}>
                    {item.tags?.map((t: string, idx: number) => (
                      <View key={idx} style={styles.miniTag}>
                        <Text style={styles.miniTagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {isRegistered && (
                  <View style={styles.registeredBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                    <Text style={styles.registeredText}>Registered</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.statLabel}>Prize Pool</Text>
                  <Text style={styles.prizeValue}>{formatCurrency(item.prizePool)}</Text>
                </View>

                <View>
                  <Text style={styles.statLabel}>Entry Fee</Text>
                  <Text style={styles.feeValue}>{formatCurrency(item.entryFee)}</Text>
                </View>

                <View style={styles.spotsBox}>
                  <Text style={styles.spotsText}>
                    {spotsLeft <= 0 ? 'Full' : `Only ${spotsLeft} left`}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                  </View>
                  <Text style={styles.bookedText}>
                    {item.bookedSpots}/{item.totalSpots} Booked
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBg,
    marginRight: spacing.sm,
  },
  activeCategoryPill: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniTag: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginRight: 6,
    marginTop: 2,
  },
  miniTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginLeft: spacing.sm,
  },
  registeredText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  prizeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  spotsBox: {
    alignItems: 'flex-end',
    width: 100,
  },
  spotsText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 3,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5EBF0',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  bookedText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
