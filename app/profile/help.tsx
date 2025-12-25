import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Enable animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
    {
        question: "How do I verify my account?",
        answer: "To keep our community safe, we require a phone number verification. Go to Edit Profile > General to ensure your details are correct."
    },
    {
        question: "Is this service free?",
        answer: "Yes! TafutaRoommie is currently free for all students."
    },
    {
        question: "How do I contact a potential roommate?",
        answer: "Once you find a match, click on their profile and use the 'Chat' button to start a conversation."
    },
    {
        question: "How do I report a fake listing?",
        answer: "Please email us immediately at safety@tafutaroommie.com with the listing ID."
    },
    {
        question: "Can I change my preferences later?",
        answer: "Absolutely. Go to Profile > Edit Profile > Preferences to update your budget or lifestyle choices."
    }
];

const FAQItem = ({ item }: any) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View className="bg-white mb-3 rounded-2xl border border-slate-100 overflow-hidden">
            <TouchableOpacity 
                onPress={toggleExpand}
                className="p-4 flex-row justify-between items-center bg-slate-50"
            >
                <Text className="font-semibold text-slate-800 flex-1 mr-4">{item.question}</Text>
                <Ionicons 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#64748b" 
                />
            </TouchableOpacity>
            {expanded && (
                <View className="p-4 bg-white">
                    <Text className="text-slate-600 leading-6">{item.answer}</Text>
                </View>
            )}
        </View>
    );
};

export default function HelpCenterScreen() {
    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ title: 'Help Center', headerShadowVisible: false }} />
            
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-blue-100 rounded-full justify-center items-center mb-4">
                        <Ionicons name="chatbubbles" size={32} color="#2563eb" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900">How can we help?</Text>
                    <Text className="text-slate-500 text-center mt-2">
                        Browse our frequently asked questions below.
                    </Text>
                </View>

                {FAQS.map((faq, index) => (
                    <FAQItem key={index} item={faq} />
                ))}

                <View className="mt-8 p-6 bg-slate-50 rounded-2xl items-center">
                    <Text className="font-bold text-slate-900 mb-2">Still need help?</Text>
                    <Text className="text-slate-500 text-center mb-4">
                        If you couldn't find your answer, reach out to our support team.
                    </Text>
                    <TouchableOpacity className="bg-blue-600 py-3 px-6 rounded-xl">
                        <Text className="text-white font-bold">Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}