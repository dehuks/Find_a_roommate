import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI } from '../../services/api';

export default function ListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    { label: 'All', value: null },
    { label: 'Private', value: 'private' },
    { label: 'Shared', value: 'shared' },
    { label: 'Bedsitter', value: 'bedsitter' },
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedFilter, listings]);

  const fetchListings = async () => {
    try {
      const data = await dataAPI.getListings();
      setListings(data);
      setFilteredListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Apply room type filter
    if (selectedFilter) {
      filtered = filtered.filter(item => 
        item.room_type?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.city?.toLowerCase().includes(query) ||
        item.area?.toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-6 pt-2 pb-4 border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Find a Room</Text>
            <Text className="text-sm text-slate-500 mt-1">
              {filteredListings.length} {filteredListings.length === 1 ? 'room' : 'rooms'} available
            </Text>
          </View>
        </View>
        <TouchableOpacity
        onPress={() => router.push('/listings/add')}
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg shadow-blue-300 z-50"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
        
        {/* Search Bar */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl h-12 px-4">
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput 
              className="flex-1 ml-2 text-slate-900" 
              placeholder="Search by location or title..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {filters.map((filter) => (
              <TouchableOpacity 
                key={filter.label}
                onPress={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-full border ${
                  selectedFilter === filter.value 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedFilter === filter.value ? 'text-white' : 'text-slate-600'
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Listings */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : filteredListings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="home-outline" size={64} color="#cbd5e1" />
          <Text className="text-lg font-bold text-slate-900 mt-4">No rooms found</Text>
          <Text className="text-slate-500 text-center mt-2">
            {searchQuery || selectedFilter 
              ? 'Try adjusting your filters or search' 
              : 'Check back later for new listings'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredListings.map((item, index) => {
            const imageUrl = item.images?.[0]?.image_file;
            const fullImageUrl = imageUrl?.startsWith('http') 
              ? imageUrl 
              : `http://192.168.100.18:8000${imageUrl || ''}`;

            return (
              <TouchableOpacity 
                key={item.listing_id || index}
                className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm border border-slate-100"
                onPress={() => router.push(`/listings/${item.listing_id}`)}
                activeOpacity={0.7}
              >
                {/* Image */}
                <View className="relative">
                  <Image 
                    source={{ uri: fullImageUrl }} 
                    className="w-full h-48 bg-slate-200" 
                    resizeMode="cover"
                  />
                  {/* Room Type Badge */}
                  <View className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-full">
                    <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {item.room_type}
                    </Text>
                  </View>
                  {/* Available Badge */}
                  {item.available_from && (
                    <View className="absolute top-3 right-3 bg-green-500 px-3 py-1.5 rounded-full">
                      <Text className="text-xs font-bold text-white">Available</Text>
                    </View>
                  )}
                </View>
                
                {/* Content */}
                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                      <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-sharp" size={14} color="#64748b" />
                        <Text className="text-slate-500 text-sm ml-1" numberOfLines={1}>
                          {item.area ? `${item.area}, ${item.city}` : item.city}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-xl font-bold text-blue-600">
                        {formatPrice(item.rent_amount)}
                      </Text>
                      <Text className="text-xs text-slate-400">/month</Text>
                    </View>
                  </View>

                  {/* Host Info */}
                  <View className="flex-row items-center mt-3 pt-3 border-t border-slate-100">
                    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
                      <Text className="text-sm font-bold text-blue-600">
                        {item.owner_name?.[0]?.toUpperCase() || 'H'}
                      </Text>
                    </View>
                    <Text className="text-sm text-slate-600 flex-1" numberOfLines={1}>
                      Hosted by {item.owner_name || 'Host'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}