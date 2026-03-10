import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { SDUIAction } from '@/types/sdui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

interface Props {
  prompt: string;
  content_data: string;
  actions: SDUIAction[];
  onComplete: (value: string) => void;
}

export const SwipeCard: React.FC<Props> = ({ prompt, content_data, actions, onComplete }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const leftAction = actions.find((a) => a.gesture === 'swipe_left') ?? actions[0];
  const rightAction = actions.find((a) => a.gesture === 'swipe_right') ?? actions[1];

  const handleSwipe = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onComplete(value);
    },
    [onComplete]
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleSwipe)(rightAction.value);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleSwipe)(leftAction.value);
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15])}deg` },
    ],
    opacity: opacity.value,
  }));

  const leftOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [leftAction.color + '15', '#00000000', rightAction.color + '15']
    ),
  }));

  return (
    <Animated.View className="flex-1 items-center justify-center px-5" style={backgroundStyle}>
      <Text className="mb-6 px-4 text-center font-semibold text-lg text-neutral-800 dark:text-neutral-200">
        {prompt}
      </Text>

      <GestureDetector gesture={pan}>
        <Animated.View
          className="relative h-96 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 dark:bg-neutral-800"
          style={[
            cardStyle,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            },
          ]}
        >
          {/* Left swipe overlay */}
          <Animated.View
            className="absolute inset-0 items-center justify-center rounded-2xl"
            style={[leftOverlayStyle, { backgroundColor: leftAction.color + '20' }]}
          >
            <View
              className="rounded-lg px-4 py-2"
              style={{ backgroundColor: leftAction.color }}
            >
              <Text className="font-bold text-lg text-white">{leftAction.label}</Text>
            </View>
          </Animated.View>

          {/* Right swipe overlay */}
          <Animated.View
            className="absolute inset-0 items-center justify-center rounded-2xl"
            style={[rightOverlayStyle, { backgroundColor: rightAction.color + '20' }]}
          >
            <View
              className="rounded-lg px-4 py-2"
              style={{ backgroundColor: rightAction.color }}
            >
              <Text className="font-bold text-lg text-white">{rightAction.label}</Text>
            </View>
          </Animated.View>

          {/* Content */}
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-xl leading-8 text-neutral-700 dark:text-neutral-300">
              {content_data}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Action hints */}
      <View className="mt-6 w-full max-w-sm flex-row justify-between px-4">
        <View className="flex-row items-center">
          <Text className="mr-1 text-lg">←</Text>
          <Text style={{ color: leftAction.color }} className="font-semibold text-sm">
            {leftAction.label}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text style={{ color: rightAction.color }} className="font-semibold text-sm">
            {rightAction.label}
          </Text>
          <Text className="ml-1 text-lg">→</Text>
        </View>
      </View>
    </Animated.View>
  );
};
