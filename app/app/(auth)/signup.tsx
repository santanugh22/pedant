import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing, typography } from '../../src/constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await api.signup({
        name,
        email,
        password,
        referralCode: referralCode.trim() || undefined,
      });
      await setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/(app)/(tabs)/competitions');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.brandTitle}>Create Account</Text>
          <Text style={styles.brandSubtitle}>Join Feedants talent competitions</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Aanya Sharma"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Referral Code (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SIDD123"
            placeholderTextColor={colors.textSecondary}
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signupBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginFooter}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexGrow: 1,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 28,
    color: colors.primary,
    marginBottom: 4,
  },
  brandSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginLeft: spacing.sm,
    flex: 1,
  },
  form: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  signupBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
