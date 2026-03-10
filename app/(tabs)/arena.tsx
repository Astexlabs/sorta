import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DynamicRenderer } from '@/components/sdui/DynamicRenderer';
import { api } from '@/convex/_generated/api';
import { useAppStore } from '@/store/useAppStore';

type OverlayType = 'xp' | 'gold_correct' | 'streak_bonus' | null;

export default function ArenaScreen() {
  const tasks = useQuery(api.tasks.getPendingTasks);
  const currentUser = useQuery(api.users.getCurrentUser);
  const submitTask = useMutation(api.tasks.submitTask);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  const { xp, streak, sessionTaskCount, addXp, setStreak, incrementSessionCount, syncFromServer } =
    useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const taskStartTime = useRef(Date.now());

  // Ensure user profile exists
  useEffect(() => {
    getOrCreateUser();
  }, []);

  // Sync server state into local store on load
  useEffect(() => {
    if (currentUser) {
      syncFromServer(currentUser.total_xp, currentUser.current_streak);
    }
  }, [currentUser]);

  const showOverlay = useCallback(
    (type: OverlayType) => {
      setOverlay(type);
      overlayOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setOverlay(null));
    },
    [overlayOpacity]
  );

  const handleTaskComplete = useCallback(
    async (selectedValue: string) => {
      if (!tasks || currentIndex >= tasks.length) return;

      const task = tasks[currentIndex];
      const timeTakenMs = Date.now() - taskStartTime.current;

      // Optimistic UI updates — instant, no waiting for server
      addXp(task.xp_reward);
      incrementSessionCount();
      setCurrentIndex((prev) => prev + 1);
      taskStartTime.current = Date.now();

      // Show appropriate overlay
      const newCount = sessionTaskCount + 1;
      if (newCount > 0 && newCount % 10 === 0) {
        showOverlay('streak_bonus');
      } else {
        showOverlay('xp');
      }

      try {
        const result = await submitTask({
          taskId: task._id as any,
          selectedValue,
          timeTakenMs,
        });

        if (result.isGoldStandard && result.isCorrect) {
          // Extra XP was already counted server-side; sync back
          showOverlay('gold_correct');
          if (currentUser) {
            syncFromServer(currentUser.total_xp + result.earnedXp, currentUser.current_streak + 1);
          }
        }
        if (result.earnedXp !== task.xp_reward) {
          // Correct the optimistic XP delta
          addXp(result.earnedXp - task.xp_reward);
        }
      } catch {
        // Silently fail — optimistic update already applied
      }
    },
    [tasks, currentIndex, sessionTaskCount, addXp, incrementSessionCount, showOverlay, submitTask, syncFromServer, currentUser]
  );

  const isLoading = tasks === undefined || currentUser === undefined;
  const isDone = !isLoading && (!tasks || currentIndex >= tasks.length);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950 items-center justify-center">
        <Text className="text-neutral-500 dark:text-neutral-400">Loading tasks...</Text>
      </SafeAreaView>
    );
  }

  if (isDone) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950 items-center justify-center px-8">
        <Text className="text-5xl mb-4">🎉</Text>
        <Text className="font-bold text-2xl text-neutral-900 dark:text-white mb-2">
          Session Complete!
        </Text>
        <Text className="text-neutral-500 dark:text-neutral-400 text-center mb-8">
          You completed {sessionTaskCount} tasks and earned {xp} total XP.
        </Text>
        <Pressable
          onPress={() => {
            setCurrentIndex(0);
            router.back();
          }}
          className="rounded-xl bg-blue-600 px-8 py-4"
        >
          <Text className="font-semibold text-white text-base">Back to Dashboard</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-blue-600 font-medium">← Exit</Text>
        </Pressable>
        <View className="flex-row items-center gap-4">
          <Text className="font-semibold text-neutral-700 dark:text-neutral-300">
            ⚡ {xp} XP
          </Text>
          <Text className="font-semibold text-orange-500">
            🔥 {streak}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mx-5 mb-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
        <View
          className="h-1.5 rounded-full bg-blue-600"
          style={{
            width: `${Math.min(100, (currentIndex / Math.max(tasks.length, 1)) * 100)}%`,
          }}
        />
      </View>
      <Text className="mb-2 text-center text-xs text-neutral-400">
        {currentIndex} / {tasks.length} tasks
      </Text>

      {/* Gold standard badge */}
      {currentTask.is_gold_standard && (
        <View className="mx-5 mb-3 flex-row items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 dark:bg-amber-900/20 dark:border-amber-700">
          <Text>⭐</Text>
          <Text className="text-amber-700 dark:text-amber-400 text-sm font-medium">
            Quality Check — answer carefully for a bonus!
          </Text>
        </View>
      )}

      {/* SDUI rendered task */}
      <View className="flex-1">
        <DynamicRenderer schema={currentTask.ui_schema} onComplete={handleTaskComplete} />
      </View>

      {/* Overlay feedback */}
      {overlay && (
        <Animated.View
          style={{ opacity: overlayOpacity }}
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="rounded-3xl px-10 py-8 items-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            {overlay === 'xp' && (
              <>
                <Text className="text-5xl">⚡</Text>
                <Text className="text-white font-bold text-2xl mt-2">
                  +{tasks[currentIndex - 1]?.xp_reward ?? 10} XP
                </Text>
              </>
            )}
            {overlay === 'gold_correct' && (
              <>
                <Text className="text-5xl">🌟</Text>
                <Text className="text-white font-bold text-2xl mt-2">Accuracy Bonus!</Text>
                <Text className="text-amber-300 text-sm mt-1">Gold standard correct</Text>
              </>
            )}
            {overlay === 'streak_bonus' && (
              <>
                <Text className="text-5xl">🔥</Text>
                <Text className="text-white font-bold text-2xl mt-2">Streak Bonus!</Text>
                <Text className="text-orange-300 text-sm mt-1">{sessionTaskCount} tasks done!</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
