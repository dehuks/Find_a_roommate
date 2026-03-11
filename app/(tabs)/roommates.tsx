import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dataAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function RoommatesScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRoommates = async () => {
        try {
            // Use the new dedicated roommates endpoint which handles filtering
            const response = await dataAPI.getRoommates();
            setUsers(Array.isArray(response) ? response : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRoommates();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRoommates();
    };

    const filteredUsers = users.filter((u) => {
        const nameStr = u?.full_name || '';
        const cityStr = u?.preferences?.target_city || '';

        const nameMatch = nameStr.toLowerCase().includes(searchQuery.toLowerCase());
        const cityMatch = cityStr.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || cityMatch;
    });

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="bg-white px-6 pt-4 pb-6 border-b border-slate-100 z-10" style={{ shadowColor: '#e2e8f0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 }}>
                <Text className="text-2xl font-bold text-slate-900 mb-4">Find Roommates</Text>

                <View className="flex-row items-center bg-slate-50 rounded-2xl h-14 px-4 border border-slate-200">
                    <Ionicons name="search" size={22} color="#94a3b8" />
                    <TextInput
                        className="flex-1 px-3 text-base text-slate-900 font-medium"
                        placeholder="Search by name or area..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
            >
                {loading ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : filteredUsers.length === 0 ? (
                    <View className="py-20 items-center">
                        <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                        <Text className="text-slate-500 mt-4 text-center">No roommates matching that search.</Text>
                    </View>
                ) : (
                    filteredUsers.map((person) => {
                        const prefs = person.preferences || {};
                        const tags = prefs.other_interests ? prefs.other_interests.split(',').slice(0, 3) : [];

                        return (
                            <TouchableOpacity
                                key={person.user_id}
                                activeOpacity={0.7}
                                onPress={() => router.push(`/user/${person.user_id}`)}
                                className="bg-white rounded-3xl p-5 mb-4 border border-slate-100"
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                            >
                                <View className="flex-row items-center">
                                    <Image
                                        source={{ uri: person.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }}
                                        className="w-16 h-16 rounded-full bg-slate-100"
                                    />
                                    <View className="flex-1 ml-4 justify-center">
                                        <View className="flex-row justify-between items-center w-full">
                                            <Text className="font-bold text-lg text-slate-900 flex-1" numberOfLines={1}>{person.full_name}</Text>
                                            <View className="flex-row items-center gap-1">
                                                {person.is_verified && <Ionicons name="shield-checkmark" size={16} color="#059669" />}
                                                {person.role === 'host' && (
                                                    <View className="bg-amber-100 px-2 py-0.5 rounded ml-1">
                                                        <Text className="text-amber-700 text-[10px] font-bold">HOST</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {/* Core Stats: City and Budget */}
                                        <View className="flex-row items-center mt-1.5 gap-3">
                                            {prefs.target_city && (
                                                <View className="flex-row items-center">
                                                    <Ionicons name="location" size={12} color="#64748b" style={{ marginRight: 2 }} />
                                                    <Text className="text-slate-500 text-xs font-medium">{prefs.target_city}</Text>
                                                </View>
                                            )}
                                            {prefs.budget_max && (
                                                <View className="flex-row items-center">
                                                    <Ionicons name="cash" size={12} color="#059669" style={{ marginRight: 2 }} />
                                                    <Text className="text-emerald-700 text-xs font-semibold">Max: KES {Number(prefs.budget_max).toLocaleString()}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                {/* Interest Tags */}
                                {tags.length > 0 && (
                                    <View className="mt-4 flex-row flex-wrap gap-2">
                                        {tags.map((tag: string, idx: number) => (
                                            <View key={idx} className="bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full">
                                                <Text className="text-slate-600 text-xs font-medium">{tag.trim()}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
