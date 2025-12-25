import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Missing Info', 'Please enter both email and password.');
    }

    setLoading(true);
    try {
      const user = await authAPI.login(email, password); 
      login(user);
      router.replace('/(tabs)');
    } catch (error: any) {
      // FIX: Show the actual error from the backend/api.ts
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-8">
      
      <View className="mb-10">
        <Text className="text-blue-600 font-extrabold text-xl mb-2 tracking-wide uppercase">TafutaRoommie</Text>
        <Text className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</Text>
        <Text className="text-slate-500 text-base leading-6">
          Sign in to find your perfect space or roommate in Nairobi.
        </Text>
      </View>

      <View className="space-y-6">
        <View>
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Email Address</Text>
          <TextInput 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 focus:border-blue-500 focus:bg-blue-50/20"
            placeholder="student@cuea.edu"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
          <TextInput 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base text-slate-900 focus:border-blue-500 focus:bg-blue-50/20"
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-blue-600 h-16 rounded-full justify-center items-center mt-4 shadow-lg shadow-blue-200 active:bg-blue-700"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        {/* FIX: Actually navigate to Register */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-blue-600 font-bold">Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}