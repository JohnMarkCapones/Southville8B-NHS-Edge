"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttemptWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptCount: number;
  isGamingTheme?: boolean;
}

export const AttemptWarningModal: React.FC<AttemptWarningModalProps> = ({
  isOpen,
  onClose,
  attemptCount,
  isGamingTheme = false,
}) => {
  const getWarningInfo = (count: number) => {
    if (count >= 10) {
      return {
        title: "Account Locked",
        message: "Too many failed attempts. Your account is now locked.",
        remainingTries: 0,
        severity: "critical",
        icon: Shield,
        color: "red"
      };
    } else if (count >= 8) {
      return {
        title: "Final Warning",
        message: "One more failed attempt will lock your account for 15 minutes.",
        remainingTries: 1,
        severity: "critical",
        icon: AlertTriangle,
        color: "red"
      };
    } else if (count >= 5) {
      return {
        title: "Multiple Failed Attempts",
        message: "You have 3 more attempts before your account gets locked.",
        remainingTries: 3,
        severity: "high",
        icon: AlertTriangle,
        color: "orange"
      };
    } else if (count >= 3) {
      return {
        title: "Failed Login Attempts",
        message: "You have 5 more attempts before your account gets locked.",
        remainingTries: 5,
        severity: "medium",
        icon: AlertTriangle,
        color: "yellow"
      };
    } else {
      return {
        title: "Login Failed",
        message: "Invalid credentials. Please check your email and password.",
        remainingTries: 8,
        severity: "low",
        icon: AlertTriangle,
        color: "blue"
      };
    }
  };

  const warning = getWarningInfo(attemptCount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "sm:max-w-md border-0 shadow-2xl",
          isGamingTheme 
            ? "bg-gaming-dark border-gaming-neon-orange/50" 
            : "bg-background"
        )}
      >
        <DialogHeader className="relative">
          <DialogTitle className={cn(
            "text-xl font-bold flex items-center gap-2",
            warning.color === "red" && (isGamingTheme ? "text-gaming-neon-red" : "text-destructive"),
            warning.color === "orange" && (isGamingTheme ? "text-gaming-neon-orange" : "text-orange-600"),
            warning.color === "yellow" && (isGamingTheme ? "text-gaming-neon-yellow" : "text-yellow-600"),
            warning.color === "blue" && (isGamingTheme ? "text-gaming-neon-blue" : "text-blue-600")
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
              warning.color === "red" && (isGamingTheme 
                ? "hover:bg-gaming-neon-red/20 text-gaming-neon-red" 
                : "hover:bg-destructive/10 text-destructive"),
              warning.color === "orange" && (isGamingTheme 
                ? "hover:bg-gaming-neon-orange/20 text-gaming-neon-orange" 
                : "hover:bg-orange-500/10 text-orange-600"),
              warning.color === "yellow" && (isGamingTheme 
                ? "hover:bg-gaming-neon-yellow/20 text-gaming-neon-yellow" 
                : "hover:bg-yellow-500/10 text-yellow-600"),
              warning.color === "blue" && (isGamingTheme 
                ? "hover:bg-gaming-neon-blue/20 text-gaming-neon-blue" 
                : "hover:bg-blue-500/10 text-blue-600")
            )}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className={cn(
            "p-4 rounded-lg border-l-4",
            warning.color === "red" && (isGamingTheme 
              ? "bg-gaming-neon-red/10 border-gaming-neon-red text-gaming-neon-red" 
              : "bg-destructive/10 border-destructive text-destructive"),
            warning.color === "orange" && (isGamingTheme 
              ? "bg-gaming-neon-orange/10 border-gaming-neon-orange text-gaming-neon-orange" 
              : "bg-orange-500/10 border-orange-500 text-orange-600"),
            warning.color === "yellow" && (isGamingTheme 
              ? "bg-gaming-neon-yellow/10 border-gaming-neon-yellow text-gaming-neon-yellow" 
              : "bg-yellow-500/10 border-yellow-500 text-yellow-600"),
            warning.color === "blue" && (isGamingTheme 
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

          {/* Remaining Tries Counter */}
          {warning.remainingTries > 0 && (
            <div className={cn(
              "p-3 rounded-lg border text-center",
              isGamingTheme 
                ? "bg-gaming-accent/20 border-gaming-neon-green/30" 
                : "bg-muted/30 border-border"
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className={cn(
                  "w-4 h-4",
                  isGamingTheme ? "text-gaming-neon-green" : "text-green-600"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  isGamingTheme ? "text-gaming-neon-green" : "text-green-600"
                )}>
                  Remaining Attempts
                </span>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                isGamingTheme ? "text-gaming-neon-green" : "text-green-600"
              )}>
                {warning.remainingTries}
              </div>
            </div>
          )}

          {/* Lockout Warning */}
          {warning.remainingTries <= 3 && warning.remainingTries > 0 && (
            <div className={cn(
              "p-3 rounded-lg border",
              isGamingTheme 
                ? "bg-gaming-accent/20 border-gaming-neon-orange/30" 
                : "bg-orange-500/10 border-orange-500/30"
            )}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={cn(
                  "w-4 h-4 mt-0.5",
                  isGamingTheme ? "text-gaming-neon-orange" : "text-orange-600"
                )} />
                <div>
                  <p className={cn(
                    "text-xs font-medium",
                    isGamingTheme ? "text-gaming-neon-orange" : "text-orange-600"
                  )}>
                    Account Lockout Warning
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground"
                  )}>
                    {warning.remainingTries === 1 
                      ? "Next failed attempt will lock your account for 15 minutes."
                      : `${warning.remainingTries} more failed attempts will result in temporary account lockout.`
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
