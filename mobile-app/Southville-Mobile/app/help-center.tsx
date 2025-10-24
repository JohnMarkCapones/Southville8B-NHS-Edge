import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface PopularQuestion {
  id: string;
  question: string;
  answer: string;
}

export default function HelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const animatedStyle = useAnimatedStyle(() => {
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

  const handleBack = () => {
    router.back();
  };

  const handleGettingStarted = () => {
    // Navigate to getting started guide
    console.log('Navigate to Getting Started');
  };

  const handleCategoryPress = (category: HelpCategory) => {
    // Navigate to category details
    console.log('Navigate to category:', category.title);
  };

  const handleQuestionPress = (question: PopularQuestion) => {
    // Show question details
    console.log('Show question details:', question.question);
  };

  const categories: HelpCategory[] = [
    {
      id: '1',
      title: 'Student & Faculty Accounts',
      description: 'Explore how to setup your account navigate and maximize',
      icon: 'person-outline',
      color: '#2196F3',
    },
    {
      id: '2',
      title: 'Schedule & Calendar',
      description: 'School events, class schedules, examination dates, holiday notices',
      icon: 'calendar-outline',
      color: '#4CAF50',
    },
    {
      id: '3',
      title: 'Grades & Report Cards',
      description: 'Viewing, downloading, and interpreting grades, report generation, grading policies',
      icon: 'document-text-outline',
      color: '#FF9800',
    },
    {
      id: '4',
      title: 'Privacy & Security',
      description: 'Data privacy, account security, authentication, user rights',
      icon: 'lock-closed-outline',
      color: '#F44336',
    },
  ];

  const popularQuestions: PopularQuestion[] = [
    {
      id: '1',
      question: 'I forgot my password. How can I reset it?',
      answer: 'Click on the "Forgot Password" link on the login page and follow the instructions to reset your password via your registered email.',
    },
    {
      id: '2',
      question: 'Where can I view my grades?',
      answer: 'Grades can be viewed in the "Grades" tab after each grading period is finalized. You can also filter by quarter and school year.',
    },
    {
      id: '3',
      question: 'How do I check my class schedule?',
      answer: 'Navigate to the "Schedule" tab to view your weekly class schedule. The schedule shows real-time dates and upcoming classes.',
    },
    {
      id: '4',
      question: 'Where can I see school announcements?',
      answer: 'All school announcements are displayed on the home screen. Check the announcements section for the latest updates.',
    },
    {
      id: '5',
      question: 'How do I update my profile information?',
      answer: 'Go to the "Profile" tab to view and update your personal information, contact details, and student information.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Circles */}
      <Animated.View style={[styles.circleBackgroundLeft, animatedStyle]} />
      <Animated.View style={[styles.circleBackgroundCenter, animatedStyle]} />
      <Animated.View style={[styles.circleBackgroundRight, animatedStyle]} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Help</Text>
          <Text style={styles.headerTitleAccent}>Center</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>How can we help you?</Text>
            <Text style={styles.greetingSubtitle}>We are happy to help you anytime.</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help"
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          </View>

          {/* Getting Started Card */}
          <TouchableOpacity style={styles.gettingStartedCard} onPress={handleGettingStarted}>
            <View style={styles.gettingStartedContent}>
              <Text style={styles.gettingStartedTitle}>Getting Started</Text>
              <Text style={styles.gettingStartedDescription}>
                Learn how to log in, navigate, and utilize key features of the Edge platform to enhance your academic performance.
              </Text>
            </View>
            <View style={styles.gettingStartedImage}>
              <Ionicons name="school-outline" size={60} color="#2196F3" />
            </View>
          </TouchableOpacity>

          {/* Browse Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category)}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999999" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular Questions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionsScroll}>
              {popularQuestions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  style={styles.questionCard}
                  onPress={() => handleQuestionPress(question)}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>{question.question}</Text>
                  </View>
                  <Text style={styles.questionAnswer} numberOfLines={3}>
                    {question.answer}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Contact Support */}
          <View style={styles.contactSection}>
            <View style={styles.contactCard}>
              <Ionicons name="headset-outline" size={32} color="#2196F3" />
              <Text style={styles.contactTitle}>Still need help?</Text>
              <Text style={styles.contactDescription}>
                Contact our support team for personalized assistance
              </Text>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  circleBackgroundLeft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
    top: screenHeight * 0.1,
    left: screenWidth * 0.01 - 75,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  circleBackgroundCenter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    opacity: 0.2,
    top: screenHeight * 0.15,
    left: screenWidth * 0.5 - 100,
  },
  circleBackgroundRight: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
    top: screenHeight * 0.12,
    right: screenWidth * 0.05 - 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerTitleAccent: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greetingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  gettingStartedCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gettingStartedContent: {
    flex: 1,
    marginRight: 16,
  },
  gettingStartedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  gettingStartedDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  gettingStartedImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  questionsScroll: {
    marginTop: 8,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: screenWidth * 0.8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionAnswer: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  contactSection: {
    marginTop: 20,
  },
  contactCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
