import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import type { SDUIAction } from '@/types/sdui';

interface Props {
  prompt: string;
  content_data: string;
  actions: SDUIAction[];
  onComplete: (value: string) => void;
}

export const TextCard: React.FC<Props> = ({ prompt, content_data, actions, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (action: SDUIAction) => {
    if (selected) return;
    setSelected(action.value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      onComplete(action.value);
    }, 300);
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
        className="mb-8 max-h-72 rounded-2xl bg-white dark:bg-neutral-800"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
          <Text className="text-base leading-7 text-neutral-700 dark:text-neutral-300">
            {content_data}
          </Text>
        </ScrollView>
      </Animated.View>

      <View className="flex-row gap-3">
        {actions.map((action, index) => {
          const isSelected = selected === action.value;

          return (
            <Animated.View
              key={action.id}
              entering={FadeInDown.duration(300).delay(200 + index * 80)}
              className="flex-1"
            >
              <Pressable
                onPress={() => handleSelect(action)}
                disabled={selected !== null}
                className={`rounded-xl py-4 ${selected && !isSelected ? 'opacity-40' : ''}`}
                style={{ backgroundColor: isSelected ? action.color : action.color + '15' }}
              >
                <Text
                  className="text-center font-bold text-base"
                  style={{ color: isSelected ? '#fff' : action.color }}
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
