export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  steps?: string[];
  tips?: string[];
  relatedArticles?: string[];
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  articleIds: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

// Help Articles
export const helpArticles: HelpArticle[] = [
  // Getting Started (5 articles)
  {
    id: 'welcome',
    title: 'Welcome to Southville 8B Edge',
    category: 'getting-started',
    tags: ['welcome', 'introduction', 'overview', 'first-time'],
    content: 'Welcome to Southville 8B Edge, your comprehensive school management app. This app helps you stay connected with your academic life, track your schedule, view grades, and stay updated with school announcements.',
    steps: [
      'Download and install the Southville 8B Edge app',
      'Open the app and tap "Login"',
      'Enter your student credentials provided by the school',
      'Complete the initial setup process',
      'Explore the main features through the bottom navigation'
    ],
    tips: [
      'Keep your login credentials secure',
      'Enable notifications to stay updated',
      'Check the app regularly for announcements'
    ],
    relatedArticles: ['login-first-time', 'navigate-interface', 'bottom-navigation']
  },
  {
    id: 'login-first-time',
    title: 'Logging in for the first time',
    category: 'getting-started',
    tags: ['login', 'first-time', 'credentials', 'authentication'],
    content: 'Learn how to log into the Southville 8B Edge app for the first time and set up your account.',
    steps: [
      'Open the Southville 8B Edge app',
      'Tap the "Login" button on the welcome screen',
      'Enter your student ID or email address',
      'Enter your password (provided by the school)',
      'Tap "Login" to access your account',
      'Complete any additional setup prompts'
    ],
    tips: [
      'Contact your teacher if you don\'t have login credentials',
      'Use the "Forgot Password" link if you can\'t remember your password',
      'Keep your login information secure'
    ],
    relatedArticles: ['welcome', 'account-security']
  },
  {
    id: 'navigate-interface',
    title: 'Navigating the app interface',
    category: 'getting-started',
    tags: ['navigation', 'interface', 'ui', 'layout'],
    content: 'Understand the main interface elements and how to navigate through the app effectively.',
    steps: [
      'Familiarize yourself with the bottom navigation bar',
      'Explore the Home tab for an overview of your day',
      'Use the Schedule tab to view your class schedule',
      'Check the Announcements tab for school updates',
      'Visit the Grades tab to view your academic performance',
      'Access the Profile tab for account settings'
    ],
    tips: [
      'The Home tab provides a quick overview of your day',
      'Swipe gestures work on many screens for better navigation',
      'Use the search function to quickly find information'
    ],
    relatedArticles: ['bottom-navigation', 'home-calendar', 'schedule-weekly']
  },
  {
    id: 'bottom-navigation',
    title: 'Understanding the bottom navigation',
    category: 'getting-started',
    tags: ['navigation', 'tabs', 'bottom-bar', 'interface'],
    content: 'Learn about the five main tabs in the bottom navigation and what each one contains.',
    steps: [
      'Home tab: Overview of your day, calendar, announcements, and events',
      'Schedule tab: Your weekly class schedule with detailed information',
      'Announcements tab: All school announcements and updates',
      'Grades tab: Your academic performance and GWA',
      'Profile tab: Personal information and account settings'
    ],
    tips: [
      'Each tab has a distinct color and icon for easy identification',
      'Tap and hold on tabs to see additional options',
      'The active tab is highlighted in blue'
    ],
    relatedArticles: ['navigate-interface', 'home-calendar', 'schedule-weekly']
  },
  {
    id: 'setup-preferences',
    title: 'Setting up your preferences',
    category: 'getting-started',
    tags: ['preferences', 'settings', 'customization', 'setup'],
    content: 'Configure your app preferences to personalize your experience.',
    steps: [
      'Go to the Profile tab',
      'Tap on "Personal Information" to update your details',
      'Access "Notification Settings" to manage alerts',
      'Enable or disable dark mode in the header',
      'Set your preferred notification types'
    ],
    tips: [
      'Enable notifications for important announcements',
      'Use dark mode for better viewing in low light',
      'Keep your profile information up to date'
    ],
    relatedArticles: ['profile-personal-info', 'notifications-settings', 'dark-mode']
  },

  // Home Screen (6 articles)
  {
    id: 'home-calendar',
    title: 'Using the home screen calendar',
    category: 'home',
    tags: ['calendar', 'home', 'dates', 'navigation'],
    content: 'The home screen calendar shows your upcoming classes and important dates. Learn how to use it effectively.',
    steps: [
      'View the calendar widget at the top of the Home tab',
      'See today\'s date highlighted in blue',
      'Tap on different dates to see what\'s scheduled',
      'View upcoming classes for the selected date',
      'Use the timeline to see your day\'s schedule'
    ],
    tips: [
      'Today\'s date is always highlighted for easy reference',
      'Upcoming classes are shown with time and subject',
      'The calendar updates automatically with your schedule'
    ],
    relatedArticles: ['home-today-schedule', 'schedule-weekly', 'home-events']
  },
  {
    id: 'home-today-schedule',
    title: 'Viewing today\'s schedule',
    category: 'home',
    tags: ['schedule', 'today', 'classes', 'timeline'],
    content: 'Quickly view your classes and activities for today directly from the home screen.',
    steps: [
      'Open the Home tab',
      'Look at the calendar section to see today\'s date',
      'Scroll down to view your upcoming classes',
      'Tap on any class card to see more details',
      'Use the timeline to understand your day\'s flow'
    ],
    tips: [
      'Classes are color-coded by subject',
      'Times are displayed in 24-hour format',
      'Tap cards to expand for more information'
    ],
    relatedArticles: ['home-calendar', 'schedule-class-cards', 'home-quick-links']
  },
  {
    id: 'home-announcements',
    title: 'Reading school updates',
    category: 'home',
    tags: ['announcements', 'updates', 'news', 'school'],
    content: 'Stay informed with the latest school announcements and updates on the home screen.',
    steps: [
      'Scroll down on the Home tab to find the "School Updates" section',
      'Read the latest announcements',
      'Notice the color-coded priority levels (red for urgent, blue for general)',
      'Tap on announcements to read the full content',
      'Check the posted date to see how recent the update is'
    ],
    tips: [
      'Urgent announcements appear at the top',
      'Announcements are sorted by date (newest first)',
      'Tap "Read more" to see the full announcement'
    ],
    relatedArticles: ['announcements-reading', 'announcements-priorities', 'home-events']
  },
  {
    id: 'home-events',
    title: 'Checking upcoming events',
    category: 'home',
    tags: ['events', 'upcoming', 'calendar', 'activities'],
    content: 'View upcoming school events, exams, and important dates on the home screen.',
    steps: [
      'Scroll to the "Events" section on the Home tab',
      'View upcoming events with dates and descriptions',
      'Tap on events to see more details',
      'Check event times and locations',
      'Note any special requirements or preparations needed'
    ],
    tips: [
      'Events are sorted by date',
      'Important events like exams are highlighted',
      'Check events regularly to stay prepared'
    ],
    relatedArticles: ['home-calendar', 'home-announcements', 'schedule-weekly']
  },
  {
    id: 'home-quick-links',
    title: 'Using quick links',
    category: 'home',
    tags: ['quick-links', 'navigation', 'shortcuts', 'access'],
    content: 'Use the quick links section to quickly access different parts of the app.',
    steps: [
      'Find the "Quick Links" section on the Home tab',
      'Tap on "Schedule" to go directly to your class schedule',
      'Tap on "Announcements" to view all school updates',
      'Tap on "Grades" to check your academic performance',
      'Tap on "Profile" to access your account settings'
    ],
    tips: [
      'Quick links provide faster access to main features',
      'Each link takes you directly to the relevant tab',
      'Use quick links to save time navigating'
    ],
    relatedArticles: ['bottom-navigation', 'schedule-weekly', 'grades-viewing']
  },
  {
    id: 'home-search',
    title: 'Searching the app',
    category: 'home',
    tags: ['search', 'find', 'lookup', 'filter'],
    content: 'Use the search function to quickly find information across the app.',
    steps: [
      'Look for the search bar on the Home tab',
      'Tap on the search input field',
      'Type keywords related to what you\'re looking for',
      'View search results as you type',
      'Tap on results to navigate to relevant sections'
    ],
    tips: [
      'Search works across announcements, schedules, and grades',
      'Use specific keywords for better results',
      'Clear the search to return to normal view'
    ],
    relatedArticles: ['home-quick-links', 'announcements-reading', 'schedule-weekly']
  },

  // Schedule Screen (5 articles)
  {
    id: 'schedule-weekly',
    title: 'Viewing your weekly schedule',
    category: 'schedule',
    tags: ['schedule', 'weekly', 'classes', 'calendar'],
    content: 'Navigate and understand your weekly class schedule in the Schedule tab.',
    steps: [
      'Tap on the "Schedule" tab in the bottom navigation',
      'View the weekly calendar at the top',
      'See all seven days of the week displayed',
      'Notice today\'s date highlighted in blue',
      'Scroll down to see your class cards for the selected day'
    ],
    tips: [
      'The calendar shows the current week',
      'Today\'s date is always highlighted',
      'Tap different dates to see different days\' schedules'
    ],
    relatedArticles: ['schedule-date-selection', 'schedule-class-cards', 'home-calendar']
  },
  {
    id: 'schedule-date-selection',
    title: 'Selecting different dates',
    category: 'schedule',
    tags: ['dates', 'selection', 'calendar', 'navigation'],
    content: 'Learn how to navigate between different dates to view your schedule.',
    steps: [
      'In the Schedule tab, look at the weekly calendar',
      'Tap on any date to select it',
      'Notice the selected date changes color',
      'View the class cards for the selected date',
      'Use the month/year display to understand the time period'
    ],
    tips: [
      'Selected dates are highlighted in blue',
      'Today\'s date has a special indicator',
      'Class cards update automatically when you select a date'
    ],
    relatedArticles: ['schedule-weekly', 'schedule-class-cards', 'home-calendar']
  },
  {
    id: 'schedule-class-cards',
    title: 'Understanding class cards',
    category: 'schedule',
    tags: ['class-cards', 'subjects', 'colors', 'information'],
    content: 'Understand the information displayed on class cards and what the colors mean.',
    steps: [
      'Look at the class cards below the calendar',
      'Notice each card has a different color representing the subject',
      'Read the subject name at the top of each card',
      'View the teacher\'s name below the subject',
      'Check the time and day information',
      'See the room number and section details'
    ],
    tips: [
      'Colors help identify subjects quickly',
      'Each card shows all essential class information',
      'Cards are sorted by time of day'
    ],
    relatedArticles: ['schedule-subject-details', 'schedule-swipe-gestures', 'schedule-weekly']
  },
  {
    id: 'schedule-subject-details',
    title: 'Reading subject details',
    category: 'schedule',
    tags: ['subject-details', 'information', 'teacher', 'room'],
    content: 'Learn how to read and understand all the details shown on class cards.',
    steps: [
      'Look at a class card in your schedule',
      'Read the subject name (e.g., "Mathematics", "English")',
      'Note the teacher\'s name (e.g., "Mr. Smith")',
      'Check the class time (e.g., "8:00 AM - 9:00 AM")',
      'View the room number (e.g., "Room 201")',
      'See your section information (e.g., "Section A")'
    ],
    tips: [
      'All information is clearly labeled',
      'Times are shown in 24-hour format',
      'Room numbers help you find your classes'
    ],
    relatedArticles: ['schedule-class-cards', 'schedule-swipe-gestures', 'home-today-schedule']
  },
  {
    id: 'schedule-swipe-gestures',
    title: 'Swipe gestures on schedule cards',
    category: 'schedule',
    tags: ['swipe', 'gestures', 'interaction', 'cards'],
    content: 'Use swipe gestures to interact with schedule cards and access additional information.',
    steps: [
      'Find a class card in your schedule',
      'Swipe left or right on the card',
      'Notice the card responds to your gesture',
      'Tap the "Read more" button to expand the card',
      'View additional details like school year and semester',
      'Tap "Show less" to collapse the card'
    ],
    tips: [
      'Swipe gestures make navigation smoother',
      'Expanded cards show more detailed information',
      'Cards remember their expanded state'
    ],
    relatedArticles: ['schedule-class-cards', 'schedule-subject-details', 'schedule-weekly']
  },

  // Announcements Screen (4 articles)
  {
    id: 'announcements-reading',
    title: 'Reading school announcements',
    category: 'announcements',
    tags: ['announcements', 'reading', 'updates', 'news'],
    content: 'Learn how to read and navigate through school announcements effectively.',
    steps: [
      'Tap on the "Announcements" tab in the bottom navigation',
      'Scroll through the list of announcements',
      'Read the announcement title and preview text',
      'Tap on an announcement to expand it',
      'Read the full content and check the posted date',
      'Use the back button to return to the list'
    ],
    tips: [
      'Announcements are sorted by date (newest first)',
      'Tap announcements to read the full content',
      'Check dates to see how recent announcements are'
    ],
    relatedArticles: ['announcements-priorities', 'announcements-expanding', 'home-announcements']
  },
  {
    id: 'announcements-priorities',
    title: 'Understanding announcement priorities',
    category: 'announcements',
    tags: ['priorities', 'urgent', 'important', 'categories'],
    content: 'Understand the different priority levels and what the colors mean.',
    steps: [
      'Look at the announcement cards',
      'Notice the colored left border on each card',
      'Red border indicates urgent/emergency announcements',
      'Blue border indicates general announcements',
      'Green border indicates academic-related announcements',
      'Read the priority badge on each announcement'
    ],
    tips: [
      'Urgent announcements should be read immediately',
      'Color coding helps prioritize which announcements to read first',
      'Priority levels help you manage your time effectively'
    ],
    relatedArticles: ['announcements-reading', 'announcements-categories', 'home-announcements']
  },
  {
    id: 'announcements-expanding',
    title: 'Expanding announcements for details',
    category: 'announcements',
    tags: ['expanding', 'details', 'full-content', 'information'],
    content: 'Learn how to expand announcements to read the full content and additional details.',
    steps: [
      'Tap on any announcement card',
      'Watch the card expand to show more content',
      'Read the full announcement text',
      'Check the posted date and time',
      'View the announcement category',
      'Tap the chevron up icon to collapse the announcement'
    ],
    tips: [
      'Expanded announcements show all available information',
      'Use the collapse button to return to the list view',
      'Expanded state is remembered while browsing'
    ],
    relatedArticles: ['announcements-reading', 'announcements-priorities', 'home-announcements']
  },
  {
    id: 'announcements-categories',
    title: 'Announcement categories explained',
    category: 'announcements',
    tags: ['categories', 'types', 'classification', 'organization'],
    content: 'Understand the different categories of announcements and what each one means.',
    steps: [
      'Look at the announcement cards',
      'Notice the category badges on each announcement',
      'General announcements cover school-wide information',
      'Academic announcements relate to studies and grades',
      'Emergency announcements are for urgent situations',
      'Event announcements inform about upcoming activities'
    ],
    tips: [
      'Categories help you filter relevant information',
      'Academic announcements are important for your studies',
      'Emergency announcements require immediate attention'
    ],
    relatedArticles: ['announcements-priorities', 'announcements-reading', 'home-announcements']
  },

  // Grades Screen (5 articles)
  {
    id: 'grades-viewing',
    title: 'Viewing your GWA',
    category: 'grades',
    tags: ['gwa', 'grades', 'academic', 'performance'],
    content: 'Learn how to view and understand your General Weighted Average (GWA) and academic performance.',
    steps: [
      'Tap on the "Grades" tab in the bottom navigation',
      'View your GWA cards displayed prominently',
      'Notice the colorful gradient backgrounds',
      'Read your GWA score and academic year',
      'Check your semester and grading period',
      'View your overall academic standing'
    ],
    tips: [
      'GWA cards are color-coded for easy identification',
      'Higher GWA scores indicate better academic performance',
      'Check your GWA regularly to track your progress'
    ],
    relatedArticles: ['grades-quarter-filter', 'grades-year-filter', 'grades-displays']
  },
  {
    id: 'grades-quarter-filter',
    title: 'Filtering grades by quarter',
    category: 'grades',
    tags: ['filtering', 'quarter', 'grading-period', 'q1-q4'],
    content: 'Use the quarter filter to view grades from specific grading periods.',
    steps: [
      'In the Grades tab, find the filter section',
      'Look for the "Quarter" filter chips',
      'Tap on "Q1" to view first quarter grades',
      'Tap on "Q2" to view second quarter grades',
      'Tap on "Q3" to view third quarter grades',
      'Tap on "Q4" to view fourth quarter grades',
      'Tap on "All" to view all quarters'
    ],
    tips: [
      'Selected quarters are highlighted in blue',
      'Filtering helps you focus on specific periods',
      'Use "All" to see your overall performance'
    ],
    relatedArticles: ['grades-viewing', 'grades-year-filter', 'grades-displays']
  },
  {
    id: 'grades-year-filter',
    title: 'Filtering grades by school year',
    category: 'grades',
    tags: ['filtering', 'school-year', 'academic-year', 'period'],
    content: 'Filter your grades by school year to view performance across different academic periods.',
    steps: [
      'In the Grades tab, find the filter section',
      'Look for the "School Year" filter chips',
      'Tap on a specific school year (e.g., "2024-2025")',
      'View grades for that academic year',
      'Tap on "All Years" to view grades from all periods',
      'Combine with quarter filters for more specific results'
    ],
    tips: [
      'School year filters help track long-term progress',
      'Combine with quarter filters for detailed analysis',
      'Use "All Years" to see your complete academic history'
    ],
    relatedArticles: ['grades-viewing', 'grades-quarter-filter', 'grades-displays']
  },
  {
    id: 'grades-displays',
    title: 'Understanding grade displays',
    category: 'grades',
    tags: ['displays', 'format', 'scores', 'interpretation'],
    content: 'Learn how to read and interpret the different grade displays and formats.',
    steps: [
      'Look at your GWA cards',
      'Notice the numerical score displayed prominently',
      'Read the academic year and semester information',
      'Check the grading period (Q1, Q2, Q3, Q4)',
      'View your overall standing and performance level',
      'Understand the color coding of the cards'
    ],
    tips: [
      'GWA scores are typically on a scale of 1.0 to 5.0',
      'Lower scores indicate better performance',
      'Color coding helps identify performance levels'
    ],
    relatedArticles: ['grades-viewing', 'grades-interpretation', 'grades-quarter-filter']
  },
  {
    id: 'grades-interpretation',
    title: 'Interpreting your academic performance',
    category: 'grades',
    tags: ['interpretation', 'performance', 'analysis', 'understanding'],
    content: 'Learn how to interpret your grades and understand what they mean for your academic progress.',
    steps: [
      'Review your GWA score',
      'Compare it with previous quarters',
      'Check your overall academic standing',
      'Look for trends in your performance',
      'Identify areas that need improvement',
      'Celebrate areas of strength'
    ],
    tips: [
      'Consistent improvement shows good academic progress',
      'Lower GWA scores indicate better performance',
      'Use grades to identify subjects that need more attention'
    ],
    relatedArticles: ['grades-displays', 'grades-viewing', 'grades-quarter-filter']
  },

  // Profile Screen (5 articles)
  {
    id: 'profile-personal-info',
    title: 'Viewing personal information',
    category: 'profile',
    tags: ['personal-info', 'profile', 'details', 'information'],
    content: 'Access and view your personal information in the Profile tab.',
    steps: [
      'Tap on the "Profile" tab in the bottom navigation',
      'View your profile header with avatar and name',
      'Check your email address and student role',
      'Scroll down to see your academic stats',
      'View your grade level, section, and ranking',
      'Access additional personal information'
    ],
    tips: [
      'Your profile shows your current academic status',
      'Keep your information up to date',
      'Contact your teacher if information is incorrect'
    ],
    relatedArticles: ['profile-account-security', 'profile-school-info', 'profile-managing']
  },
  {
    id: 'profile-account-security',
    title: 'Accessing account security features',
    category: 'profile',
    tags: ['account-security', 'security', 'password', 'authentication'],
    content: 'Learn how to access and manage your account security settings.',
    steps: [
      'In the Profile tab, scroll to the "Personal" section',
      'Tap on "Account Security"',
      'View available security features',
      'Access password change options',
      'Enable two-factor authentication (when available)',
      'Review account activity logs'
    ],
    tips: [
      'Keep your password secure and change it regularly',
      'Enable two-factor authentication for better security',
      'Review account activity to detect unauthorized access'
    ],
    relatedArticles: ['profile-personal-info', 'profile-managing', 'login-first-time']
  },
  {
    id: 'profile-school-info',
    title: 'Checking school information',
    category: 'profile',
    tags: ['school-info', 'academic', 'institution', 'details'],
    content: 'View detailed information about your school and academic program.',
    steps: [
      'In the Profile tab, scroll to the "Personal" section',
      'Tap on "School Information"',
      'View your school overview and details',
      'Check your academic information',
      'Read about school programs and services',
      'View contact information and school hours'
    ],
    tips: [
      'School information helps you understand your academic environment',
      'Contact information is useful for reaching school administration',
      'Program information helps you make informed academic decisions'
    ],
    relatedArticles: ['profile-personal-info', 'profile-managing', 'grades-viewing']
  },
  {
    id: 'profile-managing',
    title: 'Managing your profile',
    category: 'profile',
    tags: ['managing', 'profile', 'updates', 'maintenance'],
    content: 'Learn how to manage and update your profile information.',
    steps: [
      'Access the Profile tab',
      'Review your current information',
      'Tap on "Personal Information" to update details',
      'Update contact information if needed',
      'Check and verify academic information',
      'Save any changes you make'
    ],
    tips: [
      'Keep your profile information current',
      'Update contact information when it changes',
      'Verify academic information with your teachers'
    ],
    relatedArticles: ['profile-personal-info', 'profile-account-security', 'profile-logout']
  },
  {
    id: 'profile-logout',
    title: 'Logging out safely',
    category: 'profile',
    tags: ['logout', 'sign-out', 'security', 'session'],
    content: 'Learn how to log out of the app safely and securely.',
    steps: [
      'In the Profile tab, scroll to the bottom',
      'Find the red "LOGOUT" button',
      'Tap on the logout button',
      'Confirm that you want to log out',
      'Wait for the logout process to complete',
      'You will be returned to the login screen'
    ],
    tips: [
      'Always log out when using shared devices',
      'Logging out protects your account from unauthorized access',
      'You can log back in anytime with your credentials'
    ],
    relatedArticles: ['profile-managing', 'login-first-time', 'profile-account-security']
  },

  // Notifications Screen (3 articles)
  {
    id: 'notifications-viewing',
    title: 'Viewing notifications',
    category: 'notifications',
    tags: ['notifications', 'viewing', 'alerts', 'updates'],
    content: 'Learn how to view and manage your notifications effectively.',
    steps: [
      'Tap on the notification bell icon in the header',
      'View your notification list',
      'Read notification titles and previews',
      'Tap on notifications to read full content',
      'Mark notifications as read by tapping them',
      'Use the "Mark all read" option to clear all notifications'
    ],
    tips: [
      'Unread notifications are highlighted',
      'Notifications are sorted by date (newest first)',
      'Tap notifications to mark them as read'
    ],
    relatedArticles: ['notifications-settings', 'notifications-types', 'home-announcements']
  },
  {
    id: 'notifications-settings',
    title: 'Managing notification settings',
    category: 'notifications',
    tags: ['notification-settings', 'preferences', 'alerts', 'management'],
    content: 'Configure your notification preferences to control what alerts you receive.',
    steps: [
      'In the notifications screen, tap the settings icon',
      'Access notification settings',
      'Toggle "In-app notifications" on or off',
      'Enable or disable "Schedule notifications"',
      'Control "Event notifications" as needed',
      'Save your preferences'
    ],
    tips: [
      'Enable notifications for important updates',
      'Disable notifications you don\'t need',
      'You can change settings anytime'
    ],
    relatedArticles: ['notifications-viewing', 'notifications-types', 'profile-personal-info']
  },
  {
    id: 'notifications-types',
    title: 'Understanding notification types',
    category: 'notifications',
    tags: ['notification-types', 'categories', 'alerts', 'classification'],
    content: 'Learn about the different types of notifications and what each one means.',
    steps: [
      'View your notification list',
      'Notice the different icons for each notification type',
      'Class schedule notifications show calendar icons',
      'School event notifications show megaphone icons',
      'Announcement notifications show notification icons',
      'Grade notifications show school icons'
    ],
    tips: [
      'Different icons help you identify notification types quickly',
      'Priority notifications appear at the top',
      'Each type serves a different purpose'
    ],
    relatedArticles: ['notifications-viewing', 'notifications-settings', 'announcements-reading']
  },

  // Settings (3 articles)
  {
    id: 'dark-mode',
    title: 'Enabling dark mode',
    category: 'settings',
    tags: ['dark-mode', 'theme', 'appearance', 'preferences'],
    content: 'Learn how to enable and use dark mode for better viewing in low light conditions.',
    steps: [
      'Look for the theme toggle button in the header',
      'Tap the moon icon to enable dark mode',
      'Notice the app interface changes to dark colors',
      'Tap the sun icon to switch back to light mode',
      'Your preference is saved automatically',
      'Dark mode affects all screens in the app'
    ],
    tips: [
      'Dark mode is easier on the eyes in low light',
      'Your theme preference is remembered',
      'Switch between modes anytime'
    ],
    relatedArticles: ['theme-preferences', 'setup-preferences', 'profile-managing']
  },
  {
    id: 'theme-preferences',
    title: 'Customizing theme preferences',
    category: 'settings',
    tags: ['theme-preferences', 'customization', 'appearance', 'settings'],
    content: 'Customize your app appearance and theme preferences.',
    steps: [
      'Access the theme toggle in the header',
      'Switch between light and dark modes',
      'Notice how colors change throughout the app',
      'Check that text remains readable in both modes',
      'Your preference is automatically saved',
      'The theme applies to all screens consistently'
    ],
    tips: [
      'Choose the theme that works best for you',
      'Light mode is better for bright environments',
      'Dark mode is better for low light conditions'
    ],
    relatedArticles: ['dark-mode', 'setup-preferences', 'profile-managing']
  },
  {
    id: 'account-security-options',
    title: 'Account security options',
    category: 'settings',
    tags: ['account-security', 'security', 'password', 'authentication'],
    content: 'Learn about available account security options and how to use them.',
    steps: [
      'Go to the Profile tab',
      'Tap on "Account Security"',
      'Review available security features',
      'Change your password if needed',
      'Enable two-factor authentication (when available)',
      'Review your account activity'
    ],
    tips: [
      'Keep your password strong and unique',
      'Enable additional security features when available',
      'Regularly review your account activity'
    ],
    relatedArticles: ['profile-account-security', 'login-first-time', 'profile-managing']
  }
];

// Help Categories
export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using the Southville 8B Edge app',
    icon: 'rocket-outline',
    color: '#2196F3',
    articleIds: ['welcome', 'login-first-time', 'navigate-interface', 'bottom-navigation', 'setup-preferences']
  },
  {
    id: 'home',
    title: 'Home Screen',
    description: 'Master the home screen features and navigation',
    icon: 'home-outline',
    color: '#4CAF50',
    articleIds: ['home-calendar', 'home-today-schedule', 'home-announcements', 'home-events', 'home-quick-links', 'home-search']
  },
  {
    id: 'schedule',
    title: 'Schedule',
    description: 'Navigate your class schedule and view class details',
    icon: 'calendar-outline',
    color: '#FF9800',
    articleIds: ['schedule-weekly', 'schedule-date-selection', 'schedule-class-cards', 'schedule-subject-details', 'schedule-swipe-gestures']
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Stay updated with school announcements and news',
    icon: 'megaphone-outline',
    color: '#9C27B0',
    articleIds: ['announcements-reading', 'announcements-priorities', 'announcements-expanding', 'announcements-categories']
  },
  {
    id: 'grades',
    title: 'Grades',
    description: 'View and understand your academic performance',
    icon: 'school-outline',
    color: '#F44336',
    articleIds: ['grades-viewing', 'grades-quarter-filter', 'grades-year-filter', 'grades-displays', 'grades-interpretation']
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal information and account settings',
    icon: 'person-outline',
    color: '#607D8B',
    articleIds: ['profile-personal-info', 'profile-account-security', 'profile-school-info', 'profile-managing', 'profile-logout']
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage notifications and stay informed',
    icon: 'notifications-outline',
    color: '#795548',
    articleIds: ['notifications-viewing', 'notifications-settings', 'notifications-types']
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your app experience and preferences',
    icon: 'settings-outline',
    color: '#009688',
    articleIds: ['dark-mode', 'theme-preferences', 'account-security-options']
  }
];

// Task Categories
export const taskCategories: HelpCategory[] = [
  {
    id: 'getting-started-tasks',
    title: 'Getting Started',
    description: 'Essential tasks for new users',
    icon: 'play-outline',
    color: '#2196F3',
    articleIds: ['welcome', 'login-first-time', 'navigate-interface', 'bottom-navigation', 'setup-preferences']
  },
  {
    id: 'viewing-data-tasks',
    title: 'Viewing Data',
    description: 'How to view schedules, grades, and announcements',
    icon: 'eye-outline',
    color: '#4CAF50',
    articleIds: ['home-calendar', 'schedule-weekly', 'grades-viewing', 'announcements-reading', 'notifications-viewing']
  },
  {
    id: 'managing-account-tasks',
    title: 'Managing Account',
    description: 'Account management and profile settings',
    icon: 'person-circle-outline',
    color: '#FF9800',
    articleIds: ['profile-personal-info', 'profile-account-security', 'profile-managing', 'profile-logout']
  },
  {
    id: 'troubleshooting-tasks',
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: 'help-circle-outline',
    color: '#F44336',
    articleIds: ['login-first-time', 'profile-account-security', 'notifications-settings']
  },
  {
    id: 'settings-preferences-tasks',
    title: 'Settings & Preferences',
    description: 'Customizing your app experience',
    icon: 'cog-outline',
    color: '#9C27B0',
    articleIds: ['dark-mode', 'theme-preferences', 'notifications-settings', 'setup-preferences']
  }
];

// FAQs
export const faqs: FAQ[] = [
  {
    id: 'faq-password-reset',
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login screen and tap "Forgot Password". Enter your email address and follow the instructions sent to your email. If you don\'t receive the email, check your spam folder or contact your teacher for assistance.',
    category: 'account',
    tags: ['password', 'reset', 'login', 'forgot']
  },
  {
    id: 'faq-view-grades',
    question: 'Where can I view my grades?',
    answer: 'You can view your grades in the "Grades" tab. Your GWA (General Weighted Average) is displayed prominently on colorful cards. Use the filter options to view grades by quarter (Q1-Q4) or school year. Tap on grade cards to see more detailed information.',
    category: 'grades',
    tags: ['grades', 'gwa', 'view', 'academic']
  },
  {
    id: 'faq-check-schedule',
    question: 'How do I check my class schedule?',
    answer: 'Go to the "Schedule" tab to view your weekly class schedule. The calendar shows all seven days of the week, with today\'s date highlighted. Tap on different dates to see schedules for those days. Class cards show subject, teacher, time, and room information.',
    category: 'schedule',
    tags: ['schedule', 'classes', 'calendar', 'weekly']
  },
  {
    id: 'faq-school-announcements',
    question: 'Where can I see school announcements?',
    answer: 'School announcements are displayed in two places: 1) On the Home tab in the "School Updates" section, and 2) In the dedicated "Announcements" tab. Announcements are color-coded by priority (red for urgent, blue for general). Tap announcements to read the full content.',
    category: 'announcements',
    tags: ['announcements', 'school', 'updates', 'news']
  },
  {
    id: 'faq-update-profile',
    question: 'How do I update my profile information?',
    answer: 'Go to the "Profile" tab and tap on "Personal Information" to view and update your details. You can update contact information, check academic details, and verify your student information. Contact your teacher if you need to change academic information.',
    category: 'profile',
    tags: ['profile', 'personal-info', 'update', 'information']
  },
  {
    id: 'faq-gwa-calculation',
    question: 'What is GWA and how is it calculated?',
    answer: 'GWA stands for General Weighted Average, which is your overall academic performance score. It\'s calculated based on your grades in all subjects, with different subjects having different weights. Lower GWA scores indicate better performance (typically 1.0-5.0 scale).',
    category: 'grades',
    tags: ['gwa', 'calculation', 'grades', 'academic']
  },
  {
    id: 'faq-enable-dark-mode',
    question: 'How do I enable dark mode?',
    answer: 'Look for the theme toggle button in the header (moon/sun icon) and tap it to switch between light and dark modes. Dark mode is easier on the eyes in low light conditions. Your preference is automatically saved and applies to all screens.',
    category: 'settings',
    tags: ['dark-mode', 'theme', 'appearance', 'toggle']
  },
  {
    id: 'faq-filter-announcements',
    question: 'Can I filter announcements by type?',
    answer: 'Yes! Announcements are automatically categorized and color-coded. Red borders indicate urgent announcements, blue borders indicate general announcements, and green borders indicate academic announcements. You can also search for specific announcements using keywords.',
    category: 'announcements',
    tags: ['filter', 'announcements', 'categories', 'types']
  },
  {
    id: 'faq-view-notifications',
    question: 'How do I view notifications?',
    answer: 'Tap the notification bell icon in the header to view your notifications. Unread notifications are highlighted. Tap on notifications to read the full content and mark them as read. Use "Mark all read" to clear all notifications at once.',
    category: 'notifications',
    tags: ['notifications', 'view', 'alerts', 'bell']
  },
  {
    id: 'faq-schedule-colors',
    question: 'What do the different colors on schedule cards mean?',
    answer: 'Each subject has a unique color to help you quickly identify classes. The colors are consistent throughout the app - for example, Mathematics might be blue, English might be green, Science might be orange, etc. This color coding makes it easier to spot your classes at a glance.',
    category: 'schedule',
    tags: ['colors', 'schedule', 'subjects', 'cards']
  },
  {
    id: 'faq-contact-support',
    question: 'How do I contact support?',
    answer: 'If you need help, you can contact support through the Help Center. Go to the Help Center and scroll to the bottom to find the "Contact Support" section. You can also reach out to your teachers or school administration for assistance with academic matters.',
    category: 'support',
    tags: ['contact', 'support', 'help', 'assistance']
  },
  {
    id: 'faq-schedule-loading',
    question: 'What if my schedule doesn\'t load?',
    answer: 'If your schedule doesn\'t load, try refreshing the app by pulling down on the screen or closing and reopening the app. Check your internet connection. If the problem persists, contact your teacher or school administration as there might be an issue with your student profile.',
    category: 'troubleshooting',
    tags: ['schedule', 'loading', 'error', 'troubleshooting']
  },
  {
    id: 'faq-past-announcements',
    question: 'How do I view past announcements?',
    answer: 'All announcements are stored in the "Announcements" tab, sorted by date with the newest first. Scroll down to see older announcements. You can also use the search function to find specific announcements by keywords or topics.',
    category: 'announcements',
    tags: ['past', 'announcements', 'history', 'older']
  },
  {
    id: 'faq-download-grades',
    question: 'Can I download my grades?',
    answer: 'Currently, the app displays your grades online. For official grade reports or transcripts, contact your teacher or school administration. They can provide you with official documents that you can download or print.',
    category: 'grades',
    tags: ['download', 'grades', 'official', 'transcript']
  },
  {
    id: 'faq-notification-settings',
    question: 'How do I change notification settings?',
    answer: 'Go to the "Profile" tab and tap on "Personal Information", then select "Notification Settings". You can toggle different types of notifications on or off, including in-app notifications, schedule notifications, and event notifications.',
    category: 'notifications',
    tags: ['notification-settings', 'preferences', 'toggle', 'manage']
  },
  {
    id: 'faq-profile-information',
    question: 'What information is shown on my profile?',
    answer: 'Your profile shows your personal information (name, email, student ID), academic stats (grade level, section, ranking), and provides access to account security features, school information, and notification settings.',
    category: 'profile',
    tags: ['profile', 'information', 'personal', 'academic']
  },
  {
    id: 'faq-navigate-dates',
    question: 'How do I navigate between dates on the schedule?',
    answer: 'In the Schedule tab, tap on different dates in the weekly calendar to view schedules for those days. Today\'s date is highlighted in blue. You can also swipe left or right on class cards for additional interaction.',
    category: 'schedule',
    tags: ['navigate', 'dates', 'calendar', 'schedule']
  },
  {
    id: 'faq-quick-links',
    question: 'What are the quick links on the home screen?',
    answer: 'Quick links on the home screen provide fast access to main features: Schedule (view your classes), Announcements (read school updates), Grades (check your performance), and Profile (manage your account). These shortcuts save time navigating the app.',
    category: 'home',
    tags: ['quick-links', 'shortcuts', 'navigation', 'home']
  },
  {
    id: 'faq-data-update',
    question: 'How often is data updated?',
    answer: 'Data is updated in real-time when you refresh the app or navigate between screens. Announcements are updated as soon as they\'re posted by the school. Grades are updated when teachers submit them. Schedules are updated when changes are made by the school.',
    category: 'general',
    tags: ['data', 'update', 'real-time', 'refresh']
  },
  {
    id: 'faq-encounter-error',
    question: 'What should I do if I encounter an error?',
    answer: 'If you encounter an error, try refreshing the app by pulling down on the screen or closing and reopening the app. Check your internet connection. If the error persists, note down the error message and contact support or your teacher for assistance.',
    category: 'troubleshooting',
    tags: ['error', 'troubleshooting', 'support', 'help']
  }
];

// Search function
export const searchHelpContent = (query: string, articles: HelpArticle[], faqs: FAQ[]) => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return { articles: [], faqs: [] };
  
  const matchedArticles = articles.filter(article => 
    article.title.toLowerCase().includes(normalizedQuery) ||
    article.content.toLowerCase().includes(normalizedQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  );
  
  const matchedFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(normalizedQuery) ||
    faq.answer.toLowerCase().includes(normalizedQuery) ||
    faq.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  );
  
  return { articles: matchedArticles, faqs: matchedFAQs };
};
