import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatAPI, dataAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function MatchesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [matches, setMatches] = useState<any[]>([]); // Accepted matches
  const [requests, setRequests] = useState<any[]>([]); // Pending requests
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Data
  const fetchAll = async () => {
    try {
      const allData = await dataAPI.getMatches();
      const currentUserId = user?.user_id;

      // Filter 1: Pending Requests (Safe Check)
      const pending = allData.filter((m: any) =>
        m.match_status === 'pending' &&
        m.matched_user && // 👈 CHECK IF IT EXISTS FIRST
        m.matched_user.user_id === currentUserId
      );

      // Filter 2: Accepted Matches (Safe Check)
      const accepted = allData.filter((m: any) =>
        m.match_status === 'accepted' &&
        m.user &&         // 👈 Check existence
        m.matched_user    // 👈 Check existence
      );

      setRequests(pending);
      setMatches(accepted);
    } catch (error) {
      console.error("Failed to load matches", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, []);

  // --- Actions ---

  const handleAccept = async (matchId: number) => {
    try {
      await dataAPI.acceptMatch(matchId);
      Alert.alert("Success", "You are now connected!");
      fetchAll(); // Refresh the list
    } catch (e) {
      Alert.alert("Error", "Could not accept request.");
    }
  };

  const handleReject = async (matchId: number) => {
    try {
      await dataAPI.rejectMatch(matchId);
      setRequests(prev => prev.filter(m => m.match_id !== matchId));
    } catch (e) {
      Alert.alert("Error", "Could not remove request.");
    }
  };

  const handleChat = async (targetUser: any) => {
    try {
      const chat = await chatAPI.startChat(targetUser.user_id);
      router.push({
        pathname: '/chat/[id]',
        params: { id: chat.conversation_id, name: targetUser.full_name }
      });
    } catch (e) {
      Alert.alert("Error", "Could not open chat.");
    }
  };

  // --- Renderers ---

  const renderRequestItem = (item: any) => (
    <View
      key={item.match_id}
      className="bg-white p-4 rounded-2xl mb-4 border border-blue-100"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
    >
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' }}
          className="w-12 h-12 rounded-full bg-slate-200"
        />
        <View className="ml-3 flex-1">
          <Text className="font-bold text-slate-900 text-base">{item.user.full_name}</Text>
          <Text className="text-slate-500 text-xs">Wants to connect with you</Text>
        </View>
        <View className="bg-blue-50 px-2 py-1 rounded">
          <Text className="text-blue-600 font-bold text-xs">{Math.round(item.compatibility_score)}% Match</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handleReject(item.match_id)}
          className="flex-1 bg-slate-100 py-2 rounded-xl items-center"
        >
          <Text className="font-bold text-slate-600">Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAccept(item.match_id)}
          className="flex-1 bg-blue-600 py-2 rounded-xl items-center"
          style={{ shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 }}
        >
          <Text className="font-bold text-white">Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMatchItem = (item: any) => {
    // 👇 LOGIC FIX: Determine who the "Other Person" is
    const isMeSender = item.user.user_id === user?.user_id;
    const otherPerson = isMeSender ? item.matched_user : item.user;

    return (
      <TouchableOpacity
        key={item.match_id}
        onPress={() => handleChat(otherPerson)}
        className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }}
          className="w-14 h-14 rounded-full bg-slate-200"
        />
        <View className="flex-1 ml-4">
          <Text className="text-lg font-bold text-slate-900">{otherPerson.full_name}</Text>
          <Text className="text-slate-500 text-xs">
            {isMeSender ? "You sent request" : "They sent request"} • {otherPerson.preferences?.city || 'Nairobi'}
          </Text>
        </View>
        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
          <Ionicons name="chatbubble-ellipses" size={20} color="#2563eb" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-6 pt-2 pb-2">
        <Text className="text-2xl font-bold text-slate-900">Connections</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* SECTION 1: REQUESTS */}
        {requests.length > 0 && (
          <View className="mb-8">
            <Text className="font-bold text-slate-500 mb-3 uppercase text-xs tracking-wider">
              New Requests ({requests.length})
            </Text>
            {requests.map(renderRequestItem)}
          </View>
        )}

        {/* SECTION 2: MATCHES */}
        <View>
          <Text className="font-bold text-slate-500 mb-3 uppercase text-xs tracking-wider">
            Your Matches
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : matches.length === 0 ? (
            <View className="items-center justify-center mt-10 opacity-50">
              <Ionicons name="people-outline" size={48} color="black" />
              <Text className="mt-2 text-slate-600">No active connections yet.</Text>
            </View>
          ) : (
            matches.map(renderMatchItem)
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}