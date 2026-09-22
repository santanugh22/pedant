import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, radius, typography } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';

export default function TabLayout() {
  const user = useAuthStore((s) => s.user);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5EBF0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.centerFab}>
              <Feather name="plus" size={24} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="competitions"
        options={{
          title: 'Competitions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) =>
            user?.profileImageUrl ? (
              <Image
                source={{ uri: user.profileImageUrl }}
                style={styles.avatarIcon}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={size || 24} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide index from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerFab: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
