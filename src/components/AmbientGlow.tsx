import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const AmbientGlow = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0], // Move up into the status bar, then back to baseline, never down
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1], // Breathing glow effect
  });

  return (
    <AnimatedLinearGradient
      colors={['rgba(202, 255, 0, 0.15)', 'transparent']}
      style={[
        { position: 'absolute', top: -100, left: 0, right: 0, height: 450 },
        { transform: [{ translateY }], opacity }
      ]}
      pointerEvents="none"
    />
  );
};
