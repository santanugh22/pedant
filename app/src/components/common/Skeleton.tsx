import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

export const CompetitionDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.cardSkeleton}>
        <Skeleton width="60%" height={24} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Skeleton width={80} height={26} borderRadius={radius.pill} style={{ marginRight: 8 }} />
          <Skeleton width={80} height={26} borderRadius={radius.pill} />
        </View>
        <Skeleton width="100%" height={40} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={12} borderRadius={radius.pill} />
      </View>

      <View style={styles.cardSkeleton}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={56} height={56} borderRadius={radius.pill} style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="40%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={14} />
          </View>
        </View>
      </View>

      <Skeleton width="100%" height={44} borderRadius={radius.md} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={120} borderRadius={radius.lg} style={{ marginBottom: 16 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5EBF0',
    opacity: 0.8,
  },
  skeletonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    flex: 1,
  },
  cardSkeleton: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
});
