import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import* as React from 'react';
import * as Notifications from 'expo-notifications';
import { dataAPI } from '@/services/api';
import {Platform} from 'react-native';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const inAuthGroup = segments[0] === '(auth)';
    
    if (isAuthenticated && inAuthGroup) {
      // 👇 CHANGE: Redirect to the tabs root (which is now your Home screen)
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
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: '  ' 
          }} 
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}