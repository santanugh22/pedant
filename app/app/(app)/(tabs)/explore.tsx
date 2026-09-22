import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '../../../src/constants/theme';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover trending performances and classical artists</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
