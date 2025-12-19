import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          // FIX: Taller height to respect the bottom home-bar area
          height: Platform.OS === 'ios' ? 95 : 70, 
          // FIX: Push icons up away from the bottom edge
          paddingBottom: Platform.OS === 'ios' ? 30 : 10, 
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9', // slate-100
          borderTopWidth: 1,
          elevation: 0, // Remove Android shadow for a clean flat look
          shadowOpacity: 0, // Remove iOS shadow
        },
        tabBarActiveTintColor: '#258cf4',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: -5, // Tweak label position
        }
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Middle "Listings" Button - Optional: Make it pop slightly */}
      <Tabs.Screen
        name="listings"
        options={{
          title: 'Listings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "list" : "list-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}