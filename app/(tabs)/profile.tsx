import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // 1. Guard Clause: If no user is logged in
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Ionicons name="person-circle-outline" size={80} color="#cbd5e1" />
        <Text className="text-slate-500 mb-6 text-lg mt-4">You are not logged in.</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/login')}
          className="bg-blue-600 px-8 py-3 rounded-full shadow-lg shadow-blue-200"
        >
          <Text className="text-white font-bold text-lg">Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        } 
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- Header Section --- */}
        <View className="bg-white pb-8 pt-4 items-center border-b border-slate-100 rounded-b-[40px] shadow-sm">
          <View className="relative">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }} 
              className="w-28 h-28 rounded-full border-4 border-slate-50"
            />
            <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-slate-900 mt-4">
            {user.full_name || "User"}
          </Text>
          <Text className="text-slate-500">{user.email}</Text>
          
          <View className="flex-row mt-6 gap-4">
            <View className="items-center bg-slate-50 px-6 py-3 rounded-2xl">
              <Text className="text-xl font-bold text-slate-900">0</Text>
              <Text className="text-xs text-slate-500 uppercase tracking-wide">Listings</Text>
            </View>
            <View className="items-center bg-slate-50 px-6 py-3 rounded-2xl">
              <Text className="text-xl font-bold text-slate-900">0</Text>
              <Text className="text-xs text-slate-500 uppercase tracking-wide">Matches</Text>
            </View>
          </View>
        </View>

        {/* --- Menu Options --- */}
        <View className="px-6 mt-8 space-y-4">
          <Text className="font-bold text-slate-900 text-lg mb-2">Account Settings</Text>
          
          {/* 1. EDIT PROFILE (General Tab) */}
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/profile/edit', params: { tab: 'general' } })}
          >
            <MenuOption icon="person-outline" label="Edit Profile" />
          </TouchableOpacity>

          {/* 2. PREFERENCES (Preferences Tab) */}
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/profile/edit', params: { tab: 'preferences' } })}
          >
            <MenuOption icon="options-outline" label="Preferences" />
          </TouchableOpacity>

          {/* 3. PRIVACY (Security Tab) */}
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/profile/edit', params: { tab: 'security' } })}
          >
            <MenuOption icon="shield-checkmark-outline" label="Privacy & Security" />
          </TouchableOpacity>
          
          <Text className="font-bold text-slate-900 text-lg mb-2 mt-4">Support</Text>
          
          {/* 4. HELP CENTER */}
          <TouchableOpacity onPress={() => router.push('/profile/help')}>
            <MenuOption icon="help-circle-outline" label="Help Center" />
          </TouchableOpacity>
          
          {/* LOGOUT BUTTON */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-red-50 p-4 rounded-2xl mt-4"
          >
            <View className="w-10 h-10 bg-red-100 rounded-full justify-center items-center">
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </View>
            <Text className="flex-1 ml-4 font-semibold text-red-600 text-base">Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-slate-400 text-xs mt-10 mb-6">
          Version 1.0.0 • TafutaRoommie
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component
const MenuOption = ({ icon, label }: { icon: any, label: string }) => (
  <View className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    <View className="w-10 h-10 bg-slate-50 rounded-full justify-center items-center">
      <Ionicons name={icon} size={20} color="#334155" />
    </View>
    <Text className="flex-1 ml-4 font-semibold text-slate-700 text-base">{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </View>
);