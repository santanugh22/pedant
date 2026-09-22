import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface DisclaimerBannerProps {
  disclaimer?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  disclaimer = 'Disclaimer: Only contributions from paid participants will be considered for judging.',
}) => {
  return (
    <View style={styles.banner}>
      <Feather name="info" size={16} color={colors.primary} style={styles.icon} />
      <Text style={styles.text}>{disclaimer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#D4EBE7',
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  text: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 17,
    color: '#1F2937',
    flex: 1,
    fontWeight: '500',
  },
});
