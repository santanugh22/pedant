import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../../src/constants/theme';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create / Submit</Text>
        <Text style={styles.subtitle}>Upload your competition submission</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(app)/(tabs)/competitions')}
          activeOpacity={0.8}
        >
          <Text style={styles.cardTitle}>Participate in a Competition</Text>
          <Text style={styles.cardDesc}>
            Select an active competition to register and upload your recorded performance.
          </Text>
        </TouchableOpacity>
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
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
