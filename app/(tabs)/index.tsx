import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, RefreshControl, Dimensions, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { dataAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Data State
  const [listings, setListings] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await dataAPI.getListings();
      setListings(data);
      // Simulate "Featured" by taking the first 3 items
      setFeatured(data.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // 👇 FILTERING LOGIC
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // 1. Search Filter (Title or Location)
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category Filter (Matches Room Type)
      const matchesCategory = selectedCategory 
        ? item.type.toLowerCase() === selectedCategory.toLowerCase() 
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  // Toggle Category
  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if already active
    } else {
      setSelectedCategory(category);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb"/>}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled" // Allows tapping list items while keyboard is open
      >
        
        {/* --- 1. HEADER & SEARCH --- */}
        <View className="bg-white px-6 pt-4 pb-6 rounded-b-[30px] shadow-sm shadow-slate-200 z-10">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{getGreeting()}</Text>
              <Text className="text-2xl font-bold text-slate-900">
                {user?.full_name?.split(' ')[0] || 'Guest'} 👋
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/profile/edit')}
              className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200"
            >
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }} 
                className="w-full h-full rounded-full"
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar (Now Functional) */}
          <View className="flex-row items-center bg-slate-50 rounded-2xl h-14 px-4 border border-slate-200">
            <Ionicons name="search" size={22} color="#94a3b8" />
            <TextInput 
              className="flex-1 px-3 text-base text-slate-900 font-medium" 
              placeholder="Search city, area, or price..." 
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery} // Updates state on typing
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#cbd5e1" />
                </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- 2. CATEGORIES (Visual & Functional) --- */}
        <View className="mt-6 pl-6">
            <Text className="font-bold text-slate-900 text-lg mb-4">Explore</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pr-6">
                <CategoryItem 
                    icon="business" 
                    label="Apartment" 
                    active={selectedCategory === 'apartment'}
                    onPress={() => handleCategoryPress('apartment')}
                />
                <CategoryItem 
                    icon="bed" 
                    label="Bedsitter" 
                    active={selectedCategory === 'bedsitter'}
                    onPress={() => handleCategoryPress('bedsitter')}
                />
                <CategoryItem 
                    icon="people" 
                    label="Hostel" 
                    active={selectedCategory === 'hostel'}
                    onPress={() => handleCategoryPress('hostel')}
                />
                <CategoryItem 
                    icon="home" 
                    label="Shared" 
                    active={selectedCategory === 'shared'}
                    onPress={() => handleCategoryPress('shared')}
                />
                <View className="w-6" /> 
            </ScrollView>
        </View>

        {/* --- 3. VERIFICATION BANNER --- */}
        {!user?.is_verified && !searchQuery && !selectedCategory && (
            <TouchableOpacity 
                onPress={() => router.push('/profile/verify')}
                className="mx-6 mt-8 bg-blue-600 rounded-3xl p-5 shadow-lg shadow-blue-200 flex-row items-center justify-between overflow-hidden"
            >
                <View className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/50 rounded-full" />
                <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Get Verified ✅</Text>
                    <Text className="text-blue-100 text-xs mt-1 leading-4">
                        Verified users get 3x more matches. Upload your ID today.
                    </Text>
                </View>
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm ml-4">
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
            </TouchableOpacity>
        )}

        {/* --- 4. FEATURED CAROUSEL (Hide when searching) --- */}
        {!searchQuery && !selectedCategory && (
            <View className="mt-8">
                <View className="flex-row justify-between items-end px-6 mb-4">
                    <Text className="font-bold text-slate-900 text-xl">Featured Rooms</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/listings')}>
                        <Text className="text-blue-600 font-bold text-xs">See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                    snapToInterval={width * 0.75 + 16}
                    decelerationRate="fast"
                >
                    {featured.map((item) => (
                        <TouchableOpacity 
                            key={item.id}
                            activeOpacity={0.9}
                            onPress={() => router.push(`/listings/${item.id}`)}
                            style={{ width: width * 0.75 }}
                            className="mr-4 h-64 relative rounded-[24px] overflow-hidden bg-slate-900 shadow-md"
                        >
                            <Image source={{ uri: item.image }} className="absolute w-full h-full opacity-80" resizeMode="cover" />
                            <View className="absolute bottom-0 left-0 right-0 h-32 bg-black/40" /> 
                            <View className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                <Text className="text-white text-xs font-bold">⭐ 4.9</Text>
                            </View>
                            <View className="absolute bottom-4 left-4 right-4">
                                <Text className="text-white font-bold text-lg mb-1 shadow-sm" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-slate-200 text-xs mb-2">📍 {item.location}</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-white font-bold text-xl">KES {item.price}</Text>
                                    <Text className="text-slate-300 text-xs ml-1">/mo</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}

        {/* --- 5. SEARCH RESULTS / RECENT LISTINGS --- */}
        <View className="px-6 mt-8">
            <Text className="font-bold text-slate-900 text-xl mb-4">
                {searchQuery || selectedCategory ? `Results (${filteredListings.length})` : "New Arrivals"}
            </Text>
            
            {filteredListings.length === 0 ? (
                <View className="items-center py-10">
                    <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                    <Text className="text-slate-400 mt-2">No rooms found matching your search.</Text>
                </View>
            ) : (
                filteredListings.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        onPress={() => router.push(`/listings/${item.id}`)}
                        className="flex-row bg-white p-3 rounded-2xl mb-4 shadow-sm border border-slate-100"
                    >
                        <Image source={{ uri: item.image }} className="w-24 h-24 rounded-xl bg-slate-200" />
                        <View className="flex-1 ml-3 justify-between py-1">
                            <View>
                                <View className="flex-row justify-between">
                                    <Text className="text-xs text-blue-600 font-bold uppercase">{item.type}</Text>
                                    <Text className="text-slate-400 text-xs">2h ago</Text>
                                </View>
                                <Text className="font-bold text-slate-900 text-base mt-1" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-slate-500 text-xs mt-1">📍 {item.location}</Text>
                            </View>
                            <View className="flex-row justify-between items-center mt-2">
                                <Text className="font-bold text-slate-900 text-base">
                                    KES {item.price}<Text className="text-xs text-slate-400 font-normal">/mo</Text>
                                </Text>
                                <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
                                    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Updated Helper Component for Categories
const CategoryItem = ({ icon, label, active, onPress }: any) => (
    <TouchableOpacity 
        onPress={onPress}
        className={`mr-4 items-center ${active ? 'opacity-100' : 'opacity-60'}`}
    >
        <View className={`w-16 h-16 rounded-full items-center justify-center mb-2 ${
            active ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-white border border-slate-200'
        }`}>
            <Ionicons name={icon} size={24} color={active ? 'white' : '#64748b'} />
        </View>
        <Text className={`text-xs font-bold ${active ? 'text-blue-600' : 'text-slate-500'}`}>{label}</Text>
    </TouchableOpacity>
);