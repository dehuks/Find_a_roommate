import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 1. User type (matches Django response)
 */
interface User {
  user_id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  token: string;
  image?: string;
  is_verified: boolean;
}

/**
 * 2. Auth Store State
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

/**
 * 3. Auth Store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      /**
       * LOGIN
       */
      login: (userData) => {
        console.log('Saving user to storage:', userData.email);
        set({ user: userData, isAuthenticated: true });
      },

      /**
       * LOGOUT
       */
      logout: () => {
        console.log('Logging out...');
        set({ user: null, isAuthenticated: false });
      },

      /**
       * 🔄 FETCH USER (Used for pull-to-refresh)
       */
      fetchUser: async () => {
        const currentUser = get().user;

        if (!currentUser?.token) {
          console.warn('No token found. Skipping fetchUser.');
          return;
        }

        try {
          const response = await fetch(
            'https://your-api.com/api/auth/me/', // 👈 CHANGE THIS
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }

          const updatedUser = await response.json();

          // Preserve token if backend does not resend it
          set({
            user: {
              ...updatedUser,
              token: currentUser.token,
            },
          });

          console.log('User refreshed successfully');
        } catch (error) {
          console.error('fetchUser error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
