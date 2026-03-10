import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useAppStore } from '@/store/useAppStore';

export const BonusOverlay: React.FC = () => {
  const { showBonus, lastBonusType, dismissBonus } = useAppStore();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (showBonus) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 }),
        withRepeat(withSequence(withTiming(1.05, { duration: 300 }), withTiming(1, { duration: 300 })), 2)
      );
      const timeout = setTimeout(dismissBonus, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showBonus]);

  if (!showBonus) return null;

  const config = {
    streak: { title: 'Streak Bonus!', subtitle: '10 tasks in a row!', emoji: '🔥', color: '#f59e0b' },
    accuracy: { title: 'Accuracy Bonus!', subtitle: 'Gold standard matched!', emoji: '🎯', color: '#22c55e' },
    xp: { title: 'XP Bonus!', subtitle: 'Extra points earned!', emoji: '⭐', color: '#8b5cf6' },
  };

  const c = config[lastBonusType ?? 'xp'];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      className="absolute inset-0 z-50 items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <Animated.View
        entering={SlideInUp.duration(400).springify()}
        className="items-center rounded-3xl px-10 py-8"
        style={[animatedStyle, { backgroundColor: c.color + '20' }]}
      >
        <Text className="mb-2 text-6xl">{c.emoji}</Text>
        <Text className="font-bold text-2xl" style={{ color: c.color }}>
          {c.title}
        </Text>
        <Text className="mt-1 text-neutral-600 dark:text-neutral-400">{c.subtitle}</Text>
      </Animated.View>
    </Animated.View>
  );
};
