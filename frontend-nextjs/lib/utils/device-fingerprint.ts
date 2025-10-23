/**
 * Device Fingerprinting Utility
 *
 * Generates a unique device fingerprint for quiz session validation.
 * Uses browser characteristics to create a semi-persistent identifier.
 *
 * @module lib/utils/device-fingerprint
 */

'use client';

import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Device fingerprint result
 */
interface DeviceFingerprint {
  fingerprint: string;
  confidence: number;
  components: {
    userAgent: string;
    language: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    colorDepth: number;
  };
}

// Cache the FingerprintJS instance
let fpPromise: Promise<any> | null = null;

/**
 * Initialize FingerprintJS (only once)
 */
const initFingerprint = async () => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
};

/**
 * Generate device fingerprint
 *
 * Creates a unique identifier based on browser/device characteristics.
 * This is used for quiz session validation and security.
 *
 * @returns Device fingerprint object
 *
 * @example
 * ```typescript
 * const fingerprint = await generateDeviceFingerprint();
 * console.log('Fingerprint:', fingerprint.fingerprint);
 * ```
 */
export const generateDeviceFingerprint = async (): Promise<DeviceFingerprint> => {
  try {
    const fp = await initFingerprint();
    const result = await fp.get();

    // Get basic browser info as fallback
    const components = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: window.screen.colorDepth,
    };

    return {
      fingerprint: result.visitorId,
      confidence: result.confidence.score,
      components,
    };
  } catch (error) {
    console.error('Error generating device fingerprint:', error);

    // Fallback to basic fingerprint
    return generateBasicFingerprint();
  }
};

/**
 * Generate basic fingerprint (fallback)
 *
 * Creates a simpler fingerprint when FingerprintJS fails.
 */
const generateBasicFingerprint = (): DeviceFingerprint => {
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: window.screen.colorDepth,
  };

  // Create a simple hash from components
  const str = Object.values(components).join('|');
  const hash = simpleHash(str);

  return {
    fingerprint: `basic-${hash}`,
    confidence: 0.5,
    components,
  };
};

/**
 * Simple string hash function
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Get user's IP address (requires external API)
 *
 * Note: This is optional and requires an external service.
 * The backend can also capture IP from request headers.
 *
 * @returns IP address or null
 */
export const getUserIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return null;
  }
};

/**
 * Validate fingerprint match
 *
 * Compares two fingerprints to check if they're from the same device.
 *
 * @param fp1 - First fingerprint
 * @param fp2 - Second fingerprint
 * @returns True if fingerprints match
 */
export const validateFingerprintMatch = (
  fp1: string,
  fp2: string
): boolean => {
  return fp1 === fp2;
};

/**
 * Get browser information
 *
 * Returns detailed browser and device information.
 */
export const getBrowserInfo = (): {
  browser: string;
  version: string;
  os: string;
  device: string;
  isMobile: boolean;
} => {
  const ua = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown';
  let version = '';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || '';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  // Detect device
  let device = 'Desktop';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  if (isMobile) {
    if (/iPad|Tablet/i.test(ua)) device = 'Tablet';
    else device = 'Mobile';
  }

  return {
    browser,
    version,
    os,
    device,
    isMobile,
  };
};
