import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useWinners } from '../../hooks/useCompetition';
import { VideoModal } from '../common/VideoModal';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface PreviousWinnersCarouselProps {
  competitionId: string;
}

export const PreviousWinnersCarousel: React.FC<PreviousWinnersCarouselProps> = ({
  competitionId,
}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useWinners(competitionId);
  const [selectedVideo, setSelectedVideo] = useState<{ url?: string; title?: string } | null>(null);

  const winners = data?.winners || [];

  if (isLoading || winners.length === 0) {
    return null; // Graceful empty state per Section 10.4
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('previousWinners')}</Text>

      <FlatList
        data={winners}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              setSelectedVideo({
                url: item.videoUrl,
                title: `${item.name} (${item.edition || ''})`,
              })
            }
          >
            {/* Thumbnail with Play Icon Overlay */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} />
              <View style={styles.playOverlay}>
                <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 1 }} />
              </View>
            </View>

            {/* Winner Details */}
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.position}>
                {item.position === 1
                  ? '1st Winner'
                  : item.position === 2
                  ? '2nd Winner'
                  : item.position === 3
                  ? '3rd Winner'
                  : `${item.position}th Winner`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <VideoModal
        visible={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url}
        title={selectedVideo?.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h2,
    fontSize: 15,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  listContent: {
    paddingRight: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: 175,
  },
  imageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5EBF0',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  position: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
