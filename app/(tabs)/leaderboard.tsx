import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';

const RANK_COLORS: Record<number, string> = {
  1: '#f59e0b',
  2: '#9ca3af',
  3: '#cd7f32',
};

export default function LeaderboardScreen() {
  const leaderboard = useQuery(api.tasks.getLeaderboard);

  if (leaderboard === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="px-5 pt-6 pb-3">
        <Text className="font-bold text-2xl text-neutral-900 dark:text-white">Leaderboard</Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">Top annotators by XP</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {leaderboard.length === 0 ? (
          <View className="mt-20 items-center">
            <Text className="mb-2 text-4xl">🏆</Text>
            <Text className="text-neutral-400">No rankings yet. Start annotating!</Text>
          </View>
        ) : (
          leaderboard.map((entry, i) => (
            <Animated.View
              key={entry.subject}
              entering={FadeInDown.duration(300).delay(i * 60)}
              className="mb-3 flex-row items-center rounded-xl bg-white p-4 dark:bg-neutral-800"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderLeftWidth: entry.rank <= 3 ? 3 : 0,
                borderLeftColor: RANK_COLORS[entry.rank] ?? 'transparent',
              }}
            >
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                <Text
                  className="font-bold text-base"
                  style={{ color: RANK_COLORS[entry.rank] ?? '#6b7280' }}
                >
                  {entry.rank}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="font-semibold text-base text-neutral-800 dark:text-neutral-200" numberOfLines={1}>
                  {entry.subject.slice(0, 25)}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {entry.tasks_completed} tasks · {entry.accuracy_score}% accuracy
                </Text>
              </View>

              <Text className="font-bold text-base text-blue-600">{entry.total_xp} XP</Text>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
