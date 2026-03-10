import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SwipeCardProps } from '@/types/sdui';

const { width: W } = Dimensions.get('window');
const THRESHOLD = W * 0.28;

const BG = '#0a0a0a';
const SURFACE = '#111111';
const BORDER = '#1f1f1f';
const TEXT = '#f5f5f5';
const MUTED = '#555558';

interface Props extends SwipeCardProps {
  onComplete: (value: string) => void;
}

export const SwipeCard: React.FC<Props> = ({ prompt, content_data, actions, onComplete }) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  function haptic() { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.12; // subtle tilt on Y
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD) {
        tx.value = withSpring(W * 1.6, { damping: 20 });
        runOnJS(haptic)();
        runOnJS(onComplete)(actions.swipe_right.value);
      } else if (e.translationX < -THRESHOLD) {
        tx.value = withSpring(-W * 1.6, { damping: 20 });
        runOnJS(haptic)();
        runOnJS(onComplete)(actions.swipe_left.value);
      } else {
        tx.value = withSpring(0, { damping: 18 });
        ty.value = withSpring(0, { damping: 18 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-W * 0.5, 0, W * 0.5], [-12, 0, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));

  const leftOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-THRESHOLD, -24, 0], [1, 0.4, 0], Extrapolation.CLAMP),
  }));

  const rightOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, 24, THRESHOLD], [0, 0.4, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      {/* Prompt */}
      <Text style={{ color: MUTED, fontSize: 13, fontWeight: '500', letterSpacing: 0.3, textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 }}>
        {prompt}
      </Text>

      {/* Card */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{
            width: '100%', maxWidth: 360,
            aspectRatio: 0.75,
            backgroundColor: SURFACE,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: BORDER,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
            shadowColor: '#000',
            shadowOpacity: 0.5,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
          }, cardStyle]}
        >
          {/* Left label */}
          <Animated.View
            pointerEvents="none"
            style={[{
              position: 'absolute', left: 20, top: 24,
              borderWidth: 2, borderColor: actions.swipe_left.color,
              borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
              transform: [{ rotate: '-15deg' }],
            }, leftOpacity]}
          >
            <Text style={{ color: actions.swipe_left.color, fontWeight: '800', fontSize: 14, letterSpacing: 1 }}>
              {actions.swipe_left.label.toUpperCase()}
            </Text>
          </Animated.View>

          {/* Right label */}
          <Animated.View
            pointerEvents="none"
            style={[{
              position: 'absolute', right: 20, top: 24,
              borderWidth: 2, borderColor: actions.swipe_right.color,
              borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
              transform: [{ rotate: '15deg' }],
            }, rightOpacity]}
          >
            <Text style={{ color: actions.swipe_right.color, fontWeight: '800', fontSize: 14, letterSpacing: 1 }}>
              {actions.swipe_right.label.toUpperCase()}
            </Text>
          </Animated.View>

          {/* Content */}
          <Text style={{ color: TEXT, fontSize: 20, textAlign: 'center', lineHeight: 32, fontWeight: '500' }}>
            {content_data}
          </Text>
        </Animated.View>
      </GestureDetector>

      {/* Hint bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 360, marginTop: 28, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${actions.swipe_left.color}20`, borderWidth: 1, borderColor: `${actions.swipe_left.color}40`, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: actions.swipe_left.color, fontSize: 13 }}>←</Text>
          </View>
          <Text style={{ color: MUTED, fontSize: 12 }}>{actions.swipe_left.label}</Text>
        </View>

        <Text style={{ color: '#222', fontSize: 11 }}>swipe to answer</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: MUTED, fontSize: 12 }}>{actions.swipe_right.label}</Text>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${actions.swipe_right.color}20`, borderWidth: 1, borderColor: `${actions.swipe_right.color}40`, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: actions.swipe_right.color, fontSize: 13 }}>→</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
