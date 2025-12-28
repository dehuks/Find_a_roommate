import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { chatAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await chatAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load chats", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Reload when screen comes into focus (so you see new messages after going back)
  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000); // Optional: Auto-refresh inbox every 5s
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  // Helper to format time (e.g., "10:30 AM")
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
const renderItem = ({ item }: { item: any }) => {
    // Safety check: Ensure other participant exists
    if (!item.other_participant) return null;

    return (
      <TouchableOpacity 
        className="flex-row items-center p-4 bg-white border-b border-slate-100"
        onPress={() => router.push({ 
            pathname: '/chat/[id]', 
            params: { 
                id: item.conversation_id, 
                name: item.other_participant.full_name
            } 
        })}
      >
        {/* 1. Avatar */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }} 
          className="w-14 h-14 rounded-full bg-slate-200"
        />

        {/* 2. Message Preview */}
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between mb-1">
            <Text className="font-bold text-slate-900 text-base">
                {item.other_participant.full_name}
            </Text>
            {item.last_message?.sent_at && (
                <Text className={`text-xs ${!item.last_message.is_read ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                    {formatTime(item.last_message.sent_at)}
                </Text>
            )}
          </View>
          
          {/* Show "Start a conversation" when no messages exist */}
          <Text 
            numberOfLines={1} 
            className={`text-sm ${
              item.last_message 
                ? (!item.last_message.is_read ? 'text-slate-800 font-semibold' : 'text-slate-500')
                : 'text-slate-400 italic'
            }`}
          >
            {item.last_message ? item.last_message.text : 'Tap to start chatting'}
          </Text>
        </View>
      </TouchableOpacity>
    );
};

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 py-4 border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-900">Messages</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.conversation_id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 px-10">
                <Text className="text-slate-400 text-center">No messages yet. Go to Matches to find someone to talk to!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}