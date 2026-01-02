import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI, chatAPI, SERVER_URL } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const allListings = await dataAPI.getListings();
      // Filter the specific listing by ID
      const found = allListings.find((l: any) => String(l.listing_id) === String(id));
      
      if (!found) {
        Alert.alert("Error", "Room not found");
        router.back();
        return;
      }
      setListing(found);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load room details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to message the host",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (listing.owner === user.user_id) {
      Alert.alert("Oops", "You cannot message yourself!");
      return;
    }

    setContacting(true);
    try {
      const chat = await chatAPI.startChat(listing.owner);
      router.push({
        pathname: '/chat/[id]',
        params: { id: chat.conversation_id, name: listing.owner_name || 'Host' }
      });
    } catch (error) {
      Alert.alert("Error", "Could not contact host.");
    } finally {
      setContacting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this room: ${listing.title} - KES ${listing.rent_amount}/month`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Immediately';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading || !listing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // 👇 SAFE IMAGE HANDLING FOR NGROK
  const images = listing.images && listing.images.length > 0 
    ? listing.images.map((img: any) => {
        const url = img.image_file;
        // If URL is absolute (http...), use it. Otherwise, prepend Ngrok URL.
        return url.startsWith('http') ? url : `${SERVER_URL}${url}`;
      })
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'];

  const ownerName = listing.owner_name || 'Host';
  const ownerInitial = ownerName[0]?.toUpperCase() || 'H';

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Buttons */}
      <View className="absolute top-12 left-0 right-0 z-10 flex-row justify-between px-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-white/95 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleShare}
          className="w-10 h-10 bg-white/95 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="share-outline" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUrl: string, index: number) => (
              <Image 
                key={index}
                source={{ uri: imgUrl }} 
                style={{ width, height: 320 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <View className="absolute bottom-4 right-4 bg-black/70 px-3 py-1.5 rounded-full">
              <Text className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}
        </View>

        <View className="px-5 py-6">
          {/* Title & Price */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <View className="bg-blue-50 px-3 py-1 rounded-full mr-2">
                <Text className="text-blue-600 font-bold text-xs uppercase tracking-wider">
                  {listing.room_type}
                </Text>
              </View>
              {listing.available_from && (
                <View className="bg-green-50 px-3 py-1 rounded-full">
                  <Text className="text-green-600 font-bold text-xs">
                    Available {formatDate(listing.available_from)}
                  </Text>
                </View>
              )}
            </View>
            
            <Text className="text-3xl font-bold text-slate-900 mb-2">{listing.title}</Text>
            
            <View className="flex-row items-center">
              <Ionicons name="location" size={18} color="#64748b" />
              <Text className="text-slate-600 ml-1 text-base">
                {listing.area ? `${listing.area}, ${listing.city}` : listing.city}
              </Text>
            </View>
          </View>

          {/* Price Card */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-slate-600 text-sm mb-1">Monthly Rent</Text>
                <Text className="text-3xl font-bold text-blue-600">
                  {formatPrice(listing.rent_amount)}
                </Text>
              </View>
              {listing.deposit_amount && (
                <View className="items-end">
                  <Text className="text-slate-600 text-sm mb-1">Deposit</Text>
                  <Text className="text-xl font-bold text-slate-900">
                    {formatPrice(listing.deposit_amount)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="h-[1px] bg-slate-100 mb-6" />

          {/* Host Info */}
          <View className="mb-6">
            <Text className="font-bold text-lg text-slate-900 mb-3">Hosted by</Text>
            <View className="flex-row items-center bg-slate-50 rounded-xl p-4">
              <View className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center mr-3">
                <Text className="text-xl font-bold text-white">{ownerInitial}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-lg">{ownerName}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text className="text-slate-500 text-sm ml-1">Verified Host</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
            </View>
          </View>

          <View className="h-[1px] bg-slate-100 mb-6" />

          {/* Description */}
          <View className="mb-6">
            <Text className="font-bold text-lg text-slate-900 mb-3">About this place</Text>
            <Text className="text-slate-600 leading-7 text-base">
              {listing.description || "No description provided."}
            </Text>
          </View>

          {/* Additional Info */}
          {listing.created_at && (
            <View className="bg-slate-50 rounded-xl p-4">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <Text className="text-slate-600 ml-2 text-sm">
                  Listed {formatDate(listing.created_at)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-slate-500 text-xs mb-1">Total Rent</Text>
            <Text className="text-2xl font-bold text-slate-900">
              {formatPrice(listing.rent_amount)}
            </Text>
            <Text className="text-xs text-slate-400">per month</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleContact}
            disabled={contacting}
            className="bg-blue-600 px-6 py-4 rounded-2xl shadow-lg flex-row items-center"
            activeOpacity={0.8}
          >
            {contacting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="chatbubble-ellipses" size={22} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Message Host</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}