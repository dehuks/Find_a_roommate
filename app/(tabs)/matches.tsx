import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { dataAPI } from '../../services/api';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Matches from Backend
  const fetchMatches = async () => {
    try {
      const data = await dataAPI.getMatches();
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, []);

  // Helper: Color code the match score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const renderMatchItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-100 flex-row"
      onPress={() => router.push({ pathname: '/user/[id]', params: { id: item.user.user_id } })}
    >
      {/* 1. Avatar Image */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' }} 
        className="w-20 h-20 rounded-2xl bg-slate-200"
      />

      {/* 2. Content Column */}
      <View className="flex-1 ml-4 justify-between">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-lg font-bold text-slate-900">{item.user.full_name}</Text>
            <Text className="text-slate-500 text-xs">{item.user.gender || 'N/A'} • {item.user.preferences?.city || 'Nairobi'}</Text>
          </View>
          
          {/* 3. Compatibility Score Badge */}
          <View className={`px-2 py-1 rounded-lg ${getScoreColor(item.compatibility_score).split(' ')[0]}`}>
            <Text className={`font-bold text-xs ${getScoreColor(item.compatibility_score).split(' ')[1]}`}>
              {Math.round(item.compatibility_score)}% Match
            </Text>
          </View>
        </View>

        {/* 4. Quick Stats / Tags */}
        <View className="flex-row mt-2 flex-wrap gap-2">
            <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={14} color="#64748b" />
                <Text className="text-slate-500 text-xs ml-1">
                    {item.user.preferences?.budget_max ? `Max ${item.user.preferences.budget_max}` : 'No Budget'}
                </Text>
            </View>
            <View className="flex-row items-center ml-3">
                <Ionicons name="bed-outline" size={14} color="#64748b" />
                <Text className="text-slate-500 text-xs ml-1">
                    {item.user.preferences?.cleanliness_level || 'Unknown'} Clean
                </Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-6 pt-2 pb-4">
        <Text className="text-2xl font-bold text-slate-900">Your Matches</Text>
        <Text className="text-slate-500">Based on your preferences</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.match_id}
          renderItem={renderMatchItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="people-outline" size={60} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 text-center">No matches found yet.</Text>
              <Text className="text-slate-400 text-xs text-center px-10">
                Try updating your preferences or location to see more people.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}