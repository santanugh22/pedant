import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="competitions/[id]/index" />
      <Stack.Screen name="competitions/[id]/testimonials" />
      <Stack.Screen name="competitions/[id]/submit" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
