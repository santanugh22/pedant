import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import '../src/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10000,
    },
  },
});

export default function RootLayout() {
  const loadAuth = useAuthStore((s) => s.loadAuthFromStorage);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
