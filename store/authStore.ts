import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Define exactly what a User looks like (matches your Django response)
interface User {
  user_id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  token: string; // Crucial for API calls
  image?: string; // Optional if you handle images
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) => {
        console.log("Saving user to storage:", userData.email);
        set({ user: userData, isAuthenticated: true });
      },

      logout: () => {
        console.log("Logging out...");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // Key name in phone storage
      storage: createJSONStorage(() => AsyncStorage), // Use React Native storage
    }
  )
);