import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { dataAPI } from '../../services/api';

export default function AddListingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent_amount: '',
    deposit_amount: '',
    city: '',
    area: '',
    room_type: 'apartment', // Default
    available_from: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Allow selecting multiple photos
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.rent_amount || !formData.city) {
      Alert.alert("Missing Fields", "Please fill in the title, rent, and city.");
      return;
    }

    if (images.length === 0) {
      Alert.alert("No Images", "Please add at least one photo of the room.");
      return;
    }

    setLoading(true);

    try {
      const postData = new FormData();

      // 1. Append Text Fields
      Object.keys(formData).forEach(key => {
        // @ts-ignore
        postData.append(key, formData[key]);
      });

      // 2. Append Images (Key must match Django Serializer: 'uploaded_images')
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `photo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore: React Native FormData syntax
        postData.append('uploaded_images', {
          uri: uri,
          name: filename,
          type: type,
        });
      });

      await (dataAPI as any).createListing(postData);
      
      Alert.alert("Success", "Your room has been listed!", [
        { text: "OK", onPress: () => router.push('/(tabs)/listings') } // Go back to listings
      ]);

    } catch (error) {
      Alert.alert("Error", "Could not post listing. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Post a Room', headerBackTitle: 'Cancel' }} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* --- Image Picker Section --- */}
          <Text className="font-bold text-slate-700 mb-3 text-base">Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {/* Add Button */}
            <TouchableOpacity 
              onPress={pickImages}
              className="w-24 h-24 bg-slate-50 border border-dashed border-slate-300 rounded-xl justify-center items-center mr-3"
            >
              <Ionicons name="camera-outline" size={28} color="#64748b" />
              <Text className="text-xs text-slate-500 mt-1">Add Photos</Text>
            </TouchableOpacity>

            {/* Selected Images Preview */}
            {images.map((uri, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri }} className="w-24 h-24 rounded-xl bg-slate-100" />
                <TouchableOpacity 
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white"
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* --- Text Inputs --- */}
          <View className="space-y-4">
            <InputLabel label="Title" />
            <TextInput 
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
              placeholder="e.g. Spacious 1BHK in Roysambu"
              value={formData.title}
              onChangeText={t => setFormData({...formData, title: t})}
            />

            <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                    <InputLabel label="Rent (KES/mo)" />
                    <TextInput 
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                        placeholder="15000"
                        keyboardType="numeric"
                        value={formData.rent_amount}
                        onChangeText={t => setFormData({...formData, rent_amount: t})}
                    />
                </View>
                <View className="flex-1">
                    <InputLabel label="Deposit (KES)" />
                    <TextInput 
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                        placeholder="15000"
                        keyboardType="numeric"
                        value={formData.deposit_amount}
                        onChangeText={t => setFormData({...formData, deposit_amount: t})}
                    />
                </View>
            </View>

            <InputLabel label="Location" />
            <View className="flex-row gap-4 mb-4">
                <TextInput 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                    placeholder="City (e.g. Nairobi)"
                    value={formData.city}
                    onChangeText={t => setFormData({...formData, city: t})}
                />
                <TextInput 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                    placeholder="Area (e.g. Westlands)"
                    value={formData.area}
                    onChangeText={t => setFormData({...formData, area: t})}
                />
            </View>

{/* Room Type Selector */}
<InputLabel label="Room Type" />
<View className="flex-row flex-wrap gap-2 mb-4">
    {/* 👇 Use lowercase strings here to match Django models */}
    {['apartment', 'bedsitter', 'hostel', 'shared', 'private'].map((type) => (
        <TouchableOpacity
            key={type}
            onPress={() => setFormData({...formData, room_type: type})} 
            className={`px-4 py-2 rounded-full border ${
                formData.room_type === type 
                ? 'bg-blue-600 border-blue-600' 
                : 'bg-white border-slate-200'
            }`}
        >
            {/* 👇 The 'capitalize' class makes 'apartment' look like 'Apartment' */}
            <Text className={`capitalize font-medium ${
                formData.room_type === type ? 'text-white' : 'text-slate-600'
            }`}>
                {type}
            </Text>
        </TouchableOpacity>
    ))}
</View>

            <InputLabel label="Description" />
            <TextInput 
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 h-32 mb-4"
              placeholder="Tell us about the amenities, rules, etc."
              multiline
              textAlignVertical="top"
              value={formData.description}
              onChangeText={t => setFormData({...formData, description: t})}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-xl mt-4 shadow-lg mb-10 ${loading ? 'bg-slate-300' : 'bg-blue-600'}`}
          >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white text-center font-bold text-lg">Post Room</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputLabel = ({ label }: { label: string }) => (
    <Text className="font-semibold text-slate-700 mb-2 ml-1">{label}</Text>
);