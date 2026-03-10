import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import type { SDUIAction } from '@/types/sdui';

interface Props {
  prompt: string;
  content_data: string;
  actions: SDUIAction[];
  onComplete: (value: string) => void;
}

export const MultipleChoice: React.FC<Props> = ({ prompt, content_data, actions, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (action: SDUIAction) => {
    if (selected) return;
    setSelected(action.value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Brief delay for visual feedback before completing
    setTimeout(() => {
      onComplete(action.value);
    }, 400);
  };

  return (
    <View className="flex-1 justify-center px-5">
      <Animated.Text
        entering={FadeIn.duration(300)}
        className="mb-4 text-center font-semibold text-lg text-neutral-800 dark:text-neutral-200"
      >
        {prompt}
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.duration(300).delay(100)}
        className="mb-8 rounded-2xl bg-white p-5 dark:bg-neutral-800"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text className="text-center text-lg leading-7 text-neutral-700 dark:text-neutral-300">
          {content_data}
        </Text>
      </Animated.View>

      <View className="gap-3">
        {actions.map((action, index) => {
          const isSelected = selected === action.value;

          return (
            <Animated.View key={action.id} entering={FadeInDown.duration(300).delay(200 + index * 80)}>
              <Pressable
                onPress={() => handleSelect(action)}
                disabled={selected !== null}
                className={`rounded-xl border-2 px-5 py-4 ${
                  isSelected ? 'border-transparent' : 'border-neutral-200 dark:border-neutral-700'
                } ${selected && !isSelected ? 'opacity-40' : ''}`}
                style={isSelected ? { backgroundColor: action.color + '20', borderColor: action.color } : undefined}
              >
                <Text
                  className={`text-center font-semibold text-base ${
                    isSelected ? '' : 'text-neutral-800 dark:text-neutral-200'
                  }`}
                  style={isSelected ? { color: action.color } : undefined}
                >
                  {action.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};
