import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { XpBar } from '@/components/ui/XpBar';
import { api } from '@/convex/_generated/api';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const stats = useQuery(api.tasks.getUserStats);
  const leaderboard = useQuery(api.tasks.getLeaderboard);

  const displayName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? 'Annotator';

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="flex-1 px-5 pt-6">
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} className="mb-6">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">Welcome back</Text>
          <Text className="font-bold text-2xl text-neutral-900 dark:text-white">{displayName}</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)} className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">Total XP</Text>
            <Text className="font-bold text-2xl text-blue-600">{stats?.total_xp ?? 0}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">Streak</Text>
            <Text className="font-bold text-2xl text-orange-500">🔥 {stats?.current_streak ?? 0}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">Tasks</Text>
            <Text className="font-bold text-2xl text-green-600">{stats?.tasks_completed ?? 0}</Text>
          </View>
        </Animated.View>

        {/* XP Progress */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)} className="mb-6 rounded-xl bg-white p-4 dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
          <XpBar
            current={stats ? stats.total_xp % 100 : 0}
            max={100}
            level={stats?.level ?? 1}
          />
        </Animated.View>

        {/* Start Button */}
        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <Pressable
            onPress={() => router.push('/annotate')}
            className="mb-6 items-center rounded-2xl bg-blue-600 py-5"
            style={{ shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
          >
            <Text className="font-bold text-lg text-white">Start Annotating</Text>
            <Text className="mt-1 text-sm text-blue-200">Earn XP and climb the ranks</Text>
          </Pressable>
        </Animated.View>

        {/* Mini Leaderboard */}
        <Animated.View entering={FadeInDown.duration(300).delay(400)} className="flex-1">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-bold text-base text-neutral-800 dark:text-neutral-200">Leaderboard</Text>
            <Pressable onPress={() => router.push('/(tabs)/leaderboard')}>
              <Text className="text-sm text-blue-600">See all</Text>
            </Pressable>
          </View>

          <View className="rounded-xl bg-white dark:bg-neutral-800" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry, i) => (
                <View
                  key={entry.subject}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    i < 4 ? 'border-b border-neutral-100 dark:border-neutral-700' : ''
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="mr-3 w-6 font-bold text-sm text-neutral-400">#{entry.rank}</Text>
                    <Text className="font-semibold text-sm text-neutral-800 dark:text-neutral-200" numberOfLines={1}>
                      {entry.subject.slice(0, 20)}...
                    </Text>
                  </View>
                  <Text className="font-bold text-sm text-blue-600">{entry.total_xp} XP</Text>
                </View>
              ))
            ) : (
              <View className="items-center py-6">
                <Text className="text-neutral-400">No rankings yet. Be the first!</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
