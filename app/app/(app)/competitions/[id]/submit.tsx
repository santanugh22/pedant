import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../../../src/api';
import { useSubmitEntry } from '../../../../src/hooks/useCompetition';
import { colors, radius, spacing, typography } from '../../../../src/constants/theme';

export default function SubmitEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const submitEntryMutation = useSubmitEntry(id || '');

  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const pickMedia = async (type: 'video' | 'image') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Media library access is needed to upload your submission.');
      return;
    }

    const mediaTypeOption =
      type === 'video'
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.Images;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypeOption,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 300, // 5 mins
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedAsset(result.assets[0]);
    }
  };

  const handleUploadAndSubmit = async () => {
    if (!selectedAsset) {
      Alert.alert('Selection Required', 'Please select a video or photo performance to upload.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Requesting secure upload authorization...');

    try {
      const fileName = selectedAsset.fileName || (selectedAsset.type === 'video' ? 'dance_entry.mp4' : 'dance_entry.jpg');
      const fileType = selectedAsset.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const mediaType = selectedAsset.type === 'video' ? 'video' : 'image';

      // 1. Get presigned / local upload target from backend
      const target = await api.presignSubmission(id as string, { fileName, fileType });
      setUploadStatus('Uploading performance file...');

      let finalFileKey = target.fileKey;

      // 2. Direct upload without proxying large files through standard API handlers
      if (target.provider === 'local') {
        const formData = new FormData();
        if (Platform.OS === 'web') {
          const res = await fetch(selectedAsset.uri);
          const blob = await res.blob();
          formData.append('file', blob, fileName);
        } else {
          formData.append('file', {
            uri: selectedAsset.uri,
            name: fileName,
            type: fileType,
          } as any);
        }
        const uploadRes = await api.uploadLocalFile(id as string, formData);
        finalFileKey = uploadRes.fileKey;
      } else {
        // S3 Direct PUT upload
        const fileBlob = await (await fetch(selectedAsset.uri)).blob();
        await fetch(target.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': fileType },
          body: fileBlob,
        });
      }

      setUploadStatus('Recording submission details...');

      // 3. Register final verified submission with backend
      await submitEntryMutation.mutateAsync({
        fileKey: finalFileKey,
        mediaType,
      });

      Alert.alert(
        'Submission Uploaded! 🌟',
        'Your performance has been submitted successfully and marked eligible for judging.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Upload Error', err.response?.data?.error?.message || 'Failed to upload entry. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Performance</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Select your recorded Indian classical dance performance. Make sure your face and footwork are clearly visible.
        </Text>

        {selectedAsset ? (
          <View style={styles.previewContainer}>
            {selectedAsset.type === 'video' ? (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="videocam" size={48} color={colors.primary} />
                <Text style={styles.previewFileName} numberOfLines={1}>
                  {selectedAsset.fileName || 'Selected Dance Video.mp4'}
                </Text>
                <Text style={styles.previewMeta}>
                  {selectedAsset.duration ? `${Math.round(selectedAsset.duration)}s • ` : ''}
                  Ready for upload
                </Text>
              </View>
            ) : (
              <Image source={{ uri: selectedAsset.uri }} style={styles.imagePreview} resizeMode="cover" />
            )}

            <TouchableOpacity style={styles.changeButton} onPress={() => setSelectedAsset(null)}>
              <Text style={styles.changeText}>Choose Different File</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerSection}>
            <TouchableOpacity
              style={styles.pickerBox}
              onPress={() => pickMedia('video')}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="videocam-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.pickerBoxTitle}>Upload Video Performance</Text>
              <Text style={styles.pickerBoxDesc}>MP4 or MOV • Duration 2-5 mins</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerBox, { marginTop: spacing.md }]}
              onPress={() => pickMedia('image')}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="image-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.pickerBoxTitle}>Upload Photo Entry</Text>
              <Text style={styles.pickerBoxDesc}>High resolution JPEG or PNG</Text>
            </TouchableOpacity>
          </View>
        )}

        {isUploading && (
          <View style={styles.uploadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>{uploadStatus}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, (!selectedAsset || isUploading) && styles.disabledButton]}
          onPress={handleUploadAndSubmit}
          disabled={!selectedAsset || isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm & Upload Entry</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.xl,
    flex: 1,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  pickerSection: {
    marginBottom: spacing.xl,
  },
  pickerBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BAC7D5',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FAFCFD',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerBoxTitle: {
    ...typography.h2,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pickerBoxDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#E5EBF0',
  },
  videoPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE3DD',
  },
  previewFileName: {
    ...typography.h3,
    marginTop: spacing.md,
    color: colors.textPrimary,
  },
  previewMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  changeButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  uploadingText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: spacing.lg,
  },
  disabledButton: {
    backgroundColor: '#9CB3B4',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
