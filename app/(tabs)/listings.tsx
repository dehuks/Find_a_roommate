import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI } from '../../services/api';

export default function ListingsScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI.getListings().then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header & Search */}
      <View className="bg-white px-6 pt-2 pb-4 border-b border-slate-100 sticky top-0 z-10">
        <Text className="text-2xl font-bold text-slate-900 mb-4">Find a Room</Text>
        
        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-4">
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput 
              className="flex-1 ml-2 text-slate-900" 
              placeholder="Search by location..." 
            />
          </View>
          <TouchableOpacity className="w-12 h-12 bg-slate-900 rounded-xl justify-center items-center">
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 flex-row gap-2">
           {['Budget', 'Apartment', 'Bedsitter', 'Hostel', 'Furnished'].map((filter) => (
             <TouchableOpacity key={filter} className="border border-slate-200 px-4 py-1.5 rounded-full mr-2">
               <Text className="text-slate-600 text-sm font-medium">{filter}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator className="mt-10" color="#258cf4" />
      ) : (
        <ScrollView className="px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
          {listings.map((item) => (
            <TouchableOpacity key={item.id} className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm border border-slate-100">
              <Image source={{ uri: item.image }} className="w-full h-40 bg-slate-200" />
              
              <View className="p-4">
                <View className="flex-row justify-between items-start">
                   <View>
                      <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.type}</Text>
                      <Text className="text-lg font-bold text-slate-900 mt-1">{item.title}</Text>
                   </View>
                   <Text className="text-xl font-bold text-blue-600">
                     {item.price}<Text className="text-xs text-slate-400 font-normal">/mo</Text>
                   </Text>
                </View>

                <View className="flex-row items-center mt-2">
                  <Ionicons name="location-sharp" size={16} color="#64748b" />
                  <Text className="text-slate-500 ml-1">{item.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}