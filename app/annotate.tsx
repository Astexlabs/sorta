import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DynamicRenderer } from '@/components/sdui/DynamicRenderer';
import { BonusOverlay } from '@/components/ui/BonusOverlay';
import { api } from '@/convex/_generated/api';
import { useAppStore } from '@/store/useAppStore';

export default function ArenaScreen() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const tasks = useQuery(api.tasks.getPendingTasks);
  const submitTask = useMutation(api.tasks.submitTask);
  const { addXp, incrementSessionTasks, triggerAccuracyBonus } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [earnedThisSession, setEarnedThisSession] = useState(0);
  const taskStartTime = useRef(Date.now());

  const handleTaskComplete = useCallback(
    async (selectedValue: string) => {
      if (!tasks || currentIndex >= tasks.length) return;

      const currentTask = tasks[currentIndex];
      const timeTaken = Date.now() - taskStartTime.current;

      // Optimistic updates
      addXp(currentTask.xp_reward);
      incrementSessionTasks();
      setEarnedThisSession((prev) => prev + currentTask.xp_reward);
      setCurrentIndex((prev) => prev + 1);
      taskStartTime.current = Date.now();

      // Background mutation
      try {
        const result = await submitTask({
          taskId: currentTask._id as any,
          selectedValue,
          timeTakenMs: timeTaken,
        });

        if (result.is_gold && result.correct) {
          triggerAccuracyBonus();
        }
      } catch {
        // Submission failed silently - data will reconcile on next fetch
      }
    },
    [tasks, currentIndex, submitTask, addXp, incrementSessionTasks, triggerAccuracyBonus]
  );

  if (!isSignedIn) {
    return null;
  }

  if (tasks === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-neutral-500">Loading tasks...</Text>
      </SafeAreaView>
    );
  }

  const isComplete = !tasks || tasks.length === 0 || currentIndex >= tasks.length;

  if (isComplete) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-950">
        <Animated.View entering={FadeIn.duration(400)} className="items-center">
          <Text className="mb-2 text-6xl">🎉</Text>
          <Text className="mb-2 font-bold text-2xl text-neutral-800 dark:text-white">
            All Done!
          </Text>
          <Text className="mb-2 text-center text-neutral-500 dark:text-neutral-400">
            You completed {currentIndex} tasks this session
          </Text>
          <Text className="mb-8 font-semibold text-lg text-blue-600">
            +{earnedThisSession} XP earned
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl bg-blue-600 px-8 py-4"
          >
            <Text className="font-bold text-base text-white">Back to Dashboard</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Progress header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="font-semibold text-base text-blue-600">← Exit</Text>
        </Pressable>
        <Text className="font-semibold text-sm text-neutral-500">
          {currentIndex + 1} / {tasks.length}
        </Text>
        <Text className="font-bold text-sm text-green-600">+{earnedThisSession} XP</Text>
      </View>

      {/* Progress bar */}
      <View className="mx-5 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <View
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${((currentIndex + 1) / tasks.length) * 100}%` }}
        />
      </View>

      {/* Task renderer */}
      <Animated.View key={currentTask._id} entering={FadeInRight.duration(250)} className="flex-1">
        <DynamicRenderer schema={currentTask.ui_schema} onComplete={handleTaskComplete} />
      </Animated.View>

      <BonusOverlay />
    </SafeAreaView>
  );
}
