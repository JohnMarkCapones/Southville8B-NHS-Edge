import React from "react";
import type { Alert } from "@/lib/types/alert";
import { WeatherAlertModal } from "./WeatherAlertModal";
import { ClassSuspensionAlertModal } from "./ClassSuspensionAlertModal";
import { EmergencyAlertModal } from "./EmergencyAlertModal";

interface AlertModalProps {
  alert: Alert;
  onDismiss: () => void;
  extraLink?: string;
}

export function AlertModal({ alert, onDismiss, extraLink }: AlertModalProps) {
  // Map Supabase alert types to modal components
  // Desktop app maps: "Weather" → "warning", "Emergency" → "error", "Class Suspension" → "info"
  switch (alert.type) {
    case "warning":
      return (
        <WeatherAlertModal
          alert={alert}
          onDismiss={onDismiss}
          extraLink={extraLink}
        />
      );
    case "error":
      return (
        <EmergencyAlertModal
          alert={alert}
          onDismiss={onDismiss}
          extraLink={extraLink}
        />
      );
    case "info":
      return (
        <ClassSuspensionAlertModal
          alert={alert}
          onDismiss={onDismiss}
          extraLink={extraLink}
        />
      );
    default:
      // Fallback to emergency modal for unknown types
      return (
        <EmergencyAlertModal
          alert={alert}
          onDismiss={onDismiss}
          extraLink={extraLink}
        />
      );
  }
}
