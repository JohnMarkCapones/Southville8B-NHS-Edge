import enTranslations from './en.json'
import filTranslations from './fil.json'

export type Language = 'en' | 'fil'

export interface Translations {
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    loading: string
    error: string
    success: string
    confirm: string
    close: string
    back: string
    next: string
    previous: string
    search: string
    filter: string
    sort: string
    refresh: string
    submit: string
    reset: string
    clear: string
    select: string
    all: string
    none: string
    yes: string
    no: string
    ok: string
    retry: string
    continue: string
    finish: string
    start: string
    stop: string
    pause: string
    resume: string
  }
  navigation: {
    dashboard: string
    academics: string
    studentLife: string
    tools: string
    publisher: string
    documents: string
    home: string
    news: string
    events: string
    clubs: string
    calendar: string
    library: string
    athletics: string
    portal: string
  }
  student: {
    welcome: string
    readyToAchieve: string
    mySubjects: string
    quizCentral: string
    classSchedule: string
    grades: string
    academicCalendar: string
    certificates: string
    myClubs: string
    myApplications: string
    discoverClubs: string
    schoolEvents: string
    schoolNews: string
    journalist: string
    myArticles: string
    writeArticle: string
    notes: string
    todoList: string
    goals: string
    pomodoroTimer: string
    settings: string
    profile: string
    inviteFriends: string
    shareWithClassmates: string
  }
  header: {
    notifications: string
    markAllRead: string
    noNotifications: string
    viewProfile: string
    accountSettings: string
    signOut: string
    signOutConfirm: string
    language: string
    theme: string
    light: string
    dark: string
    system: string
  }
  productivity: {
    notes: {
      title: string
      addNote: string
      editNote: string
      deleteNote: string
      noteTitle: string
      noteContent: string
      saveNote: string
      cancelEdit: string
      noNotes: string
      searchNotes: string
      lastUpdated: string
    }
    todo: {
      title: string
      addTask: string
      editTask: string
      deleteTask: string
      taskTitle: string
      taskDescription: string
      dueDate: string
      priority: string
      high: string
      medium: string
      low: string
      completed: string
      pending: string
      noTasks: string
      searchTasks: string
      markComplete: string
      markIncomplete: string
    }
    goals: {
      title: string
      addGoal: string
      editGoal: string
      deleteGoal: string
      goalTitle: string
      goalDescription: string
      targetDate: string
      progress: string
      status: string
      active: string
      completed: string
      paused: string
      noGoals: string
      searchGoals: string
      updateProgress: string
    }
    pomodoro: {
      title: string
      work: string
      break: string
      longBreak: string
      startTimer: string
      pauseTimer: string
      resetTimer: string
      workTime: string
      breakTime: string
      longBreakTime: string
      sessions: string
      achievements: string
      statistics: string
      settings: string
      focus: string
      rest: string
      completed: string
      unlocked: string
    }
  }
  auth: {
    login: string
    logout: string
    signIn: string
    signOut: string
    username: string
    password: string
    email: string
    forgotPassword: string
    rememberMe: string
    createAccount: string
    alreadyHaveAccount: string
    dontHaveAccount: string
    loginAs: string
    student: string
    teacher: string
    admin: string
    parent: string
  }
  errors: {
    somethingWentWrong: string
    tryAgain: string
    networkError: string
    unauthorized: string
    notFound: string
    serverError: string
    validationError: string
    timeout: string
  }
  success: {
    saved: string
    updated: string
    deleted: string
    created: string
    sent: string
    uploaded: string
    downloaded: string
  }
  dashboard: {
    welcomeBack: string
    readyToConquer: string
    productiveDay: string
    studyTipOfTheDay: string
    youveGotThis: string
  }
}

export const translations: Record<Language, Translations> = {
  en: enTranslations as Translations,
  fil: filTranslations as Translations,
}

export const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'fil' as Language, name: 'Filipino', flag: '🇵🇭' },
]

export const defaultLanguage: Language = 'en'

export function getLanguageFromCode(code: string): Language {
  return code === 'fil' ? 'fil' : 'en'
}

export function getLanguageName(code: Language): string {
  const language = languages.find(lang => lang.code === code)
  return language?.name || 'English'
}

export function getLanguageFlag(code: Language): string {
  const language = languages.find(lang => lang.code === code)
  return language?.flag || '🇺🇸'
}
