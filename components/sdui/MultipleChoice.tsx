import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MultipleChoiceProps } from '@/types/sdui';

interface Props extends MultipleChoiceProps {
  onComplete: (value: string) => void;
}

export const MultipleChoice: React.FC<Props> = ({ prompt, content_data, options, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    Haptics.selectionAsync();
  };

  const handleSubmit = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(selected);
  };

  return (
    <View className="flex-1 px-5 pt-6">
      <Text className="mb-4 text-center font-semibold text-lg text-neutral-800 dark:text-neutral-100">
        {prompt}
      </Text>

      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
        <Text className="text-center font-medium text-xl leading-relaxed text-neutral-900 dark:text-white">
          {content_data}
        </Text>
      </View>

      <View className="gap-3">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              className="rounded-xl border-2 p-4"
              style={{
                borderColor: isSelected ? option.color : '#e5e7eb',
                backgroundColor: isSelected ? `${option.color}18` : 'white',
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-5 w-5 rounded-full border-2 items-center justify-center"
                  style={{ borderColor: isSelected ? option.color : '#d1d5db' }}
                >
                  {isSelected && (
                    <View
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </View>
                <Text
                  className="font-medium text-base"
                  style={{ color: isSelected ? option.color : '#374151' }}
                >
                  {option.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!selected}
        className="mt-6 rounded-xl py-4 items-center"
        style={{
          backgroundColor: selected ? '#2563eb' : '#e5e7eb',
        }}
      >
        <Text
          className="font-semibold text-base"
          style={{ color: selected ? 'white' : '#9ca3af' }}
        >
          Submit Answer
        </Text>
      </Pressable>
    </View>
  );
};
