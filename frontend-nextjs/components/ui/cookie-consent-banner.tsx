"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X, Settings, Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Cookie Consent Banner Component
 *
 * Displays a GDPR-compliant cookie consent banner on first visit.
 * Allows users to accept all, decline optional, or customize preferences.
 *
 * @example
 * ```tsx
 * <CookieConsentBanner />
 * ```
 */

type ConsentPreferences = {
  necessary: boolean; // Always true (required for site functionality)
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_PREFERENCES);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      timestamp: new Date().toISOString(),
      preferences: prefs,
    }));

    // Apply consent preferences (e.g., initialize analytics if accepted)
    if (prefs.analytics) {
      // TODO: Initialize analytics (Google Analytics, etc.)
      console.log("Analytics cookies enabled");
    }

    if (prefs.marketing) {
      // TODO: Initialize marketing pixels (Facebook Pixel, etc.)
      console.log("Marketing cookies enabled");
    }

    closeConsentBanner();
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const handleDeclineOptional = () => {
    saveConsent({
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const closeConsentBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === "necessary") return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Banner */}
      <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6">
        <Card
          className={cn(
            "max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-school-blue/20 shadow-2xl transition-all duration-300",
            isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          )}
        >
          <div className="p-6">
            {!showSettings ? (
              // Simple view
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <Cookie className="w-8 h-8 text-school-blue" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      We Value Your Privacy
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                      By clicking "Accept All", you consent to our use of cookies.{" "}
                      <Link
                        href="/guess/privacy-policy"
                        className="text-school-blue hover:underline font-medium"
                      >
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-school-blue hover:bg-school-blue/90 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept All
                  </Button>
                  <Button
                    onClick={handleDeclineOptional}
                    variant="outline"
                    className="flex-1 border-slate-300 dark:border-slate-600"
                  >
                    Decline Optional
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="border-school-blue text-school-blue hover:bg-school-blue/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </>
            ) : (
              // Settings view
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-school-blue" />
                    Cookie Preferences
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                  Choose which cookies you want to accept. You can change these settings at any time.
                </p>

                <div className="space-y-4 mb-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mt-1 w-4 h-4 rounded border-slate-300"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Necessary Cookies
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Examples: Authentication, security, session management
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference("analytics")}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-school-blue focus:ring-school-blue cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Analytics Cookies
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Help us understand how visitors interact with our website.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Examples: Google Analytics, page views, user behavior
                      </p>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference("marketing")}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-school-blue focus:ring-school-blue cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Marketing Cookies
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Used to deliver personalized advertisements relevant to you.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Examples: Facebook Pixel, ad retargeting
                      </p>
                    </div>
                  </div>

                  {/* Preference Cookies */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => togglePreference("preferences")}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-school-blue focus:ring-school-blue cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Preference Cookies
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Remember your settings and preferences for a better experience.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Examples: Language, theme, layout preferences
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSavePreferences}
                    className="flex-1 bg-school-blue hover:bg-school-blue/90 text-white"
                  >
                    Save Preferences
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    variant="outline"
                    className="flex-1"
                  >
                    Accept All
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
