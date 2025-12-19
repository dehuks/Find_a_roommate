import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI } from '../../services/api';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI.getMatches().then((data) => {
      setMatches(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator color="#258cf4" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-900">Your Matches</Text>
        <Text className="text-slate-500">People who fit your vibe.</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {matches.map((match) => (
          <View key={match.match_id} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-100">
            {/* Top Row: Image & Score */}
            <View className="flex-row gap-4">
              <Image source={{ uri: match.user.image }} className="w-20 h-20 rounded-2xl bg-slate-200" />
              
              <View className="flex-1 justify-center">
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-lg font-bold text-slate-900">{match.user.full_name}, {match.user.age}</Text>
                    <Text className="text-slate-500 text-sm">{match.user.occupation}</Text>
                  </View>
                  {/* Compatibility Badge */}
                  <View className="bg-green-100 px-2 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="sparkles" size={12} color="#16a34a" />
                    <Text className="text-green-700 font-bold text-xs ml-1">{match.compatibility_score}%</Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-2">
                   <Text className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md text-xs">
                      Budget: KES {match.budget}
                   </Text>
                </View>
              </View>
            </View>

            {/* Tags Row */}
            <View className="flex-row flex-wrap gap-2 mt-4">
              {match.tags.map((tag: string, index: number) => (
                <View key={index} className="bg-slate-100 px-3 py-1.5 rounded-full">
                  <Text className="text-slate-600 text-xs font-medium">{tag}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-xl flex-row justify-center items-center shadow-md shadow-blue-200">
                <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Connect</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-12 items-center justify-center border border-slate-200 rounded-xl">
                 <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}