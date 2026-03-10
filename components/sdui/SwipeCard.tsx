import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SwipeCardProps } from '@/types/sdui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface Props extends SwipeCardProps {
  onComplete: (value: string) => void;
}

export const SwipeCard: React.FC<Props> = ({ prompt, content_data, actions, onComplete }) => {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  function triggerHaptic() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / SCREEN_WIDTH;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        rotate.value = withSpring(0.3);
        runOnJS(triggerHaptic)();
        runOnJS(onComplete)(actions.swipe_right.value);
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        rotate.value = withSpring(-0.3);
        runOnJS(triggerHaptic)();
        runOnJS(onComplete)(actions.swipe_left.value);
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value * 15}deg` },
    ],
  }));

  const leftLabelOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -translateX.value / SWIPE_THRESHOLD)),
  }));

  const rightLabelOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD)),
  }));

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Text className="mb-6 text-center font-semibold text-lg text-neutral-800 dark:text-neutral-100">
        {prompt}
      </Text>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[animatedStyle]}
          className="h-96 w-full max-w-sm rounded-3xl bg-white p-6 shadow-lg dark:bg-neutral-800"
        >
          {/* Left label overlay */}
          <Animated.View
            style={leftLabelOpacity}
            className="absolute left-5 top-5 rounded-lg border-4 px-3 py-1"
            pointerEvents="none"
          >
            <Text
              className="font-bold text-xl"
              style={{ color: actions.swipe_left.color, borderColor: actions.swipe_left.color }}
            >
              {actions.swipe_left.label.toUpperCase()}
            </Text>
          </Animated.View>

          {/* Right label overlay */}
          <Animated.View
            style={rightLabelOpacity}
            className="absolute right-5 top-5 rounded-lg border-4 px-3 py-1"
            pointerEvents="none"
          >
            <Text
              className="font-bold text-xl"
              style={{ color: actions.swipe_right.color, borderColor: actions.swipe_right.color }}
            >
              {actions.swipe_right.label.toUpperCase()}
            </Text>
          </Animated.View>

          <View className="flex-1 items-center justify-center">
            <Text className="text-center font-medium text-2xl leading-relaxed text-neutral-900 dark:text-white">
              {content_data}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Swipe hints */}
      <View className="mt-8 flex-row items-center justify-between w-full max-w-sm px-4">
        <View className="items-center">
          <Text className="text-2xl">←</Text>
          <Text className="mt-1 font-medium text-sm" style={{ color: actions.swipe_left.color }}>
            {actions.swipe_left.label}
          </Text>
        </View>
        <Text className="text-neutral-400 text-sm">Swipe to answer</Text>
        <View className="items-center">
          <Text className="text-2xl">→</Text>
          <Text className="mt-1 font-medium text-sm" style={{ color: actions.swipe_right.color }}>
            {actions.swipe_right.label}
          </Text>
        </View>
      </View>
    </View>
  );
};
