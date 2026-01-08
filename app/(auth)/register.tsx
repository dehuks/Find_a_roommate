import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // 👇 New State for Role & Gender
  const [role, setRole] = useState('seeker'); // Default to Seeker
  const [gender, setGender] = useState('prefer_not_to_say'); 

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !phone) {
      return Alert.alert('Missing Info', 'Please fill in all fields.');
    }

    if (gender === 'prefer_not_to_say') {
        Alert.alert("Gender Required", "Please select a gender to help with roommate matching.");
        return;
    }

    setLoading(true);
    try {
      // 👇 Pass the new fields to the API
      await authAPI.register(fullName, email, password, phone, role, gender);
      
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Registration Failed', 'Could not create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper Component for Selection Chips
  const SelectionChip = ({ label, value, selectedValue, onSelect }: any) => (
    <TouchableOpacity 
      onPress={() => onSelect(value)}
      className={`px-6 py-3 rounded-full border mr-2 mb-2 ${
        selectedValue === value 
          ? 'bg-blue-600 border-blue-600' 
          : 'bg-white border-slate-200'
      }`}
    >
      <Text className={`font-semibold ${
        selectedValue === value ? 'text-white' : 'text-slate-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }} 
        className="px-8 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <Text className="text-blue-600 font-extrabold text-xl mb-2 tracking-wide uppercase">Join Us</Text>
          <Text className="text-4xl font-bold text-slate-900 mb-2">Create Account</Text>
          <Text className="text-slate-500 text-base leading-6">
            Tell us about yourself to find the perfect match.
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Full Name</Text>
            <TextInput 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 focus:border-blue-500"
              placeholder="Kamau Otieno"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Email Address</Text>
            <TextInput 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 focus:border-blue-500"
              placeholder="student@cuea.edu"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Phone Number</Text>
            <TextInput 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 focus:border-blue-500"
              placeholder="0712 345 678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* 👇 NEW: Role Selection */}
          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">I am a...</Text>
            <View className="flex-row">
                <SelectionChip label="Room Seeker" value="seeker" selectedValue={role} onSelect={setRole} />
                <SelectionChip label="Host (Have Room)" value="host" selectedValue={role} onSelect={setRole} />
            </View>
          </View>

          {/* 👇 NEW: Gender Selection */}
          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Gender</Text>
            <View className="flex-row flex-wrap">
                <SelectionChip label="Male" value="male" selectedValue={gender} onSelect={setGender} />
                <SelectionChip label="Female" value="female" selectedValue={gender} onSelect={setGender} />
            </View>
          </View>

          <View>
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
            <TextInput 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 focus:border-blue-500"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-blue-600 h-16 rounded-full justify-center items-center mt-6 shadow-lg shadow-blue-200 active:bg-blue-700"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-blue-600 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}