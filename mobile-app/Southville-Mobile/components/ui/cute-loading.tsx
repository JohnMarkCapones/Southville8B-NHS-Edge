import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CuteLoadingProps {
  size?: number;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'notification' | 'settings' | 'heart' | 'star';
}

export function CuteLoading({ 
  size = 60, 
  color = '#1976D2', 
  icon,
  variant = 'default'
}: CuteLoadingProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Get icon based on variant if not specified
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'notification': return 'notifications';
      case 'settings': return 'settings';
      case 'heart': return 'heart';
      case 'star': return 'star';
      default: return 'heart';
    }
  };

  useEffect(() => {
    // Bouncing animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    bounceAnimation.start();
    rotateAnimation.start();

    return () => {
      bounceAnimation.stop();
      rotateAnimation.stop();
    };
  }, [bounceAnim, rotateAnim]);

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotateTransform = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { translateY: bounceTransform },
              { rotate: rotateTransform },
            ],
          },
        ]}
      >
        <Ionicons name={getIcon()} size={size} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
