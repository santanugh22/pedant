import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoModalProps {
  visible: boolean;
  onClose: () => void;
  videoUrl?: string;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  visible,
  onClose,
  videoUrl,
  title = 'Watch Video',
}) => {
  const effectiveUrl =
    videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const player = useVideoPlayer(effectiveUrl, (p) => {
    p.loop = true;
    if (visible) {
      p.play();
    }
  });

  useEffect(() => {
    if (visible && player) {
      player.play();
    } else if (!visible && player) {
      player.pause();
    }
  }, [visible, player]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              startsPictureInPictureAutomatically={false}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.pill,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
