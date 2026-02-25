import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { showError, showInfo, showSuccess } from '../../utils/toast'; // 👈 Import Toast helpers

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Validation Toast
    if (!email || !password) {
      return showInfo('Please enter both email and password to continue.');
    }

    setLoading(true);
    try {
      const user = await authAPI.login(email, password);
      login(user);

      // 2. Success Toast
      showSuccess('Welcome back!', `Signed in as ${user.full_name}`);

      router.replace('/(tabs)');
    } catch (error: any) {
      // 3. Error Toast (Handles "Invalid credentials" nicely)
      showError(error);
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
          className="w-full bg-blue-600 h-16 rounded-full justify-center items-center mt-4 active:bg-blue-700"
          style={{ shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 15, elevation: 5 }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-blue-600 font-bold">Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}