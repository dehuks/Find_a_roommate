import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { dataAPI } from '../../services/api';
import { calculateCompatibility } from '../../utils/scoring'; // 👈 Import the helper

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null); // The person we are looking at
  const [myPrefs, setMyPrefs] = useState<any>(null); // My preferences
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'none' | 'sending' | 'sent'>('none');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      if (!id) return;

      // 1. Fetch the Target User
      const targetUser = await dataAPI.getUser(id as string);
      setUser(targetUser);

      // 2. Fetch MY Preferences (to calculate score)
      const prefs = await dataAPI.getPreferences();

      if (prefs) {
        setMyPrefs(prefs);
        // 3. Calculate Score Instantly
        if (targetUser.preferences) {
          const score = calculateCompatibility(prefs, targetUser.preferences);
          setMatchScore(score);
        }
      } else {
        setMyPrefs(null); // I haven't set prefs yet
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!myPrefs) {
      Alert.alert(
        "Missing Preferences",
        "You need to set your preferences before connecting so we can tell if you're a good match!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Set Preferences", onPress: () => router.push('/profile/edit?tab=preferences') }
        ]
      );
      return;
    }

    // ... existing connect logic ...
    setRequestStatus('sending');
    try {
      await dataAPI.requestMatch(user.user_id);
      setRequestStatus('sent');
      Alert.alert("Request Sent", "Wait for them to accept!");
    } catch (error: any) {
      if (error.message.includes("already sent")) {
        setRequestStatus('sent');
        Alert.alert("Notice", "Request already sent.");
      } else {
        setRequestStatus('none');
        Alert.alert("Error", "Could not connect.");
      }
    }
  };

  // ... handleCall, handleWhatsApp ...
  const handleCall = () => {
    if (user?.phone_number) Linking.openURL(`tel:${user.phone_number}`);
  };

  const handleWhatsApp = () => {
    if (user?.phone_number) {
      const phone = user.phone_number.replace('+', '');
      Linking.openURL(`https://wa.me/${phone}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) return null;

  // Helper for Score Color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="absolute top-0 left-0 right-0 z-10 p-4 pt-12 flex-row justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/80 rounded-full items-center justify-center backdrop-blur-md"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Profile Image */}
        <View className="items-center mt-20 px-6">
          <Image
            source={{
              uri: user.profile_image || (
                user.gender?.toLowerCase() === 'female'
                  ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'
                  : 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800'
              )
            }}
            className="w-32 h-32 rounded-full border-4 border-slate-100 mb-4"
          />
          <Text className="text-3xl font-bold text-slate-900 text-center">{user.full_name}</Text>
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-slate-500 text-base">{user.role || 'Seeker'} • {user.preferences?.city || 'Nairobi'}</Text>
            {user.gender && (
              <View className={`px-2.5 py-0.5 rounded-full ${user.gender?.toLowerCase() === 'female' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                <Text className={`text-xs font-bold capitalize ${user.gender?.toLowerCase() === 'female' ? 'text-pink-600' : 'text-blue-600'}`}>
                  {user.gender}
                </Text>
              </View>
            )}
          </View>
          <View className="mb-5" />

          {/* 👇 THE NEW SCORE CARD */}
          {myPrefs ? (
            <View className={`px-6 py-3 rounded-2xl border flex-row items-center mb-6 ${getScoreColor(matchScore || 0)}`}>
              <Ionicons name="sparkles" size={20} color="currentColor" />
              <View className="ml-3 items-center">
                <Text className="font-bold text-lg">{matchScore}% Match</Text>
                <Text className="text-xs opacity-80">Based on your preferences</Text>
              </View>
            </View>
          ) : (
            // 👇 THE REMINDER IF NO PREFS
            <TouchableOpacity
              onPress={() => router.push('/profile/edit?tab=preferences')}
              className="bg-blue-50 border border-blue-200 px-6 py-4 rounded-2xl mb-6 flex-row items-center"
            >
              <Ionicons name="alert-circle" size={24} color="#2563eb" />
              <View className="ml-3 flex-1">
                <Text className="font-bold text-blue-800">See Match Percentage</Text>
                <Text className="text-blue-600 text-xs mt-1">Set your preferences to see how compatible you are.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>

        {/* Buttons */}
        <View className="flex-row justify-center gap-4 px-6 mb-8">
          <TouchableOpacity onPress={handleCall} className="w-14 h-14 bg-slate-100 rounded-full items-center justify-center">
            <Ionicons name="call" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConnect}
            disabled={requestStatus !== 'none'}
            className={`flex-1 h-14 rounded-full flex-row items-center justify-center ${requestStatus === 'sent' ? 'bg-green-600' : 'bg-blue-600'
              }`}
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}
          >
            {requestStatus === 'sending' ? (
              <ActivityIndicator color="white" />
            ) : requestStatus === 'sent' ? (
              <>
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Sent</Text>
              </>
            ) : (
              <>
                <Ionicons name="person-add" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Connect</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsApp}
            className="w-14 h-14 bg-green-500 rounded-full items-center justify-center"
            style={{ shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          >
            <Ionicons name="logo-whatsapp" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="h-[1px] bg-slate-100 mx-6 mb-8" />

        {/* Preferences Grid */}
        <View className="px-6">
          <Text className="text-lg font-bold text-slate-900 mb-4">Lifestyle & Preferences</Text>
          <View className="flex-row flex-wrap gap-3">

            {/* Location */}
            {(user.preferences?.target_city || user.preferences?.city) && (
              <DetailTag icon="location" label={user.preferences?.target_city || user.preferences?.city} />
            )}

            {/* Move-in Date */}
            {user.preferences?.move_in_date && (
              <DetailTag icon="calendar" label={`Move in: ${user.preferences.move_in_date}`} />
            )}

            {/* Budget */}
            {(user.preferences?.budget_min || user.preferences?.budget_max) && (
              <DetailTag
                icon="cash"
                label={
                  user.preferences?.budget_min && user.preferences?.budget_max
                    ? `KES ${Number(user.preferences.budget_min).toLocaleString()} – ${Number(user.preferences.budget_max).toLocaleString()}`
                    : user.preferences?.budget_max
                    ? `Max KES ${Number(user.preferences.budget_max).toLocaleString()}`
                    : `Min KES ${Number(user.preferences.budget_min).toLocaleString()}`
                }
                color="text-emerald-700 bg-emerald-50"
              />
            )}

            {/* Actively Looking */}
            <DetailTag
              icon={user.preferences?.is_actively_looking ? "search" : "pause-circle"}
              label={user.preferences?.is_actively_looking ? "Actively Looking" : "Not Looking"}
              color={user.preferences?.is_actively_looking ? "text-blue-600 bg-blue-50" : "text-slate-500 bg-slate-100"}
            />

            {/* Sleep Schedule */}
            <DetailTag icon="bed" label={user.preferences?.sleep_schedule || 'Flexible'} />

            {/* Cleanliness */}
            <DetailTag icon="water" label={`${user.preferences?.cleanliness_level || 'Medium'} Clean`} />

            {/* Noise Tolerance */}
            <DetailTag icon="volume-medium" label={`${user.preferences?.noise_tolerance || 'Medium'} Noise`} />

            {/* Smoking */}
            <DetailTag
              icon={user.preferences?.smoking ? "skull" : "leaf"}
              label={user.preferences?.smoking ? "Smoker" : "Non-Smoker"}
              color={user.preferences?.smoking ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}
            />

            {/* Pets */}
            <DetailTag
              icon="paw"
              label={user.preferences?.pets ? "Has Pets" : "No Pets"}
              color={user.preferences?.pets ? "text-amber-700 bg-amber-50" : "text-slate-500 bg-slate-100"}
            />

            {/* Guests */}
            <DetailTag
              icon={user.preferences?.guests_allowed ? "people" : "person-remove"}
              label={user.preferences?.guests_allowed ? "Guests OK" : "No Guests"}
              color={user.preferences?.guests_allowed ? "text-violet-600 bg-violet-50" : "text-slate-500 bg-slate-100"}
            />
          </View>

          {/* Interest Tags */}
          {user.preferences?.other_interests && (
            <View className="mt-6">
              <Text className="text-sm font-bold text-slate-500 uppercase mb-3">Interests & Requirements</Text>
              <View className="flex-row flex-wrap gap-2">
                {user.preferences.other_interests.split(',').filter(Boolean).map((tag: string, i: number) => (
                  <View key={i} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                    <Text className="text-blue-700 text-xs font-semibold">{tag.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const DetailTag = ({ icon, label, color }: any) => (
  <View className={`flex-row items-center px-4 py-3 rounded-2xl ${color || 'bg-slate-50'}`}>
    <Ionicons name={icon} size={18} color="#475569" />
    <Text className="ml-2 text-slate-700 font-semibold">{label}</Text>
  </View>
);