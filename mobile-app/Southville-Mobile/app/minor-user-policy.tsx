import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function MinorUserPolicyScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const { user } = useCurrentUser();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardColor = isDark ? "#1E2440" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#DFE8F3";
  const gradientColors = isDark
    ? ["#020617", "#0F172A"]
    : ["#D9ECFF", "#FFFFFF"];
  const mutedColor = isDark ? "rgba(255,255,255,0.7)" : "#5B6787";

  const highlightCards = [
    {
      icon: "shield-checkmark" as const,
      title: "Privacy First",
      subtitle: "Aligned with RA 10173",
    },
    {
      icon: "people-circle" as const,
      title: "Parental Oversight",
      subtitle: "Guardian consent reinforced",
    },
    {
      icon: "lock-closed" as const,
      title: "Secure Records",
      subtitle: "Encrypted student data",
    },
  ];

  const policySections = [
    {
      number: "1",
      title: "Purpose",
      paragraphs: [
        'This Minor User Policy outlines the data handling practices, parental consent requirements, and safety commitments of Southville 8B NHS Edge for users below 18 years old ("Minor Users").',
        "The policy ensures compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and Department of Education (DepEd) guidelines on student data privacy and protection.",
      ],
    },
    {
      number: "2",
      title: "Definition of Minor User",
      paragraphs: [
        "A Minor User refers to any student or registered user under the age of 18 who accesses or uses the Southville 8B NHS Edge platform — including its web, mobile, and desktop applications.",
        "If you are below 18 years old, your access and continued use of the platform require the knowledge, consent, and supervision of your parent or legal guardian.",
      ],
    },
    {
      number: "3",
      title: "Information Collected from Minor Users",
      intro:
        "To support academic operations and digital learning services, the system may collect the following types of information:",
      bullets: [
        "Personal identification details (e.g., full name, student number, section, grade level)",
        "Academic and attendance records",
        "Learning activity logs and submissions",
        "Communication data (messages, announcements, feedback)",
        "System usage analytics (login history, feature interactions)",
      ],
      footnote:
        "All information is processed solely for legitimate educational purposes and is not shared with any third party unless required by law or authorized by the Department of Education.",
    },
    {
      number: "4",
      title: "Parental and Guardian Consent",
      intro:
        "Before or upon account activation, parents or legal guardians are notified regarding:",
      bullets: [
        "The nature and purpose of data collection",
        "The specific information to be processed",
        "Their rights to access, correct, or request deletion of their child's data",
      ],
      footnote:
        "The school reserves the right to suspend or restrict a minor's account if parental or guardian consent is not properly verified.",
    },
    {
      number: "5",
      title: "Protection and Retention of Data",
      paragraphs: [
        "The school adopts industry-standard security, encryption, and access-control measures to safeguard all student data.",
        "Data is retained only for as long as necessary to fulfill academic requirements or as mandated by law, after which it is securely deleted or anonymized.",
      ],
    },
    {
      number: "6",
      title: "Rights of Minor Users and Parents/Guardians",
      intro:
        "Under the Data Privacy Act, both the minor and their parent or guardian have the right to:",
      bullets: [
        "Access personal information held by the school",
        "Request correction of inaccurate or outdated data",
        "Withdraw consent for specific processing activities",
        "Lodge complaints with the National Privacy Commission (NPC) for any privacy concerns",
      ],
      footnote:
        "Requests may be directed to the school's Data Protection Officer (DPO) using the contact details below.",
    },
    {
      number: "7",
      title: "Responsible Use",
      intro: "Minor Users are expected to:",
      bullets: [
        "Use the platform responsibly and ethically",
        "Avoid sharing personal login credentials with others",
        "Report any suspicious or inappropriate activity to school authorities",
      ],
      footnote:
        "Any misuse of the system may lead to disciplinary action consistent with school policies.",
    },
    {
      number: "8",
      title: "Data Protection Contact",
      paragraphs: [
        "For questions or requests related to this policy, please contact:",
      ],
      bullets: [
        "Admin",
        "Email: southville8bnhs@gmail.com",
        "Southville 8B National High School, Rodriguez, Rizal",
        "Official school contact lines",
      ],
    },
    {
      number: "9",
      title: "Acknowledgment",
      intro:
        "By accessing or using the Southville 8B NHS Edge platform, you acknowledge that:",
      bullets: [
        "You are below 18 years old and understand your classification as a Minor User",
        "You and your parent/guardian have read, understood, and accepted this policy",
        "You consent to the processing of your information for legitimate educational purposes",
      ],
    },
    {
      number: "10",
      title: "Policy Updates",
      paragraphs: [
        "This policy may be revised periodically to reflect regulatory changes or improvements in privacy practices. Updates will be posted on this page, and continued use of the system constitutes acceptance of the updated version.",
      ],
    },
  ];

  const handleContinue = async () => {
    if (!agreed || !user?.id) return;

    setIsSubmitting(true);
    try {
      // Save acceptance flag
      const flagKey = `@minor_policy_accepted_${user.id}`;
      await AsyncStorage.setItem(flagKey, "true");

      // Navigate to home
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving policy acceptance:", error);
      // Still navigate even if saving fails
      router.replace("/(tabs)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.heroCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <View style={styles.heroChip}>
              <Ionicons name="shield-checkmark" size={16} color={colors.tint} />
              <Text style={[styles.heroChipText, { color: colors.tint }]}>
                Mandatory Review
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Minor User Policy
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Southville 8B NHS Edge
            </Text>
            <Text style={[styles.metaText, { color: mutedColor }]}>
              Last updated: December 2024
            </Text>

            <View style={styles.highlightStack}>
              {highlightCards.map((card) => (
                <View
                  key={card.title}
                  style={[styles.highlightCard, { borderColor }]}
                >
                  <View style={styles.highlightIcon}>
                    <Ionicons name={card.icon} size={20} color={colors.tint} />
                  </View>
                  <Text style={[styles.highlightTitle, { color: colors.text }]}>
                    {card.title}
                  </Text>
                  <Text
                    style={[styles.highlightSubtitle, { color: mutedColor }]}
                  >
                    {card.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {policySections.map((section) => (
            <View
              key={section.number}
              style={[
                styles.sectionCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionBadge,
                    { backgroundColor: colors.tint },
                  ]}
                >
                  <Text style={styles.sectionBadgeText}>{section.number}</Text>
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
              </View>

              {section.paragraphs?.map((paragraph, index) => (
                <Text
                  key={`${section.number}-p-${index}`}
                  style={[styles.sectionText, { color: colors.text }]}
                >
                  {paragraph}
                </Text>
              ))}

              {section.intro && (
                <Text style={[styles.sectionIntro, { color: colors.text }]}>
                  {section.intro}
                </Text>
              )}

              {section.bullets && (
                <View style={styles.bulletList}>
                  {section.bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.tint}
                      />
                      <Text style={[styles.bulletText, { color: colors.text }]}>
                        {bullet}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {section.footnote && (
                <Text style={[styles.footnoteText, { color: mutedColor }]}>
                  {section.footnote}
                </Text>
              )}
            </View>
          ))}

          <View
            style={[
              styles.consentCard,
              {
                borderColor: colors.tint,
                backgroundColor: isDark
                  ? "rgba(10, 126, 164, 0.12)"
                  : "#E8F6FF",
              },
            ]}
          >
            <View style={styles.consentHeader}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.tint}
              />
              <Text style={[styles.consentTitle, { color: colors.text }]}>
                Consent Required
              </Text>
            </View>
            <Text style={[styles.consentText, { color: colors.text }]}>
              Confirm that you have read and understood this policy. Your
              acknowledgement lets us continue providing a safe digital
              experience for minor users.
            </Text>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreed ? colors.tint : "transparent",
                    borderColor: agreed
                      ? colors.tint
                      : "rgba(99, 102, 116, 0.5)",
                  },
                ]}
              >
                {agreed && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                I have read and agree to this Minor User Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: colors.tint,
                  opacity: agreed && !isSubmitting ? 1 : 0.5,
                },
              ]}
              onPress={handleContinue}
              disabled={!agreed || isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>
                {isSubmitting ? "Processing…" : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacer}>
            <Text style={[styles.footerNote, { color: mutedColor }]}>
              All Rights Reserve 2025
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(10, 126, 164, 0.12)",
  },
  heroChipText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    marginTop: 12,
    color: "#5B6787",
    fontStyle: "italic",
  },
  highlightStack: {
    marginTop: 20,
  },
  highlightCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(10, 126, 164, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  highlightSubtitle: {
    fontSize: 13,
    color: "#5B6787",
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  sectionIntro: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  bulletList: {
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },
  footnoteText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#5B6787",
  },
  consentCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    marginTop: 12,
  },
  consentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  consentText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  footerSpacer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerNote: {
    fontSize: 12,
    color: "#5B6787",
  },
});
