import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { MultipleChoiceProps } from '@/types/sdui';

const SURFACE = '#111111';
const BORDER = '#1f1f1f';
const TEXT = '#f5f5f5';
const MUTED = '#555558';

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
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Prompt */}
      <Text style={{ color: MUTED, fontSize: 13, fontWeight: '500', letterSpacing: 0.3, textAlign: 'center', marginBottom: 16, marginTop: 4 }}>
        {prompt}
      </Text>

      {/* Content card */}
      <View style={{ backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 20, padding: 22, marginBottom: 24 }}>
        <Text style={{ color: TEXT, fontSize: 18, lineHeight: 30, textAlign: 'center', fontWeight: '500' }}>
          {content_data}
        </Text>
      </View>

      {/* Options */}
      <View style={{ gap: 10, marginBottom: 24 }}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={({ pressed }) => ({
                borderWidth: 1.5,
                borderColor: isSelected ? option.color : BORDER,
                borderRadius: 14,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isSelected ? `${option.color}12` : SURFACE,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{
                width: 20, height: 20, borderRadius: 10,
                borderWidth: 2, borderColor: isSelected ? option.color : '#333',
                alignItems: 'center', justifyContent: 'center', marginRight: 14,
              }}>
                {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: option.color }} />}
              </View>
              <Text style={{ color: isSelected ? TEXT : '#666', fontWeight: isSelected ? '600' : '400', fontSize: 14, flex: 1 }}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: option.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleSubmit}
        disabled={!selected}
        style={({ pressed }) => ({
          backgroundColor: selected ? '#6366f1' : '#1a1a1a',
          borderRadius: 14, paddingVertical: 16, alignItems: 'center',
          borderWidth: selected ? 0 : 1, borderColor: BORDER,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: selected ? 'white' : MUTED, fontWeight: '600', fontSize: 15 }}>
          Submit answer
        </Text>
      </Pressable>
    </ScrollView>
  );
};
