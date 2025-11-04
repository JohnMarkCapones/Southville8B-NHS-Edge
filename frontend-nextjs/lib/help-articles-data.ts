import {
  Sparkles,
  TrendingUp,
  Calendar,
  FileText,
  Brain,
  User,
  Bell,
  Users,
  Target,
  AlertCircle,
} from "lucide-react"

export interface HelpArticle {
  id: string
  title: string
  category: string
  type: 'guide' | 'troubleshooting' | 'video'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readingTime: string
  views: number
  likes: number
  description: string
  content: string
  fullContent: string
  steps?: string[]
  tips?: string[]
  tags: string[]
  icon: any
  color: string
  featured: boolean
  videoAvailable: boolean
  updated: string
  relatedArticles?: string[]
}

export const helpArticles: HelpArticle[] = [
  {
    id: 'welcome',
    title: 'Welcome to Student Portal',
    category: 'getting-started',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '5 min',
    views: 1234,
    likes: 89,
    description: 'Complete introduction to navigating your student portal and accessing key features',
    content: 'Welcome to Southville 8B NHS Student Portal! This comprehensive guide will help you navigate and utilize all features effectively.',
    fullContent: `
      <div class="mb-8">
        <h2>Welcome to Your Student Portal</h2>
        <p class="mt-4 mb-6">The Southville 8B NHS Student Portal is your central hub for all academic activities, communication, and resources. This guide will help you get started and make the most of the platform.</p>
      </div>
      
      <div class="mb-10">
        <h3>What You Can Do</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>View Your Grades:</strong> Access your academic performance across all subjects with detailed breakdowns</li>
          <li class="pl-2"><strong>Manage Assignments:</strong> Submit assignments, track due dates, and view feedback from teachers</li>
          <li class="pl-2"><strong>Access Course Materials:</strong> Download lecture notes, presentations, and study resources</li>
          <li class="pl-2"><strong>Take Online Quizzes:</strong> Complete assessments and exams through the Quiz Central section</li>
          <li class="pl-2"><strong>Stay Updated:</strong> Read announcements, view school events, and join clubs</li>
          <li class="pl-2"><strong>Use Productivity Tools:</strong> Take notes, manage your todo list, set goals, and use the Pomodoro timer</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Getting Started</h3>
        <p class="mt-4 mb-4">After logging in for the first time, you'll land on your dashboard. Here's what to do next:</p>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Complete your profile information</li>
          <li class="pl-2">Set up your notification preferences</li>
          <li class="pl-2">Explore the sidebar navigation</li>
          <li class="pl-2">Check your schedule and upcoming assignments</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Navigation Tips</h3>
        <p class="mt-4 mb-4">The sidebar on the left contains all main sections. You can:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click any section to navigate</li>
          <li class="pl-2">Use the search bar at the top to find specific features</li>
          <li class="pl-2">Collapse the sidebar for more screen space</li>
          <li class="pl-2">Access quick actions from the dashboard</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Need Help?</h3>
        <p class="mt-4">If you encounter any issues or have questions, check our Help Center for detailed guides, or contact support at support@southville8bnhs.edu.ph</p>
      </div>
    `,
    steps: [
      'Log in with your credentials',
      'Explore the dashboard overview',
      'Familiarize yourself with the sidebar navigation',
      'Check your profile and settings',
      'View your schedule and upcoming tasks',
    ],
    tips: [
      'Bookmark frequently used pages',
      'Enable notifications to stay updated',
      'Use the search feature to quickly find content',
      'Customize your dashboard layout',
    ],
    tags: ['welcome', 'basics', 'navigation', 'introduction'],
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    featured: true,
    videoAvailable: true,
    updated: '2 days ago',
    relatedArticles: ['profile-settings', 'view-grades', 'class-schedule'],
  },
  {
    id: 'view-grades',
    title: 'How to View Your Grades',
    category: 'academics',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '3 min',
    views: 2456,
    likes: 156,
    description: 'Step-by-step guide to accessing and understanding your academic grades and performance metrics',
    content: 'Navigate to the Grades section from your dashboard to view your academic performance across all subjects.',
    fullContent: `
      <div class="mb-8">
        <h2>Viewing Your Grades</h2>
        <p class="mt-4 mb-6">Your grades section provides comprehensive information about your academic performance across all subjects and grading periods.</p>
      </div>
      
      <div class="mb-10">
        <h3>Accessing Your Grades</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click on <strong>"Grades"</strong> in the sidebar navigation</li>
          <li class="pl-2">You'll see a list of all your enrolled subjects</li>
          <li class="pl-2">Select a subject to view detailed grade breakdowns</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Understanding Grade Displays</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Quarter Grades:</strong> Your performance for each grading period (Q1, Q2, Q3, Q4)</li>
          <li class="pl-2"><strong>Subject Breakdown:</strong> Individual assignment, quiz, and exam scores</li>
          <li class="pl-2"><strong>Overall Average:</strong> Your cumulative grade for the subject</li>
          <li class="pl-2"><strong>Comments:</strong> Teacher feedback and recommendations</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Filtering Options</h3>
        <p class="mt-4 mb-4">Use the filter options to:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">View grades by specific quarter</li>
          <li class="pl-2">Filter by subject</li>
          <li class="pl-2">See only recent updates</li>
          <li class="pl-2">Export your grade report</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Grade Updates</h3>
        <p class="mt-4 mb-6">Grades are typically updated within 3-5 business days after assessments. You'll receive a notification when new grades are posted.</p>
      </div>

      <div class="mb-8">
        <h3>Interpreting Your Grades</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>90-100:</strong> Excellent performance</li>
          <li class="pl-2"><strong>85-89:</strong> Very good performance</li>
          <li class="pl-2"><strong>80-84:</strong> Good performance</li>
          <li class="pl-2"><strong>75-79:</strong> Satisfactory performance</li>
          <li class="pl-2"><strong>Below 75:</strong> Needs improvement - seek help from teachers</li>
        </ul>
      </div>
    `,
    steps: [
      'Navigate to the Grades section',
      'Select the academic period (quarter/year)',
      'Choose a subject to view detailed grades',
      'Review individual assignment and exam scores',
      'Check teacher comments for feedback',
    ],
    tips: [
      'Check grades regularly to track your progress',
      'Enable grade notifications to stay updated',
      'Use the export feature to save your grade reports',
      'Contact teachers if you have questions about specific grades',
    ],
    tags: ['grades', 'academics', 'performance', 'results'],
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-600',
    featured: true,
    videoAvailable: true,
    updated: '1 week ago',
    relatedArticles: ['class-schedule', 'submit-assignment', 'take-quiz'],
  },
  {
    id: 'class-schedule',
    title: 'Understanding Your Class Schedule',
    category: 'academics',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '4 min',
    views: 1890,
    likes: 112,
    description: 'Learn how to view, interpret, and manage your class schedule effectively',
    content: 'Access your schedule from the Schedule section to see all your classes, times, and locations.',
    fullContent: `
      <div class="mb-8">
        <h2>Understanding Your Class Schedule</h2>
        <p class="mt-4 mb-6">Your class schedule shows all your enrolled courses with their meeting times, locations, and teacher information.</p>
      </div>
      
      <div class="mb-10">
        <h3>Viewing Your Schedule</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click on <strong>"Schedule"</strong> in the sidebar</li>
          <li class="pl-2">View your weekly schedule in calendar format</li>
          <li class="pl-2">Switch between day, week, and month views</li>
          <li class="pl-2">Click on any class to see detailed information</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Schedule Information</h3>
        <p class="mt-4 mb-4">Each class displays:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Subject Name:</strong> The course title</li>
          <li class="pl-2"><strong>Time:</strong> Start and end times</li>
          <li class="pl-2"><strong>Location:</strong> Room number or online meeting link</li>
          <li class="pl-2"><strong>Teacher:</strong> Instructor name and contact</li>
          <li class="pl-2"><strong>Day:</strong> When the class meets</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Today's Schedule</h3>
        <p class="mt-4 mb-4">Your dashboard shows today's classes at a glance. You can:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">See upcoming classes for today</li>
          <li class="pl-2">View class details by clicking on them</li>
          <li class="pl-2">Access course materials directly</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Schedule Changes</h3>
        <p class="mt-4 mb-4">If your schedule changes:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">You'll receive a notification</li>
          <li class="pl-2">Changes appear in red or highlighted</li>
          <li class="pl-2">Contact your guidance counselor for permanent changes</li>
        </ul>
      </div>
    `,
    steps: [
      'Navigate to the Schedule section',
      'Choose your preferred view (day/week/month)',
      'Review all your classes and times',
      'Click on a class for detailed information',
      'Access course materials from class details',
    ],
    tips: [
      'Check your schedule daily',
      'Enable schedule notifications',
      'Save your schedule as a PDF',
      'Sync with your personal calendar app',
    ],
    tags: ['schedule', 'classes', 'time', 'calendar'],
    icon: Calendar,
    color: 'from-emerald-500 to-teal-600',
    featured: false,
    videoAvailable: false,
    updated: '3 days ago',
    relatedArticles: ['view-grades', 'courses-materials', 'clubs-organizations'],
  },
  {
    id: 'submit-assignment',
    title: 'Submitting Assignments',
    category: 'academics',
    type: 'guide',
    difficulty: 'intermediate',
    readingTime: '6 min',
    views: 3210,
    likes: 203,
    description: 'Complete guide to submitting assignments online, including file formats and troubleshooting',
    content: 'Learn how to upload and submit your assignments through the portal.',
    fullContent: `
      <div class="mb-8">
        <h2>Submitting Assignments Online</h2>
        <p class="mt-4 mb-6">Submitting assignments through the portal is easy and convenient. Follow these steps to ensure successful submission.</p>
      </div>
      
      <div class="mb-10">
        <h3>Step-by-Step Submission Process</h3>
        <ol class="mt-4 ml-6 space-y-4">
          <li class="pl-2 mb-4">
            <strong>Find Your Assignment:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Go to the <strong>"Courses"</strong> section</li>
              <li class="pl-2">Select the subject</li>
              <li class="pl-2">Find the assignment in the list</li>
            </ul>
          </li>
          <li class="pl-2 mb-4">
            <strong>Review Requirements:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Read the assignment description carefully</li>
              <li class="pl-2">Check file format requirements (PDF, DOCX, etc.)</li>
              <li class="pl-2">Note the due date and time</li>
              <li class="pl-2">Review any specific instructions</li>
            </ul>
          </li>
          <li class="pl-2 mb-4">
            <strong>Prepare Your Files:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Complete your assignment</li>
              <li class="pl-2">Save in the required format</li>
              <li class="pl-2">Check file size (usually max 10MB)</li>
              <li class="pl-2">Name your file appropriately</li>
            </ul>
          </li>
          <li class="pl-2 mb-4">
            <strong>Upload and Submit:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Click the <strong>"Submit Assignment"</strong> button</li>
              <li class="pl-2">Click <strong>"Choose File"</strong> or drag and drop</li>
              <li class="pl-2">Select your file</li>
              <li class="pl-2">Add any comments if needed</li>
              <li class="pl-2">Click <strong>"Submit"</strong></li>
            </ul>
          </li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Accepted File Formats</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Documents:</strong> PDF, DOCX, DOC, TXT</li>
          <li class="pl-2"><strong>Presentations:</strong> PPTX, PPT</li>
          <li class="pl-2"><strong>Spreadsheets:</strong> XLSX, XLS, CSV</li>
          <li class="pl-2"><strong>Images:</strong> JPG, PNG, GIF (for image-based assignments)</li>
          <li class="pl-2"><strong>Code:</strong> ZIP files for multiple files</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>File Size Limits</h3>
        <p class="mt-4 mb-4">Maximum file size: <strong>10MB</strong> per file. For larger files:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Compress images</li>
          <li class="pl-2">Reduce PDF size</li>
          <li class="pl-2">Use ZIP compression for multiple files</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Late Submissions</h3>
        <p class="mt-4 mb-4">Late submission policies vary by teacher:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Some assignments accept late work with penalties</li>
          <li class="pl-2">Others may not accept late submissions</li>
          <li class="pl-2">Always check assignment details</li>
          <li class="pl-2">Contact your teacher if you need an extension</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Troubleshooting</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Upload fails:</strong> Check file size and format</li>
          <li class="pl-2"><strong>Can't see submit button:</strong> Verify due date hasn't passed</li>
          <li class="pl-2"><strong>File not uploading:</strong> Try a different browser or clear cache</li>
          <li class="pl-2"><strong>Submission error:</strong> Contact support if issue persists</li>
        </ul>
      </div>
    `,
    steps: [
      'Go to Courses section',
      'Select your subject',
      'Find the assignment',
      'Review requirements and due date',
      'Prepare your file in correct format',
      'Click Submit Assignment',
      'Upload your file',
      'Confirm submission',
      'Verify submission status',
    ],
    tips: [
      'Submit early to avoid last-minute issues',
      'Keep backup copies of your work',
      'Verify file upload completed successfully',
      'Check submission status after uploading',
      'Contact teacher if you encounter problems',
    ],
    tags: ['assignments', 'submission', 'upload', 'homework'],
    icon: FileText,
    color: 'from-orange-500 to-red-600',
    featured: true,
    videoAvailable: true,
    updated: '5 days ago',
    relatedArticles: ['take-quiz', 'courses-materials', 'troubleshooting'],
  },
  {
    id: 'take-quiz',
    title: 'Taking Online Quizzes',
    category: 'academics',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '5 min',
    views: 2789,
    likes: 178,
    description: 'Everything you need to know about taking quizzes, including tips and best practices',
    content: 'Access and complete quizzes assigned by your teachers through the Quiz Central section.',
    fullContent: `
      <div class="mb-8">
        <h2>Taking Online Quizzes</h2>
        <p class="mt-4 mb-6">Online quizzes are an important part of your assessment. Follow this guide to ensure a smooth quiz-taking experience.</p>
      </div>
      
      <div class="mb-10">
        <h3>Before Starting a Quiz</h3>
        <ol class="mt-4 ml-6 space-y-4">
          <li class="pl-2 mb-4">
            <strong>Access Quiz Central:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Navigate to <strong>"Quiz Central"</strong> from the sidebar</li>
              <li class="pl-2">View all available quizzes</li>
              <li class="pl-2">Check deadlines and time limits</li>
            </ul>
          </li>
          <li class="pl-2 mb-4">
            <strong>Review Quiz Details:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Read all instructions carefully</li>
              <li class="pl-2">Check the time limit</li>
              <li class="pl-2">Review question format</li>
              <li class="pl-2">Note if you can go back to previous questions</li>
            </ul>
          </li>
          <li class="pl-2 mb-4">
            <strong>Prepare Your Environment:</strong>
            <ul class="mt-2 ml-6 space-y-2">
              <li class="pl-2">Ensure stable internet connection</li>
              <li class="pl-2">Use a full-screen browser</li>
              <li class="pl-2">Close unnecessary tabs/applications</li>
              <li class="pl-2">Have materials ready if allowed</li>
            </ul>
          </li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>During the Quiz</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Read Carefully:</strong> Take time to understand each question</li>
          <li class="pl-2"><strong>Answer All Questions:</strong> Don't leave any blank</li>
          <li class="pl-2"><strong>Watch the Timer:</strong> Monitor remaining time</li>
          <li class="pl-2"><strong>Save Frequently:</strong> Answers auto-save every 30 seconds</li>
          <li class="pl-2"><strong>Review if Time Permits:</strong> Check answers before submitting</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Question Types</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Multiple Choice:</strong> Select one correct answer</li>
          <li class="pl-2"><strong>Multiple Select:</strong> Choose all correct answers</li>
          <li class="pl-2"><strong>True/False:</strong> Select true or false</li>
          <li class="pl-2"><strong>Short Answer:</strong> Type your response</li>
          <li class="pl-2"><strong>Essay:</strong> Write detailed responses</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Important Notes</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Time Limits:</strong> Most quizzes have time restrictions</li>
          <li class="pl-2"><strong>No Going Back:</strong> Some quizzes prevent reviewing previous questions</li>
          <li class="pl-2"><strong>Auto-Submit:</strong> Quiz submits automatically when time expires</li>
          <li class="pl-2"><strong>One Attempt:</strong> Most quizzes allow only one submission</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Technical Issues</h3>
        <p class="mt-4 mb-4">If you experience problems during a quiz:</p>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Don't panic - your answers are auto-saved</li>
          <li class="pl-2">Take a screenshot of any error messages</li>
          <li class="pl-2">Note the time when the issue occurred</li>
          <li class="pl-2">Contact your teacher immediately</li>
          <li class="pl-2">Technical support can restore your session</li>
        </ol>
      </div>

      <div class="mb-8">
        <h3>Best Practices</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Start quizzes early in the availability window</li>
          <li class="pl-2">Don't refresh the page during a quiz</li>
          <li class="pl-2">Use a reliable internet connection</li>
          <li class="pl-2">Review quiz instructions before starting</li>
          <li class="pl-2">Submit before time expires if you're done</li>
        </ul>
      </div>
    `,
    steps: [
      'Navigate to Quiz Central',
      'Select the quiz you want to take',
      'Read all instructions carefully',
      'Click Start Quiz',
      'Answer each question',
      'Monitor your remaining time',
      'Review your answers',
      'Click Submit when finished',
      'Confirm submission',
    ],
    tips: [
      'Take quizzes in a quiet environment',
      'Read all questions carefully',
      'Manage your time wisely',
      'Don\'t wait until the last minute',
      'Keep backup of your answers if possible',
    ],
    tags: ['quiz', 'exams', 'testing', 'assessment'],
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    featured: true,
    videoAvailable: false,
    updated: '1 week ago',
    relatedArticles: ['submit-assignment', 'view-grades', 'troubleshooting'],
  },
  {
    id: 'profile-settings',
    title: 'Managing Your Profile',
    category: 'account',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '4 min',
    views: 1456,
    likes: 94,
    description: 'Update your personal information, preferences, and account settings',
    content: 'Customize your profile, update contact information, and manage your account settings.',
    fullContent: `
      <div class="mb-8">
        <h2>Managing Your Profile</h2>
        <p class="mt-4 mb-6">Your profile contains your personal information, academic details, and account preferences. Keeping it updated ensures accurate communication and records.</p>
      </div>
      
      <div class="mb-10">
        <h3>Accessing Your Profile</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click on your profile picture or name in the top right</li>
          <li class="pl-2">Select <strong>"Profile"</strong> from the dropdown menu</li>
          <li class="pl-2">Or navigate to <strong>"Profile"</strong> in the sidebar</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Personal Information</h3>
        <p class="mt-4 mb-4">You can update:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Contact Information:</strong> Phone numbers, email addresses</li>
          <li class="pl-2"><strong>Emergency Contacts:</strong> Parent/guardian information</li>
          <li class="pl-2"><strong>Address:</strong> Current residential address</li>
          <li class="pl-2"><strong>Profile Picture:</strong> Upload or change your photo</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Account Settings</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Password:</strong> Change your login password</li>
          <li class="pl-2"><strong>Notifications:</strong> Configure email and push notifications</li>
          <li class="pl-2"><strong>Privacy:</strong> Control what information is visible</li>
          <li class="pl-2"><strong>Preferences:</strong> Language, timezone, date format</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Academic Information</h3>
        <p class="mt-4 mb-4">View your:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Student ID and enrollment details</li>
          <li class="pl-2">Current grade level and section</li>
          <li class="pl-2">Academic standing</li>
          <li class="pl-2">Enrollment history</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Note on Restricted Fields</h3>
        <p class="mt-4 mb-4">Some information requires administrative approval to change:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Legal name changes</li>
          <li class="pl-2">Student ID number</li>
          <li class="pl-2">Grade level assignments</li>
          <li class="pl-2">Official records</li>
        </ul>
        <p class="mt-4">Contact the registrar's office for these changes.</p>
      </div>
    `,
    steps: [
      'Navigate to Profile section',
      'Click Edit Profile',
      'Update personal information',
      'Change contact details',
      'Update emergency contacts',
      'Modify account settings',
      'Save your changes',
    ],
    tips: [
      'Keep your contact information current',
      'Use a strong, unique password',
      'Enable two-factor authentication if available',
      'Review privacy settings regularly',
      'Update profile picture for better recognition',
    ],
    tags: ['profile', 'settings', 'account', 'personal'],
    icon: User,
    color: 'from-indigo-500 to-blue-600',
    featured: false,
    videoAvailable: false,
    updated: '2 weeks ago',
    relatedArticles: ['notifications', 'welcome'],
  },
  {
    id: 'courses-materials',
    title: 'Accessing Course Materials',
    category: 'academics',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '3 min',
    views: 1987,
    likes: 124,
    description: 'How to find, download, and organize your course materials and resources',
    content: 'Learn how to access all your course materials, download files, and organize your resources.',
    fullContent: `
      <div class="mb-8">
        <h2>Accessing Course Materials</h2>
        <p class="mt-4 mb-6">All your course materials, including lecture notes, presentations, and study resources, are available in the Materials section.</p>
      </div>
      
      <div class="mb-10">
        <h3>Finding Materials</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Go to <strong>"Courses"</strong> in the sidebar</li>
          <li class="pl-2">Select the subject you want</li>
          <li class="pl-2">Click on the <strong>"Materials"</strong> tab</li>
          <li class="pl-2">Browse available resources</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Types of Materials</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Lecture Notes:</strong> PDF notes from class</li>
          <li class="pl-2"><strong>Presentations:</strong> PowerPoint slides</li>
          <li class="pl-2"><strong>Worksheets:</strong> Practice exercises</li>
          <li class="pl-2"><strong>Reading Materials:</strong> Textbooks, articles, papers</li>
          <li class="pl-2"><strong>Videos:</strong> Recorded lectures and tutorials</li>
          <li class="pl-2"><strong>Study Guides:</strong> Review materials</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Downloading Materials</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Find the material you need</li>
          <li class="pl-2">Click on it to view details</li>
          <li class="pl-2">Click the <strong>"Download"</strong> button</li>
          <li class="pl-2">Choose save location</li>
          <li class="pl-2">File downloads to your device</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Organizing Materials</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Create folders by subject on your device</li>
          <li class="pl-2">Use clear file naming conventions</li>
          <li class="pl-2">Sort by date or topic</li>
          <li class="pl-2">Bookmark frequently used materials</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Previewing Files</h3>
        <p class="mt-4 mb-4">Most files can be previewed without downloading:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">PDFs open in browser viewer</li>
          <li class="pl-2">Images display inline</li>
          <li class="pl-2">Videos play in browser player</li>
          <li class="pl-2">Documents show preview</li>
        </ul>
      </div>
    `,
    steps: [
      'Navigate to Courses',
      'Select your subject',
      'Click Materials tab',
      'Browse available files',
      'Preview or download materials',
      'Organize downloads on your device',
    ],
    tips: [
      'Download materials for offline access',
      'Organize files by subject and date',
      'Keep backup copies of important materials',
      'Check for updated versions regularly',
      'Use search to find specific materials quickly',
    ],
    tags: ['materials', 'resources', 'download', 'files'],
    icon: FileText,
    color: 'from-cyan-500 to-blue-600',
    featured: false,
    videoAvailable: false,
    updated: '4 days ago',
    relatedArticles: ['class-schedule', 'submit-assignment', 'view-grades'],
  },
  {
    id: 'notifications',
    title: 'Managing Notifications',
    category: 'account',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '2 min',
    views: 1123,
    likes: 67,
    description: 'Customize your notification preferences to stay informed',
    content: 'Configure which notifications you want to receive and how you want to receive them.',
    fullContent: `
      <div class="mb-8">
        <h2>Managing Notifications</h2>
        <p class="mt-4 mb-6">Stay informed about important updates by customizing your notification preferences.</p>
      </div>
      
      <div class="mb-10">
        <h3>Accessing Notification Settings</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Go to <strong>"Settings"</strong> in the sidebar</li>
          <li class="pl-2">Click on <strong>"Notifications"</strong></li>
          <li class="pl-2">Review all notification options</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Notification Types</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Assignments:</strong> New assignments, due date reminders</li>
          <li class="pl-2"><strong>Grades:</strong> New grades posted, grade updates</li>
          <li class="pl-2"><strong>Announcements:</strong> School and class announcements</li>
          <li class="pl-2"><strong>Events:</strong> Upcoming events and activities</li>
          <li class="pl-2"><strong>Messages:</strong> Direct messages from teachers</li>
          <li class="pl-2"><strong>Quizzes:</strong> New quizzes available, quiz reminders</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Delivery Methods</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Email:</strong> Receive notifications via email</li>
          <li class="pl-2"><strong>Push:</strong> Browser push notifications</li>
          <li class="pl-2"><strong>In-App:</strong> Notifications within the portal</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Setting Quiet Hours</h3>
        <p class="mt-4 mb-4">Configure times when notifications are muted:</p>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Enable Quiet Hours</li>
          <li class="pl-2">Set start and end times</li>
          <li class="pl-2">Choose which days to apply</li>
          <li class="pl-2">Urgent notifications may still come through</li>
        </ol>
      </div>

      <div class="mb-8">
        <h3>Best Practices</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Enable notifications for important items (grades, assignments)</li>
          <li class="pl-2">Set quiet hours for better focus</li>
          <li class="pl-2">Review notification settings regularly</li>
          <li class="pl-2">Check spam folder if emails aren't arriving</li>
        </ul>
      </div>
    `,
    steps: [
      'Go to Settings',
      'Click Notifications',
      'Review available notification types',
      'Enable/disable each type',
      'Choose delivery method',
      'Set quiet hours if desired',
      'Save preferences',
    ],
    tips: [
      'Enable critical notifications (grades, assignments)',
      'Set quiet hours during study time',
      'Use email for important updates',
      'Check notification settings monthly',
    ],
    tags: ['notifications', 'alerts', 'settings', 'preferences'],
    icon: Bell,
    color: 'from-amber-500 to-orange-600',
    featured: false,
    videoAvailable: false,
    updated: '1 week ago',
    relatedArticles: ['profile-settings', 'welcome'],
  },
  {
    id: 'clubs-organizations',
    title: 'Joining Clubs & Organizations',
    category: 'student-life',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '5 min',
    views: 2234,
    likes: 145,
    description: 'Discover and join student clubs and organizations',
    content: 'Explore available clubs, read descriptions, and join communities that interest you.',
    fullContent: `
      <div class="mb-8">
        <h2>Joining Clubs & Organizations</h2>
        <p class="mt-4 mb-6">Participate in extracurricular activities by joining clubs and organizations that match your interests.</p>
      </div>
      
      <div class="mb-10">
        <h3>Finding Clubs</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Navigate to <strong>"Clubs"</strong> in the sidebar</li>
          <li class="pl-2">Browse all available clubs</li>
          <li class="pl-2">Use filters to find clubs by category</li>
          <li class="pl-2">Read club descriptions and requirements</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Club Categories</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Academic:</strong> Science, Math, Debate, Academic competitions</li>
          <li class="pl-2"><strong>Arts:</strong> Music, Drama, Visual Arts, Photography</li>
          <li class="pl-2"><strong>Sports:</strong> Basketball, Volleyball, Track and Field</li>
          <li class="pl-2"><strong>Service:</strong> Community service, Volunteering</li>
          <li class="pl-2"><strong>Special Interest:</strong> Coding, Gaming, Book Club</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Joining a Club</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click on a club you're interested in</li>
          <li class="pl-2">Read the full description</li>
          <li class="pl-2">Check membership requirements</li>
          <li class="pl-2">Review meeting schedule</li>
          <li class="pl-2">Click <strong>"Join Club"</strong> or <strong>"Apply"</strong></li>
          <li class="pl-2">Fill out application if required</li>
          <li class="pl-2">Wait for approval</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Club Applications</h3>
        <p class="mt-4 mb-4">Some clubs require applications:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Fill out the application form</li>
          <li class="pl-2">Answer required questions</li>
          <li class="pl-2">Submit your application</li>
          <li class="pl-2">Check application status</li>
          <li class="pl-2">You'll be notified of acceptance</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Managing Memberships</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">View all your club memberships</li>
          <li class="pl-2">See upcoming meetings and events</li>
          <li class="pl-2">Access club resources and materials</li>
          <li class="pl-2">Communicate with club members</li>
          <li class="pl-2">Leave clubs if needed</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Benefits of Joining</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Develop new skills</li>
          <li class="pl-2">Meet like-minded students</li>
          <li class="pl-2">Build leadership experience</li>
          <li class="pl-2">Enhance your academic profile</li>
          <li class="pl-2">Have fun and reduce stress</li>
        </ul>
      </div>
    `,
    steps: [
      'Browse available clubs',
      'Read club descriptions',
      'Check requirements and schedule',
      'Click Join or Apply',
      'Complete application if needed',
      'Wait for approval',
      'Start participating',
    ],
    tips: [
      'Join clubs that match your interests',
      'Don\'t overcommit - quality over quantity',
      'Attend meetings regularly',
      'Participate actively',
      'Build relationships with members',
    ],
    tags: ['clubs', 'organizations', 'activities', 'extracurricular'],
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    featured: false,
    videoAvailable: false,
    updated: '3 days ago',
    relatedArticles: ['calendar-events', 'welcome'],
  },
  {
    id: 'calendar-events',
    title: 'Viewing School Events',
    category: 'student-life',
    type: 'guide',
    difficulty: 'beginner',
    readingTime: '3 min',
    views: 1678,
    likes: 98,
    description: 'Stay updated with school events, activities, and important dates',
    content: 'Browse upcoming events, view event details, and RSVP to activities.',
    fullContent: `
      <div class="mb-8">
        <h2>Viewing School Events</h2>
        <p class="mt-4 mb-6">Stay informed about all school events, activities, and important dates through the Events section.</p>
      </div>
      
      <div class="mb-10">
        <h3>Accessing Events</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click <strong>"Events"</strong> in the sidebar</li>
          <li class="pl-2">View upcoming events calendar</li>
          <li class="pl-2">Filter by event type or date</li>
          <li class="pl-2">Click on events for details</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Event Types</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Academic:</strong> Exams, parent-teacher conferences, workshops</li>
          <li class="pl-2"><strong>Sports:</strong> Games, tournaments, practices</li>
          <li class="pl-2"><strong>Cultural:</strong> Festivals, performances, celebrations</li>
          <li class="pl-2"><strong>Social:</strong> Dances, gatherings, mixers</li>
          <li class="pl-2"><strong>Service:</strong> Community service events, fundraisers</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Event Information</h3>
        <p class="mt-4 mb-4">Each event shows:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Date and time</li>
          <li class="pl-2">Location</li>
          <li class="pl-2">Description</li>
          <li class="pl-2">RSVP requirements</li>
          <li class="pl-2">Contact information</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>RSVP to Events</h3>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Click on the event</li>
          <li class="pl-2">Read full details</li>
          <li class="pl-2">Click <strong>"RSVP"</strong> button</li>
          <li class="pl-2">Confirm your attendance</li>
          <li class="pl-2">Receive confirmation</li>
        </ol>
      </div>

      <div class="mb-8">
        <h3>Event Notifications</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Get notified of new events</li>
          <li class="pl-2">Receive reminders before events</li>
          <li class="pl-2">Get updates if events change</li>
          <li class="pl-2">See events on your calendar</li>
        </ul>
      </div>
    `,
    steps: [
      'Navigate to Events section',
      'Browse calendar view',
      'Filter by type if needed',
      'Click on event for details',
      'RSVP if required',
      'Add to personal calendar',
    ],
    tips: [
      'Check events regularly',
      'RSVP early for popular events',
      'Set reminders for important events',
      'Sync with your personal calendar',
      'Share events with friends',
    ],
    tags: ['events', 'calendar', 'activities', 'school'],
    icon: Calendar,
    color: 'from-teal-500 to-emerald-600',
    featured: false,
    videoAvailable: false,
    updated: '6 days ago',
    relatedArticles: ['clubs-organizations', 'notifications'],
  },
  {
    id: 'productivity-tools',
    title: 'Using Productivity Tools',
    category: 'tools',
    type: 'guide',
    difficulty: 'intermediate',
    readingTime: '8 min',
    views: 2890,
    likes: 189,
    description: 'Master the productivity tools: Notes, Todo List, Goals, and Pomodoro Timer',
    content: 'Learn how to use all productivity tools to enhance your study habits and organization.',
    fullContent: `
      <div class="mb-8">
        <h2>Using Productivity Tools</h2>
        <p class="mt-4 mb-6">The student portal includes powerful productivity tools to help you stay organized, manage your time, and achieve your goals.</p>
      </div>
      
      <div class="mb-10">
        <h3>Notes Tool</h3>
        <p class="mt-4 mb-4">Create and organize your study notes:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Create Notes:</strong> Click "New Note" to start</li>
          <li class="pl-2"><strong>Format Text:</strong> Use formatting options (bold, italic, lists)</li>
          <li class="pl-2"><strong>Organize:</strong> Create folders and categories</li>
          <li class="pl-2"><strong>Search:</strong> Quickly find notes using search</li>
          <li class="pl-2"><strong>Share:</strong> Share notes with classmates</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Todo List</h3>
        <p class="mt-4 mb-4">Manage your tasks effectively:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Add Tasks:</strong> Create new todo items</li>
          <li class="pl-2"><strong>Set Priorities:</strong> Mark high/medium/low priority</li>
          <li class="pl-2"><strong>Due Dates:</strong> Assign deadlines</li>
          <li class="pl-2"><strong>Categories:</strong> Organize by subject or type</li>
          <li class="pl-2"><strong>Check Off:</strong> Mark completed tasks</li>
          <li class="pl-2"><strong>Archive:</strong> Move completed tasks to archive</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Goal Tracker</h3>
        <p class="mt-4 mb-4">Set and track your academic goals:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2"><strong>Create Goals:</strong> Set short-term and long-term goals</li>
          <li class="pl-2"><strong>Track Progress:</strong> Update your progress regularly</li>
          <li class="pl-2"><strong>Milestones:</strong> Break large goals into milestones</li>
          <li class="pl-2"><strong>Deadlines:</strong> Set target completion dates</li>
          <li class="pl-2"><strong>Visualize:</strong> See your progress with charts</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Pomodoro Timer</h3>
        <p class="mt-4 mb-4">Use the Pomodoro technique for focused study:</p>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Set a 25-minute timer</li>
          <li class="pl-2">Focus on one task</li>
          <li class="pl-2">Take a 5-minute break</li>
          <li class="pl-2">Repeat 4 times</li>
          <li class="pl-2">Take a longer 15-30 minute break</li>
        </ol>
      </div>

      <div class="mb-8">
        <h3>Best Practices</h3>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Use notes during lectures</li>
          <li class="pl-2">Keep todo list updated daily</li>
          <li class="pl-2">Review goals weekly</li>
          <li class="pl-2">Use Pomodoro for focused study sessions</li>
          <li class="pl-2">Sync tools for better organization</li>
        </ul>
      </div>
    `,
    steps: [
      'Access productivity tools from dashboard',
      'Create your first note',
      'Set up your todo list',
      'Define your goals',
      'Start a Pomodoro session',
      'Regularly update and review',
    ],
    tips: [
      'Use notes during live classes',
      'Review todo list each morning',
      'Update goals weekly',
      'Use Pomodoro for difficult subjects',
      'Keep tools synced across devices',
    ],
    tags: ['productivity', 'tools', 'notes', 'todo', 'goals'],
    icon: Target,
    color: 'from-violet-500 to-indigo-600',
    featured: true,
    videoAvailable: true,
    updated: '1 week ago',
    relatedArticles: ['class-schedule', 'submit-assignment', 'welcome'],
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Troubleshooting',
    category: 'support',
    type: 'troubleshooting',
    difficulty: 'beginner',
    readingTime: '7 min',
    views: 3456,
    likes: 234,
    description: 'Solutions to common problems and how to resolve them quickly',
    content: 'Find solutions to frequently encountered issues and learn troubleshooting steps.',
    fullContent: `
      <div class="mb-8">
        <h2>Common Issues & Troubleshooting</h2>
        <p class="mt-4 mb-6">This guide helps you resolve common issues you might encounter while using the student portal.</p>
      </div>
      
      <div class="mb-10">
        <h3>Login Problems</h3>
        <p class="mt-4 mb-4"><strong>Issue: Can't log in</strong></p>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Verify username and password (check Caps Lock)</li>
          <li class="pl-2">Clear browser cache and cookies</li>
          <li class="pl-2">Try a different browser</li>
          <li class="pl-2">Use "Forgot Password" to reset</li>
          <li class="pl-2">Contact support if issue persists</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Assignment Submission Issues</h3>
        <p class="mt-4 mb-4"><strong>Issue: Can't submit assignment</strong></p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Check file format is accepted</li>
          <li class="pl-2">Verify file size is under 10MB</li>
          <li class="pl-2">Check internet connection</li>
          <li class="pl-2">Try uploading again</li>
          <li class="pl-2">Contact teacher if problem continues</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Quiz Technical Problems</h3>
        <p class="mt-4 mb-4"><strong>Issue: Quiz won't load or crashes</strong></p>
        <ol class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Refresh the page</li>
          <li class="pl-2">Clear browser cache</li>
          <li class="pl-2">Disable browser extensions</li>
          <li class="pl-2">Try a different browser</li>
          <li class="pl-2">Contact teacher immediately</li>
          <li class="pl-2">Take screenshots of errors</li>
        </ol>
      </div>

      <div class="mb-10">
        <h3>Grades Not Showing</h3>
        <p class="mt-4 mb-4"><strong>Issue: Grades missing or not updated</strong></p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Check if grading period is complete</li>
          <li class="pl-2">Grades update 3-5 days after assessment</li>
          <li class="pl-2">Refresh the page</li>
          <li class="pl-2">Contact your teacher</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Slow Loading</h3>
        <p class="mt-4 mb-4"><strong>Issue: Pages loading slowly</strong></p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Check internet connection speed</li>
          <li class="pl-2">Close unnecessary browser tabs</li>
          <li class="pl-2">Clear browser cache</li>
          <li class="pl-2">Try during off-peak hours</li>
          <li class="pl-2">Disable browser extensions</li>
        </ul>
      </div>

      <div class="mb-10">
        <h3>Notifications Not Working</h3>
        <p class="mt-4 mb-4"><strong>Issue: Not receiving notifications</strong></p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Check notification settings</li>
          <li class="pl-2">Verify email address is correct</li>
          <li class="pl-2">Check spam/junk folder</li>
          <li class="pl-2">Enable browser notifications</li>
          <li class="pl-2">Update notification preferences</li>
        </ul>
      </div>

      <div class="mb-8">
        <h3>Contact Support</h3>
        <p class="mt-4 mb-4">If problems persist:</p>
        <ul class="mt-4 ml-6 space-y-3">
          <li class="pl-2">Email: support@southville8bnhs.edu.ph</li>
          <li class="pl-2">Phone: +1 (234) 567-8900</li>
          <li class="pl-2">Include screenshots and error messages</li>
          <li class="pl-2">Describe what you were doing when issue occurred</li>
        </ul>
      </div>
    `,
    steps: [
      'Identify the problem',
      'Try basic troubleshooting',
      'Check help documentation',
      'Search for similar issues',
      'Contact support with details',
    ],
    tips: [
      'Always clear cache first',
      'Take screenshots of errors',
      'Note what you were doing',
      'Try different browsers',
      'Keep support contact info handy',
    ],
    tags: ['troubleshooting', 'issues', 'problems', 'solutions'],
    icon: AlertCircle,
    color: 'from-red-500 to-orange-600',
    featured: true,
    videoAvailable: false,
    updated: '2 days ago',
    relatedArticles: ['welcome', 'submit-assignment', 'take-quiz'],
  },
]

export function getArticleById(id: string): HelpArticle | undefined {
  return helpArticles.find(article => article.id === id)
}

export function getRelatedArticles(currentId: string, limit: number = 3): HelpArticle[] {
  const currentArticle = getArticleById(currentId)
  if (!currentArticle) return []
  
  const relatedIds = currentArticle.relatedArticles || []
  const related = relatedIds
    .map(id => getArticleById(id))
    .filter((article): article is HelpArticle => article !== undefined)
    .slice(0, limit)
  
  // If not enough related articles, add articles from same category
  if (related.length < limit) {
    const sameCategory = helpArticles
      .filter(a => a.category === currentArticle.category && a.id !== currentId)
      .slice(0, limit - related.length)
    related.push(...sameCategory)
  }
  
  return related.slice(0, limit)
}

export function getArticlesByCategory(category: string): HelpArticle[] {
  return helpArticles.filter(article => article.category === category)
}

