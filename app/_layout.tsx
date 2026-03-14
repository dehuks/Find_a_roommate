// Removed top level import of expo-device to prevent crash
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Toast from 'react-native-toast-message';
import '../global.css';
import { dataAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // We use 'appIsReady' instead of 'isMounted'
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("🚀 Starting app preparation...");

        // 1. Safe Push Notification Registration
        await registerForPushNotificationsAsync();

      } catch (e) {
        console.warn("⚠️ Error during preparation:", e);
      } finally {
        // 2. Always tell the app we are ready
        console.log("✅ App is ready!");
        setAppIsReady(true);
      }
    }

    // 3. Safety Timeout: Force app to load if it hangs for >4 seconds
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

    // Once app is ready, hide splash screen
    SplashScreen.hideAsync().catch(() => {});

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, appIsReady]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        {/* 1. Main Tabs & Auth (Header HIDDEN) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* 2. Detail Screens (Header VISIBLE) */}
        <Stack.Screen
          name="listings/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{ headerShown: true, title: 'Profile', headerBackTitle: 'Back', headerTintColor: '#0f172a' }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: true, title: 'Chat', headerBackTitle: 'Inbox', headerTintColor: '#0f172a' }}
        />

        {/* 3. Forms (Modal Style) */}
        <Stack.Screen
          name="listings/add"
          options={{ headerShown: true, title: 'Post a Room', presentation: 'modal', headerBackTitle: 'Cancel' }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ headerShown: true, title: 'Edit Profile', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="profile/help"
          options={{ headerShown: true, title: 'Help Center', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="profile/verify"
          options={{ headerShown: true, title: 'Get Verified', headerBackTitle: 'Profile' }}
        />
        <Stack.Screen
          name="profile/listings"
          options={{ headerShown: true, title: 'My Listings', headerBackTitle: 'Profile' }}
        />
      </Stack>
      <Toast />

      {/* Loading overlay — keeps Stack always mounted so navigation context is never lost */}
      {!appIsReady && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
          zIndex: 9999
        }}>
          <ActivityIndicator size="large" color="#258cf4" />
        </View>
      )}
    </View>
  );
}

// --- Helper: Push Notifications (Web/Simulator Safe) ---
async function registerForPushNotificationsAsync() {
  try {
    // Guard: Don't run push registration on Web
    if (Platform.OS === 'web') {
      console.log("💻 Web detected. Skipping Push Registration.");
      return;
    }


    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Push notification permissions not granted');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    console.log('📲 Expo Push Token:', token);

    if (token) {
      await dataAPI.updatePushToken(token);
    }
  } catch (error) {
    console.log('⚠️ Error registering for push notifications:', error);
  }
}