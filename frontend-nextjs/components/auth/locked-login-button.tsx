"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockedLoginButtonProps {
  isLocked: boolean;
  retryAfterSeconds: number;
  attemptCount: number;
  isGamingTheme?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const LockedLoginButton: React.FC<LockedLoginButtonProps> = ({
  isLocked,
  retryAfterSeconds,
  attemptCount,
  isGamingTheme = false,
  className,
  children,
  onClick,
  disabled = false,
}) => {
  const formatTime = (seconds: number) => {
    // Ensure seconds is a valid number
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLockoutLevel = (count: number) => {
    if (count >= 10) return { level: 3, name: "15 minutes", color: "red" };
    if (count >= 8) return { level: 2, name: "5 minutes", color: "orange" };
    if (count >= 5) return { level: 1, name: "1 minute", color: "yellow" };
    return { level: 0, name: "none", color: "green" };
  };

  const lockoutInfo = getLockoutLevel(attemptCount);

  if (isLocked) {
    return (
      <Button
        disabled
        className={cn(
          "w-full h-12 text-lg font-semibold shadow-lg transition-all duration-300 relative overflow-hidden",
          // Locked appearance
          isGamingTheme
            ? "bg-gaming-dark border-2 border-gaming-neon-red/50 text-gaming-neon-red cursor-not-allowed"
            : "bg-muted border-2 border-destructive/50 text-destructive cursor-not-allowed",
          className
        )}
      >
        {/* Locked Background Pattern */}
        <div className={cn(
          "absolute inset-0 opacity-10",
          isGamingTheme ? "bg-gaming-neon-red" : "bg-destructive"
        )} 
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 20px
          )`
        }} />

        {/* Lock Icon */}
        <Lock className="w-5 h-5 mr-2 animate-pulse" />

        {/* Lockout Message */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">
            ACCOUNT LOCKED
          </span>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>Try again in {formatTime(retryAfterSeconds)}</span>
          </div>
        </div>

        {/* Lockout Level Indicator */}
        <div className={cn(
          "absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          lockoutInfo.color === "red" && (isGamingTheme 
            ? "bg-gaming-neon-red text-gaming-dark" 
            : "bg-destructive text-destructive-foreground"),
          lockoutInfo.color === "orange" && (isGamingTheme 
            ? "bg-gaming-neon-orange text-gaming-dark" 
            : "bg-orange-500 text-white"),
          lockoutInfo.color === "yellow" && (isGamingTheme 
            ? "bg-gaming-neon-yellow text-gaming-dark" 
            : "bg-yellow-500 text-black")
        )}>
          {lockoutInfo.level}
        </div>
      </Button>
    );
  }

  // Normal button when not locked
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
        isGamingTheme
          ? "bg-gradient-to-r from-gaming-neon-blue to-gaming-neon-cyan hover:scale-105 animate-gamingPulse"
          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105",
        className
      )}
    >
      {children}
    </Button>
  );
};
