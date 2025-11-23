using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;
using System;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class HelpGuideViewModel : ViewModelBase
{
    private ObservableCollection<HelpCategoryViewModel> _allCategories = new();

    [ObservableProperty]
    private ObservableCollection<HelpCategoryViewModel> _helpCategories = new();

    [ObservableProperty]
    private string _searchText = string.Empty;

    [ObservableProperty]
    private HelpCategoryViewModel? _selectedCategory;

    public HelpGuideViewModel()
    {
        InitializeHelpCategories();
        // Set default selected category to prevent null binding errors
        SelectedCategory = HelpCategories.FirstOrDefault();
    }

    partial void OnSearchTextChanged(string value)
    {
        ApplySearch();
    }

    private void ApplySearch()
    {
        if (string.IsNullOrWhiteSpace(SearchText))
        {
            HelpCategories = new ObservableCollection<HelpCategoryViewModel>(_allCategories);
            if (SelectedCategory == null || !HelpCategories.Contains(SelectedCategory))
            {
                SelectedCategory = HelpCategories.FirstOrDefault();
            }
            return;
        }

        var searchLower = SearchText.ToLowerInvariant();
        var filteredCategories = new ObservableCollection<HelpCategoryViewModel>();

        foreach (var category in _allCategories)
        {
            var matchingArticles = category.Articles
                .Where(a => a.Title.ToLowerInvariant().Contains(searchLower) ||
                           a.Content.ToLowerInvariant().Contains(searchLower))
                .ToList();

            if (category.Title.ToLowerInvariant().Contains(searchLower) ||
                category.Description.ToLowerInvariant().Contains(searchLower) ||
                matchingArticles.Any())
            {
                var filteredCategory = new HelpCategoryViewModel
                {
                    Title = category.Title,
                    Description = category.Description,
                    Articles = new ObservableCollection<HelpArticleViewModel>(matchingArticles.Any() 
                        ? matchingArticles 
                        : category.Articles)
                };
                filteredCategories.Add(filteredCategory);
            }
        }

        HelpCategories = filteredCategories;
        SelectedCategory = HelpCategories.FirstOrDefault();
    }

    private void InitializeHelpCategories()
    {
        // 1. Getting Started
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Getting Started",
            Description = "Basic information to get you started with the Teacher Portal",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "System Overview", 
                    Content = "Welcome to the Southville 8B NHS Teacher Portal! This desktop application provides teachers with comprehensive tools to manage classes, grades, announcements, and communication.\n\n" +
                             "The teacher portal is organized into several main sections:\n" +
                             "• Overview: Dashboard with KPIs, recent activities, and calendar\n" +
                             "• Classroom: Schedule Planner and Grade Entry\n" +
                             "• Content: My Announcements for class communications\n" +
                             "• Communication: Messaging with parents, admins, and other teachers\n\n" +
                             "Use the left sidebar to navigate between different sections. The right sidebar displays your profile, current page information, and quick statistics."
                },
                new() 
                { 
                    Title = "First Login & Navigation", 
                    Content = "When you first log in to the teacher portal:\n\n" +
                             "1. Enter your email and password on the login screen\n" +
                             "2. Check 'Remember Me' if you want to stay logged in\n" +
                             "3. Click 'Login' to access the portal\n" +
                             "4. You'll be taken to the Dashboard by default\n\n" +
                             "Navigation:\n" +
                             "• Use the left sidebar to switch between different sections\n" +
                             "• Click on any navigation item (Dashboard, Schedule Planner, etc.) to open that page\n" +
                             "• The active page is highlighted in blue\n" +
                             "• Use the profile dropdown (top right) to access Profile, Settings, Notifications, Help Guide, and Logout"
                }
            }
        });

        // 2. Dashboard
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Dashboard",
            Description = "Understanding your dashboard, KPIs, and quick access features",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Dashboard Overview",
                    Content = "The Dashboard is your central hub when you log in. It provides a comprehensive overview of your teaching activities and key metrics.\n\n" +
                             "Key Components:\n" +
                             "• KPI Cards: Display total students, active classes, upcoming lessons, and unread messages\n" +
                             "• Today's Schedule: Shows your classes for today with subject, time, and room information\n" +
                             "• Weekly Schedule: Overview of your weekly class distribution\n" +
                             "• Recent Activities: Latest student activities and submissions\n" +
                             "• My Announcements: Quick view of your recent announcements\n" +
                             "• Grade Entry Quick Access: Quick links to sections needing grade entry\n\n" +
                             "The dashboard automatically refreshes data every few minutes to keep information current."
                },
                new()
                {
                    Title = "Understanding KPIs",
                    Content = "Key Performance Indicators (KPIs) on your dashboard provide quick insights:\n\n" +
                             "• My Students: Total number of students across all your classes\n" +
                             "• Active Classes: Number of classes you're currently teaching\n" +
                             "• Upcoming Lessons: Number of lessons scheduled in the near future\n" +
                             "• Unread Messages: Messages from parents, admins, or other teachers requiring your attention\n\n" +
                             "These metrics update in real-time and help you stay on top of your teaching responsibilities."
                },
                new()
                {
                    Title = "Quick Actions from Dashboard",
                    Content = "The Dashboard provides quick access buttons to frequently used features:\n\n" +
                             "• Schedule Planner: Click to view your full weekly schedule\n" +
                             "• Grade Entry: Quick access to enter or update student grades\n" +
                             "• My Announcements: Navigate to create or manage announcements\n" +
                             "• Messaging: Access your conversations with parents and colleagues\n\n" +
                             "These quick actions help you navigate efficiently without using the sidebar menu."
                }
            }
        });

        // 3. Schedule Planner
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Schedule Planner",
            Description = "View and manage your class schedules",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Viewing Your Schedule",
                    Content = "The Schedule Planner displays your weekly class schedule in an organized format.\n\n" +
                             "To view your schedule:\n" +
                             "1. Click 'Schedule Planner' in the left sidebar\n" +
                             "2. The current week's schedule is displayed by default\n" +
                             "3. Each class shows subject, section, time, and room information\n" +
                             "4. Classes are organized by day and time slots\n\n" +
                             "The schedule view helps you plan your week and see your teaching load at a glance."
                },
                new()
                {
                    Title = "Filtering by Week",
                    Content = "You can view schedules for different weeks:\n\n" +
                             "1. Use the week dropdown at the top of the Schedule Planner\n" +
                             "2. Select from available weeks (Current Week, Next Week, etc.)\n" +
                             "3. The schedule updates to show classes for the selected week\n" +
                             "4. The date range is displayed below the week selector\n\n" +
                             "This feature helps you plan ahead and see your upcoming schedule."
                },
                new()
                {
                    Title = "Schedule Details",
                    Content = "Each schedule entry shows important information:\n\n" +
                             "• Subject Name: The course you're teaching\n" +
                             "• Section: The class section (e.g., Grade 8-A)\n" +
                             "• Time: Start and end time of the class\n" +
                             "• Room: The classroom location\n" +
                             "• Day: Day of the week\n\n" +
                             "Click on any schedule entry to view more details. The schedule helps you manage your time and prepare for classes effectively."
                }
            }
        });

        // 4. Grade Entry
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Grade Entry",
            Description = "Enter and manage student grades, calculate GWA",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Accessing Grade Entry",
                    Content = "The Grade Entry feature allows you to enter and update student grades.\n\n" +
                             "To access Grade Entry:\n" +
                             "1. Click 'Grade Entry' in the left sidebar\n" +
                             "2. Select a Grading Period from the dropdown (e.g., 1st Quarter, 2nd Quarter)\n" +
                             "3. Select a School Year from the dropdown\n" +
                             "4. The system loads students for your sections\n\n" +
                             "You'll see a list of students with their current grades and GWA (General Weighted Average)."
                },
                new()
                {
                    Title = "Entering Grades",
                    Content = "To enter or update student grades:\n\n" +
                             "1. Select the appropriate Grading Period and School Year\n" +
                             "2. Find the student in the list\n" +
                             "3. Click on the grade field for that student\n" +
                             "4. Enter the grade value (typically 0-100)\n" +
                             "5. The system automatically marks the entry as 'dirty' (unsaved)\n" +
                             "6. Grades are color-coded:\n" +
                             "   • Green: 90 and above (Excellent)\n" +
                             "   • Blue: 80-89 (Good)\n" +
                             "   • Orange: 70-79 (Fair)\n" +
                             "   • Red: Below 70 (Needs Improvement)\n\n" +
                             "You can enter multiple grades before saving."
                },
                new()
                {
                    Title = "Saving Grades",
                    Content = "After entering grades, you need to save them:\n\n" +
                             "1. Review all entered grades for accuracy\n" +
                             "2. Click 'Save All Grades' button\n" +
                             "3. The system validates that grades are within acceptable range\n" +
                             "4. If validation passes, grades are saved to the database\n" +
                             "5. A success message confirms the save operation\n\n" +
                             "Important Notes:\n" +
                             "• Always validate grades before saving\n" +
                             "• The system will create a new GWA entry if one doesn't exist\n" +
                             "• Existing GWA entries will be updated\n" +
                             "• Unsaved changes are indicated by visual markers"
                },
                new()
                {
                    Title = "Understanding GWA",
                    Content = "GWA (General Weighted Average) is automatically calculated:\n\n" +
                             "• GWA represents a student's overall performance\n" +
                             "• It's calculated based on entered grades\n" +
                             "• The GWA is displayed next to each student's name\n" +
                             "• GWA updates automatically when you save grades\n\n" +
                             "The GWA helps you track student progress and identify students who may need additional support."
                }
            }
        });

        // 5. My Announcements
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "My Announcements",
            Description = "Create, manage, and track your class announcements",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Viewing Announcements",
                    Content = "The My Announcements page shows all your announcements:\n\n" +
                             "1. Click 'My Announcements' in the left sidebar\n" +
                             "2. View summary cards showing Total Announcements and Active Posts\n" +
                             "3. Browse recent announcements in the horizontal scrollable list\n" +
                             "4. Each announcement card shows:\n" +
                             "   • Title\n" +
                             "   • Priority badge (High, Medium, Low)\n" +
                             "   • Status badge (Active, Draft, etc.)\n" +
                             "   • Target class\n" +
                             "   • Description preview\n\n" +
                             "Use the Refresh button to reload the latest announcements."
                },
                new()
                {
                    Title = "Creating Announcements",
                    Content = "To create a new announcement:\n\n" +
                             "1. Scroll to the 'Quick Create' section at the bottom\n" +
                             "2. Enter the announcement Title\n" +
                             "3. Select the Target Class from the dropdown\n" +
                             "4. Enter the announcement content/description\n" +
                             "5. Optionally set priority and scheduling\n" +
                             "6. Click 'Publish' or 'Save as Draft'\n\n" +
                             "The announcement will appear in your list and be visible to students in the selected class."
                },
                new()
                {
                    Title = "Editing Announcements",
                    Content = "To edit an existing announcement:\n\n" +
                             "1. Find the announcement in the list\n" +
                             "2. Click the Edit button (pencil icon) on the announcement card\n" +
                             "3. The edit form opens with existing data populated\n" +
                             "4. Make your changes to title, content, class, or priority\n" +
                             "5. Click 'Save' to update the announcement\n" +
                             "6. A success message confirms the update\n\n" +
                             "Note: Only your own announcements can be edited."
                },
                new()
                {
                    Title = "Viewing Announcement Details",
                    Content = "To view full details of an announcement:\n\n" +
                             "1. Find the announcement in the list\n" +
                             "2. Click the View button (eye icon) on the announcement card\n" +
                             "3. A dialog opens showing:\n" +
                             "   • Full title and content\n" +
                             "   • Target class\n" +
                             "   • Priority level\n" +
                             "   • Status\n" +
                             "   • Creation date\n\n" +
                             "This helps you review announcements before sharing or editing them."
                },
                new()
                {
                    Title = "Deleting Announcements",
                    Content = "To delete an announcement:\n\n" +
                             "1. Find the announcement in the list\n" +
                             "2. Click the Delete button (trash icon) on the announcement card\n" +
                             "3. A confirmation dialog appears\n" +
                             "4. Confirm deletion by clicking 'Yes'\n" +
                             "5. The announcement is permanently removed\n\n" +
                             "Warning: Deleted announcements cannot be recovered. Make sure you want to delete before confirming."
                },
                new()
                {
                    Title = "Filtering Announcements",
                    Content = "You can filter announcements by status:\n\n" +
                             "1. Use the filter dropdown (shows 'All' by default)\n" +
                             "2. Select from available options:\n" +
                             "   • All: Shows all announcements\n" +
                             "   • Active: Shows only published/active announcements\n" +
                             "   • Draft: Shows only draft announcements\n" +
                             "   • Scheduled: Shows only scheduled announcements\n" +
                             "3. The list updates to show only matching announcements\n\n" +
                             "Filtering helps you manage large numbers of announcements efficiently."
                }
            }
        });

        // 6. Messaging
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Messaging",
            Description = "Communicate with parents, admins, and other teachers",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Accessing Messaging",
                    Content = "The Messaging feature allows you to communicate with parents, administrators, and other teachers.\n\n" +
                             "To access Messaging:\n" +
                             "1. Click 'Messaging' in the left sidebar\n" +
                             "2. Your conversations list appears on the left\n" +
                             "3. Select a conversation to view messages\n" +
                             "4. The message area opens on the right\n\n" +
                             "Conversations are organized by contact, with the most recent messages at the top."
                },
                new()
                {
                    Title = "Starting a New Conversation",
                    Content = "To start a new conversation:\n\n" +
                             "1. Click the 'New' button at the top of the conversations list\n" +
                             "2. Enter basic chat information (recipient, subject, etc.)\n" +
                             "3. Click 'Create Chat' to start the conversation\n" +
                             "4. The new conversation appears in your list\n\n" +
                             "You can then send your first message to the recipient."
                },
                new()
                {
                    Title = "Sending Messages",
                    Content = "To send a message in an existing conversation:\n\n" +
                             "1. Select a conversation from the list\n" +
                             "2. Type your message in the message input field at the bottom\n" +
                             "3. Click the Send button or press Enter\n" +
                             "4. Your message appears immediately (optimistic update)\n" +
                             "5. The message status updates to 'Sent' when confirmed by the server\n\n" +
                             "Messages are delivered in real-time, and you'll see delivery status indicators."
                },
                new()
                {
                    Title = "Searching Conversations",
                    Content = "To find a specific conversation:\n\n" +
                             "1. Use the search box at the top of the conversations list\n" +
                             "2. Type the contact name or keywords from messages\n" +
                             "3. Matching conversations appear as you type\n" +
                             "4. Click on a conversation to open it\n\n" +
                             "Search helps you quickly find conversations with specific contacts or topics."
                },
                new()
                {
                    Title = "Viewing Contact Information",
                    Content = "To view details about a contact:\n\n" +
                             "1. Select a conversation\n" +
                             "2. Click the Info button (i icon) in the chat header\n" +
                             "3. A modal opens showing:\n" +
                             "   • Contact name and role\n" +
                             "   • Online status\n" +
                             "   • Conversation details\n\n" +
                             "From the contact info modal, you can also delete the conversation if needed."
                },
                new()
                {
                    Title = "Deleting Conversations",
                    Content = "To delete a conversation:\n\n" +
                             "1. Open the contact info modal (click Info button)\n" +
                             "2. Click 'Delete Conversation'\n" +
                             "3. A confirmation dialog appears\n" +
                             "4. Confirm deletion by clicking 'Yes'\n" +
                             "5. The conversation is permanently removed from your list\n\n" +
                             "Warning: Deleted conversations cannot be recovered. All messages in that conversation will be lost."
                }
            }
        });

        // 7. Profile & Account
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Profile & Account",
            Description = "Manage your profile information and account settings",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Viewing Your Profile",
                    Content = "Your profile displays your personal and professional information:\n\n" +
                             "To view your profile:\n" +
                             "1. Click your profile picture/name in the top right\n" +
                             "2. Select 'Profile' from the dropdown menu\n" +
                             "3. Your profile page displays:\n" +
                             "   • Full name and email\n" +
                             "   • Subject specialization\n" +
                             "   • Department\n" +
                             "   • Phone number\n" +
                             "   • Address\n" +
                             "   • Birthday and age\n\n" +
                             "Note: Profile information is read-only and managed by administrators."
                },
                new()
                {
                    Title = "Profile Information",
                    Content = "Your profile contains the following information:\n\n" +
                             "Personal Information:\n" +
                             "• Full Name: Your complete name as registered\n" +
                             "• Email: Your school email address\n" +
                             "• Phone: Contact phone number\n" +
                             "• Department: Your assigned department\n\n" +
                             "Contact and Address:\n" +
                             "• Address: Your registered address\n" +
                             "• Birthday: Your date of birth\n" +
                             "• Age: Automatically calculated from birthday\n\n" +
                             "All profile fields are displayed for reference but cannot be edited directly."
                }
            }
        });

        // 8. Settings & Preferences
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Settings & Preferences",
            Description = "Configure application settings and preferences",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Accessing Settings",
                    Content = "Settings allow you to customize your application experience:\n\n" +
                             "To access Settings:\n" +
                             "1. Click your profile picture/name in the top right\n" +
                             "2. Select 'Settings' from the dropdown menu\n" +
                             "3. The Settings page opens\n\n" +
                             "Here you can configure various application preferences to suit your needs."
                },
                new()
                {
                    Title = "Application Settings",
                    Content = "The Settings page provides options to customize:\n\n" +
                             "• Theme preferences (if available)\n" +
                             "• Notification preferences\n" +
                             "• Display options\n" +
                             "• Other application-specific settings\n\n" +
                             "Changes to settings are saved automatically. Use the Settings page to personalize your experience with the Teacher Portal."
                }
            }
        });

        // 9. Notifications
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Notifications",
            Description = "Manage and view your notifications",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Accessing Notifications",
                    Content = "Notifications keep you informed about important updates and activities:\n\n" +
                             "To view notifications:\n" +
                             "1. Click your profile picture/name in the top right\n" +
                             "2. Select 'Notifications' from the dropdown menu\n" +
                             "3. The Notifications page displays all your notifications\n\n" +
                             "Notifications are organized by type and time, with the most recent at the top."
                },
                new()
                {
                    Title = "Managing Notifications",
                    Content = "You can manage notifications in several ways:\n\n" +
                             "Mark All as Read:\n" +
                             "• Click 'Mark All Read' to mark all notifications as read\n" +
                             "• This helps you clear the unread count\n\n" +
                             "Mark Individual Notification:\n" +
                             "• Click on a specific notification to mark it as read\n" +
                             "• Read notifications are visually distinguished\n\n" +
                             "Delete Notification:\n" +
                             "• Click the delete button on a notification to remove it\n" +
                             "• Deleted notifications cannot be recovered\n\n" +
                             "Clear All:\n" +
                             "• Use 'Clear All' to remove all notifications\n" +
                             "• A confirmation dialog prevents accidental deletion"
                }
            }
        });

        // 10. Help & Support
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Help & Support",
            Description = "Get help and find answers to common questions",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new()
                {
                    Title = "Using the Help Guide",
                    Content = "The Help Guide provides comprehensive documentation for all features:\n\n" +
                             "To access the Help Guide:\n" +
                             "1. Click your profile picture/name in the top right\n" +
                             "2. Select 'Help Guide' from the dropdown menu\n" +
                             "3. Browse help categories on the left\n" +
                             "4. Click a category to view articles\n" +
                             "5. Use the search box to find specific topics\n\n" +
                             "The Help Guide is organized by feature, making it easy to find information about specific tasks."
                },
                new()
                {
                    Title = "Searching Help Articles",
                    Content = "To quickly find help information:\n\n" +
                             "1. Open the Help Guide\n" +
                             "2. Type keywords in the search box at the top\n" +
                             "3. Matching categories and articles appear automatically\n" +
                             "4. Click on any result to view the full article\n\n" +
                             "Search looks through article titles and content, so you can find information even if you don't know the exact category."
                },
                new()
                {
                    Title = "Getting Additional Support",
                    Content = "If you need additional help:\n\n" +
                             "• Check the Help Guide for detailed instructions\n" +
                             "• Contact your school's IT support team\n" +
                             "• Reach out to the system administrator\n\n" +
                             "For technical issues or questions not covered in the Help Guide, please contact your school's support team for assistance."
                }
            }
        });

        // Set HelpCategories to all categories initially
        HelpCategories = new ObservableCollection<HelpCategoryViewModel>(_allCategories);
    }
}

public partial class HelpCategoryViewModel : ObservableObject
{
    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string _description = string.Empty;

    [ObservableProperty]
    private ObservableCollection<HelpArticleViewModel> _articles = new();
}

public partial class HelpArticleViewModel : ObservableObject
{
    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string _content = string.Empty;
}

