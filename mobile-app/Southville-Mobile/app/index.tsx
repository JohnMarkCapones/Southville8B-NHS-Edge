import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useAuthSession } from '@/hooks/use-auth-session';
import { fetchCurrentUser } from '@/services/user';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { status } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if onboarding has been completed
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        
        // Simulate loading time (2-3 seconds)
        await new Promise(resolve => setTimeout(resolve, 2500));

        if (status === 'authenticated') {
          // User is already logged in - check if they need to accept policy
          try {
            const user = await fetchCurrentUser();
            
            // Check if user is a student
            if (user?.student) {
              // Check if policy has been accepted
              const flagKey = `@minor_policy_accepted_${user.id}`;
              const policyAccepted = await AsyncStorage.getItem(flagKey);
              
              if (!policyAccepted) {
                // Policy not accepted - show policy page
                router.replace('/minor-user-policy');
                return;
              }
            }
            
            // Policy accepted or not a student - go to tabs
            router.replace('/(tabs)');
          } catch (userError) {
            console.error('[SplashScreen] Error fetching user:', userError);
            // If user fetch fails, navigate to tabs
            router.replace('/(tabs)');
          }
        } else if (onboardingCompleted === 'true') {
          // Onboarding completed, go to login
          router.replace('/login');
        } else {
          // First time user, show onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Default to onboarding on error
        router.replace('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [status, router]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        {
          scale: withSequence(
            withTiming(0.8, { duration: 0 }),
            withTiming(1, {
              duration: 1000,
              easing: Easing.out(Easing.ease),
            })
          ),
        },
      ],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        {
          translateY: withTiming(0, {
            duration: 800,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      }),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image 
            source={require('@/assets/onboarding/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Title */}
        <Animated.View style={[styles.titleContainer, textAnimatedStyle]}>
          <Text style={styles.title}>Southville 8B NHS</Text>
          <Text style={styles.titleAccent}>Edge</Text>
          <Text style={styles.subtitle}>Excellence in Education</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Preparing your portal</Text>
        </Animated.View>
      </View>

      {/* Copyright */}
      <View style={styles.footer}>
        <Text style={styles.copyright}>All Rights Reserve 2023</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    maxWidth: screenWidth * 0.5,
    maxHeight: screenHeight * 0.3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  copyright: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
  },
});