import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XpBar } from '@/components/ui/XpBar';
import { api } from '@/convex/_generated/api';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const stats = useQuery(api.tasks.getUserStats);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} className="mb-6 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Text className="font-bold text-3xl text-blue-600">
              {(user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress?.[0] ?? '?').toUpperCase()}
            </Text>
          </View>
          <Text className="font-bold text-xl text-neutral-900 dark:text-white">
            {user?.fullName ?? user?.emailAddresses[0]?.emailAddress ?? 'User'}
          </Text>
          <Text className="text-sm text-neutral-500">{user?.emailAddresses[0]?.emailAddress}</Text>
        </Animated.View>

        {/* Level & XP */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(100)}
          className="mb-4 rounded-xl bg-white p-5 dark:bg-neutral-800"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
        >
          <XpBar current={stats ? stats.total_xp % 100 : 0} max={100} level={stats?.level ?? 1} />
        </Animated.View>

        {/* Stats grid */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)} className="mb-4 flex-row gap-3">
          <View className="flex-1 items-center rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="font-bold text-2xl text-blue-600">{stats?.total_xp ?? 0}</Text>
            <Text className="text-xs text-neutral-500">Total XP</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="font-bold text-2xl text-green-600">{stats?.tasks_completed ?? 0}</Text>
            <Text className="text-xs text-neutral-500">Tasks Done</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(300)} className="mb-4 flex-row gap-3">
          <View className="flex-1 items-center rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="font-bold text-2xl text-orange-500">🔥 {stats?.current_streak ?? 0}</Text>
            <Text className="text-xs text-neutral-500">Day Streak</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="font-bold text-2xl text-purple-600">{stats?.accuracy_score ?? 0}%</Text>
            <Text className="text-xs text-neutral-500">Accuracy</Text>
          </View>
        </Animated.View>

        {/* Reward History (mocked) */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(400)}
          className="mb-4 rounded-xl bg-white p-5 dark:bg-neutral-800"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
        >
          <Text className="mb-3 font-bold text-base text-neutral-800 dark:text-neutral-200">
            Reward History
          </Text>
          <View className="items-center py-4">
            <Text className="text-neutral-400">No rewards claimed yet</Text>
            <Text className="mt-1 text-xs text-neutral-400">Keep annotating to earn rewards!</Text>
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.duration(300).delay(500)} className="mb-10">
          <Pressable
            onPress={handleSignOut}
            className="items-center rounded-xl border border-red-200 py-4 dark:border-red-800"
          >
            <Text className="font-semibold text-base text-red-600">Sign Out</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
