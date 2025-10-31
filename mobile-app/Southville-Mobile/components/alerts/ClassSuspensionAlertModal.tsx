import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Alert } from "@/lib/types/alert";

interface ClassSuspensionAlertModalProps {
  alert: Alert;
  onDismiss: () => void;
  extraLink?: string;
}

export function ClassSuspensionAlertModal({
  alert,
  onDismiss,
  extraLink,
}: ClassSuspensionAlertModalProps) {
  const handleActionPress = () => {
    if (extraLink) {
      Linking.openURL(extraLink);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header - Purple/Violet Theme */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>CLASS SUSPENSION</Text>
            <Text style={styles.headerSubtitle}>Class Suspension Notice</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Main Alert Card */}
          <View style={styles.mainCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons name="school" size={40} color="#9C27B0" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.mainTitle}>{alert.title}</Text>
              <Text style={styles.mainMessage}>{alert.message}</Text>
              <Text style={styles.secondaryMessage}>Please take note</Text>
            </View>
          </View>

          {/* Action Section */}
          {extraLink && (
            <View style={styles.actionSection}>
              <Text style={styles.actionIntro}>
                For more details, visit our official page
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleActionPress}
              >
                <View style={styles.actionButtonContent}>
                  <Ionicons name="globe" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>More Information</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="information-circle" size={16} color="#9C27B0" />
            </View>
            <Text style={styles.footerText}>
              Stay updated with announcements
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 25,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#9C27B0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 24,
    gap: 20,
  },
  mainCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#F3E5F5",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E1BEE7",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  mainMessage: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
  },
  secondaryMessage: {
    fontSize: 14,
    color: "#9C27B0",
    fontWeight: "600",
  },
  actionSection: {
    gap: 12,
  },
  actionIntro: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: "#9C27B0",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  footerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3E5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#9C27B0",
    fontWeight: "600",
  },
});
