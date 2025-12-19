import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { dataAPI } from '../../services/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI.getProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  if (loading) return <View className="flex-1 bg-white justify-center items-center"><ActivityIndicator color="#258cf4"/></View>;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Header */}
        <View className="bg-white pb-8 pt-4 items-center border-b border-slate-100">
          <View className="relative">
             <Image source={{ uri: profile.image }} className="w-28 h-28 rounded-full bg-slate-200 border-4 border-slate-50" />
             <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-4 border-white">
                <Ionicons name="camera" size={16} color="white" />
             </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center mt-4">
            <Text className="text-xl font-bold text-slate-900">{profile.full_name}</Text>
            {profile.is_verified && <Ionicons name="checkmark-circle" size={20} color="#258cf4" style={{ marginLeft: 6 }} />}
          </View>
          <Text className="text-slate-500">{profile.email}</Text>

          <TouchableOpacity className="mt-4 bg-slate-900 px-6 py-2 rounded-full">
            <Text className="text-white font-bold text-sm">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Menu */}
        <View className="mt-6 px-4 gap-3">
          <Text className="text-slate-900 font-bold text-lg mb-2 px-2">Settings</Text>

          <MenuOption icon="person-outline" label="Account Information" />
          <MenuOption icon="shield-checkmark-outline" label="Privacy & Security" />
          <MenuOption icon="card-outline" label="Payments & Subscription" />
          <MenuOption icon="notifications-outline" label="Notifications" />

          {/* Logout */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-100 mt-4"
          >
            <View className="w-10 h-10 bg-red-50 rounded-full justify-center items-center">
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text className="flex-1 ml-4 font-bold text-red-500 text-base">Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for Menu Items
const MenuOption = ({ icon, label }: { icon: any, label: string }) => (
  <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-100">
    <View className="w-10 h-10 bg-slate-50 rounded-full justify-center items-center">
      <Ionicons name={icon} size={20} color="#334155" />
    </View>
    <Text className="flex-1 ml-4 font-medium text-slate-700 text-base">{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);