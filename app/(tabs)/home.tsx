import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
// FIX: Import 'dataAPI' instead of 'listingAPI'
import { dataAPI } from '../../services/api';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    // FIX: Use the new dataAPI method
    dataAPI.getListings().then(setListings);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        
        {/* Header */}
        <View className="px-6 pt-2 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-blue-100/50 rounded-full justify-center items-center">
              <Ionicons name="location" size={24} color="#258cf4" />
            </View>
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</Text>
              <Text className="text-base font-bold text-slate-900">Nairobi, KE ▾</Text>
            </View>
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-white justify-center items-center border border-slate-100 shadow-sm">
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View className="px-6 mt-6">
          <Text className="text-3xl font-bold text-slate-900 leading-tight">
            Karibu, <Text className="text-blue-600">{user?.full_name || 'Guest'}</Text>
          </Text>
          <Text className="text-slate-500 mt-1 text-base">Find your perfect space today.</Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center bg-white rounded-2xl h-14 px-4 border border-slate-200 shadow-sm">
            <Ionicons name="search" size={22} color="#94a3b8" />
            <TextInput 
              className="flex-1 px-4 text-base text-slate-900" 
              placeholder="Search (e.g. Roysambu, 1BHK)..." 
              placeholderTextColor="#94a3b8"
            />
            <View className="h-6 w-[1px] bg-slate-200 mx-2" />
            <TouchableOpacity>
              <Ionicons name="options-outline" size={22} color="#258cf4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories / Chips */}
        <View className="mt-6">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            <TouchableOpacity className="bg-blue-600 px-6 py-2.5 rounded-full shadow-md shadow-blue-200">
              <Text className="text-white font-semibold">All</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-slate-200 px-6 py-2.5 rounded-full shadow-sm">
              <Text className="text-slate-600 font-semibold">Students</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-slate-200 px-6 py-2.5 rounded-full shadow-sm">
              <Text className="text-slate-600 font-semibold">Westlands</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-slate-200 px-6 py-2.5 rounded-full shadow-sm">
              <Text className="text-slate-600 font-semibold">Juja</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recommended Section */}
        <View className="px-6 mt-8 flex-row justify-between items-end">
          <Text className="text-xl font-bold text-slate-900">Recommended</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Listings List */}
        <View className="px-6 mt-4 gap-4">
          {listings.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              className="bg-white p-3 rounded-3xl flex-row shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <Image 
                source={{ uri: item.image }} 
                className="w-28 h-28 rounded-2xl bg-slate-200"
              />
              <View className="flex-1 ml-4 justify-between py-1">
                <View>
                  <View className="flex-row justify-between items-start">
                    <Text className="font-bold text-lg text-slate-900 leading-tight flex-1 mr-2">{item.title}</Text>
                    <TouchableOpacity>
                      <Ionicons name="heart-outline" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="location-sharp" size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-500 ml-1 font-medium">{item.location}</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-end mt-2">
                   <View>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rent</Text>
                      <Text className="text-blue-600 font-extrabold text-xl">
                        {item.price}<Text className="text-xs text-slate-400 font-normal">/mo</Text>
                      </Text>
                   </View>
                   <View className="bg-blue-50 px-2.5 py-1 rounded-lg">
                      {/* FIX: Use item.type if available, or default to Apartment */}
                      <Text className="text-blue-600 text-[10px] font-bold uppercase">{item.type || 'Apartment'}</Text>
                   </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}