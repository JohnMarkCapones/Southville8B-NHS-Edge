"use client"

import { useLanguage } from '../context/LanguageContext'
import { translations, Translations, Language } from '../translations'

type TranslationKey = string
type TranslationPath = string

// Helper type to get nested object keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type TranslationKeys = NestedKeyOf<Translations>

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj) || path
}

// Helper function to interpolate variables in translation strings
function interpolate(template: string, variables: Record<string, any> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

export function useTranslation() {
  const { language, setLanguage, isLoading } = useLanguage()

  const t = (key: TranslationKeys, variables?: Record<string, any>): string => {
    try {
      const translation = getNestedValue(translations[language], key)
      
      if (typeof translation !== 'string') {
        console.warn(`Translation key "${key}" not found for language "${language}"`)
        return key
      }

      return variables ? interpolate(translation, variables) : translation
    } catch (error) {
      console.error(`Error getting translation for key "${key}":`, error)
      return key
    }
  }

  const tWithFallback = (key: TranslationKeys, fallback: string, variables?: Record<string, any>): string => {
    try {
      const translation = getNestedValue(translations[language], key)
      
      if (typeof translation !== 'string') {
        return variables ? interpolate(fallback, variables) : fallback
      }

      return variables ? interpolate(translation, variables) : translation
    } catch (error) {
      console.error(`Error getting translation for key "${key}":`, error)
      return variables ? interpolate(fallback, variables) : fallback
    }
  }

  const getAvailableLanguages = () => {
    return Object.keys(translations) as Language[]
  }

  const isLanguageSupported = (lang: string): lang is Language => {
    return lang in translations
  }

  return {
    t,
    tWithFallback,
    language,
    setLanguage,
    isLoading,
    getAvailableLanguages,
    isLanguageSupported,
  }
}

// Hook for getting translations without context (useful for server components)
export function useStaticTranslation(language: Language = 'en') {
  const t = (key: TranslationKeys, variables?: Record<string, any>): string => {
    try {
      const translation = getNestedValue(translations[language], key)
      
      if (typeof translation !== 'string') {
        console.warn(`Translation key "${key}" not found for language "${language}"`)
        return key
      }

      return variables ? interpolate(translation, variables) : translation
    } catch (error) {
      console.error(`Error getting translation for key "${key}":`, error)
      return key
    }
  }

  return { t }
}

// Utility function for server-side translation
export function getTranslation(language: Language, key: TranslationKeys, variables?: Record<string, any>): string {
  try {
    const translation = getNestedValue(translations[language], key)
    
    if (typeof translation !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`)
      return key
    }

    return variables ? interpolate(translation, variables) : translation
  } catch (error) {
    console.error(`Error getting translation for key "${key}":`, error)
    return key
  }
}
