import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const leaderboard = useQuery(api.tasks.getLeaderboard);
  const tasks = useQuery(api.tasks.getPendingTasks);
  const { syncFromServer } = useAppStore();

  useEffect(() => {
    getOrCreateUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      syncFromServer(currentUser.total_xp, currentUser.current_streak);
    }
  }, [currentUser]);

  const availableTasks = tasks?.length ?? 0;
  const xp = currentUser?.total_xp ?? 0;
  const streak = currentUser?.current_streak ?? 0;

  // XP level thresholds (100 XP per level)
  const level = Math.floor(xp / 100) + 1;
  const xpIntoLevel = xp % 100;
  const xpProgress = xpIntoLevel / 100;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            Welcome back
          </Text>
          <Text className="font-bold text-2xl text-neutral-900 dark:text-white">
            {currentUser?.name ?? 'Annotator'}
          </Text>
        </View>

        {/* Stats row */}
        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <Text className="text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wide mb-1">
              Total XP
            </Text>
            <Text className="font-bold text-2xl text-blue-700 dark:text-blue-300">{xp}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-orange-50 p-4 dark:bg-orange-900/20">
            <Text className="text-orange-600 dark:text-orange-400 font-semibold text-xs uppercase tracking-wide mb-1">
              Streak
            </Text>
            <Text className="font-bold text-2xl text-orange-700 dark:text-orange-300">
              🔥 {streak}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-purple-50 p-4 dark:bg-purple-900/20">
            <Text className="text-purple-600 dark:text-purple-400 font-semibold text-xs uppercase tracking-wide mb-1">
              Level
            </Text>
            <Text className="font-bold text-2xl text-purple-700 dark:text-purple-300">
              {level}
            </Text>
          </View>
        </View>

        {/* XP progress bar */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              Level {level}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {xpIntoLevel} / 100 XP
            </Text>
          </View>
          <View className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
            <View
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${xpProgress * 100}%` }}
            />
          </View>
        </View>

        {/* Start Annotating CTA */}
        <Pressable
          onPress={() => router.push('/(tabs)/arena')}
          disabled={availableTasks === 0}
          className="mb-6 rounded-2xl bg-blue-600 py-5 items-center active:bg-blue-700 disabled:opacity-40"
        >
          <Text className="font-bold text-white text-lg">
            {availableTasks > 0 ? `Start Annotating (${availableTasks} tasks)` : 'No tasks available'}
          </Text>
          {availableTasks > 0 && (
            <Text className="text-blue-200 text-sm mt-1">Earn XP for every annotation</Text>
          )}
        </Pressable>

        {/* Mini leaderboard */}
        <View className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <View className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <Text className="font-semibold text-neutral-900 dark:text-white">Leaderboard</Text>
          </View>
          {leaderboard === undefined ? (
            <View className="p-4">
              <Text className="text-neutral-400 text-sm">Loading...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View className="p-4">
              <Text className="text-neutral-400 text-sm">No rankings yet. Be the first!</Text>
            </View>
          ) : (
            leaderboard.slice(0, 5).map((entry) => (
              <View
                key={entry.rank}
                className="flex-row items-center px-4 py-3 border-b border-neutral-50 dark:border-neutral-900"
              >
                <Text className="w-8 font-bold text-neutral-400 text-sm">#{entry.rank}</Text>
                <Text className="flex-1 font-medium text-neutral-800 dark:text-neutral-200">
                  {entry.name}
                </Text>
                <Text className="font-semibold text-blue-600 text-sm">{entry.total_xp} XP</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
