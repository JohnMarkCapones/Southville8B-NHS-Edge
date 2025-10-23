"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Language, defaultLanguage, getLanguageFromCode } from '../translations'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [storedLanguage, setStoredLanguage] = useLocalStorage<Language>('app-language', defaultLanguage)
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Check if we have a stored language preference
        if (storedLanguage) {
          setLanguageState(storedLanguage)
        } else {
          // Try to detect browser language
          const browserLanguage = navigator.language || navigator.languages?.[0]
          const detectedLanguage = getLanguageFromCode(browserLanguage)
          setLanguageState(detectedLanguage)
          setStoredLanguage(detectedLanguage)
        }
      } catch (error) {
        console.error('Error initializing language:', error)
        setLanguageState(defaultLanguage)
      } finally {
        setIsLoading(false)
      }
    }

    initializeLanguage()
  }, [storedLanguage, setStoredLanguage])

  const setLanguage = (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage)
      setStoredLanguage(newLanguage)
      
      // Update HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLanguage
      }
    } catch (error) {
      console.error('Error setting language:', error)
    }
  }

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const value: LanguageContextType = {
    language,
    setLanguage,
    isLoading,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook for getting current language without context
export function useCurrentLanguage(): Language {
  const { language } = useLanguage()
  return language
}
