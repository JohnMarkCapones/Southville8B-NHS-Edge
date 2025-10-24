import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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

export default function PrivacyPolicyScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <Text style={styles.title}>Southville 8B NHS Edge</Text>
          <Text style={styles.subtitle}>Privacy Policy</Text>
          
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:
            </Text>
            <Text style={styles.bulletPoint}>• Student identification information (name, student ID, LRN)</Text>
            <Text style={styles.bulletPoint}>• Contact information (email address, phone number)</Text>
            <Text style={styles.bulletPoint}>• Academic records (grades, schedules, attendance)</Text>
            <Text style={styles.bulletPoint}>• Device information and usage data</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve our educational services</Text>
            <Text style={styles.bulletPoint}>• Process and maintain academic records</Text>
            <Text style={styles.bulletPoint}>• Send important announcements and notifications</Text>
            <Text style={styles.bulletPoint}>• Ensure the security and integrity of our platform</Text>
            <Text style={styles.bulletPoint}>• Comply with legal and regulatory requirements</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </Text>
            <Text style={styles.bulletPoint}>• With school administrators and authorized teachers</Text>
            <Text style={styles.bulletPoint}>• When required by law or legal process</Text>
            <Text style={styles.bulletPoint}>• To protect the rights, property, or safety of our school community</Text>
            <Text style={styles.bulletPoint}>• With service providers who assist in operating our platform</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </Text>
            <Text style={styles.bulletPoint}>• Encryption of sensitive data in transit and at rest</Text>
            <Text style={styles.bulletPoint}>• Regular security assessments and updates</Text>
            <Text style={styles.bulletPoint}>• Access controls and authentication systems</Text>
            <Text style={styles.bulletPoint}>• Staff training on data protection practices</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Student Privacy Rights</Text>
            <Text style={styles.sectionText}>
              Students and parents have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access their personal information</Text>
            <Text style={styles.bulletPoint}>• Request correction of inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Request deletion of personal information (subject to legal requirements)</Text>
            <Text style={styles.bulletPoint}>• Opt-out of non-essential communications</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, comply with legal obligations, resolve disputes, and enforce our agreements. Academic records are typically retained according to educational regulations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our app is designed for educational use by students. We are committed to protecting the privacy of children and comply with applicable children's privacy laws. We obtain appropriate consent from parents or guardians when required.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
            <Text style={styles.sectionText}>
              Our app may integrate with third-party services for educational purposes. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy in the app and updating the "Last updated" date. Your continued use of the app after such changes constitutes acceptance of the updated policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </Text>
            <Text style={styles.contactText}>Southville 8B National High School</Text>
            <Text style={styles.contactText}>Rodriguez, Rizal</Text>
            <Text style={styles.contactText}>Email: privacy@southville8b.edu.ph</Text>
            <Text style={styles.contactText}>Phone: (02) 1234-5678</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This Privacy Policy is designed to protect the privacy of our students and school community while enabling effective educational services.
            </Text>
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
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
    top: screenHeight * 0.1,
    left: screenWidth * 0.01 - 100,
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E3F2FD',
    opacity: 0.2,
    top: screenHeight * 0.2,
    left: screenWidth * 0.5 - 150,
  },
  circleBackgroundRight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
    top: screenHeight * 0.15,
    right: screenWidth * 0.05 - 60,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 4,
  },
  footer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
