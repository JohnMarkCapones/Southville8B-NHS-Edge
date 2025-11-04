import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { PaginationDots } from '@/components/onboarding/PaginationDots';

interface OnboardingData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: ImageSourcePropType;
  circleConfig?: {
    left?: boolean;
    center?: boolean;
    right?: boolean;
    rightCount?: number;
    leftCount?: number;
    topLeft?: boolean;
    topRight?: boolean;
    bottomLeft?: boolean;
    bottomRight?: boolean;
  };
}

const onboardingData: OnboardingData[] = [
  {
    id: '1',
    title: 'Southville 8B NHS Edge',
    subtitle: 'Welcome to Edge',
    description: 'Your School Portal is now in your\npocket, Education merges\ntechnology Edge',
    image: require('@/assets/onboarding/slide-1.png'),
    circleConfig: {
      left: true,
      center: true,
      right: true,
      rightCount: 1,
      topLeft: true,
    },
  },
  {
    id: '2',
    title: 'Access the portal anywhere',
    description: 'Now you can access view grades, schedule, and announcement anywhere, anytime!',
    image: require('@/assets/onboarding/slide-2.png'),
    circleConfig: {
      left: false,
      center: true,
      right: true,
      rightCount: 1,
      bottomRight: true,
    },
  },
  {
    id: '3',
    title: 'Event Notification Real-time',
    description: 'Stay on top of school events with real-time notifications. Participate and be successful!',
    image: require('@/assets/onboarding/slide-3.png'),
    circleConfig: {
      left: true,
      center: true,
      right: true,
      rightCount: 2,
      topRight: true,
      bottomLeft: true,
    },
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const renderSlide = ({ item, index }: { item: OnboardingData; index: number }) => (
    <OnboardingSlide
      title={item.title}
      subtitle={item.subtitle}
      description={item.description}
      image={item.image}
      isActive={index === currentIndex}
      circleConfig={item.circleConfig}
    />
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* FlatList for slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {/* Navigation Buttons */}
        <View style={
          currentIndex === 0 ? styles.buttonContainerRight : 
          currentIndex === 2 ? styles.buttonContainerCenter : 
          styles.buttonContainer
        }>
          {/* Back Button */}
          {currentIndex > 0 && currentIndex < 2 && (
            <TouchableOpacity style={styles.navButtonLeft} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Next/Get Started Button */}
          {currentIndex < onboardingData.length - 1 ? (
            <TouchableOpacity style={currentIndex === 0 ? styles.navButtonRight : styles.navButtonRight} onPress={handleNext}>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <PaginationDots totalDots={onboardingData.length} activeIndex={currentIndex} />
        </View>
      </View>

      {/* Copyright */}
      <View style={styles.footer}>
        <Text style={styles.copyright}>All Rights Reserve 2025</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  navigationContainer: {
    paddingBottom: 20,
    gap: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  buttonContainerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  buttonContainerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  paginationContainer: {
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonLeft: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonRight: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getStartedButton: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    minWidth: 200,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
