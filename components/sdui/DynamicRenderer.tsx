import React from 'react';
import { Text, View } from 'react-native';

import { SDUISchema } from '@/types/sdui';
import { MultipleChoice } from './MultipleChoice';
import { SwipeCard } from './SwipeCard';

interface Props {
  schema: SDUISchema;
  onComplete: (value: string) => void;
}

const ComponentRegistry: Record<string, React.FC<any>> = {
  SwipeCard,
  MultipleChoice,
};

export const DynamicRenderer: React.FC<Props> = ({ schema, onComplete }) => {
  const Component = ComponentRegistry[schema.component];

  if (!Component) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Unsupported component: {schema.component}</Text>
      </View>
    );
  }

  return <Component {...schema.props} onComplete={onComplete} />;
};
