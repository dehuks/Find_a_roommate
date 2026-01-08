// app/profile/listings.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI } from '../../services/api';

export default function MyListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      const data = await dataAPI.getMyListings();
      setListings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to remove this room? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await dataAPI.deleteListing(id);
              // Remove from UI immediately so we don't need to refresh
              setListings(prev => prev.filter(item => item.id !== id));
            } catch (error) {
              Alert.alert("Error", "Could not delete listing.");
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl mb-4 shadow-sm border border-slate-100 overflow-hidden flex-row">
      {/* Thumbnail */}
      <Image 
        source={{ uri: item.image }} 
        className="w-28 h-28 bg-slate-200" 
      />
      
      {/* Content */}
      <View className="flex-1 p-3 justify-between">
        <View>
            <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>
                {item.title}
            </Text>
            <Text className="text-slate-500 text-xs mt-1 capitalize">
                {item.type} • {item.location}
            </Text>
        </View>

        <View className="flex-row justify-between items-end mt-2">
            <Text className="font-bold text-blue-600">KES {item.price}</Text>
            
            {/* Delete Button */}
            <TouchableOpacity 
                onPress={() => handleDelete(item.id)}
                className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex-row items-center"
            >
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
                <Text className="text-red-600 text-xs font-bold ml-1">Remove</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: "My Listings", headerBackTitle: "Profile" }} />
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : listings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="home-outline" size={32} color="#94a3b8" />
            </View>
            <Text className="text-slate-900 font-bold text-lg">No listings yet</Text>
            <Text className="text-slate-500 text-center mt-2 mb-6">
                You haven't posted any rooms. Share your space to find a roommate!
            </Text>
            <TouchableOpacity 
                onPress={() => router.push('/listings/add')}
                className="bg-blue-600 px-6 py-3 rounded-full"
            >
                <Text className="text-white font-bold">Post a Room</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
            data={listings}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}