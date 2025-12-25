import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams(); // Chat ID & Friend's Name
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const data = await chatAPI.getMessages(Number(id));
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & Polling
  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    setInputText(''); // Clear immediately for UX

    try {
      // Optimistic UI Update (Show message immediately before server confirms)
      const tempMsg = {
        message_id: Math.random(),
        message_text: textToSend,
        is_me: true,
        sent_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);

      // Send to Backend
      await chatAPI.sendMessage(Number(id), textToSend);
      fetchMessages(); // Refresh to get the real message ID
    } catch (error) {
      console.error("Failed to send");
      // Ideally remove the temp message here if it failed
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.is_me;
    return (
      <View className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
           <View className="w-8 h-8 rounded-full bg-slate-300 items-center justify-center mr-2">
              <Text className="text-xs font-bold text-slate-600">
                  {name ? (name as string)[0] : '?'}
              </Text>
           </View>
        )}
        <View 
            className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                isMe ? 'bg-blue-600 rounded-tr-none' : 'bg-slate-100 rounded-tl-none'
            }`}
        >
            <Text className={`text-base ${isMe ? 'text-white' : 'text-slate-800'}`}>
                {item.message_text}
            </Text>
            <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{
            title: name as string || 'Chat',
            headerBackTitle: 'Inbox',
            headerShadowVisible: false,
        }} 
      />

      <SafeAreaView className="flex-1" edges={['bottom']}>
        {loading ? (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        ) : (
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => String(item.message_id)}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
        )}

        {/* Input Bar */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View className="flex-row items-center p-3 border-t border-slate-100 bg-white">
                <TextInput 
                    className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-base mr-3 max-h-24"
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity 
                    onPress={handleSend}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                        inputText.trim() ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                    disabled={!inputText.trim()}
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}