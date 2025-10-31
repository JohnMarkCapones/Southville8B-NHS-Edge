import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  subtitle?: string;
  description: string;
  image: ImageSourcePropType;
  isActive: boolean;
  circleConfig?: {
    left?: boolean;
    center?: boolean;
    right?: boolean;
    rightCount?: number;
    leftCount?: number; // For multiple left circles
    topLeft?: boolean; // Additional positioning options
    topRight?: boolean;
    bottomLeft?: boolean;
    bottomRight?: boolean;
  };
}

export function OnboardingSlide({
  title,
  subtitle,
  description,
  image,
  isActive,
  circleConfig = { left: true, center: true, right: true, rightCount: 1 },
}: OnboardingSlideProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        {
          scale: withTiming(isActive ? 1 : 0.8, {
            duration: 600,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  const circleBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 0.6 : 0, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        {
          scale: withTiming(isActive ? 1 : 0.8, {
            duration: 600,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Title at the top */}
      <View style={styles.titleContainer}>
        {title.includes('Edge') ? (
          <View style={styles.splitTitleContainer}>
            <Text style={styles.title}>{title.replace(' Edge', '')}</Text>
            <Text style={styles.titleAccent}> Edge</Text>
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      {/* Light blue circular backgrounds */}
      {circleConfig.left && (
        <>
          <Animated.View style={[
            circleConfig.leftCount === 2 ? styles.circleBackgroundLeftTransparent : styles.circleBackgroundLeft, 
            circleBackgroundStyle
          ]} />
          {circleConfig.leftCount === 2 && (
            <Animated.View style={[styles.circleBackgroundLeft2Transparent, circleBackgroundStyle]} />
          )}
        </>
      )}
      {circleConfig.center && (
        <Animated.View style={[styles.circleBackgroundCenter, circleBackgroundStyle]} />
      )}
      {circleConfig.right && (
        <>
          <Animated.View style={[
            circleConfig.rightCount === 2 ? styles.circleBackgroundRightTransparent : styles.circleBackgroundRight, 
            circleBackgroundStyle
          ]} />
          {circleConfig.rightCount === 2 && (
            <Animated.View style={[styles.circleBackgroundRight2Transparent, circleBackgroundStyle]} />
          )}
        </>
      )}
      {circleConfig.topLeft && (
        <Animated.View style={[styles.circleBackgroundTopLeft, circleBackgroundStyle]} />
      )}
      {circleConfig.topRight && (
        <Animated.View style={[styles.circleBackgroundTopRight, circleBackgroundStyle]} />
      )}
      {circleConfig.bottomLeft && (
        <Animated.View style={[styles.circleBackgroundBottomLeft, circleBackgroundStyle]} />
      )}
      {circleConfig.bottomRight && (
        <Animated.View style={[styles.circleBackgroundBottomRight, circleBackgroundStyle]} />
      )}
      
      {/* Illustration */}
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </Animated.View>

      {/* Subtitle and Description at the bottom */}
      <View style={styles.content}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  splitTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackgroundLeft: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    // Position on the left side, slightly upper
    top: screenHeight * 0.2,
    left: screenWidth * 0.01 - 100,
    // Add shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  circleBackgroundCenter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Center it behind the illustration
    top: screenHeight * 0.3,
    left: screenWidth * 0.5 - 150,
  },
  circleBackgroundRight: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 75,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position on the right side, slightly upper
    top: screenHeight * 0.3,
    right: screenWidth * 0.10 - 75,
    // Add shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  circleBackgroundRight2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    // Position second right circle below the first
    top: screenHeight * 0.4,
    right: screenWidth * 0.15 - 30,
    // Add shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  circleBackgroundRightTransparent: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 75,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position on the right side, slightly upper
    top: screenHeight * 0.3,
    right: screenWidth * 0.10 - 75,
  },
  circleBackgroundRight2Transparent: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position second right circle below the first
    top: screenHeight * 0.3,
    right: screenWidth * 0.10 - 30,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    zIndex: 1,
  },
  image: {
    width: screenWidth * 1,
    height: screenHeight * 0.5,
    maxWidth: 600,
    maxHeight: 600,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: screenWidth * 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 16,
    lineHeight: 28,
  },
  description: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  circleBackgroundLeftTransparent: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position on the left side, slightly upper
    top: screenHeight * 0.2,
    left: screenWidth * 0.01 - 100,
  },
  circleBackgroundLeft2Transparent: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position second left circle below the first
    top: screenHeight * 0.4,
    left: screenWidth * 0.05 - 60,
  },
  circleBackgroundTopLeft: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position at top left
    top: screenHeight * 0.1,
    left: screenWidth * 0.05 - 45,
  },
  circleBackgroundTopRight: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position at top right
    top: screenHeight * 0.1,
    right: screenWidth * 0.05 - 40,
  },
  circleBackgroundBottomLeft: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position at bottom left
    bottom: screenHeight * 0.2,
    left: screenWidth * 0.05 - 35,
  },
  circleBackgroundBottomRight: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
    // Position at bottom right
    bottom: screenHeight * 0.2,
    right: screenWidth * 0.05 - 35,
  },
});
