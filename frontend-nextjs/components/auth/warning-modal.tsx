"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptCount: number;
  isGamingTheme?: boolean;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  attemptCount,
  isGamingTheme = false,
}) => {
  const getWarningMessage = (count: number) => {
    if (count >= 10) {
      return {
        title: "Account Temporarily Locked",
        message: "Too many failed login attempts. Your account has been temporarily locked for security reasons.",
        severity: "critical",
        icon: Shield,
      };
    } else if (count >= 8) {
      return {
        title: "Multiple Failed Attempts",
        message: "You have made multiple failed login attempts. Please verify your credentials before trying again.",
        severity: "high",
        icon: AlertTriangle,
      };
    } else if (count >= 5) {
      return {
        title: "Failed Login Attempts",
        message: "Several failed login attempts detected. Please double-check your email and password.",
        severity: "medium",
        icon: AlertTriangle,
      };
    } else {
      return {
        title: "Login Failed",
        message: "Invalid email or password. Please check your credentials and try again.",
        severity: "low",
        icon: AlertTriangle,
      };
    }
  };

  const warning = getWarningMessage(attemptCount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "sm:max-w-md border-0 shadow-2xl",
          isGamingTheme 
            ? "bg-gaming-dark border-gaming-neon-red/50" 
            : "bg-background"
        )}
      >
        <DialogHeader className="relative">
          <DialogTitle className={cn(
            "text-xl font-bold flex items-center gap-2",
            isGamingTheme ? "text-gaming-neon-red" : "text-destructive"
          )}>
            <warning.icon className="w-5 h-5" />
            {warning.title}
          </DialogTitle>
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "absolute -top-2 -right-2 h-8 w-8 rounded-full",
              isGamingTheme 
                ? "hover:bg-gaming-neon-red/20 text-gaming-neon-red" 
                : "hover:bg-destructive/10 text-destructive"
            )}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className={cn(
            "p-4 rounded-lg border-l-4",
            warning.severity === "critical" && (isGamingTheme 
              ? "bg-gaming-neon-red/10 border-gaming-neon-red text-gaming-neon-red" 
              : "bg-destructive/10 border-destructive text-destructive"),
            warning.severity === "high" && (isGamingTheme 
              ? "bg-gaming-neon-orange/10 border-gaming-neon-orange text-gaming-neon-orange" 
              : "bg-orange-500/10 border-orange-500 text-orange-600"),
            warning.severity === "medium" && (isGamingTheme 
              ? "bg-gaming-neon-yellow/10 border-gaming-neon-yellow text-gaming-neon-yellow" 
              : "bg-yellow-500/10 border-yellow-500 text-yellow-600"),
            warning.severity === "low" && (isGamingTheme 
              ? "bg-gaming-neon-blue/10 border-gaming-neon-blue text-gaming-neon-blue" 
              : "bg-blue-500/10 border-blue-500 text-blue-600")
          )}>
            <p className="text-sm font-medium">{warning.message}</p>
          </div>

          {/* Attempt Counter */}
          <div className={cn(
            "flex items-center justify-center gap-2 p-3 rounded-lg",
            isGamingTheme 
              ? "bg-gaming-accent/30" 
              : "bg-muted/50"
          )}>
            <Clock className={cn(
              "w-4 h-4",
              isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground"
            )}>
              Failed attempts: {attemptCount}
            </span>
          </div>

          {/* Security Notice */}
          {attemptCount >= 5 && (
            <div className={cn(
              "p-3 rounded-lg border",
              isGamingTheme 
                ? "bg-gaming-accent/20 border-gaming-neon-green/30" 
                : "bg-muted/30 border-border"
            )}>
              <div className="flex items-start gap-2">
                <Shield className={cn(
                  "w-4 h-4 mt-0.5",
                  isGamingTheme ? "text-gaming-neon-green" : "text-green-600"
                )} />
                <div>
                  <p className={cn(
                    "text-xs font-medium",
                    isGamingTheme ? "text-gaming-neon-green" : "text-green-600"
                  )}>
                    Security Protection Active
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground"
                  )}>
                    {attemptCount >= 10 
                      ? "Your account is temporarily locked. Please wait before trying again."
                      : "Additional failed attempts may result in temporary account lockout."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              className={cn(
                "flex-1",
                isGamingTheme 
                  ? "bg-gaming-neon-green hover:bg-gaming-neon-green/80 text-gaming-dark" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              I Understand
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
