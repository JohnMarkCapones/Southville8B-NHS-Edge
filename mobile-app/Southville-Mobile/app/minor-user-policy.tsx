import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function MinorUserPolicyScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useCurrentUser();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!agreed || !user?.id) return;

    setIsSubmitting(true);
    try {
      // Save acceptance flag
      const flagKey = `@minor_policy_accepted_${user.id}`;
      await AsyncStorage.setItem(flagKey, 'true');
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving policy acceptance:', error);
      // Still navigate even if saving fails
      router.replace('/(tabs)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            🧾 Minor User Policy
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Southville 8B NHS Edge
          </Text>
        </View>

        {/* Policy Content */}
        <View style={styles.content}>
          {/* Section 1: Purpose */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>1.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Purpose</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                This Minor User Policy outlines the data handling practices, parental consent requirements, and safety commitments of Southville 8B NHS Edge for users below 18 years old ("Minor Users").
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                The policy ensures compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and the Department of Education (DepEd) guidelines on student data privacy and protection.
              </Text>
            </View>
          </View>

          {/* Section 2: Definition of Minor User */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>2.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Definition of Minor User</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                A Minor User refers to any student or registered user under the age of 18 who accesses or uses the Southville 8B NHS Edge platform — including its web, mobile, and desktop applications.
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                If you are below 18 years old, your access and continued use of the platform require the knowledge, consent, and supervision of your parent or legal guardian.
              </Text>
            </View>
          </View>

          {/* Section 3: Information Collected */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>3.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Information Collected from Minor Users</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                To support academic operations and digital learning services, the system may collect the following types of information:
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                • Personal identification details (e.g., full name, student number, section, grade level){'\n'}
                • Academic and attendance records{'\n'}
                • Learning activity logs and submissions{'\n'}
                • Communication data (messages, announcements, feedback){'\n'}
                • System usage analytics (login history, feature interactions)
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                All information is processed solely for legitimate educational purposes and is not shared with any third party unless required by law or authorized by the Department of Education.
              </Text>
            </View>
          </View>

          {/* Section 4: Parental Consent */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>4.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Parental and Guardian Consent</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Before or upon account activation, parents or legal guardians are notified regarding:
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                • The nature and purpose of data collection;{'\n'}
                • The specific information to be processed; and{'\n'}
                • Their rights to access, correct, or request deletion of their child's data.
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                The school reserves the right to suspend or restrict a minor's account if parental or guardian consent is not properly verified.
              </Text>
            </View>
          </View>

          {/* Section 5: Protection and Retention */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>5.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Protection and Retention of Data</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                The school adopts industry-standard security, encryption, and access control measures to safeguard all student data.
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Data is retained only for as long as necessary to fulfill academic requirements or as mandated by law, after which it is securely deleted or anonymized.
              </Text>
            </View>
          </View>

          {/* Section 6: Rights */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>6.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Rights of Minor Users and Parents/Guardians</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Under the Data Privacy Act, both the minor and their parent or guardian have the right to:
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                • Access personal information held by the school;{'\n'}
                • Request correction of inaccurate or outdated data;{'\n'}
                • Withdraw consent for specific processing activities; and{'\n'}
                • Lodge complaints with the National Privacy Commission (NPC) for any privacy concerns.
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Requests may be directed to the school's Data Protection Officer (DPO) using the contact details below.
              </Text>
            </View>
          </View>

          {/* Section 7: Responsible Use */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>7.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Responsible Use</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Minor Users are expected to:
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                • Use the platform responsibly and ethically;{'\n'}
                • Avoid sharing personal login credentials with others;{'\n'}
                • Report any suspicious or inappropriate activity to school authorities.
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Any misuse of the system may lead to disciplinary action consistent with school policies.
              </Text>
            </View>
          </View>

          {/* Section 8: Data Protection Contact */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>8.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Protection Contact</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                For questions or requests related to this policy, please contact:
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                Admin{'\n'}
                📧 Email: southville8bnhs@gmail.com{'\n'}
                🏫 Southville 8B National High School, Rodriguez, Rizal{'\n'}
                📞 Contact Information
              </Text>
            </View>
          </View>

          {/* Section 9: Acknowledgment */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>9.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Acknowledgment</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                By accessing or using the Southville 8B NHS Edge platform, you acknowledge that:
              </Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                • You are below 18 years old and understand your classification as a Minor User;{'\n'}
                • You (and your parent/guardian) have read, understood, and accepted this policy; and{'\n'}
                • You consent to the processing of your information for legitimate educational purposes.
              </Text>
            </View>
          </View>

          {/* Section 10: Policy Updates */}
          <View style={styles.section}>
            <Text style={[styles.sectionNumber, { color: colors.tint }]}>10.</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Policy Updates</Text>
              <Text style={[styles.sectionText, { color: colors.text }]}>
                This policy may be revised periodically to reflect regulatory changes or improvements in privacy practices. Updates will be posted on this page, and continued use of the system constitutes acceptance of the updated version.
              </Text>
            </View>
          </View>

          {/* Checkbox and Continue Button */}
          <View style={styles.footerSection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreed ? colors.tint : 'transparent',
                    borderColor: agreed ? colors.tint : colors.icon,
                    borderWidth: 2,
                  },
                ]}
              >
                {agreed && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                I agree
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: agreed ? colors.tint : colors.icon,
                  opacity: agreed ? 1 : 0.5,
                },
              ]}
              onPress={handleContinue}
              disabled={!agreed || isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {isSubmitting ? 'Processing...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Copyright Footer */}
          <View style={styles.copyrightSection}>
            <Text style={[styles.copyright, { color: colors.icon }]}>
              All Rights Reserve 2025
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  sectionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
    minWidth: 24,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  copyrightSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
});

