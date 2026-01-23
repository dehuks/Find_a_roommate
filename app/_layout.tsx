import { useEffect, useState, useCallback } from 'react';
import { View, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { dataAPI } from '../services/api';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("🚀 Starting app preparation...");

        // 1. Skip Push Notifications on Simulator to prevent hanging
        if (Device.isDevice) {
            console.log("📱 Physical Device detected. Registering for Push...");
            await registerForPushNotificationsAsync();
        } else {
            console.log("💻 Simulator detected. Skipping Push Registration.");
        }

        // 2. Artificial delay (optional, remove if not needed)
        // await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (e) {
        console.warn("⚠️ Error during preparation:", e);
      } finally {
        // 3. Always tell the app we are ready
        console.log("✅ App is ready!");
        setAppIsReady(true);
      }
    }

    // 4. Safety Timeout: Force app to load if it hangs for >4 seconds
    const timeout = setTimeout(() => {
        console.log("⏰ Safety timeout triggered. Forcing app load.");
        setAppIsReady(true);
    }, 4000);

    prepare();

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!appIsReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, isMounted]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("📲 Expo Push Token:", token);

    // Send to Backend
    await dataAPI.updatePushToken(token);
  }

  if (!isMounted) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#258cf4" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="dark" />
      <Stack>
        {/* 1. Main Tabs & Auth (Keep Header HIDDEN) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* 2. Detail Screens (Show Header + Back Button) */}
        <Stack.Screen 
          name="listings/[id]" 
          options={{ 
            headerShown: true, 
            title: 'Room Details',
            headerBackTitle: 'Back', // iOS back text
            headerTintColor: '#0f172a' // Dark slate color
          }} 
        />
        <Stack.Screen 
          name="user/[id]" 
          options={{ 
            headerShown: true, 
            title: 'Profile',
            headerBackTitle: 'Back',
            headerTintColor: '#0f172a'
          }} 
        />
        <Stack.Screen 
          name="chat/[id]" 
          options={{ 
            headerShown: true, 
            title: 'Chat',
            headerBackTitle: 'Inbox',
            headerTintColor: '#0f172a'
          }} 
        />

        {/* 3. Forms (Show Header or use Modal style) */}
        <Stack.Screen 
          name="listings/add" 
          options={{ 
            headerShown: true, 
            title: 'Post a Room',
            presentation: 'modal', // Makes it slide up like a card on iOS
            headerBackTitle: 'Cancel'
          }} 
        />
        <Stack.Screen 
          name="profile/edit" 
          options={{ 
            headerShown: true, 
            title: 'Edit Profile',
            headerBackTitle: 'Back'
          }} 
        />
      </Stack>
      <Toast />
    </View>
  );
}