/**
 * Robust localStorage utilities for productivity tools
 * Handles errors, fallbacks, and data validation
 */

export interface StorageOptions {
  key: string
  defaultValue?: any
  validate?: (data: any) => boolean
}

export class LocalStorageManager {
  private static instance: LocalStorageManager
  private storage: Storage

  constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : null as any
  }

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }

  /**
   * Safely get data from localStorage
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.storage) return defaultValue

    try {
      const item = this.storage.getItem(key)
      if (item === null) return defaultValue

      const parsed = JSON.parse(item)
      return parsed
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      // Remove corrupted data
      this.remove(key)
      return defaultValue
    }
  }

  /**
   * Safely set data to localStorage
   */
  set<T>(key: string, value: T): boolean {
    if (!this.storage) return false

    try {
      const serialized = JSON.stringify(value)
      this.storage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
      return false
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): boolean {
    if (!this.storage) return false

    try {
      this.storage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
      return false
    }
  }

  /**
   * Check if key exists in localStorage
   */
  has(key: string): boolean {
    if (!this.storage) return false
    return this.storage.getItem(key) !== null
  }

  /**
   * Get all keys that start with a prefix
   */
  getKeysWithPrefix(prefix: string): string[] {
    if (!this.storage) return []

    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * Clear all data with a specific prefix
   */
  clearWithPrefix(prefix: string): void {
    if (!this.storage) return

    const keys = this.getKeysWithPrefix(prefix)
    keys.forEach(key => this.remove(key))
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    if (!this.storage) return { used: 0, available: 0, total: 0 }

    let used = 0
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key) {
        const value = this.storage.getItem(key)
        if (value) {
          used += key.length + value.length
        }
      }
    }

    // Estimate total storage (usually 5-10MB)
    const total = 5 * 1024 * 1024 // 5MB estimate
    const available = total - used

    return { used, available, total }
  }
}

// Export singleton instance
export const storage = LocalStorageManager.getInstance()

// Specific storage functions for productivity tools
export const productivityStorage = {
  // Notes
  getNotes: () => storage.get('student-notes-v2', []),
  setNotes: (notes: any[]) => storage.set('student-notes-v2', notes),
  
  // Todos
  getTodos: () => storage.get('student-todos-v2', []),
  setTodos: (todos: any[]) => storage.set('student-todos-v2', todos),
  
  // Goals
  getGoals: () => storage.get('student-goals-v2', []),
  setGoals: (goals: any[]) => storage.set('student-goals-v2', goals),
  
  // Pomodoro
  getPomodoroSessions: () => storage.get('pomodoro-sessions-v2', []),
  setPomodoroSessions: (sessions: any[]) => storage.set('pomodoro-sessions-v2', sessions),
  
  getPomodoroSettings: () => storage.get('pomodoro-settings-v2', {
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
  }),
  setPomodoroSettings: (settings: any) => storage.set('pomodoro-settings-v2', settings),
  
  getPomodoroAchievements: () => storage.get('pomodoro-achievements-v2', []),
  setPomodoroAchievements: (achievements: any[]) => storage.set('pomodoro-achievements-v2', achievements),
}

// Migration function to move from old keys to new keys
export const migrateStorage = () => {
  const migrations = [
    { from: 'student-notes', to: 'student-notes-v2' },
    { from: 'student-todos', to: 'student-todos-v2' },
    { from: 'student-goals', to: 'student-goals-v2' },
    { from: 'pomodoro-sessions', to: 'pomodoro-sessions-v2' },
    { from: 'pomodoro-settings', to: 'pomodoro-settings-v2' },
    { from: 'pomodoro-achievements', to: 'pomodoro-achievements-v2' },
  ]

  migrations.forEach(({ from, to }) => {
    if (storage.has(from) && !storage.has(to)) {
      const data = storage.get(from)
      if (data) {
        storage.set(to, data)
        console.log(`Migrated ${from} to ${to}`)
      }
    }
  })
}

// Auto-migrate on import
if (typeof window !== 'undefined') {
  migrateStorage()
}
