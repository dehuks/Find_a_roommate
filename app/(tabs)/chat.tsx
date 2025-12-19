import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { dataAPI } from '../../services/api';

export default function ChatScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataAPI.getConversations().then((data) => {
      setChats(data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 py-4 border-b border-slate-50 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900">Messages</Text>
        <TouchableOpacity>
           <Ionicons name="create-outline" size={24} color="#258cf4" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#258cf4" />
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {chats.map((chat) => (
            <TouchableOpacity 
              key={chat.conversation_id} 
              className="px-6 py-4 flex-row items-center active:bg-slate-50 border-b border-slate-50"
            >
              <Image 
                source={{ uri: chat.other_user.image }} 
                className="w-14 h-14 rounded-full bg-slate-200" 
              />
              
              <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-base font-bold text-slate-900">{chat.other_user.full_name}</Text>
                  <Text className="text-xs text-slate-400">{chat.last_message.sent_at}</Text>
                </View>
                
                <View className="flex-row justify-between items-center mt-1">
                  <Text 
                    numberOfLines={1} 
                    className={`text-sm flex-1 mr-4 ${!chat.last_message.is_read ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}
                  >
                    {chat.last_message.text}
                  </Text>
                  {!chat.last_message.is_read && (
                    <View className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}