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

interface EmergencyAlertModalProps {
  alert: Alert;
  onDismiss: () => void;
  extraLink?: string;
}

export function EmergencyAlertModal({
  alert,
  onDismiss,
  extraLink,
}: EmergencyAlertModalProps) {
  const handleActionPress = () => {
    if (extraLink) {
      Linking.openURL(extraLink);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header - Red/Danger Theme */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>EMERGENCY ALERT</Text>
            <Text style={styles.headerSubtitle}>Critical Notice</Text>
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
                <Ionicons name="warning" size={40} color="#DC2626" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.mainTitle}>{alert.title}</Text>
              <Text style={styles.mainMessage}>{alert.message}</Text>
              <Text style={styles.secondaryMessage}>
                Please act immediately
              </Text>
            </View>
          </View>

          {/* Action Section */}
          {extraLink && (
            <View style={styles.actionSection}>
              <Text style={styles.actionIntro}>
                For emergency protocols, visit our page
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleActionPress}
              >
                <View style={styles.actionButtonContent}>
                  <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>
                    Emergency Information
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="shield-checkmark" size={16} color="#DC2626" />
            </View>
            <Text style={styles.footerText}>Your safety is our priority</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.85)",
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
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  header: {
    backgroundColor: "#DC2626",
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
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
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
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    color: "#DC2626",
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
    backgroundColor: "#DC2626",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#DC2626",
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
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
});
