import { Language, defaultLanguage, getLanguageFromCode } from '../translations'

// Date formatting utilities
export function formatDate(date: Date, language: Language = defaultLanguage): string {
  try {
    const locale = language === 'fil' ? 'fil-PH' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return date.toLocaleDateString()
  }
}

export function formatTime(date: Date, language: Language = defaultLanguage): string {
  try {
    const locale = language === 'fil' ? 'fil-PH' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch (error) {
    console.error('Error formatting time:', error)
    return date.toLocaleTimeString()
  }
}

export function formatDateTime(date: Date, language: Language = defaultLanguage): string {
  try {
    const locale = language === 'fil' ? 'fil-PH' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch (error) {
    console.error('Error formatting date-time:', error)
    return date.toLocaleString()
  }
}

// Number formatting utilities
export function formatNumber(number: number, language: Language = defaultLanguage): string {
  try {
    const locale = language === 'fil' ? 'fil-PH' : 'en-US'
    return new Intl.NumberFormat(locale).format(number)
  } catch (error) {
    console.error('Error formatting number:', error)
    return number.toString()
  }
}

export function formatCurrency(amount: number, language: Language = defaultLanguage, currency: string = 'PHP'): string {
  try {
    const locale = language === 'fil' ? 'fil-PH' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatPercentage(value: number, language: Language = defaultLanguage): string {
  try {
    const locale = language === 'fil' ? 'fil-PH' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value / 100)
  } catch (error) {
    console.error('Error formatting percentage:', error)
    return `${value}%`
  }
}

// Language detection utilities
export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') {
    return defaultLanguage
  }

  try {
    const browserLanguage = navigator.language || navigator.languages?.[0] || 'en'
    return getLanguageFromCode(browserLanguage)
  } catch (error) {
    console.error('Error detecting browser language:', error)
    return defaultLanguage
  }
}

export function getLanguageFromPathname(pathname: string): Language | null {
  // Check if pathname starts with language code
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    const firstSegment = segments[0]
    if (firstSegment === 'en' || firstSegment === 'fil') {
      return firstSegment as Language
    }
  }
  return null
}

export function addLanguageToPathname(pathname: string, language: Language): string {
  const currentLanguage = getLanguageFromPathname(pathname)
  
  if (currentLanguage) {
    // Replace existing language
    return pathname.replace(`/${currentLanguage}`, `/${language}`)
  } else {
    // Add language to beginning
    return `/${language}${pathname}`
  }
}

export function removeLanguageFromPathname(pathname: string): string {
  const language = getLanguageFromPathname(pathname)
  if (language) {
    return pathname.replace(`/${language}`, '') || '/'
  }
  return pathname
}

// Validation utilities
export function isValidLanguage(language: string): language is Language {
  return language === 'en' || language === 'fil'
}

export function normalizeLanguage(language: string): Language {
  if (isValidLanguage(language)) {
    return language
  }
  return defaultLanguage
}

// Storage utilities
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return defaultLanguage
  }

  try {
    const stored = localStorage.getItem('app-language')
    if (stored && isValidLanguage(stored)) {
      return stored
    }
  } catch (error) {
    console.error('Error getting stored language:', error)
  }

  return defaultLanguage
}

export function setStoredLanguage(language: Language): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem('app-language', language)
  } catch (error) {
    console.error('Error setting stored language:', error)
  }
}

// RTL support (for future expansion)
export function isRTL(language: Language): boolean {
  // Currently no RTL languages supported
  return false
}

export function getTextDirection(language: Language): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr'
}
