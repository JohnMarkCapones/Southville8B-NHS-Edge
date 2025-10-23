export interface HelpSection {
  id: string
  title: string
  icon: string
  description: string
  content: HelpContent[]
  quickActions?: QuickAction[]
}

export interface HelpContent {
  id: string
  title: string
  type: 'guide' | 'troubleshooting' | 'reference' | 'video'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  content: string
  steps?: string[]
  code?: string
  relatedPages?: string[]
  tags: string[]
}

export interface QuickAction {
  id: string
  title: string
  description: string
  action: 'navigate' | 'contact' | 'external'
  target: string
  icon: string
}

export const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    description: 'New to the system? Start here to learn the basics and get up to speed quickly.',
    quickActions: [
      {
        id: 'first-login',
        title: 'First Login Guide',
        description: 'Complete step-by-step first login process',
        action: 'navigate',
        target: '/superadmin/overview',
        icon: '🔑'
      },
      {
        id: 'dashboard-tour',
        title: 'Dashboard Tour',
        description: 'Take a guided tour of the main dashboard',
        action: 'navigate',
        target: '/superadmin/overview',
        icon: '🗺️'
      },
      {
        id: 'contact-admin',
        title: 'Contact Administrator',
        description: 'Get help from system administrator',
        action: 'contact',
        target: 'admin@southville8bnhs.edu.ph',
        icon: '📧'
      },
      {
        id: 'system-overview',
        title: 'System Overview',
        description: 'Understand the complete system architecture',
        action: 'navigate',
        target: '/superadmin/overview',
        icon: '🏗️'
      }
    ],
    content: [
      {
        id: 'welcome',
        title: 'Welcome to SuperAdmin Dashboard',
        type: 'guide',
        difficulty: 'beginner',
        content: 'Welcome to the Southville 8B NHS SuperAdmin dashboard. This comprehensive system provides powerful management tools for school administration, student management, content creation, and system configuration. This guide will help you navigate and utilize all features effectively.',
        steps: [
          'Log in with your administrator credentials provided by the IT department',
          'Familiarize yourself with the dashboard layout and navigation structure',
          'Review your user permissions and access levels in the profile section',
          'Set up your profile information and notification preferences',
          'Explore the main navigation sections to understand available features',
          'Bookmark frequently used pages for quick access',
          'Configure your dashboard widgets and layout preferences',
          'Review the system status and health indicators'
        ],
        tags: ['welcome', 'basics', 'login', 'dashboard', 'navigation'],
        relatedPages: ['/superadmin/overview', '/superadmin/profile', '/superadmin/settings']
      },
      {
        id: 'navigation',
        title: 'Navigation and Interface Guide',
        type: 'guide',
        difficulty: 'beginner',
        content: 'Learn how to navigate through the SuperAdmin interface efficiently and make the most of the available tools and features.',
        steps: [
          'Use the primary sidebar for main sections - click to expand/collapse',
          'Utilize the search functionality to quickly find specific features',
          'Bookmark frequently used pages using the star icon',
          'Use keyboard shortcuts for faster navigation (Ctrl+H for help)',
          'Access quick actions from the top navigation bar',
          'Use the breadcrumb navigation to understand your current location',
          'Switch between different views using the view toggle buttons',
          'Access user menu and settings from the top-right corner'
        ],
        tags: ['navigation', 'interface', 'basics', 'shortcuts', 'efficiency'],
        relatedPages: ['/superadmin/overview', '/superadmin/settings']
      },
      {
        id: 'permissions',
        title: 'Understanding User Permissions',
        type: 'guide',
        difficulty: 'intermediate',
        content: 'Learn about the different permission levels and how they affect your access to various system features.',
        steps: [
          'Review your current permission level in the profile section',
          'Understand the difference between SuperAdmin, Admin, and Teacher roles',
          'Check which sections and features you have access to',
          'Contact the system administrator if you need additional permissions',
          'Learn about role-based access control (RBAC) implementation',
          'Understand data access restrictions and security measures'
        ],
        tags: ['permissions', 'roles', 'security', 'access control'],
        relatedPages: ['/superadmin/profile', '/superadmin/users/roles']
      }
    ]
  },
  {
    id: 'user-management',
    title: 'User Management Mastery',
    icon: '👥',
    description: 'Comprehensive guide to managing users, roles, permissions, and user-related operations across the entire system.',
    quickActions: [
      {
        id: 'add-user',
        title: 'Add New User',
        description: 'Create a new user account with proper role assignment',
        action: 'navigate',
        target: '/superadmin/users/add',
        icon: '➕'
      },
      {
        id: 'bulk-import',
        title: 'Bulk User Import',
        description: 'Import multiple users from CSV or Excel files',
        action: 'navigate',
        target: '/superadmin/users/import',
        icon: '📊'
      },
      {
        id: 'manage-roles',
        title: 'Manage Roles & Permissions',
        description: 'Configure user roles and permission levels',
        action: 'navigate',
        target: '/superadmin/users/roles',
        icon: '🔐'
      },
      {
        id: 'user-reports',
        title: 'User Activity Reports',
        description: 'Generate comprehensive user activity and engagement reports',
        action: 'navigate',
        target: '/superadmin/users/reports',
        icon: '📈'
      }
    ],
    content: [
      {
        id: 'user-overview',
        title: 'User Management Overview',
        type: 'guide',
        difficulty: 'intermediate',
        content: 'Comprehensive guide to managing all users in the system, including students, teachers, administrators, and parents. Learn about user lifecycle management, role assignments, and best practices.',
        steps: [
          'Access the Users section from the main navigation menu',
          'View all users in the system with their current status and roles',
          'Use advanced filtering options to find specific users by role, status, department, or grade level',
          'Utilize bulk actions for managing multiple users simultaneously',
          'Export user data for reporting and analysis purposes',
          'Monitor user activity and engagement metrics',
          'Set up automated user provisioning and deprovisioning workflows',
          'Configure user notification preferences and communication settings'
        ],
        tags: ['users', 'management', 'overview', 'roles', 'permissions'],
        relatedPages: ['/superadmin/users', '/superadmin/users/roles', '/superadmin/users/reports']
      },
      {
        id: 'role-management',
        title: 'Role and Permission Management',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Detailed guide to creating, modifying, and managing user roles and permissions. Learn about role-based access control (RBAC) and how to implement proper security policies.',
        steps: [
          'Navigate to Users > Roles & Permissions section',
          'Review existing roles: SuperAdmin, Admin, Teacher, Student, Parent',
          'Create custom roles for specific organizational needs',
          'Assign granular permissions to each role (read, write, delete, admin)',
          'Configure role inheritance and hierarchy',
          'Set up conditional permissions based on user attributes',
          'Test role assignments in a safe environment',
          'Document role changes and maintain audit trails',
          'Regularly review and update role permissions for security compliance'
        ],
        tags: ['roles', 'permissions', 'security', 'rbac', 'access control'],
        relatedPages: ['/superadmin/users/roles', '/superadmin/settings/security']
      },
      {
        id: 'user-troubleshooting',
        title: 'User Management Troubleshooting',
        type: 'troubleshooting',
        difficulty: 'intermediate',
        content: 'Common user management issues and their solutions. Learn how to resolve login problems, permission issues, and data inconsistencies.',
        steps: [
          'Check user account status and activation status',
          'Verify email addresses and contact information accuracy',
          'Reset passwords if users cannot log in (use secure password policies)',
          'Review role assignments and access level configurations',
          'Check for account lockouts due to failed login attempts',
          'Verify user data integrity and consistency',
          'Review audit logs for suspicious user activity',
          'Contact IT support for complex permission or data issues',
          'Document troubleshooting steps for future reference'
        ],
        tags: ['troubleshooting', 'users', 'issues', 'login', 'permissions'],
        relatedPages: ['/superadmin/users', '/superadmin/support', '/superadmin/system/logs']
      },
      {
        id: 'bulk-operations',
        title: 'Bulk User Operations',
        type: 'guide',
        difficulty: 'intermediate',
        content: 'Learn how to perform bulk operations on multiple users, including imports, exports, role assignments, and status updates.',
        steps: [
          'Prepare user data in the required CSV or Excel format',
          'Use the bulk import feature to add multiple users at once',
          'Validate imported data for accuracy and completeness',
          'Assign roles and permissions to imported users',
          'Use bulk actions to update user status, roles, or other attributes',
          'Export user data for external systems or reporting',
          'Schedule automated bulk operations for regular maintenance',
          'Monitor bulk operation results and handle any errors'
        ],
        tags: ['bulk operations', 'import', 'export', 'automation', 'efficiency'],
        relatedPages: ['/superadmin/users/import', '/superadmin/users/export']
      }
    ]
  },
  {
    id: 'content-management',
    title: 'Content Management System',
    icon: '📝',
    description: 'Comprehensive content management including announcements, news, events, and multimedia content creation and distribution.',
    quickActions: [
      {
        id: 'create-announcement',
        title: 'Create Announcement',
        description: 'Post a new school-wide or targeted announcement',
        action: 'navigate',
        target: '/superadmin/content/announcements/create',
        icon: '📢'
      },
      {
        id: 'manage-news',
        title: 'Manage News Articles',
        description: 'Create, edit, and publish news articles',
        action: 'navigate',
        target: '/superadmin/content/news',
        icon: '📰'
      },
      {
        id: 'event-management',
        title: 'Event Management',
        description: 'Create and manage school events and activities',
        action: 'navigate',
        target: '/superadmin/content/events',
        icon: '📅'
      },
      {
        id: 'media-library',
        title: 'Media Library',
        description: 'Upload and organize images, videos, and documents',
        action: 'navigate',
        target: '/superadmin/content/media',
        icon: '🎬'
      }
    ],
    content: [
      {
        id: 'announcements',
        title: 'Managing School Announcements',
        type: 'guide',
        difficulty: 'beginner',
        content: 'Learn how to create, manage, and distribute school announcements effectively. Understand targeting options, scheduling, and best practices for communication.',
        steps: [
          'Navigate to Content Management > Announcements section',
          'Click "Create New Announcement" to start a new announcement',
          'Fill in the announcement title, content, and description',
          'Set visibility options (public, authenticated users, specific roles)',
          'Configure target audience (all users, specific grades, departments, or individuals)',
          'Add rich text formatting, images, and attachments as needed',
          'Set publication date and time for scheduled announcements',
          'Preview the announcement before publishing',
          'Publish immediately or schedule for later delivery',
          'Monitor announcement engagement and read receipts'
        ],
        tags: ['announcements', 'content', 'management', 'communication', 'targeting'],
        relatedPages: ['/superadmin/content/announcements', '/superadmin/content/announcements/create']
      },
      {
        id: 'news-management',
        title: 'News Article Management',
        type: 'guide',
        difficulty: 'intermediate',
        content: 'Comprehensive guide to creating, editing, and managing news articles. Learn about content workflows, approval processes, and publication strategies.',
        steps: [
          'Access the News section from Content Management',
          'Create new articles using the rich text editor',
          'Add compelling headlines, summaries, and full content',
          'Upload and optimize images for web display',
          'Set article categories and tags for better organization',
          'Configure SEO settings for better search visibility',
          'Set up content approval workflows for quality control',
          'Schedule articles for publication at optimal times',
          'Monitor article performance and reader engagement',
          'Archive old articles and maintain content freshness'
        ],
        tags: ['news', 'articles', 'content', 'seo', 'workflow'],
        relatedPages: ['/superadmin/content/news', '/superadmin/content/news/create']
      },
      {
        id: 'event-management',
        title: 'Event and Activity Management',
        type: 'guide',
        difficulty: 'intermediate',
        content: 'Learn how to create, manage, and promote school events, activities, and important dates. Understand event registration, capacity management, and communication.',
        steps: [
          'Navigate to Content Management > Events section',
          'Create new events with detailed information and descriptions',
          'Set event dates, times, and duration',
          'Configure event capacity and registration requirements',
          'Add event location and venue information',
          'Set up event categories and tags for organization',
          'Configure RSVP and registration workflows',
          'Send event invitations and reminders to relevant audiences',
          'Monitor event registrations and attendance',
          'Generate event reports and feedback collection'
        ],
        tags: ['events', 'activities', 'calendar', 'registration', 'management'],
        relatedPages: ['/superadmin/content/events', '/superadmin/calendar']
      },
      {
        id: 'media-management',
        title: 'Media Library and Asset Management',
        type: 'guide',
        difficulty: 'intermediate',
        content: 'Learn how to upload, organize, and manage media assets including images, videos, documents, and other files. Understand file optimization and storage management.',
        steps: [
          'Access the Media Library from Content Management',
          'Upload images, videos, and documents with proper naming conventions',
          'Organize media into folders and categories for easy access',
          'Optimize images for web display and performance',
          'Set up automatic image compression and resizing',
          'Configure access permissions for different media types',
          'Use media in announcements, news articles, and other content',
          'Monitor storage usage and implement cleanup policies',
          'Backup important media assets regularly',
          'Implement CDN for faster media delivery'
        ],
        tags: ['media', 'assets', 'images', 'videos', 'storage', 'optimization'],
        relatedPages: ['/superadmin/content/media', '/superadmin/settings/storage']
      }
    ]
  },
  {
    id: 'academic-management',
    title: 'Academic Management',
    icon: '🎓',
    description: 'Comprehensive academic management including courses, grades, schedules, and academic reporting systems.',
    quickActions: [
      {
        id: 'course-management',
        title: 'Course Management',
        description: 'Create and manage academic courses and curricula',
        action: 'navigate',
        target: '/superadmin/academic/courses',
        icon: '📚'
      },
      {
        id: 'grade-management',
        title: 'Grade Management',
        description: 'Configure grading systems and grade calculations',
        action: 'navigate',
        target: '/superadmin/academic/grades',
        icon: '📊'
      },
      {
        id: 'schedule-management',
        title: 'Schedule Management',
        description: 'Create and manage class schedules and timetables',
        action: 'navigate',
        target: '/superadmin/academic/schedules',
        icon: '⏰'
      },
      {
        id: 'academic-reports',
        title: 'Academic Reports',
        description: 'Generate comprehensive academic performance reports',
        action: 'navigate',
        target: '/superadmin/academic/reports',
        icon: '📈'
      }
    ],
    content: [
      {
        id: 'course-setup',
        title: 'Course and Curriculum Setup',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Learn how to set up and manage academic courses, curricula, and learning objectives. Understand course prerequisites, credit systems, and academic pathways.',
        steps: [
          'Navigate to Academic Management > Courses section',
          'Create new courses with detailed descriptions and learning objectives',
          'Set up course prerequisites and co-requisites',
          'Configure credit hours and grading scales for each course',
          'Assign teachers and teaching assistants to courses',
          'Set up course materials, textbooks, and resources',
          'Configure course schedules and meeting times',
          'Set up enrollment limits and waitlist management',
          'Create course templates for recurring offerings',
          'Monitor course enrollment and capacity utilization'
        ],
        tags: ['courses', 'curriculum', 'academic', 'prerequisites', 'enrollment'],
        relatedPages: ['/superadmin/academic/courses', '/superadmin/academic/curriculum']
      },
      {
        id: 'grading-systems',
        title: 'Grading Systems and Grade Calculations',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Learn how to configure different grading systems, calculate final grades, and set up grade reporting. Understand weighted grades, curves, and grade policies.',
        steps: [
          'Access Academic Management > Grading Systems',
          'Configure different grading scales (percentage, letter grades, GPA)',
          'Set up weighted grade categories (homework, tests, projects, participation)',
          'Configure grade calculation formulas and rounding rules',
          'Set up grade curves and adjustment policies',
          'Configure grade release dates and visibility settings',
          'Set up grade appeals and review processes',
          'Configure automated grade notifications to students and parents',
          'Generate grade reports and transcripts',
          'Monitor grade distribution and academic performance trends'
        ],
        tags: ['grading', 'grades', 'calculations', 'policies', 'reports'],
        relatedPages: ['/superadmin/academic/grades', '/superadmin/academic/policies']
      },
      {
        id: 'schedule-management',
        title: 'Class Schedule and Timetable Management',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Learn how to create, manage, and optimize class schedules. Understand room assignments, teacher availability, and conflict resolution.',
        steps: [
          'Navigate to Academic Management > Schedules section',
          'Create master schedules for different academic periods',
          'Assign teachers to specific time slots and subjects',
          'Configure room assignments and capacity management',
          'Set up recurring schedules for regular classes',
          'Handle schedule conflicts and optimization',
          'Create special schedules for exams, events, and holidays',
          'Generate individual student and teacher schedules',
          'Monitor schedule utilization and efficiency',
          'Export schedules for external systems and communication'
        ],
        tags: ['schedules', 'timetables', 'rooms', 'teachers', 'optimization'],
        relatedPages: ['/superadmin/academic/schedules', '/superadmin/calendar']
      }
    ]
  },
  {
    id: 'system-settings',
    title: 'System Settings & Configuration',
    icon: '⚙️',
    description: 'Configure system settings, security policies, integrations, and administrative preferences.',
    quickActions: [
      {
        id: 'general-settings',
        title: 'General Settings',
        description: 'Configure basic system settings and preferences',
        action: 'navigate',
        target: '/superadmin/settings/general',
        icon: '🔧'
      },
      {
        id: 'security-settings',
        title: 'Security Settings',
        description: 'Manage security policies and access controls',
        action: 'navigate',
        target: '/superadmin/settings/security',
        icon: '🔒'
      },
      {
        id: 'integration-settings',
        title: 'Integration Settings',
        description: 'Configure third-party integrations and APIs',
        action: 'navigate',
        target: '/superadmin/settings/integrations',
        icon: '🔗'
      },
      {
        id: 'backup-settings',
        title: 'Backup & Recovery',
        description: 'Configure automated backups and recovery procedures',
        action: 'navigate',
        target: '/superadmin/settings/backup',
        icon: '💾'
      }
    ],
    content: [
      {
        id: 'settings-overview',
        title: 'System Settings Overview',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Comprehensive overview of all system configuration options. Learn about different setting categories and their impact on system behavior.',
        steps: [
          'Access Settings from the main navigation menu',
          'Review current configuration in each setting category',
          'Understand the impact of different setting changes',
          'Make necessary changes following best practices',
          'Test changes in a safe environment before applying to production',
          'Document any modifications for future reference',
          'Set up configuration backups before major changes',
          'Monitor system behavior after configuration changes',
          'Regularly review and update settings for optimal performance'
        ],
        tags: ['settings', 'configuration', 'system', 'administration'],
        relatedPages: ['/superadmin/settings', '/superadmin/settings/general']
      },
      {
        id: 'security-configuration',
        title: 'Security Configuration and Policies',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Learn how to configure comprehensive security policies, access controls, and monitoring systems to protect your school data.',
        steps: [
          'Navigate to Settings > Security section',
          'Configure password policies and complexity requirements',
          'Set up two-factor authentication (2FA) requirements',
          'Configure session timeout and idle logout policies',
          'Set up IP whitelisting and access restrictions',
          'Configure audit logging and monitoring',
          'Set up automated security alerts and notifications',
          'Configure data encryption and privacy settings',
          'Review and update security policies regularly',
          'Conduct security audits and penetration testing'
        ],
        tags: ['security', 'policies', 'authentication', 'encryption', 'monitoring'],
        relatedPages: ['/superadmin/settings/security', '/superadmin/system/logs']
      },
      {
        id: 'integration-setup',
        title: 'Third-Party Integrations Setup',
        type: 'guide',
        difficulty: 'advanced',
        content: 'Learn how to configure integrations with external systems, APIs, and services to extend functionality and improve workflows.',
        steps: [
          'Access Settings > Integrations section',
          'Review available integration options and requirements',
          'Configure API keys and authentication credentials',
          'Set up data synchronization and mapping',
          'Configure webhook endpoints for real-time updates',
          'Test integration connections and data flow',
          'Set up error handling and retry mechanisms',
          'Monitor integration performance and reliability',
          'Document integration configurations and dependencies',
          'Plan for integration maintenance and updates'
        ],
        tags: ['integrations', 'apis', 'webhooks', 'synchronization', 'external systems'],
        relatedPages: ['/superadmin/settings/integrations', '/superadmin/system/status']
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & Support',
    icon: '🔧',
    description: 'Common issues, solutions, and support resources for resolving system problems and getting help.',
    quickActions: [
      {
        id: 'system-status',
        title: 'Check System Status',
        description: 'View current system health and performance metrics',
        action: 'navigate',
        target: '/superadmin/system/status',
        icon: '📊'
      },
      {
        id: 'error-logs',
        title: 'View Error Logs',
        description: 'Access system logs and error reports',
        action: 'navigate',
        target: '/superadmin/system/logs',
        icon: '📋'
      },
      {
        id: 'contact-support',
        title: 'Contact Technical Support',
        description: 'Get help from our technical support team',
        action: 'contact',
        target: 'support@southville8bnhs.edu.ph',
        icon: '🆘'
      },
      {
        id: 'system-maintenance',
        title: 'System Maintenance',
        description: 'Schedule and perform system maintenance tasks',
        action: 'navigate',
        target: '/superadmin/system/maintenance',
        icon: '🔨'
      }
    ],
    content: [
      {
        id: 'common-issues',
        title: 'Common Issues & Solutions',
        type: 'troubleshooting',
        difficulty: 'intermediate',
        content: 'Comprehensive troubleshooting guide for frequently encountered problems. Learn how to diagnose and resolve common system issues.',
        steps: [
          'Check your internet connection and network stability',
          'Clear browser cache, cookies, and temporary files',
          'Try logging out and logging back in to refresh your session',
          'Check system status page for known issues and maintenance windows',
          'Verify your user permissions and access levels',
          'Check for browser compatibility issues and update if necessary',
          'Review error messages and system logs for specific error codes',
          'Try accessing the system from a different browser or device',
          'Contact support if issues persist after basic troubleshooting',
          'Document the issue and resolution for future reference'
        ],
        tags: ['troubleshooting', 'issues', 'solutions', 'diagnostics', 'support'],
        relatedPages: ['/superadmin/system/status', '/superadmin/system/logs', '/superadmin/support']
      },
      {
        id: 'performance-issues',
        title: 'Performance and Speed Issues',
        type: 'troubleshooting',
        difficulty: 'intermediate',
        content: 'Learn how to identify and resolve performance issues, slow loading times, and system responsiveness problems.',
        steps: [
          'Check system status page for performance metrics and alerts',
          'Monitor your internet connection speed and stability',
          'Clear browser cache and disable unnecessary browser extensions',
          'Check for large file uploads or downloads that might be slowing the system',
          'Review system resource usage and server performance metrics',
          'Optimize database queries and system configurations',
          'Check for system updates and apply performance patches',
          'Monitor user activity and identify potential bottlenecks',
          'Consider upgrading system resources if performance issues persist',
          'Document performance issues and solutions for system optimization'
        ],
        tags: ['performance', 'speed', 'optimization', 'monitoring', 'resources'],
        relatedPages: ['/superadmin/system/status', '/superadmin/system/performance']
      },
      {
        id: 'data-issues',
        title: 'Data Issues and Recovery',
        type: 'troubleshooting',
        difficulty: 'advanced',
        content: 'Learn how to handle data inconsistencies, missing information, and data recovery procedures.',
        steps: [
          'Identify the scope and nature of the data issue',
          'Check system logs for data-related errors and warnings',
          'Verify data integrity using built-in validation tools',
          'Review recent system changes that might have caused the issue',
          'Check backup systems and data recovery options',
          'Contact database administrators for complex data issues',
          'Implement data recovery procedures if necessary',
          'Validate recovered data for accuracy and completeness',
          'Update data backup and recovery procedures',
          'Document the incident and prevention measures'
        ],
        tags: ['data', 'recovery', 'integrity', 'backup', 'validation'],
        relatedPages: ['/superadmin/system/backup', '/superadmin/system/logs']
      }
    ]
  }
]

// Context help mapping for different pages
export const contextHelpMap: Record<string, string[]> = {
  '/superadmin': ['getting-started', 'user-management'],
  '/superadmin/overview': ['getting-started', 'user-management'],
  '/superadmin/users': ['user-management', 'troubleshooting'],
  '/superadmin/users/add': ['user-management'],
  '/superadmin/users/roles': ['user-management'],
  '/superadmin/content': ['content-management', 'getting-started'],
  '/superadmin/content/announcements': ['content-management'],
  '/superadmin/content/news': ['content-management'],
  '/superadmin/content/events': ['content-management'],
  '/superadmin/academic': ['academic-management', 'user-management'],
  '/superadmin/academic/courses': ['academic-management'],
  '/superadmin/academic/grades': ['academic-management'],
  '/superadmin/academic/schedules': ['academic-management'],
  '/superadmin/settings': ['system-settings', 'troubleshooting'],
  '/superadmin/settings/security': ['system-settings'],
  '/superadmin/settings/integrations': ['system-settings'],
  '/superadmin/system': ['troubleshooting', 'system-settings'],
  '/superadmin/system/status': ['troubleshooting'],
  '/superadmin/system/logs': ['troubleshooting'],
  '/superadmin/calendar': ['content-management', 'academic-management'],
  '/superadmin/reports': ['user-management', 'academic-management']
}

// Quick help items for common tasks
export const quickHelpItems = [
  {
    id: 'add-user',
    title: 'Add New User',
    description: 'Create a new user account with proper role assignment',
    action: 'navigate',
    target: '/superadmin/users/add',
    icon: '👤'
  },
  {
    id: 'create-announcement',
    title: 'Create Announcement',
    description: 'Post a new school-wide or targeted announcement',
    action: 'navigate',
    target: '/superadmin/content/announcements/create',
    icon: '📢'
  },
  {
    id: 'manage-courses',
    title: 'Manage Courses',
    description: 'Create and configure academic courses and curricula',
    action: 'navigate',
    target: '/superadmin/academic/courses',
    icon: '📚'
  },
  {
    id: 'system-status',
    title: 'Check System Status',
    description: 'View system health, performance, and status information',
    action: 'navigate',
    target: '/superadmin/system/status',
    icon: '📊'
  },
  {
    id: 'user-reports',
    title: 'Generate User Reports',
    description: 'Create comprehensive user activity and engagement reports',
    action: 'navigate',
    target: '/superadmin/users/reports',
    icon: '📈'
  },
  {
    id: 'security-settings',
    title: 'Security Settings',
    description: 'Configure security policies and access controls',
    action: 'navigate',
    target: '/superadmin/settings/security',
    icon: '🔒'
  },
  {
    id: 'backup-system',
    title: 'System Backup',
    description: 'Configure and manage system backups and recovery',
    action: 'navigate',
    target: '/superadmin/settings/backup',
    icon: '💾'
  },
  {
    id: 'contact-support',
    title: 'Contact Support',
    description: 'Get help from our technical support team',
    action: 'contact',
    target: 'support@southville8bnhs.edu.ph',
    icon: '🆘'
  }
]