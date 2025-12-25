import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI, chatAPI } from '../../services/api'; // 👈 Import chatAPI

export default function UserDetailScreen() {
  const { id, score } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false); // 👈 Loading state for starting chat

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await dataAPI.getUser(id);
        setUser(data);
      } catch (error) {
        Alert.alert("Error", "Could not load profile");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) loadUser();
  }, [id]);

  const handleCall = () => {
    if (user?.phone_number) Linking.openURL(`tel:${user.phone_number}`);
  };

  const handleWhatsApp = () => {
    if (user?.phone_number) {
        const phone = user.phone_number.replace('+', '');
        Linking.openURL(`https://wa.me/${phone}`);
    }
  };

  // 👇 NEW: Handle Start Chat
  const handleMessage = async () => {
    if (!user) return;
    setChatLoading(true);
    try {
        // 1. Call API to start/get conversation
        const chat = await chatAPI.startChat(user.user_id);
        
        // 2. Redirect to the Chat Room
        router.push({
            pathname: '/chat/[id]',
            params: { id: chat.conversation_id, name: user.full_name }
        });
    } catch (error) {
        Alert.alert("Error", "Could not start conversation");
    } finally {
        setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10 p-4 pt-12 flex-row justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-sm backdrop-blur-md">
            <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* 👇 NEW: Chat Button in Top Right */}
        <TouchableOpacity onPress={handleMessage} className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center shadow-sm">
             {chatLoading ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="chatbubble-ellipses" size={20} color="white" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Image & Info */}
        <View className="items-center mt-20 px-6">
            <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800' }} 
                className="w-32 h-32 rounded-full border-4 border-slate-100 mb-4"
            />
            <Text className="text-3xl font-bold text-slate-900 text-center">{user.full_name}</Text>
            <Text className="text-slate-500 text-base mb-4">{user.role || 'Roommate Seeker'} • {user.preferences?.city || 'Nairobi'}</Text>

            {score && (
                <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center mb-6">
                    <Ionicons name="sparkles" size={16} color="#15803d" />
                    <Text className="text-green-700 font-bold ml-2">{Math.round(Number(score))}% Match</Text>
                </View>
            )}
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-center gap-4 px-6 mb-8">
            <TouchableOpacity onPress={handleCall} className="w-14 h-14 bg-slate-100 rounded-full items-center justify-center">
                <Ionicons name="call" size={24} color="black" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleWhatsApp} className="w-14 h-14 bg-green-500 rounded-full items-center justify-center shadow-lg shadow-green-200">
                <Ionicons name="logo-whatsapp" size={24} color="white" />
            </TouchableOpacity>
            
            {/* 👇 UPDATED: Wired up the Chat Button */}
            <TouchableOpacity 
                onPress={handleMessage} 
                disabled={chatLoading}
                className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-200"
            >
                {chatLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Ionicons name="chatbubble-ellipses" size={24} color="white" />
                )}
            </TouchableOpacity>
        </View>

        <View className="h-[1px] bg-slate-100 mx-6 mb-8" />

        {/* Preferences Grid */}
        <View className="px-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">Lifestyle & Preferences</Text>
            <View className="flex-row flex-wrap gap-3">
                <DetailTag icon="bed" label={user.preferences?.sleep_schedule || 'Flexible Schedule'} />
                <DetailTag icon="water" label={`${user.preferences?.cleanliness_level || 'Medium'} Clean`} />
                <DetailTag icon="logo-usd" label={`Budget: ${user.preferences?.budget_max || 'N/A'}`} />
                <DetailTag 
                    icon={user.preferences?.smoking ? "skull" : "leaf"} 
                    label={user.preferences?.smoking ? "Smoker" : "Non-Smoker"} 
                    color={user.preferences?.smoking ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}
                />
                <DetailTag icon="paw" label={user.preferences?.pets ? "Has Pets" : "No Pets"} />
                <DetailTag icon="people" label={user.preferences?.guests_allowed ? "Guests OK" : "No Guests"} />
            </View>
        </View>

        {/* Interests */}
        {user.preferences?.other_interests && (
            <View className="px-6 mt-8">
                <Text className="text-lg font-bold text-slate-900 mb-3">Interests</Text>
                <View className="flex-row flex-wrap gap-2">
                    {user.preferences.other_interests.split(',').map((tag: string, i: number) => (
                        <View key={i} className="bg-slate-100 px-4 py-2 rounded-xl">
                            <Text className="text-slate-600 font-semibold">{tag.trim()}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )}
      </ScrollView>
    </View>
  );
}

const DetailTag = ({ icon, label, color }: any) => (
    <View className={`flex-row items-center px-4 py-3 rounded-2xl ${color || 'bg-slate-50'}`}>
        <Ionicons name={icon} size={18} color="#475569" />
        <Text className="ml-2 text-slate-700 font-semibold">{label}</Text>
    </View>
);