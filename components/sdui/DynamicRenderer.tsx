import React from 'react';
import { Text, View } from 'react-native';

import type { SDUISchema } from '@/types/sdui';
import { MultipleChoice } from './MultipleChoice';
import { SwipeCard } from './SwipeCard';
import { TextCard } from './TextCard';

interface Props {
  schema: SDUISchema;
  onComplete: (selectedValue: string) => void;
}

const ComponentRegistry: Record<string, React.FC<any>> = {
  SwipeCard,
  MultipleChoice,
  TextCard,
};

export const DynamicRenderer: React.FC<Props> = ({ schema, onComplete }) => {
  const Component = ComponentRegistry[schema.layout];

  if (!Component) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-neutral-500">
          Unsupported component: {schema.layout}
        </Text>
      </View>
    );
  }

  return (
    <Component
      prompt={schema.prompt}
      content_data={schema.content_data}
      content_type={schema.content_type}
      actions={schema.actions}
      onComplete={onComplete}
    />
  );
};
