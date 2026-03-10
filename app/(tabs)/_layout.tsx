import { useAuth } from '@clerk/clerk-expo';
import { Award01Icon, Home01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  usePushNotifications();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#555558',
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopWidth: 1,
          borderTopColor: '#1f1f1f',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon icon={Home01Icon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="arena"
        options={{
          title: 'Arena',
          tabBarIcon: ({ color }) => <Icon icon={Award01Icon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Icon icon={Settings01Icon} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
