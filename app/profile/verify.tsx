import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI } from '../../services/api';

export default function VerifyProfileScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [docType, setDocType] = useState('national_id'); // default
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to upload an ID.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert("Missing Photo", "Please upload a photo of your ID.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', docType);

      // Prepare Image Data
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      // @ts-ignore: React Native FormData handling
      formData.append('document_image', { uri: image, name: filename, type });

      await dataAPI.submitVerification(formData);

      Alert.alert(
        "Submitted!", 
        "Your document is under review. You will receive a verification badge once approved.",
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error) {
      Alert.alert("Error", "Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Get Verified", headerBackTitle: "Profile" }} />
      
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        {/* Header Info */}
        <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="shield-checkmark" size={32} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 text-center">Verify Your Identity</Text>
            <Text className="text-slate-500 text-center mt-2 px-4">
                Upload a clear photo of your ID. Verified users get 3x more matches!
            </Text>
        </View>

        {/* Document Type Selector */}
        <Text className="font-bold text-slate-700 mb-3">Document Type</Text>
        <View className="flex-row gap-3 mb-6">
            <DocTypeOption 
                label="National ID" 
                selected={docType === 'national_id'} 
                onPress={() => setDocType('national_id')} 
            />
            <DocTypeOption 
                label="Student ID" 
                selected={docType === 'student_id'} 
                onPress={() => setDocType('student_id')} 
            />
        </View>

        {/* Image Upload Area */}
        <Text className="font-bold text-slate-700 mb-3">Upload Photo</Text>
        <TouchableOpacity 
            onPress={pickImage}
            className="w-full h-56 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl items-center justify-center overflow-hidden"
        >
            {image ? (
                <Image source={{ uri: image }} className="w-full h-full" resizeMode="contain" />
            ) : (
                <View className="items-center">
                    <Ionicons name="cloud-upload-outline" size={40} color="#94a3b8" />
                    <Text className="text-slate-400 mt-2">Tap to upload image</Text>
                </View>
            )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-xl mt-8 shadow-lg ${loading ? 'bg-slate-300' : 'bg-blue-600'}`}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white text-center font-bold text-lg">Submit for Review</Text>
            )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper for the pill buttons
const DocTypeOption = ({ label, selected, onPress }: any) => (
    <TouchableOpacity 
        onPress={onPress}
        className={`flex-1 py-3 rounded-xl border items-center justify-center ${
            selected ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-200'
        }`}
    >
        <Text className={`font-semibold ${selected ? 'text-blue-700' : 'text-slate-600'}`}>
            {label}
        </Text>
    </TouchableOpacity>
);