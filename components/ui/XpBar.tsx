import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  current: number;
  max: number;
  level: number;
}

export const XpBar: React.FC<Props> = ({ current, max, level }) => {
  const progress = Math.min(current / max, 1);

  const barStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%` as any, { damping: 15 }),
  }));

  return (
    <View className="w-full">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
          Level {level}
        </Text>
        <Text className="text-xs text-neutral-500">
          {current} / {max} XP
        </Text>
      </View>
      <View className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <Animated.View
          className="h-full rounded-full bg-blue-500"
          style={[{ width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
};
