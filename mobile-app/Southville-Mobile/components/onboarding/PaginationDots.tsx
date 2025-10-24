import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PaginationDotsProps {
  totalDots: number;
  activeIndex: number;
}

export function PaginationDots({ totalDots, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalDots }, (_, index) => {
        const isActive = index === activeIndex;
        
        const animatedStyle = useAnimatedStyle(() => {
          return {
            width: withTiming(isActive ? 12 : 8, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            }),
            height: withTiming(isActive ? 12 : 8, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            }),
            backgroundColor: withTiming(
              isActive ? '#2196F3' : '#E0E0E0',
              {
                duration: 300,
                easing: Easing.out(Easing.ease),
              }
            ),
          };
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, animatedStyle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 6,
  },
});
