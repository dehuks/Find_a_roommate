import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { dataAPI, authAPI } from '../../services/api';


type Tab = 'general' | 'preferences' | 'security';

// --- HELPER COMPONENTS ---

const PreferenceToggle = ({ label, value, onValueChange }: any) => (
    <View className="flex-row justify-between items-center">
        <Text className="text-slate-700 font-medium">{label}</Text>
        <Switch 
            value={value} 
            onValueChange={onValueChange} 
            trackColor={{ false: "#e2e8f0", true: "#2563eb" }}
        />
    </View>
);

const RenderGeneral = ({ data, setData }: any) => (
    <View className="space-y-4">
      <View>
        <Text className="text-slate-500 mb-1 ml-1 text-xs uppercase font-bold">Full Name</Text>
        <TextInput 
          value={data.full_name}
          onChangeText={(t) => setData({...data, full_name: t})}
          className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
        />
      </View>
      
      <View>
        <Text className="text-slate-500 mb-1 ml-1 text-xs uppercase font-bold">Email</Text>
        <TextInput 
          value={data.email}
          onChangeText={(t) => setData({...data, email: t})}
          className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View>
        <Text className="text-slate-500 mb-1 ml-1 text-xs uppercase font-bold">Phone</Text>
        <TextInput 
          value={data.phone_number}
          onChangeText={(t) => setData({...data, phone_number: t})}
          className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
          keyboardType="phone-pad"
        />
      </View>

      <View>
        <Text className="text-slate-500 mb-3 ml-1 text-xs uppercase font-bold">Gender</Text>
        <View className="flex-row gap-3">
            {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity 
                    key={gender}
                    onPress={() => setData({...data, gender: gender})}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                        data.gender === gender 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-slate-200'
                    }`}
                >
                    <Text className={`font-bold capitalize ${data.gender === gender ? 'text-white' : 'text-slate-500'}`}>
                        {gender}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
);

const RenderSecurity = ({ data, setData }: any) => (
    <View className="space-y-4">
      <TextInput 
        placeholder="Current Password" 
        secureTextEntry 
        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
        onChangeText={(t) => setData({...data, old: t})}
      />
      <TextInput 
        placeholder="New Password" 
        secureTextEntry 
        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
        onChangeText={(t) => setData({...data, new: t})}
      />
      <TextInput 
        placeholder="Confirm New Password" 
        secureTextEntry 
        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
        onChangeText={(t) => setData({...data, confirm: t})}
      />
    </View>
);

const RenderPreferences = ({ prefData, setPrefData, customTags, newTag, setNewTag, addTag, removeTag }: any) => (
    <View className="space-y-6">
      {/* Budget Range */}
      <View>
        <Text className="text-slate-500 mb-3 ml-1 text-xs uppercase font-bold">Budget Range (KES/Month)</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-slate-400 mb-1 ml-1">Minimum</Text>
            <TextInput 
              value={prefData.budget_min ? String(prefData.budget_min) : ''}
              onChangeText={(t) => setPrefData({...prefData, budget_min: t})}
              placeholder="e.g. 10000"
              keyboardType="numeric"
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-slate-400 mb-1 ml-1">Maximum</Text>
            <TextInput 
              value={prefData.budget_max ? String(prefData.budget_max) : ''}
              onChangeText={(t) => setPrefData({...prefData, budget_max: t})}
              placeholder="e.g. 30000"
              keyboardType="numeric"
              className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold"
            />
          </View>
        </View>
      </View>

      {/* Add after Budget Range section */}
<View>
  <Text className="text-slate-500 mb-1 ml-1 text-xs uppercase font-bold">City</Text>
  <TextInput 
    value={prefData.city || ''}
    onChangeText={(t) => setPrefData({...prefData, city: t})}
    placeholder="e.g. Nairobi, Mombasa"
    className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
  />
</View>

      {/* Lifestyle Preferences */}
      <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <PreferenceToggle 
          label="Do you smoke?" 
          value={prefData.smoking} 
          onValueChange={(v: boolean) => setPrefData({...prefData, smoking: v})} 
        />
        <View className="h-[1px] bg-slate-200 my-3" />
        <PreferenceToggle 
          label="Do you have pets?" 
          value={prefData.pets} 
          onValueChange={(v: boolean) => setPrefData({...prefData, pets: v})} 
        />
        <View className="h-[1px] bg-slate-200 my-3" />
        <PreferenceToggle 
          label="Guests Allowed?" 
          value={prefData.guests_allowed} 
          onValueChange={(v: boolean) => setPrefData({...prefData, guests_allowed: v})} 
        />
      </View>

      {/* Cleanliness */}
      <View>
        <Text className="text-slate-500 mb-3 ml-1 text-xs uppercase font-bold">Cleanliness Level</Text>
        <View className="flex-row gap-3">
            {['Low', 'Medium', 'High'].map((level) => (
                <TouchableOpacity 
                    key={level}
                    onPress={() => setPrefData({...prefData, cleanliness_level: level})}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                        prefData.cleanliness_level === level 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-slate-200'
                    }`}
                >
                    <Text className={`font-bold capitalize ${prefData.cleanliness_level === level ? 'text-white' : 'text-slate-500'}`}>
                        {level}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Noise Tolerance */}
      <View>
        <Text className="text-slate-500 mb-3 ml-1 text-xs uppercase font-bold">Noise Tolerance</Text>
        <View className="flex-row gap-3">
            {['Low', 'Medium', 'High'].map((level) => (
                <TouchableOpacity 
                    key={level}
                    onPress={() => setPrefData({...prefData, noise_tolerance: level})}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                        prefData.noise_tolerance === level 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-slate-200'
                    }`}
                >
                    <Text className={`font-bold capitalize ${prefData.noise_tolerance === level ? 'text-white' : 'text-slate-500'}`}>
                        {level}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Sleep Schedule */}
      <View>
        <Text className="text-slate-500 mb-3 ml-1 text-xs uppercase font-bold">Sleep Schedule</Text>
        <View className="flex-row gap-3">
            {['Early bird', 'Night owl', 'Flexible'].map((schedule) => (
                <TouchableOpacity 
                    key={schedule}
                    onPress={() => setPrefData({...prefData, sleep_schedule: schedule})}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                        prefData.sleep_schedule === schedule 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-slate-200'
                    }`}
                >
                    <Text className={`font-semibold text-xs ${prefData.sleep_schedule === schedule ? 'text-white' : 'text-slate-500'}`}>
                        {schedule}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Preferred Gender */}
<View>
  <Text className="text-slate-500 mb-3 ml-1 text-xs uppercase font-bold">Preferred Roommate Gender</Text>
  <View className="flex-row gap-3">
      {[
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'prefer_not_to_say', label: 'Any' }
      ].map(({ value, label }) => (
          <TouchableOpacity 
              key={value}
              onPress={() => setPrefData({...prefData, preferred_gender: value})}
              className={`flex-1 py-3 rounded-xl items-center border ${
                  prefData.preferred_gender === value 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-slate-200'
              }`}
          >
              <Text className={`font-bold capitalize ${prefData.preferred_gender === value ? 'text-white' : 'text-slate-500'}`}>
                  {label}
              </Text>
          </TouchableOpacity>
      ))}
  </View>
</View>

      {/* Custom Tags Section */}
      <View>
        <Text className="text-slate-500 mb-2 ml-1 text-xs uppercase font-bold">Interests / Requirements</Text>
        
        {/* Input */}
        <View className="flex-row gap-2 mb-3">
            <TextInput 
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add e.g. Gym enthusiast, Vegan"
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl"
                onSubmitEditing={addTag}
            />
            <TouchableOpacity onPress={addTag} className="bg-slate-900 px-4 justify-center rounded-xl">
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>

        {/* Chips */}
        <View className="flex-row flex-wrap gap-2">
            {customTags.map((tag: string, index: number) => (
                <View key={index} className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-full flex-row items-center">
                    <Text className="text-blue-700 font-semibold mr-1">{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                        <Ionicons name="close-circle" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
            ))}
            {customTags.length === 0 && (
                <Text className="text-slate-400 italic text-sm">No custom preferences added yet.</Text>
            )}
        </View>
      </View>
    </View>
);

// --- MAIN COMPONENT ---

export default function EditProfileScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>((tab as Tab) || 'general');
  const [loading, setLoading] = useState(false);
  

  

  // States
  const [generalData, setGeneralData] = useState({
  full_name: '',
  email: '',
  phone_number: '',
  gender: ''
 });


  const [prefData, setPrefData] = useState<any>({
    cleanliness_level: 'Medium',
    smoking: false,
    pets: false,
    guests_allowed: true,
    noise_tolerance: 'Medium',
    sleep_schedule: 'Flexible',
    budget_min: '',
    budget_max: '',
    preferred_gender: 'any',
    other_interests: '' ,
    city: ''
  });
  const [prefId, setPrefId] = useState<number | undefined>(undefined);
  
  // Custom Tags State
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Password State
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });

  // Fetch Data
  // Inside your React Component
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      const [profileData, preferencesData] = await Promise.all([
        dataAPI.getProfile(),
        dataAPI.getPreferences()
      ]);

      // ✅ GENERAL = PROFILE DATA
      setGeneralData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        gender: profileData.gender || ''
      });

      // ✅ PREFERENCES = PREFERENCES DATA (unchanged)
      if (preferencesData) {
        setPrefData({
          cleanliness_level: preferencesData.cleanliness_level || 'Medium',
          smoking: !!preferencesData.smoking,
          pets: !!preferencesData.pets,
          guests_allowed: !!preferencesData.guests_allowed,
          noise_tolerance: preferencesData.noise_tolerance || 'Medium',
          sleep_schedule: preferencesData.sleep_schedule || 'Flexible',
          budget_min: preferencesData.budget_min
            ? String(preferencesData.budget_min)
            : '',
          budget_max: preferencesData.budget_max
            ? String(preferencesData.budget_max)
            : '',
          preferred_gender: preferencesData.preferred_gender || 'any',
          city: preferencesData.city || ''
        });

        setPrefId(preferencesData.preference_id);

        setCustomTags(
          preferencesData.other_interests
            ? preferencesData.other_interests
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
            : []
        );
      }
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);


  // Tag Handlers
  const addTag = () => {
    if (newTag.trim().length > 0 && !customTags.includes(newTag.trim())) {
        setCustomTags([...customTags, newTag.trim()]);
        setNewTag('');
        Keyboard.dismiss();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    Keyboard.dismiss();

    try {
      if (!user) throw new Error("User not authenticated");

      if (activeTab === 'general') {
        const updatedUser = await dataAPI.updateProfile(user.user_id, generalData);
        login({ ...user, ...updatedUser }); 
        Alert.alert("Success", "Profile updated successfully");
      } 
      else if (activeTab === 'preferences') {
        
        // FIX 2: Helper to safely parse budget numbers (Prevents NaN)
        const parseAmount = (value: any) => {
            if (!value) return null; // Handle empty string, null, undefined
            // Remove commas in case user typed "10,000"
            const num = parseFloat(String(value).replace(/,/g, ''));
            return isNaN(num) ? null : num;
        };

        // Prepare Payload
        const payload = {
            ...prefData,
            budget_min: parseAmount(prefData.budget_min),
            budget_max: parseAmount(prefData.budget_max),
            other_interests: customTags.join(','),
            city: prefData.city || null

        };

        console.log('Saving preferences payload:', payload);

        const updatedPref = await dataAPI.updatePreferences(payload, prefId);
        
        setPrefData({
            ...updatedPref,
            // Convert back to string for input display
            budget_min: updatedPref.budget_min !== null ? String(updatedPref.budget_min) : '',
            budget_max: updatedPref.budget_max !== null ? String(updatedPref.budget_max) : '',
        });
        
        if (updatedPref && updatedPref.preference_id) {
            setPrefId(updatedPref.preference_id);
        }

        Alert.alert("Success", "Preferences saved!");
      }
      else if (activeTab === 'security') {
        if (passwordData.new !== passwordData.confirm) throw new Error("Passwords do not match");
        await authAPI.changePassword(passwordData.old, passwordData.new);
        Alert.alert("Success", "Password changed. Please login again.", [
            { text: "OK", onPress: () => router.replace('/(auth)/login') }
        ]);
      }
    } catch (error: any) {
        let msg = error.message;
        // Clean up messy API errors
        if (msg.includes('Save failed:')) {
            try {
                const rawJson = msg.replace('Save failed: ', '');
                const jsonErr = JSON.parse(rawJson);
                const key = Object.keys(jsonErr)[0];
                msg = `${key.toUpperCase()}: ${jsonErr[key]}`;
            } catch (e) {}
        }
        console.error('Save error:', error);
        Alert.alert("Save Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen 
         options={{
            title: 'Edit Profile',
            headerShadowVisible: false,
            headerBackTitle: 'Back',
         }} 
      />

      <SafeAreaView className="flex-1" edges={['bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
              
              <View className="flex-row bg-slate-100 p-1 rounded-xl mb-8">
                  {(['general', 'preferences', 'security'] as Tab[]).map((tab) => (
                      <TouchableOpacity 
                          key={tab} 
                          onPress={() => setActiveTab(tab)}
                          className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
                      >
                          <Text className={`font-semibold capitalize ${activeTab === tab ? 'text-slate-900' : 'text-slate-400'}`}>
                              {tab}
                          </Text>
                      </TouchableOpacity>
                  ))}
              </View>

              {activeTab === 'general' && <RenderGeneral data={generalData} setData={setGeneralData} />}
              
              {activeTab === 'preferences' && (
                <RenderPreferences 
                    prefData={prefData} 
                    setPrefData={setPrefData} 
                    customTags={customTags} 
                    newTag={newTag}
                    setNewTag={setNewTag}
                    addTag={addTag}
                    removeTag={removeTag}
                />
              )}
              
              {activeTab === 'security' && <RenderSecurity data={passwordData} setData={setPasswordData} />}

          </ScrollView>
        </KeyboardAvoidingView>

        <View className="p-6 border-t border-slate-100">
          <TouchableOpacity 
              onPress={handleSave} 
              disabled={loading}
              className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
          >
              {loading ? <ActivityIndicator color="white" /> : (
                  <Text className="text-white font-bold text-lg">Save Changes</Text>
              )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}