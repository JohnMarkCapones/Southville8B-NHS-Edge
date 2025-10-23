import { useState, useEffect, useCallback } from 'react'
import { storage } from '@/lib/storage/localStorage'

/**
 * Custom hook for reliable localStorage with React state synchronization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    validate?: (value: any) => boolean
    onError?: (error: Error) => void
  } = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { validate, onError } = options

  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.get(key)
      
      // If no item found, return initial value
      if (item === null) {
        return initialValue
      }

      // Validate the data if validator provided
      if (validate && !validate(item)) {
        console.warn(`Invalid data for key "${key}", using initial value`)
        return initialValue
      }

      return item
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      onError?.(error as Error)
      return initialValue
    }
  })

  // Function to update both state and localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Update state
        setStoredValue(valueToStore)

        // Update localStorage
        const success = storage.set(key, valueToStore)
        if (!success) {
          throw new Error('Failed to save to localStorage')
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
        onError?.(error as Error)
      }
    },
    [key, storedValue, onError]
  )

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      storage.remove(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
      onError?.(error as Error)
    }
  }, [key, initialValue, onError])

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook specifically for productivity tools data
 */
export function useProductivityStorage() {
  // Notes
  const [notes, setNotes] = useLocalStorage('student-notes-v2', [], {
    validate: (data) => Array.isArray(data)
  })

  // Todos
  const [todos, setTodos] = useLocalStorage('student-todos-v2', [], {
    validate: (data) => Array.isArray(data)
  })

  // Goals
  const [goals, setGoals] = useLocalStorage('student-goals-v2', [], {
    validate: (data) => Array.isArray(data)
  })

  // Pomodoro sessions
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage('pomodoro-sessions-v2', [], {
    validate: (data) => Array.isArray(data)
  })

  // Pomodoro settings
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage('pomodoro-settings-v2', {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    soundType: 'bell',
    autoStartBreaks: false,
    autoStartPomodoros: false,
    darkMode: false,
    notifications: true,
  }, {
    validate: (data) => typeof data === 'object' && data !== null
  })

  // Pomodoro achievements
  const [pomodoroAchievements, setPomodoroAchievements] = useLocalStorage('pomodoro-achievements-v2', [], {
    validate: (data) => Array.isArray(data)
  })

  return {
    notes: { data: notes, setData: setNotes },
    todos: { data: todos, setData: setTodos },
    goals: { data: goals, setData: setGoals },
    pomodoroSessions: { data: pomodoroSessions, setData: setPomodoroSessions },
    pomodoroSettings: { data: pomodoroSettings, setData: setPomodoroSettings },
    pomodoroAchievements: { data: pomodoroAchievements, setData: setPomodoroAchievements },
  }
}
