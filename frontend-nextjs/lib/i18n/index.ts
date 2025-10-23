// Main i18n exports
export { LanguageProvider, useLanguage, useCurrentLanguage } from './context/LanguageContext'
export { useTranslation, useStaticTranslation, getTranslation } from './hooks/useTranslation'
export { 
  translations, 
  languages, 
  defaultLanguage, 
  getLanguageFromCode, 
  getLanguageName, 
  getLanguageFlag,
  type Language,
  type Translations 
} from './translations'

// Utility exports
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  detectBrowserLanguage,
  getLanguageFromPathname,
  addLanguageToPathname,
  removeLanguageFromPathname,
  isValidLanguage,
  normalizeLanguage,
  getStoredLanguage,
  setStoredLanguage,
  isRTL,
  getTextDirection,
} from './utils/i18n'
