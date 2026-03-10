import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DynamicRenderer } from '@/components/sdui/DynamicRenderer';
import { api } from '@/convex/_generated/api';
import { useAppStore } from '@/store/useAppStore';

const BG = '#0a0a0a';
const SURFACE = '#111111';
const BORDER = '#1f1f1f';
const ACCENT = '#6366f1';
const ACCENT2 = '#a78bfa';
const TEXT = '#f5f5f5';
const MUTED = '#555558';

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
  const overlayScale = useRef(new Animated.Value(0.85)).current;
  const taskStartTime = useRef(Date.now());

  useEffect(() => { getOrCreateUser(); }, []);
  useEffect(() => {
    if (currentUser) syncFromServer(currentUser.total_xp, currentUser.current_streak);
  }, [currentUser]);

  const showOverlay = useCallback((type: OverlayType) => {
    setOverlay(type);
    overlayOpacity.setValue(0);
    overlayScale.setValue(0.85);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(overlayScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 8 }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.delay(1000),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setOverlay(null));
  }, [overlayOpacity, overlayScale]);

  const handleTaskComplete = useCallback(async (selectedValue: string) => {
    if (!tasks || currentIndex >= tasks.length) return;
    const task = tasks[currentIndex];
    const timeTakenMs = Date.now() - taskStartTime.current;

    addXp(task.xp_reward);
    incrementSessionCount();
    setCurrentIndex((prev) => prev + 1);
    taskStartTime.current = Date.now();

    const newCount = sessionTaskCount + 1;
    showOverlay(newCount > 0 && newCount % 10 === 0 ? 'streak_bonus' : 'xp');

    try {
      const result = await submitTask({ taskId: task._id as any, selectedValue, timeTakenMs });
      if (result.isGoldStandard && result.isCorrect) showOverlay('gold_correct');
      if (result.earnedXp !== task.xp_reward) addXp(result.earnedXp - task.xp_reward);
    } catch { /* optimistic — silent */ }
  }, [tasks, currentIndex, sessionTaskCount, addXp, incrementSessionCount, showOverlay, submitTask]);

  const isLoading = tasks === undefined || currentUser === undefined;
  const isDone = !isLoading && (!tasks || currentIndex >= tasks.length);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: MUTED, fontSize: 14 }}>Loading tasks…</Text>
      </SafeAreaView>
    );
  }

  if (isDone) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: `${ACCENT}18`, alignItems: 'center', justifyContent: 'center', marginBottom: 28, borderWidth: 1, borderColor: `${ACCENT}30` }}>
          <Text style={{ fontSize: 36 }}>✓</Text>
        </View>
        <Text style={{ color: TEXT, fontSize: 24, fontWeight: '700', marginBottom: 10, textAlign: 'center' }}>
          Session complete
        </Text>
        <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 40 }}>
          You finished {sessionTaskCount} task{sessionTaskCount !== 1 ? 's' : ''} and earned{' '}
          <Text style={{ color: ACCENT2 }}>{xp} XP</Text> total.
        </Text>
        <Pressable
          onPress={() => { setCurrentIndex(0); router.back(); }}
          style={{ backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>Back to home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentIndex];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} style={{ paddingVertical: 6, paddingRight: 12 }}>
          <Text style={{ color: MUTED, fontSize: 22 }}>←</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ fontSize: 13 }}>⚡</Text>
            <Text style={{ color: ACCENT2, fontWeight: '600', fontSize: 13 }}>{xp}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ fontSize: 13 }}>🔥</Text>
            <Text style={{ color: '#f97316', fontWeight: '600', fontSize: 13 }}>{streak}</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ marginHorizontal: 20, marginBottom: 8 }}>
        <View style={{ height: 2, backgroundColor: BORDER, borderRadius: 2 }}>
          <View style={{
            height: 2,
            width: `${Math.min(100, (currentIndex / Math.max(tasks.length, 1)) * 100)}%`,
            backgroundColor: ACCENT,
            borderRadius: 2,
          }} />
        </View>
        <Text style={{ color: MUTED, fontSize: 11, marginTop: 5 }}>
          {currentIndex} / {tasks.length}
        </Text>
      </View>

      {/* Gold standard hint */}
      {currentTask.is_gold_standard && (
        <View style={{ marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1a150a', borderWidth: 1, borderColor: '#3d2c0a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ fontSize: 14 }}>⭐</Text>
          <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '500' }}>Quality check — answer carefully for a bonus</Text>
        </View>
      )}

      {/* SDUI task */}
      <View style={{ flex: 1 }}>
        <DynamicRenderer schema={currentTask.ui_schema} onComplete={handleTaskComplete} />
      </View>

      {/* Overlay */}
      {overlay && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center',
            opacity: overlayOpacity,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: 'rgba(10,10,10,0.92)', borderRadius: 24, paddingHorizontal: 36, paddingVertical: 28,
              alignItems: 'center', borderWidth: 1, borderColor: BORDER,
              transform: [{ scale: overlayScale }],
            }}
          >
            {overlay === 'xp' && (
              <>
                <Text style={{ fontSize: 40, marginBottom: 6 }}>⚡</Text>
                <Text style={{ color: ACCENT2, fontWeight: '700', fontSize: 26 }}>
                  +{tasks[currentIndex - 1]?.xp_reward ?? 10}
                </Text>
                <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>XP earned</Text>
              </>
            )}
            {overlay === 'gold_correct' && (
              <>
                <Text style={{ fontSize: 40, marginBottom: 6 }}>🌟</Text>
                <Text style={{ color: '#f59e0b', fontWeight: '700', fontSize: 22 }}>Accuracy Bonus!</Text>
                <Text style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Quality check passed</Text>
              </>
            )}
            {overlay === 'streak_bonus' && (
              <>
                <Text style={{ fontSize: 40, marginBottom: 6 }}>🔥</Text>
                <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 22 }}>Streak Bonus!</Text>
                <Text style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{sessionTaskCount} tasks in this session</Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
