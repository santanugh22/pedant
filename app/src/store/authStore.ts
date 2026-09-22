import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  walletBalance: number;
  profileImageUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  updateAccessToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'feedants_access_token';
const REFRESH_TOKEN_KEY = 'feedants_refresh_token';
const USER_KEY = 'feedants_user';

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await setStorageItem(ACCESS_TOKEN_KEY, accessToken);
    await setStorageItem(REFRESH_TOKEN_KEY, refreshToken);
    await setStorageItem(USER_KEY, JSON.stringify(user));
    set({ user, accessToken, refreshToken, isLoading: false });
  },

  updateAccessToken: async (accessToken) => {
    await setStorageItem(ACCESS_TOKEN_KEY, accessToken);
    set({ accessToken });
  },

  logout: async () => {
    await removeStorageItem(ACCESS_TOKEN_KEY);
    await removeStorageItem(REFRESH_TOKEN_KEY);
    await removeStorageItem(USER_KEY);
    set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
  },

  loadAuthFromStorage: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        getStorageItem(ACCESS_TOKEN_KEY),
        getStorageItem(REFRESH_TOKEN_KEY),
        getStorageItem(USER_KEY),
      ]);

      if (accessToken && userJson) {
        set({
          accessToken,
          refreshToken,
          user: JSON.parse(userJson),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
