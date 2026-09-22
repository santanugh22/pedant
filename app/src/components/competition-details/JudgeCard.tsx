import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/Card';
import { VideoModal } from '../common/VideoModal';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface JudgeCardProps {
  judge: {
    name: string;
    title: string;
    experienceYears: number;
    photoUrl: string;
    introVideoUrl?: string;
  };
}

export const JudgeCard: React.FC<JudgeCardProps> = ({ judge }) => {
  const { t } = useTranslation();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <Card padding="md" style={styles.card}>
        <View style={styles.container}>
          {/* Circular Judge Photo */}
          <Image
            source={{ uri: judge.photoUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />

          {/* Judge Info Details */}
          <View style={styles.infoContainer}>
            <Text style={styles.judgeLabel}>{t('judge')}</Text>
            <Text style={styles.name}>{judge.name}</Text>
            <Text style={styles.title}>{judge.title}</Text>
            <Text style={styles.experience}>
              {t('yearsExperience', { years: judge.experienceYears })}
            </Text>
          </View>

          {/* Intro Video Play Button */}
          {judge.introVideoUrl ? (
            <TouchableOpacity
              style={styles.playContainer}
              onPress={() => setVideoOpen(true)}
              activeOpacity={0.7}
            >
              <View style={styles.playCircle}>
                <Ionicons name="play" size={18} color={colors.primary} style={{ marginLeft: 2 }} />
              </View>
              <Text style={styles.introVideoText}>{t('introVideo')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>

      <VideoModal
        visible={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={judge.introVideoUrl}
        title={`${judge.name} – ${t('introVideo')}`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    backgroundColor: '#E5EBF0',
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  judgeLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  introVideoText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
