using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;
using System;

namespace Southville8BEdgeUI.ViewModels.Admin;

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
            Description = "Basic information to get you started with the system",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "System Overview", 
                    Content = "Welcome to the Southville 8B NHS Admin Portal! This comprehensive desktop application provides administrators with powerful tools to manage the school's digital ecosystem.\n\n" +
                             "The admin portal is organized into several main sections:\n" +
                             "• Overview: Dashboard with key metrics and statistics\n" +
                             "• Management: User, Building, and Class Schedule management\n" +
                             "• Content: Events and E-Library management\n" +
                             "• Communication: Alerts and Chat features\n\n" +
                             "Use the left sidebar to navigate between different sections. The right sidebar displays your profile, current page information, and quick statistics."
                },
                new() 
                { 
                    Title = "First Login & Navigation", 
                    Content = "When you first log in to the admin portal:\n\n" +
                             "1. Enter your email and password on the login screen\n" +
                             "2. Check 'Keep me signed in' if you want to stay logged in\n" +
                             "3. Click the login button\n\n" +
                             "After logging in, you'll see the Dashboard. The interface consists of:\n" +
                             "• Left Sidebar: Main navigation menu with all available features\n" +
                             "• Center Content: The main working area showing the current page\n" +
                             "• Right Sidebar: Your profile, statistics, and event calendar\n\n" +
                             "You can toggle the sidebars using the chevron buttons at the top of the screen."
                },
                new() 
                { 
                    Title = "Understanding the Dashboard", 
                    Content = "The Dashboard is your central command center, providing an overview of the school's key metrics:\n\n" +
                             "Key Statistics Cards:\n" +
                             "• Total Students: Current enrollment count\n" +
                             "• Active Teachers: Number of active teaching staff\n" +
                             "• Total Sections: Number of class sections\n" +
                             "• Total Staff: Administrative and support staff count\n\n" +
                             "Performance Metrics:\n" +
                             "• Student Attendance Rate: Percentage of students attending\n" +
                             "• Teacher Satisfaction Rate: Staff satisfaction metrics\n" +
                             "• System Uptime: Application availability percentage\n" +
                             "• Online Users: Currently active users\n\n" +
                             "Quick Actions: Use the action buttons on dashboard cards to quickly navigate to related features like User Management, Building Management, or Events."
                },
                new() 
                { 
                    Title = "Profile Dropdown Features", 
                    Content = "Click on your profile in the right sidebar to access the dropdown menu with the following options:\n\n" +
                             "• Profile: View and edit your personal information, change password, upload photo\n" +
                             "• Settings: Access system settings and preferences\n" +
                             "• Notifications: View and manage your notifications\n" +
                             "• Help Guide: Access this comprehensive help documentation (you're here!)\n" +
                             "• Dark Mode: Toggle between light and dark theme\n" +
                             "• Logout: Sign out of your account\n\n" +
                             "The dropdown also displays your email address for quick reference."
                }
            }
        });

        // 2. Dashboard
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Dashboard",
            Description = "Understanding dashboard metrics, statistics, and quick actions",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Overview of Dashboard Metrics", 
                    Content = "The Dashboard provides real-time insights into your school's operations. Key metrics are displayed in easy-to-read cards:\n\n" +
                             "Main Statistics:\n" +
                             "• Total Students: Shows current student enrollment across all grade levels\n" +
                             "• Active Teachers: Number of teachers currently active in the system\n" +
                             "• Total Sections: Count of all class sections\n" +
                             "• Total Staff: Administrative and support staff members\n\n" +
                             "Room Management:\n" +
                             "• Available Rooms: Number of rooms currently available for booking\n" +
                             "• Total Rooms: Total number of rooms in all buildings\n" +
                             "• Room Utilization: Percentage showing how many rooms are in use\n" +
                             "• Rooms in Maintenance: Rooms currently unavailable due to maintenance\n\n" +
                             "Events:\n" +
                             "• Upcoming Events: Number of events scheduled in the near future\n\n" +
                             "These metrics update in real-time and help you monitor the school's status at a glance."
                },
                new() 
                { 
                    Title = "Understanding Statistics Cards", 
                    Content = "The Dashboard displays various statistics cards that provide quick insights:\n\n" +
                             "User Statistics:\n" +
                             "• Student Percentage: Percentage of total users who are students\n" +
                             "• Teacher Percentage: Percentage of total users who are teachers\n" +
                             "• Admin Percentage: Percentage of total users who are administrators\n" +
                             "• Active Percentage: Percentage of users with 'Active' status\n\n" +
                             "Performance Metrics:\n" +
                             "• Student Attendance Rate: Real-time attendance percentage\n" +
                             "• Teacher Satisfaction Rate: Staff satisfaction metrics\n" +
                             "• System Uptime: Application availability (target: >99.5%)\n" +
                             "• Online Users: Currently logged-in users\n\n" +
                             "Room Status:\n" +
                             "• Room Occupancy Rate: Percentage of rooms currently occupied\n" +
                             "• Occupied Rooms: Number of rooms in use\n" +
                             "• Rooms Booked: Number of rooms with scheduled bookings\n\n" +
                             "Click on any card to navigate to the related management page for more details."
                },
                new() 
                { 
                    Title = "Quick Actions", 
                    Content = "The Dashboard provides quick action buttons to navigate to key features:\n\n" +
                             "Available Quick Actions:\n" +
                             "• User Management: Click to manage students, teachers, and admins\n" +
                             "• Building Management: Access building, floor, and room management\n" +
                             "• Events Dashboard: View and manage school events\n" +
                             "• Chat: Open the chat interface for communication\n" +
                             "• E-Library: Access the digital library management\n\n" +
                             "These quick actions save time by providing direct access to frequently used features without navigating through the sidebar menu."
                },
                new() 
                { 
                    Title = "Weekly Statistics", 
                    Content = "The Dashboard displays weekly statistics in a visual chart format:\n\n" +
                             "Weekly Stats Chart:\n" +
                             "• Shows data trends over the past week\n" +
                             "• Displays metrics like user activity, events, or other key indicators\n" +
                             "• Updates automatically as new data comes in\n\n" +
                             "The chart helps you identify patterns and trends in school operations. Hover over data points to see exact values."
                },
                new() 
                { 
                    Title = "System Alerts", 
                    Content = "System alerts appear on the Dashboard to notify you of important information:\n\n" +
                             "Alert Types:\n" +
                             "• System Notifications: Important system updates or maintenance notices\n" +
                             "• User Activity: Significant user actions that require attention\n" +
                             "• Data Updates: Notifications about data synchronization or changes\n\n" +
                             "Alert Actions:\n" +
                             "• Dismiss: Click the dismiss button to remove alerts you've reviewed\n" +
                             "• View Details: Click on an alert to see more information\n\n" +
                             "Alerts are color-coded by priority (High, Medium, Low) to help you prioritize your attention."
                }
            }
        });

        // 3. User Management
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "User Management",
            Description = "Managing users, roles, and permissions",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Creating New Users", 
                    Content = "You can create three types of users: Students, Teachers, and Admins.\n\n" +
                             "To create a new user:\n" +
                             "1. Navigate to User Management from the left sidebar\n" +
                             "2. Click the 'Create User' button at the top of the page\n" +
                             "3. Select the user type (Student, Teacher, or Admin)\n" +
                             "4. Fill in the required information:\n" +
                             "   • For Students: First Name, Last Name, Email, Birthday, Grade Level, Section\n" +
                             "   • For Teachers: First Name, Last Name, Email, Birthday, Department, Subject Specialization\n" +
                             "   • For Admins: First Name, Last Name, Email, Birthday, Role Description\n" +
                             "5. Click 'Create User' to save\n\n" +
                             "The system will automatically generate a username from the email address. For students and teachers, the initial password is set to their birthday in YYYYMMDD format. For admins, a secure random password is generated."
                },
                new() 
                { 
                    Title = "Importing Users via CSV", 
                    Content = "Bulk import users from a CSV file to save time:\n\n" +
                             "Steps to Import:\n" +
                             "1. Go to User Management\n" +
                             "2. Click the 'Import Users' button\n" +
                             "3. Select the CSV file from your computer\n" +
                             "4. Review the import preview to verify data\n" +
                             "5. Click 'Import' to complete the process\n\n" +
                             "CSV Format Requirements:\n" +
                             "• For Students: First Name, Last Name, Email, Birthday, Grade Level, Section\n" +
                             "• For Teachers: First Name, Last Name, Email, Birthday, Department, Subject\n" +
                             "• Headers must match exactly (case-sensitive)\n" +
                             "• Dates should be in YYYY-MM-DD format\n\n" +
                             "The system will show you a summary of successful imports and any errors that occurred."
                },
                new() 
                { 
                    Title = "Editing User Information", 
                    Content = "Update user details after creation:\n\n" +
                             "To edit a user:\n" +
                             "1. Go to User Management\n" +
                             "2. Find the user in the list (use search or filters)\n" +
                             "3. Click the 'Edit' button on the user card\n" +
                             "4. Modify the fields you want to change:\n" +
                             "   • Basic Info: Full Name, Email\n" +
                             "   • Student: First/Last/Middle Name, Student ID, LRN ID, Birthday, Grade Level, Section\n" +
                             "   • Teacher: First/Last/Middle Name, Birthday, Department, Subject, Advisory Section\n" +
                             "   • Admin: First/Last/Middle Name, Birthday, Role Description, Phone Number\n" +
                             "5. Click 'Save Changes' to update\n\n" +
                             "Note: Some fields like User ID cannot be changed after creation. The system will automatically calculate age from birthday."
                },
                new() 
                { 
                    Title = "Viewing User Details", 
                    Content = "View comprehensive information about any user:\n\n" +
                             "To view user details:\n" +
                             "1. Navigate to User Management\n" +
                             "2. Find the user in the list\n" +
                             "3. Click the 'View Details' button on the user card\n\n" +
                             "The details page shows:\n" +
                             "• Basic Information: Full Name, Email, Role, Status\n" +
                             "• Account Information: Created Date, Last Updated, Last Login\n" +
                             "• Role-Specific Details:\n" +
                             "  - Students: Student ID, LRN ID, Grade Level, Section, Enrollment Year, Honor Status\n" +
                             "  - Teachers: Department, Subject Specialization, Advisory Section, Age\n" +
                             "  - Admins: Role Description, Phone Number, Age\n\n" +
                             "Use this view to get a complete picture of a user's account and activity."
                },
                new() 
                { 
                    Title = "Resetting User Passwords", 
                    Content = "Reset a user's password when they forget it or need a new one:\n\n" +
                             "To reset a password:\n" +
                             "1. Go to User Management\n" +
                             "2. Find the user whose password you want to reset\n" +
                             "3. Click the 'Reset PW' button on the user card\n" +
                             "4. Confirm the reset in the dialog box\n\n" +
                             "Password Reset Rules:\n" +
                             "• For Students and Teachers: Password is reset to their birthday in YYYYMMDD format (e.g., 20100115 for January 15, 2010)\n" +
                             "• For Admins: A secure random password is generated\n\n" +
                             "Important: The new password will be displayed in a confirmation message. Make sure to securely share this with the user. They should change it after first login for security."
                },
                new() 
                { 
                    Title = "Deleting Users", 
                    Content = "Remove users from the system permanently:\n\n" +
                             "To delete a user:\n" +
                             "1. Navigate to User Management\n" +
                             "2. Find the user you want to delete\n" +
                             "3. Click the 'Delete' button on the user card\n" +
                             "4. Confirm the deletion in the warning dialog\n\n" +
                             "Warning: This action cannot be undone. Deleting a user will:\n" +
                             "• Remove all user data from the system\n" +
                             "• Remove access to all associated resources\n" +
                             "• Affect related records (schedules, assignments, etc.)\n\n" +
                             "Best Practice: Consider deactivating users instead of deleting them if you may need to restore access later. Deactivated users can be reactivated, but deleted users cannot be recovered."
                },
                new() 
                { 
                    Title = "Filtering and Searching Users", 
                    Content = "Quickly find specific users using filters and search:\n\n" +
                             "Search Function:\n" +
                             "• Type in the search box to find users by name, email, or ID\n" +
                             "• Search works across all user fields\n" +
                             "• Results update as you type\n\n" +
                             "Filter Options:\n" +
                             "• Role Filter: Filter by Student, Teacher, Admin, or Staff\n" +
                             "• Status Filter: Filter by Active, Inactive, Suspended, or Pending\n" +
                             "• Grade Filter: Filter students by Grade Level (Grade 8-12, Faculty, N/A)\n\n" +
                             "Combining Filters:\n" +
                             "• You can use multiple filters together\n" +
                             "• For example: Search for 'Active Students in Grade 10'\n" +
                             "• Clear filters by selecting 'All' options\n\n" +
                             "Pagination:\n" +
                             "• Results are paginated (default: 25 per page)\n" +
                             "• Change page size: 10, 25, 50, or 100 users per page\n" +
                             "• Use Previous/Next buttons to navigate pages"
                },
                new() 
                { 
                    Title = "User Status Management", 
                    Content = "Manage user account status to control access:\n\n" +
                             "User Statuses:\n" +
                             "• Active: User can log in and use the system normally\n" +
                             "• Inactive: User account is disabled, cannot log in\n" +
                             "• Suspended: Temporary restriction, usually for disciplinary reasons\n" +
                             "• Pending: Newly created account awaiting activation\n\n" +
                             "To Change Status:\n" +
                             "1. Go to User Management\n" +
                             "2. Find the user\n" +
                             "3. Click the status toggle button (if available)\n" +
                             "4. Or edit the user and change status in the edit form\n\n" +
                             "Status Effects:\n" +
                             "• Active users have full access based on their role\n" +
                             "• Inactive users cannot log in but data is preserved\n" +
                             "• Suspended users are temporarily blocked\n" +
                             "• Pending users need activation before first login\n\n" +
                             "Note: Users with 'Pending' status cannot be edited or have their status changed until activated."
                }
            }
        });

        // 4. Building Management
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Building Management",
            Description = "Managing buildings, floors, and rooms",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Managing Buildings", 
                    Content = "Buildings are the top-level structure in the facility hierarchy. Each building can contain multiple floors, and each floor can contain multiple rooms.\n\n" +
                             "To create a new building:\n" +
                             "1. Navigate to Building Management from the left sidebar\n" +
                             "2. Click the 'Create Building' or 'Add Building' button\n" +
                             "3. Enter building information:\n" +
                             "   • Building Name: e.g., 'Main Building', 'Science Wing'\n" +
                             "   • Building Code: Short identifier (e.g., 'MB', 'SW')\n" +
                             "   • Description: Optional details about the building\n" +
                             "4. Click 'Save' to create the building\n\n" +
                             "To edit a building:\n" +
                             "1. Find the building in the list\n" +
                             "2. Click on the building card or edit button\n" +
                             "3. Modify the information\n" +
                             "4. Click 'Save Changes'\n\n" +
                             "To delete a building:\n" +
                             "• Note: You can only delete buildings that have no floors or rooms\n" +
                             "• Delete all floors and rooms first, then delete the building"
                },
                new() 
                { 
                    Title = "Adding Floors to Buildings", 
                    Content = "Floors are organized within buildings. Each floor can contain multiple rooms.\n\n" +
                             "To add a floor:\n" +
                             "1. Go to Building Management\n" +
                             "2. Select or expand the building where you want to add a floor\n" +
                             "3. Click 'Add Floor' or the floor creation button\n" +
                             "4. Enter floor information:\n" +
                             "   • Floor Name: e.g., 'Ground Floor', 'First Floor', 'Second Floor'\n" +
                             "   • Floor Number: Numeric identifier (0, 1, 2, etc.)\n" +
                             "   • Description: Optional details\n" +
                             "5. Click 'Save' to create the floor\n\n" +
                             "Floor Organization:\n" +
                             "• Floors are displayed hierarchically under their parent building\n" +
                             "• You can expand/collapse buildings to view their floors\n" +
                             "• Each floor shows the number of rooms it contains\n\n" +
                             "Best Practice: Use consistent naming conventions (e.g., 'Ground Floor', '1st Floor', '2nd Floor') for easier navigation."
                },
                new() 
                { 
                    Title = "Managing Rooms", 
                    Content = "Rooms are the smallest unit in the building hierarchy. They can be assigned to classes, events, or other activities.\n\n" +
                             "To create a room:\n" +
                             "1. Navigate to Building Management\n" +
                             "2. Expand the building and floor where you want to add a room\n" +
                             "3. Click 'Add Room' or the room creation button\n" +
                             "4. Enter room information:\n" +
                             "   • Room Number: e.g., '101', 'A-201', 'Lab-3'\n" +
                             "   • Room Name: Optional descriptive name (e.g., 'Computer Lab', 'Science Lab')\n" +
                             "   • Capacity: Maximum number of occupants\n" +
                             "   • Room Type: Classroom, Laboratory, Office, etc.\n" +
                             "   • Status: Available, Occupied, Maintenance\n" +
                             "5. Click 'Save' to create the room\n\n" +
                             "Bulk Room Creation:\n" +
                             "• You can create multiple rooms at once using bulk creation\n" +
                             "• Useful for creating numbered rooms (101, 102, 103, etc.)\n" +
                             "• Specify the range and naming pattern\n\n" +
                             "To edit a room:\n" +
                             "1. Find the room in the building/floor hierarchy\n" +
                             "2. Click on the room card or edit button\n" +
                             "3. Modify the information\n" +
                             "4. Click 'Save Changes'"
                },
                new() 
                { 
                    Title = "Room Status and Capacity", 
                    Content = "Manage room availability and capacity to optimize space usage:\n\n" +
                             "Room Statuses:\n" +
                             "• Available: Room is free and can be booked\n" +
                             "• Occupied: Room is currently in use\n" +
                             "• Maintenance: Room is under maintenance and unavailable\n" +
                             "• Reserved: Room is reserved for a specific event or class\n\n" +
                             "To change room status:\n" +
                             "1. Go to Building Management\n" +
                             "2. Find the room\n" +
                             "3. Click on the room to view details\n" +
                             "4. Change the status dropdown\n" +
                             "5. Save changes\n\n" +
                             "Room Capacity:\n" +
                             "• Set the maximum number of people the room can accommodate\n" +
                             "• This helps prevent overbooking\n" +
                             "• The system will warn if a booking exceeds capacity\n\n" +
                             "Room Utilization:\n" +
                             "• The dashboard shows overall room utilization percentage\n" +
                             "• This metric helps identify if you need more rooms or if some are underused\n" +
                             "• Aim for 70-80% utilization for optimal efficiency"
                },
                new() 
                { 
                    Title = "Searching Buildings and Rooms", 
                    Content = "Quickly find specific buildings, floors, or rooms using the search function:\n\n" +
                             "Search Features:\n" +
                             "• Type in the search box at the top of Building Management\n" +
                             "• Search works across:\n" +
                             "  - Building names and codes\n" +
                             "  - Floor names\n" +
                             "  - Room numbers and names\n\n" +
                             "Search Results:\n" +
                             "• Results are filtered in real-time as you type\n" +
                             "• Matching buildings, floors, and rooms are highlighted\n" +
                             "• The search is case-insensitive\n\n" +
                             "Tips for Effective Searching:\n" +
                             "• Use building codes for quick access (e.g., 'MB' for Main Building)\n" +
                             "• Search by room number to find specific rooms (e.g., '101')\n" +
                             "• Use partial matches - you don't need to type the full name\n\n" +
                             "Clearing Search:\n" +
                             "• Clear the search box to show all buildings and rooms again\n" +
                             "• Or click the 'X' button in the search field"
                }
            }
        });

        // 5. Class Schedules
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Class Schedules",
            Description = "Viewing and filtering class schedules",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Viewing Class Schedules", 
                    Content = "The Class Schedules page displays all class schedules in a table format.\n\n" +
                             "To view schedules:\n" +
                             "1. Navigate to Class Schedules from the left sidebar\n" +
                             "2. The page will load all schedules automatically\n" +
                             "3. Schedules are displayed as cards showing:\n" +
                             "   • Subject Name (with color indicator)\n" +
                             "   • Teacher Name\n" +
                             "   • Section Name\n" +
                             "   • Room Number and Building\n" +
                             "   • Day of Week\n" +
                             "   • Time Range (Start - End)\n" +
                             "   • School Year and Semester\n\n" +
                             "Schedule Information:\n" +
                             "• Each schedule card has a colored left border matching the subject color\n" +
                             "• The day is displayed in a badge at the top right\n" +
                             "• Time range shows when the class meets\n" +
                             "• Use the Refresh button to reload the latest schedule data"
                },
                new() 
                { 
                    Title = "Filtering by Section", 
                    Content = "Filter schedules to show only classes for a specific section:\n\n" +
                             "To filter by section:\n" +
                             "1. Go to Class Schedules\n" +
                             "2. Find the 'Section' filter dropdown\n" +
                             "3. Select the section you want to view\n" +
                             "4. The schedule list will update automatically\n\n" +
                             "Use Cases:\n" +
                             "• View all classes for a specific section (e.g., '8-A')\n" +
                             "• Check the weekly schedule for a particular class\n" +
                             "• Verify section assignments\n\n" +
                             "To clear the filter:\n" +
                             "• Select 'All Sections' or use the 'Clear Filters' button"
                },
                new() 
                { 
                    Title = "Filtering by Teacher", 
                    Content = "View all schedules assigned to a specific teacher:\n\n" +
                             "To filter by teacher:\n" +
                             "1. Navigate to Class Schedules\n" +
                             "2. Find the 'Teacher' filter dropdown\n" +
                             "3. Select the teacher from the list\n" +
                             "4. Schedules will update to show only that teacher's classes\n\n" +
                             "Use Cases:\n" +
                             "• Check a teacher's weekly schedule\n" +
                             "• Verify teacher assignments\n" +
                             "• Identify potential scheduling conflicts\n\n" +
                             "The filter shows all teachers who have assigned schedules. Select 'All Teachers' to view all schedules again."
                },
                new() 
                { 
                    Title = "Filtering by Day of Week", 
                    Content = "View schedules for a specific day:\n\n" +
                             "To filter by day:\n" +
                             "1. Go to Class Schedules\n" +
                             "2. Find the 'Day' filter dropdown\n" +
                             "3. Select a day (Monday, Tuesday, Wednesday, etc.)\n" +
                             "4. Only schedules for that day will be displayed\n\n" +
                             "Available Days:\n" +
                             "• Monday through Sunday\n\n" +
                             "Use Cases:\n" +
                             "• See what classes are scheduled on a specific day\n" +
                             "• Check room usage for a particular day\n" +
                             "• Plan activities around existing schedules\n\n" +
                             "Tip: Combine day filter with section or teacher filter to see very specific schedule views."
                },
                new() 
                { 
                    Title = "Filtering by School Year and Semester", 
                    Content = "View schedules for specific academic periods:\n\n" +
                             "To filter by school year:\n" +
                             "1. Navigate to Class Schedules\n" +
                             "2. Find the 'School Year' dropdown\n" +
                             "3. Select a school year (e.g., '2024-2025')\n\n" +
                             "To filter by semester:\n" +
                             "1. Find the 'Semester' dropdown\n" +
                             "2. Select '1st' or '2nd' semester\n\n" +
                             "Default Values:\n" +
                             "• School Year defaults to the current academic year\n" +
                             "• Semester defaults to '1st'\n\n" +
                             "Use Cases:\n" +
                             "• View schedules for the current semester\n" +
                             "• Compare schedules across different semesters\n" +
                             "• Archive or review past academic year schedules\n\n" +
                             "The statistics cards at the top update based on your selected filters."
                },
                new() 
                { 
                    Title = "Searching Schedules", 
                    Content = "Use the search function to quickly find specific schedules:\n\n" +
                             "To search:\n" +
                             "1. Go to Class Schedules\n" +
                             "2. Type in the search box\n" +
                             "3. Results filter in real-time as you type\n\n" +
                             "Search works across:\n" +
                             "• Subject Name\n" +
                             "• Teacher Name\n" +
                             "• Section Name\n" +
                             "• Room Number\n\n" +
                             "Search Tips:\n" +
                             "• Search is case-insensitive\n" +
                             "• Partial matches work (e.g., 'Math' will find 'Mathematics')\n" +
                             "• You can combine search with filters for precise results\n\n" +
                             "To clear search:\n" +
                             "• Delete the text in the search box\n" +
                             "• Or use the 'Clear Filters' button to reset everything"
                },
                new() 
                { 
                    Title = "Understanding Schedule Statistics", 
                    Content = "The top of the Class Schedules page displays key statistics:\n\n" +
                             "Statistics Cards:\n" +
                             "• Total Schedules: Total number of schedules in the system\n" +
                             "• Active Schedules: Schedules for the selected school year\n" +
                             "• Schedules This Semester: Schedules matching both school year and semester filters\n" +
                             "• Conflicts: Number of schedules with detected conflicts\n" +
                             "• Teachers: Number of unique teachers with assigned schedules\n\n" +
                             "How Statistics Update:\n" +
                             "• Statistics update automatically when you change filters\n" +
                             "• They reflect the currently filtered view\n" +
                             "• Use them to get quick insights into schedule distribution\n\n" +
                             "Understanding Conflicts:\n" +
                             "• Conflicts occur when schedules overlap (same teacher, room, or section at the same time)\n" +
                             "• High conflict count indicates scheduling issues that may need attention\n" +
                             "• Review conflicts to identify and resolve scheduling problems"
                },
                new() 
                { 
                    Title = "Clearing Filters and Refreshing", 
                    Content = "Reset your view and reload schedule data:\n\n" +
                             "To Clear All Filters:\n" +
                             "1. Click the 'Clear Filters' button\n" +
                             "2. All filter dropdowns reset to default values\n" +
                             "3. Search box is cleared\n" +
                             "4. All schedules are displayed again\n\n" +
                             "To Refresh Data:\n" +
                             "1. Click the 'Refresh' button (🔄) in the top right\n" +
                             "2. The system reloads schedules from the server\n" +
                             "3. Any new or updated schedules will appear\n\n" +
                             "When to Refresh:\n" +
                             "• After schedules have been updated by other admins\n" +
                             "• If you suspect data is outdated\n" +
                             "• To ensure you're viewing the latest information\n\n" +
                             "Note: Filters are preserved when you refresh, so you can refresh while maintaining your current filter settings."
                }
            }
        });

        // 6. Events Dashboard
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Events Dashboard",
            Description = "Viewing and filtering school events",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Viewing Events", 
                    Content = "The Events Dashboard displays all school events, activities, and announcements.\n\n" +
                             "To view events:\n" +
                             "1. Navigate to Events Dashboard from the left sidebar\n" +
                             "2. Events are automatically loaded and displayed\n" +
                             "3. Each event card shows:\n" +
                             "   • Event Title\n" +
                             "   • Event Description\n" +
                             "   • Event Date and Time\n" +
                             "   • Location\n" +
                             "   • Event Type (Meeting, Competition, Holiday, etc.)\n" +
                             "   • Status (Draft, Published, Cancelled, Completed)\n" +
                             "   • Organizer Name\n" +
                             "   • Tags\n\n" +
                             "Event Display:\n" +
                             "• Events are displayed in a card layout\n" +
                             "• Each card has a status indicator showing the current status\n" +
                             "• Click on an event card to view more details\n" +
                             "• Use the Refresh button to reload the latest events"
                },
                new() 
                { 
                    Title = "Filtering by Status", 
                    Content = "Filter events by their current status:\n\n" +
                             "To filter by status:\n" +
                             "1. Go to Events Dashboard\n" +
                             "2. Find the 'Status' filter dropdown\n" +
                             "3. Select a status:\n" +
                             "   • Draft: Events not yet published\n" +
                             "   • Published: Active events visible to users\n" +
                             "   • Cancelled: Events that have been cancelled\n" +
                             "   • Completed: Events that have finished\n" +
                             "4. The event list updates automatically\n\n" +
                             "Use Cases:\n" +
                             "• View only published events\n" +
                             "• Check draft events that need review\n" +
                             "• Review completed events for records\n\n" +
                             "To view all events regardless of status, select 'All Status'."
                },
                new() 
                { 
                    Title = "Filtering by Type", 
                    Content = "Filter events by their category or type:\n\n" +
                             "To filter by type:\n" +
                             "1. Navigate to Events Dashboard\n" +
                             "2. Find the 'Type' filter dropdown\n" +
                             "3. Select an event type:\n" +
                             "   • Meeting\n" +
                             "   • Competition\n" +
                             "   • Holiday\n" +
                             "   • Academic\n" +
                             "   • Sports\n" +
                             "   • Cultural\n" +
                             "4. Only events of that type will be displayed\n\n" +
                             "Use Cases:\n" +
                             "• View all sports events\n" +
                             "• Check academic calendar events\n" +
                             "• See upcoming competitions\n\n" +
                             "Select 'All Types' to view events of all categories."
                },
                new() 
                { 
                    Title = "Filtering by Location", 
                    Content = "View events happening at specific locations:\n\n" +
                             "To filter by location:\n" +
                             "1. Go to Events Dashboard\n" +
                             "2. Find the 'Location' filter dropdown\n" +
                             "3. Select a location:\n" +
                             "   • Main Hall\n" +
                             "   • Gymnasium\n" +
                             "   • Auditorium\n" +
                             "   • Classroom\n" +
                             "   • Online\n" +
                             "4. Events at that location will be shown\n\n" +
                             "Use Cases:\n" +
                             "• Check what events are scheduled in the Main Hall\n" +
                             "• View all online events\n" +
                             "• Plan room usage around events\n\n" +
                             "Select 'All Locations' to view events from all locations."
                },
                new() 
                { 
                    Title = "Filtering by Tags", 
                    Content = "Filter events using tags for more specific categorization:\n\n" +
                             "To filter by tag:\n" +
                             "1. Navigate to Events Dashboard\n" +
                             "2. Find the 'Tag' filter dropdown\n" +
                             "3. Select a tag from the list\n" +
                             "4. Only events with that tag will be displayed\n\n" +
                             "About Tags:\n" +
                             "• Tags provide additional categorization beyond event type\n" +
                             "• Events can have multiple tags\n" +
                             "• Tags help organize events by themes or topics\n\n" +
                             "Use Cases:\n" +
                             "• Find events related to a specific theme\n" +
                             "• Group related events together\n" +
                             "• Filter by custom categories\n\n" +
                             "Clear the tag filter to view all events again."
                },
                new() 
                { 
                    Title = "Searching Events", 
                    Content = "Use the search function to quickly find specific events:\n\n" +
                             "To search:\n" +
                             "1. Go to Events Dashboard\n" +
                             "2. Type in the search box at the top\n" +
                             "3. Results filter in real-time as you type\n\n" +
                             "Search works across:\n" +
                             "• Event Title\n" +
                             "• Event Description\n" +
                             "• Organizer Name\n" +
                             "• Location\n\n" +
                             "Search Tips:\n" +
                             "• Search is case-insensitive\n" +
                             "• Partial matches work (e.g., 'sport' will find 'Sports Day')\n" +
                             "• You can combine search with filters for precise results\n\n" +
                             "To clear search:\n" +
                             "• Delete the text in the search box\n" +
                             "• The event list will show all events again"
                },
                new() 
                { 
                    Title = "Understanding Event Statistics", 
                    Content = "The top of the Events Dashboard displays key statistics:\n\n" +
                             "Statistics Cards:\n" +
                             "• Total Events: Total number of events in the system\n" +
                             "• This Week Events: Events scheduled for the current week\n" +
                             "• Upcoming Events: Future events that haven't occurred yet\n" +
                             "• Past Events: Events that have already taken place\n\n" +
                             "How Statistics Update:\n" +
                             "• Statistics update automatically when you change filters\n" +
                             "• They reflect the currently filtered view\n" +
                             "• Use them to get quick insights into event distribution\n\n" +
                             "Understanding the Counts:\n" +
                             "• 'This Week' includes events from Monday to Sunday of the current week\n" +
                             "• 'Upcoming' includes all future events regardless of date\n" +
                             "• 'Past' includes all completed or past events\n\n" +
                             "These statistics help you understand the event calendar at a glance."
                },
                new() 
                { 
                    Title = "Viewing Event Details", 
                    Content = "View comprehensive information about a specific event:\n\n" +
                             "To view event details:\n" +
                             "1. Navigate to Events Dashboard\n" +
                             "2. Find the event you want to view\n" +
                             "3. Click on the event card\n\n" +
                             "Event Details Page shows:\n" +
                             "• Full Event Title and Description\n" +
                             "• Complete Date and Time Information\n" +
                             "• Location Details\n" +
                             "• Event Type and Status\n" +
                             "• Organizer Information\n" +
                             "• All Associated Tags\n" +
                             "• Event Image (if available)\n" +
                             "• Creation and Update Timestamps\n\n" +
                             "Use the back button or navigation to return to the events list."
                },
                new() 
                { 
                    Title = "Pagination and Loading More", 
                    Content = "Events are displayed in pages for better performance:\n\n" +
                             "Pagination:\n" +
                             "• Events are loaded in pages (default: 10 per page)\n" +
                             "• The current page number is displayed\n" +
                             "• Total number of pages is shown\n\n" +
                             "Loading More Events:\n" +
                             "• If there are more events, a 'Load More' button appears\n" +
                             "• Click 'Load More' to load the next page\n" +
                             "• New events are appended to the current list\n" +
                             "• The button disappears when all events are loaded\n\n" +
                             "Refreshing Events:\n" +
                             "• Click the 'Refresh' button to reload all events\n" +
                             "• This fetches the latest data from the server\n" +
                             "• Filters are preserved when refreshing\n\n" +
                             "Note: Filters and search apply to all pages, so you'll only see matching events across all pages."
                }
            }
        });

        // 7. Alerts
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Alerts",
            Description = "Creating and managing school alerts and announcements",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Creating Alerts", 
                    Content = "Create alerts to notify students, teachers, and staff about important information.\n\n" +
                             "To create an alert:\n" +
                             "1. Navigate to Alerts from the left sidebar\n" +
                             "2. Fill in the alert form:\n" +
                             "   • Alert Type: Select from Weather, Class Suspension, or Emergency\n" +
                             "   • Title: Enter a clear, concise title for the alert\n" +
                             "   • Message: Write the detailed message content\n" +
                             "   • Extra Link (Optional): Add a URL for additional information\n" +
                             "   • Priority: Select High, Medium, or Low\n" +
                             "   • Target Audience: Choose who should see this alert\n" +
                             "   • Expiration: Set when the alert should expire\n" +
                             "3. Click 'Create Alert' or 'Publish Alert' to save\n\n" +
                             "Alert Types:\n" +
                             "• Weather: For weather-related announcements (e.g., early dismissal)\n" +
                             "• Class Suspension: For class cancellation or suspension notices\n" +
                             "• Emergency: For urgent emergency notifications\n\n" +
                             "After creating, the alert will be visible to the selected audience immediately."
                },
                new() 
                { 
                    Title = "Setting Alert Priorities", 
                    Content = "Priorities help users identify the importance of alerts:\n\n" +
                             "Priority Levels:\n" +
                             "• High: Critical alerts that require immediate attention\n" +
                             "   - Use for emergencies, urgent announcements\n" +
                             "   - Displayed with red/danger color\n\n" +
                             "• Medium: Important but not urgent alerts\n" +
                             "   - Use for class suspensions, schedule changes\n" +
                             "   - Displayed with yellow/warning color\n\n" +
                             "• Low: Informational alerts\n" +
                             "   - Use for general announcements, reminders\n" +
                             "   - Displayed with green/success color\n\n" +
                             "To Set Priority:\n" +
                             "1. When creating an alert, find the 'Priority' dropdown\n" +
                             "2. Select the appropriate priority level\n" +
                             "3. The alert will be color-coded based on priority\n\n" +
                             "Best Practice: Use High priority sparingly for truly urgent matters. Overuse can desensitize users to important alerts."
                },
                new() 
                { 
                    Title = "Targeting Specific Audiences", 
                    Content = "Control who sees your alerts by setting the target audience:\n\n" +
                             "Target Options:\n" +
                             "• Whole School: Alert is visible to everyone\n" +
                             "   - All students, teachers, and staff will see it\n" +
                             "   - Use for school-wide announcements\n\n" +
                             "• Grade Level: Alert targets a specific grade\n" +
                             "   - Select the grade (e.g., Grade 8, Grade 9)\n" +
                             "   - Only users in that grade will see the alert\n" +
                             "   - Use for grade-specific information\n\n" +
                             "• Section: Alert targets a specific class section\n" +
                             "   - Enter the section name (e.g., '8-A', '9-B')\n" +
                             "   - Only students and teachers in that section see it\n" +
                             "   - Use for section-specific notices\n\n" +
                             "To Set Target Audience:\n" +
                             "1. In the alert form, find 'Target Audience' or 'Target Scope'\n" +
                             "2. Select Whole School, Grade Level, or Section\n" +
                             "3. If selecting Grade Level or Section, enter the specific value\n\n" +
                             "Note: The more specific your target, the fewer people will see the alert. Use this to avoid unnecessary notifications."
                },
                new() 
                { 
                    Title = "Setting Alert Expiration", 
                    Content = "Alerts automatically expire at a set date and time:\n\n" +
                             "To Set Expiration:\n" +
                             "1. When creating an alert, find the expiration settings\n" +
                             "2. Set the Expiration Date:\n" +
                             "   - Select the date when the alert should expire\n" +
                             "   - Defaults to today's date\n\n" +
                             "3. Set the Expiration Time:\n" +
                             "   - Select the time when the alert should expire\n" +
                             "   - Defaults to 11:59 PM\n\n" +
                             "Expiration Behavior:\n" +
                             "• Alerts automatically become inactive after expiration\n" +
                             "• Expired alerts are no longer visible to users\n" +
                             "• You can still see expired alerts in the admin view\n" +
                             "• Expired alerts can be manually deleted or purged\n\n" +
                             "Best Practices:\n" +
                             "• Set expiration for time-sensitive alerts (e.g., same-day announcements)\n" +
                             "• For ongoing information, set expiration far in the future\n" +
                             "• Review and update expiration dates if events change\n\n" +
                             "Example: For a 'Class suspended tomorrow' alert, set expiration to end of the next day."
                },
                new() 
                { 
                    Title = "Managing Active Alerts", 
                    Content = "View and manage alerts that are currently active:\n\n" +
                             "Viewing Active Alerts:\n" +
                             "• Active alerts are displayed at the top of the Alerts page\n" +
                             "• They are sorted by priority (High first) and expiration time\n" +
                             "• Each alert shows:\n" +
                             "  - Type and Title\n" +
                             "  - Message content\n" +
                             "  - Priority indicator (color-coded)\n" +
                             "  - Target audience\n" +
                             "  - Creation and expiration times\n\n" +
                             "Active Alert Count:\n" +
                             "• The page displays the number of active alerts\n" +
                             "• This helps you monitor how many alerts are currently visible\n\n" +
                             "Managing Active Alerts:\n" +
                             "• Expire Alert: Manually expire an alert before its expiration time\n" +
                             "• Delete Alert: Permanently remove an alert from the system\n\n" +
                             "Best Practice: Regularly review active alerts to ensure they're still relevant and haven't expired."
                },
                new() 
                { 
                    Title = "Deleting Alerts", 
                    Content = "Permanently remove alerts from the system:\n\n" +
                             "To Delete an Alert:\n" +
                             "1. Go to the Alerts page\n" +
                             "2. Find the alert you want to delete\n" +
                             "3. Click the 'Delete' button on the alert card\n" +
                             "4. Confirm the deletion if prompted\n\n" +
                             "When to Delete:\n" +
                             "• Alerts that are no longer needed\n" +
                             "• Alerts created by mistake\n" +
                             "• Old alerts that are cluttering the list\n\n" +
                             "Warning: Deleting an alert is permanent and cannot be undone. The alert will be removed from all users' views immediately.\n\n" +
                             "Alternative: Instead of deleting, you can:\n" +
                             "• Expire the alert manually (if it's still active)\n" +
                             "• Let it expire naturally at its set expiration time\n" +
                             "• Use 'Purge Expired' to remove all expired alerts at once"
                },
                new() 
                { 
                    Title = "Expiring Alerts Manually", 
                    Content = "Manually expire alerts before their scheduled expiration time:\n\n" +
                             "To Expire an Alert:\n" +
                             "1. Navigate to Alerts\n" +
                             "2. Find the active alert you want to expire\n" +
                             "3. Click the 'Expire' or 'Expire Now' button\n" +
                             "4. The alert will immediately become inactive\n\n" +
                             "Use Cases:\n" +
                             "• An event was cancelled and the alert is no longer relevant\n" +
                             "• Information in the alert has changed\n" +
                             "• You want to remove the alert before its natural expiration\n\n" +
                             "Expired vs Deleted:\n" +
                             "• Expired alerts remain in the system but are hidden from users\n" +
                             "• Deleted alerts are permanently removed\n" +
                             "• You can still see expired alerts in the admin view\n" +
                             "• Expired alerts can be purged later to clean up the list\n\n" +
                             "Note: Once expired, an alert cannot be reactivated. You would need to create a new alert if the information is still needed."
                },
                new() 
                { 
                    Title = "Purging Expired Alerts", 
                    Content = "Remove all expired alerts from the system at once:\n\n" +
                             "To Purge Expired Alerts:\n" +
                             "1. Go to the Alerts page\n" +
                             "2. Find the 'Purge Expired' button\n" +
                             "3. Click to remove all expired alerts\n" +
                             "4. Confirm if prompted\n\n" +
                             "What Gets Purged:\n" +
                             "• Only alerts that have passed their expiration date/time\n" +
                             "• Active alerts are not affected\n" +
                             "• Manually expired alerts are also removed\n\n" +
                             "Benefits:\n" +
                             "• Keeps the alerts list clean and manageable\n" +
                             "• Removes clutter from old announcements\n" +
                             "• Improves performance with fewer records\n\n" +
                             "When to Purge:\n" +
                             "• Periodically (e.g., weekly or monthly)\n" +
                             "• When the expired alerts list becomes too long\n" +
                             "• As part of regular maintenance\n\n" +
                             "Warning: Purging is permanent. Expired alerts cannot be recovered after purging. Make sure you don't need any historical data from expired alerts before purging."
                }
            }
        });

        // 8. Chat
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Chat",
            Description = "Communicating with users through the chat system",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Starting New Conversations", 
                    Content = "Initiate conversations with teachers, admins, or other users:\n\n" +
                             "To start a new chat:\n" +
                             "1. Navigate to Chat from the left sidebar\n" +
                             "2. Click the 'New Chat' or 'Start Conversation' button\n" +
                             "3. Search for the user you want to chat with:\n" +
                             "   • Type their name in the search box\n" +
                             "   • Or browse through the user list\n" +
                             "4. Select the user from the results\n" +
                             "5. The conversation will open automatically\n\n" +
                             "Who Can You Chat With:\n" +
                             "• Teachers: All teaching staff members\n" +
                             "• Admins: Other administrators\n" +
                             "• Students: (if enabled for your role)\n\n" +
                             "Conversation Features:\n" +
                             "• Messages are sent in real-time\n" +
                             "• Conversation history is saved\n" +
                             "• You can see when messages were sent\n" +
                             "• Unread message counts are displayed"
                },
                new() 
                { 
                    Title = "Sending Messages", 
                    Content = "Send messages in an active conversation:\n\n" +
                             "To send a message:\n" +
                             "1. Select a conversation from the conversation list\n" +
                             "2. Type your message in the message input box at the bottom\n" +
                             "3. Press Enter or click the Send button\n\n" +
                             "Message Features:\n" +
                             "• Messages appear immediately in the chat\n" +
                             "• Your messages appear on the right side\n" +
                             "• Other users' messages appear on the left side\n" +
                             "• Timestamps show when each message was sent\n" +
                             "• Message status shows if it's sending or sent\n\n" +
                             "Message Display:\n" +
                             "• Your messages: Displayed with accent color background\n" +
                             "• Other messages: Displayed with card background\n" +
                             "• Time format: Shows as 'h:mm tt' (e.g., '2:30 PM')\n\n" +
                             "Tips:\n" +
                             "• Keep messages clear and professional\n" +
                             "• Use proper grammar and spelling\n" +
                             "• Be respectful in all communications"
                },
                new() 
                { 
                    Title = "Managing Conversations", 
                    Content = "Organize and manage your chat conversations:\n\n" +
                             "Conversation List:\n" +
                             "• Shows all your active conversations\n" +
                             "• Displays contact name and role\n" +
                             "• Shows last message preview\n" +
                             "• Shows last message time\n" +
                             "• Displays unread message count (if any)\n\n" +
                             "Selecting Conversations:\n" +
                             "• Click on any conversation to open it\n" +
                             "• Messages load automatically when you select a conversation\n" +
                             "• Unread messages are marked as read when you open the conversation\n\n" +
                             "Conversation Information:\n" +
                             "• Contact Name: The person you're chatting with\n" +
                             "• Contact Role: Their role (Admin, Teacher, etc.)\n" +
                             "• Online Status: Shows if the contact is currently online\n" +
                             "• Last Message: Preview of the most recent message\n" +
                             "• Unread Count: Number of unread messages (if any)\n\n" +
                             "Deleting Conversations:\n" +
                             "• Open the contact info modal\n" +
                             "• Click 'Delete Conversation'\n" +
                             "• Confirm the deletion\n" +
                             "• The conversation will be removed from your list"
                },
                new() 
                { 
                    Title = "Filtering Conversations", 
                    Content = "Filter conversations by user type to find specific chats:\n\n" +
                             "To Filter Conversations:\n" +
                             "1. Go to the Chat page\n" +
                             "2. Find the 'User Type' filter dropdown\n" +
                             "3. Select a filter option:\n" +
                             "   • All Users: Shows all conversations\n" +
                             "   • Admins: Shows only conversations with administrators\n" +
                             "   • Teachers: Shows only conversations with teachers\n\n" +
                             "Filter Behavior:\n" +
                             "• Filtering happens in real-time\n" +
                             "• Selected conversation remains open if it matches the filter\n" +
                             "• If selected conversation doesn't match, it switches to the first matching conversation\n\n" +
                             "Use Cases:\n" +
                             "• Quickly find conversations with teachers\n" +
                             "• View only admin-to-admin communications\n" +
                             "• Organize conversations by role\n\n" +
                             "Clearing Filters:\n" +
                             "• Select 'All Users' to show all conversations again"
                },
                new() 
                { 
                    Title = "Searching Conversations", 
                    Content = "Quickly find specific conversations using search:\n\n" +
                             "To Search Conversations:\n" +
                             "1. Navigate to Chat\n" +
                             "2. Type in the search box at the top\n" +
                             "3. Results filter in real-time as you type\n\n" +
                             "Search works across:\n" +
                             "• Contact Names: Search by the person's name\n" +
                             "• Last Message Content: Search within message previews\n\n" +
                             "Search Features:\n" +
                             "• Case-insensitive: 'maria' will find 'Maria'\n" +
                             "• Partial matches: 'rod' will find 'Rodriguez'\n" +
                             "• Real-time filtering: Results update as you type\n\n" +
                             "Combining Search and Filters:\n" +
                             "• You can use search together with user type filters\n" +
                             "• For example: Filter by 'Teachers' and search for 'Maria'\n" +
                             "• This narrows down results to specific conversations\n\n" +
                             "To Clear Search:\n" +
                             "• Delete the text in the search box\n" +
                             "• All conversations will be shown again"
                },
                new() 
                { 
                    Title = "Viewing Contact Information", 
                    Content = "View details about the person you're chatting with:\n\n" +
                             "To View Contact Info:\n" +
                             "1. Open a conversation\n" +
                             "2. Click the contact info button (usually an info icon)\n" +
                             "3. A modal will open showing contact details\n\n" +
                             "Contact Information Displayed:\n" +
                             "• Contact Name: Full name of the person\n" +
                             "• Role: Their role in the system (Admin, Teacher, etc.)\n" +
                             "• Online Status: Whether they're currently online\n" +
                             "• Conversation Details: Information about the conversation\n\n" +
                             "Contact Info Actions:\n" +
                             "• Delete Conversation: Remove the conversation from your list\n" +
                             "• Close: Close the contact info modal\n\n" +
                             "Closing the Modal:\n" +
                             "• Click the 'Close' button\n" +
                             "• Or click outside the modal\n" +
                             "• The conversation remains open"
                },
                new() 
                { 
                    Title = "Understanding Message Status", 
                    Content = "Track the status of your sent messages:\n\n" +
                             "Message Statuses:\n" +
                             "• Sending: Message is being sent to the server\n" +
                             "   - Shows while the message is in transit\n" +
                             "   - Message appears in chat immediately (optimistic update)\n\n" +
                             "• Sent: Message has been successfully delivered\n" +
                             "   - Confirmed by the server\n" +
                             "   - Final status after sending completes\n\n" +
                             "How It Works:\n" +
                             "• When you send a message, it appears immediately in the chat\n" +
                             "• The status shows 'Sending' while the server processes it\n" +
                             "• Once confirmed, the status changes to 'Sent'\n" +
                             "• If sending fails, the message is removed and you can try again\n\n" +
                             "Message Display:\n" +
                             "• Your messages: Right-aligned with accent color\n" +
                             "• Other messages: Left-aligned with card background\n" +
                             "• Timestamps: Show when each message was sent\n\n" +
                             "Note: Messages are saved automatically, so you won't lose conversation history."
                },
                new() 
                { 
                    Title = "Unread Messages", 
                    Content = "Track and manage unread messages in your conversations:\n\n" +
                             "Unread Message Indicators:\n" +
                             "• Unread count badge appears on conversations with new messages\n" +
                             "• Shows the number of unread messages\n" +
                             "• Helps you identify which conversations need attention\n\n" +
                             "How Unread Counts Work:\n" +
                             "• When someone sends you a message, the unread count increases\n" +
                             "• When you open the conversation, messages are marked as read\n" +
                             "• The unread count resets to zero\n\n" +
                             "Marking Messages as Read:\n" +
                             "• Messages are automatically marked as read when you:\n" +
                             "  - Open the conversation\n" +
                             "  - View the messages in the chat\n\n" +
                             "Best Practices:\n" +
                             "• Check conversations with unread messages regularly\n" +
                             "• Respond to messages in a timely manner\n" +
                             "• Use unread counts to prioritize which conversations to check first\n\n" +
                             "Note: Unread counts update in real-time as new messages arrive."
                }
            }
        });

        // 9. Profile & Account
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Profile & Account",
            Description = "Managing your profile information and account settings",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Viewing Profile Information", 
                    Content = "Access and view your profile details:\n\n" +
                             "To view your profile:\n" +
                             "1. Click on your profile in the right sidebar\n" +
                             "2. Select 'Profile' from the dropdown menu\n" +
                             "3. Your profile page will display all your information\n\n" +
                             "Profile Information Displayed:\n" +
                             "• Full Name: Your complete name\n" +
                             "• Email: Your email address (used for login)\n" +
                             "• Phone: Your contact phone number\n" +
                             "• Position: Your job title or position\n" +
                             "• Department: The department you belong to\n" +
                             "• Join Date: When you joined the organization\n" +
                             "• Employee ID: Your unique employee identifier\n" +
                             "• Address: Your residential or work address\n" +
                             "• Profile Photo: Your profile picture (if uploaded)\n\n" +
                             "Profile Display:\n" +
                             "• Information is displayed in a clean, organized layout\n" +
                             "• You can view all details at a glance\n" +
                             "• Some fields may be editable depending on permissions"
                },
                new() 
                { 
                    Title = "Editing Profile Details", 
                    Content = "Update your personal information:\n\n" +
                             "To edit your profile:\n" +
                             "1. Navigate to your Profile page\n" +
                             "2. Click the 'Edit Profile' button\n" +
                             "3. The profile fields will become editable\n" +
                             "4. Modify the information you want to change\n" +
                             "5. Click 'Save' to save your changes\n" +
                             "6. Or click 'Cancel' to discard changes\n\n" +
                             "Editable Fields:\n" +
                             "• Full Name: Update your name if it has changed\n" +
                             "• Phone: Update your contact number\n" +
                             "• Address: Update your address information\n" +
                             "• Other fields may be editable depending on system settings\n\n" +
                             "Note: Some fields like Email, Employee ID, or Join Date may be restricted from editing for security and data integrity reasons.\n\n" +
                             "Saving Changes:\n" +
                             "• Click 'Save' to confirm your changes\n" +
                             "• Changes are saved to your account immediately\n" +
                             "• You'll see a confirmation message when saved successfully\n\n" +
                             "Canceling Edits:\n" +
                             "• Click 'Cancel' to discard any unsaved changes\n" +
                             "• Your profile will revert to the last saved state"
                },
                new() 
                { 
                    Title = "Changing Password", 
                    Content = "Update your account password for security:\n\n" +
                             "To change your password:\n" +
                             "1. Go to your Profile page\n" +
                             "2. Click the 'Change Password' button\n" +
                             "3. You'll be taken to the Change Password page\n" +
                             "4. Enter your current password\n" +
                             "5. Enter your new password\n" +
                             "6. Confirm your new password by entering it again\n" +
                             "7. Click 'Change Password' to save\n\n" +
                             "Password Requirements:\n" +
                             "• New password must be at least 8 characters long\n" +
                             "• Use a combination of letters, numbers, and symbols for better security\n" +
                             "• Avoid using easily guessable passwords\n\n" +
                             "Validation:\n" +
                             "• Current password is required to verify your identity\n" +
                             "• New password and confirm password must match\n" +
                             "• System will validate password strength\n\n" +
                             "After Changing Password:\n" +
                             "• Your password is updated immediately\n" +
                             "• You'll need to use the new password for future logins\n" +
                             "• You'll see a success message confirming the change\n\n" +
                             "Security Tips:\n" +
                             "• Change your password regularly\n" +
                             "• Don't share your password with anyone\n" +
                             "• Use a unique password that you don't use elsewhere"
                },
                new() 
                { 
                    Title = "Uploading Profile Photo", 
                    Content = "Add or update your profile picture:\n\n" +
                             "To upload a profile photo:\n" +
                             "1. Navigate to your Profile page\n" +
                             "2. Find the profile photo section\n" +
                             "3. Click the 'Upload Photo' button or the photo area\n" +
                             "4. Select an image file from your computer\n" +
                             "5. The photo will be uploaded and displayed\n\n" +
                             "Photo Requirements:\n" +
                             "• Supported formats: JPG, PNG, GIF\n" +
                             "• Recommended size: Square images work best\n" +
                             "• File size: Keep images under 5MB for faster upload\n" +
                             "• Image quality: Use clear, well-lit photos\n\n" +
                             "Photo Display:\n" +
                             "• Your photo appears in your profile\n" +
                             "• It may also appear in chat conversations and other areas\n" +
                             "• The photo is automatically resized to fit the display\n\n" +
                             "Replacing Your Photo:\n" +
                             "• Click 'Upload Photo' again to replace your current photo\n" +
                             "• The new photo will replace the old one\n\n" +
                             "Removing Your Photo:\n" +
                             "• Contact support if you need to remove your profile photo\n" +
                             "• Or upload a new photo to replace it"
                },
                new() 
                { 
                    Title = "Accessing Profile from Dropdown", 
                    Content = "Quick access to your profile through the dropdown menu:\n\n" +
                             "To access your profile:\n" +
                             "1. Look at the right sidebar\n" +
                             "2. Click on your profile picture or name\n" +
                             "3. A dropdown menu will appear\n" +
                             "4. Select 'Profile' from the menu\n\n" +
                             "Profile Dropdown Options:\n" +
                             "• Profile: View and edit your profile information\n" +
                             "• Settings: Access system settings (if available)\n" +
                             "• Notifications: View your notifications\n" +
                             "• Help Guide: Access this help documentation\n" +
                             "• Dark Mode: Toggle between light and dark theme\n" +
                             "• Logout: Sign out of your account\n\n" +
                             "Quick Information:\n" +
                             "• Your email address is displayed in the dropdown\n" +
                             "• This helps you confirm which account you're logged into\n\n" +
                             "Navigation:\n" +
                             "• Selecting 'Profile' takes you directly to your profile page\n" +
                             "• You can return to other pages using the sidebar navigation"
                }
            }
        });

        // 10. Settings & Preferences
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Settings & Preferences",
            Description = "Configuring system settings and user preferences",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Accessing Settings", 
                    Content = "Access the Settings page to configure system preferences:\n\n" +
                             "To open Settings:\n" +
                             "1. Click on your profile in the right sidebar\n" +
                             "2. Select 'Settings' from the dropdown menu\n" +
                             "3. The Settings page will open\n\n" +
                             "Settings Categories:\n" +
                             "• School Information: Basic school details and academic period\n" +
                             "• Display Preferences: How information is displayed\n" +
                             "• Notifications & Alerts: Email and notification settings\n" +
                             "• Data Management: Auto-save and confirmation preferences\n" +
                             "• Security & Access: Security and session settings\n" +
                             "• Reports & Export: Report generation and export options\n\n" +
                             "Saving Settings:\n" +
                             "• Click 'Save Settings' to apply your changes\n" +
                             "• Settings are saved immediately\n" +
                             "• Some settings may require a page refresh to take effect"
                },
                new() 
                { 
                    Title = "School Information Settings", 
                    Content = "Configure basic school information and academic period:\n\n" +
                             "School Information Options:\n" +
                             "• School Name: The name of your school\n" +
                             "   - Default: 'Southville 8B National High School'\n" +
                             "   - Used in reports and documents\n\n" +
                             "• Current School Year: The active academic year\n" +
                             "   - Options: 2023-2024, 2024-2025, 2025-2026\n" +
                             "   - Affects schedules and academic records\n\n" +
                             "• Current Semester: The active semester\n" +
                             "   - Options: 1st, 2nd\n" +
                             "   - Used for filtering and organizing data\n\n" +
                             "• School Theme: Color theme for the school\n" +
                             "   - Options: Blue, Green, Red, Purple\n" +
                             "   - May affect report colors and branding\n\n" +
                             "To Update:\n" +
                             "1. Go to Settings\n" +
                             "2. Find the 'School Information' section\n" +
                             "3. Update the fields as needed\n" +
                             "4. Click 'Save Settings'"
                },
                new() 
                { 
                    Title = "Display Preferences", 
                    Content = "Customize how information is displayed in the application:\n\n" +
                             "Display Options:\n" +
                             "• Students Per Page: Number of students shown per page\n" +
                             "   - Options: 10, 25, 50, 100\n" +
                             "   - Default: 25\n" +
                             "   - Affects pagination in user management\n\n" +
                             "• Show Student Photos: Display student profile photos\n" +
                             "   - Toggle on/off\n" +
                             "   - When off, photos are hidden for privacy\n\n" +
                             "• Show Detailed Info: Display detailed information in lists\n" +
                             "   - Toggle on/off\n" +
                             "   - When off, shows only essential information\n\n" +
                             "• Date Format: How dates are displayed\n" +
                             "   - Options: MM/dd/yyyy, dd/MM/yyyy, yyyy-MM-dd\n" +
                             "   - Default: MM/dd/yyyy\n" +
                             "   - Affects all date displays throughout the app\n\n" +
                             "To Change:\n" +
                             "1. Navigate to Settings\n" +
                             "2. Find 'Display Preferences' section\n" +
                             "3. Adjust the settings\n" +
                             "4. Save your changes"
                },
                new() 
                { 
                    Title = "Notifications & Alerts Settings", 
                    Content = "Configure email notifications and alert preferences:\n\n" +
                             "Email Notifications:\n" +
                             "• Email New Students: Receive email when new students are added\n" +
                             "   - Toggle on/off\n" +
                             "   - Helps track new enrollments\n\n" +
                             "• Email Grade Submissions: Receive email when grades are submitted\n" +
                             "   - Toggle on/off\n" +
                             "   - Keeps you informed of academic updates\n\n" +
                             "Alert Preferences:\n" +
                             "• Show Popup Alerts: Display popup notifications\n" +
                             "   - Toggle on/off\n" +
                             "   - When off, alerts appear only in notification center\n\n" +
                             "• Notification Sound: Play sound for notifications\n" +
                             "   - Toggle on/off\n" +
                             "   - Audio alerts for important notifications\n\n" +
                             "Best Practices:\n" +
                             "• Enable email notifications for critical events\n" +
                             "• Use popup alerts for urgent information\n" +
                             "• Adjust sound settings based on your work environment"
                },
                new() 
                { 
                    Title = "Data Management Settings", 
                    Content = "Configure how data is saved and managed:\n\n" +
                             "Auto-Save Options:\n" +
                             "• Auto Save Records: Automatically save changes\n" +
                             "   - Toggle on/off\n" +
                             "   - When on, changes are saved without clicking Save\n" +
                             "   - Prevents data loss\n\n" +
                             "Confirmation Settings:\n" +
                             "• Confirm Delete Students: Show confirmation before deleting students\n" +
                             "   - Toggle on/off\n" +
                             "   - Prevents accidental deletions\n\n" +
                             "• Confirm Delete Teachers: Show confirmation before deleting teachers\n" +
                             "   - Toggle on/off\n" +
                             "   - Safety measure for important data\n\n" +
                             "• Show Confirmation Messages: Display success/error messages\n" +
                             "   - Toggle on/off\n     " +
                             "   - Provides feedback on actions\n\n" +
                             "Navigation:\n" +
                             "• Remember Last Page: Return to last visited page on login\n" +
                             "   - Toggle on/off\n" +
                             "   - Convenience feature for frequent users\n\n" +
                             "Recommendation: Keep confirmation dialogs enabled to prevent accidental data loss."
                },
                new() 
                { 
                    Title = "Security & Access Settings", 
                    Content = "Configure security and session management:\n\n" +
                             "Session Management:\n" +
                             "• Session Timeout Minutes: Auto-logout after inactivity\n" +
                             "   - Default: 30 minutes\n" +
                             "   - Range: Adjustable (recommended: 15-60 minutes)\n" +
                             "   - Security feature to prevent unauthorized access\n\n" +
                             "Security Features:\n" +
                             "• Require Password for Sensitive Actions: Extra verification\n" +
                             "   - Toggle on/off\n" +
                             "   - When on, requires password for critical operations\n" +
                             "   - Examples: Deleting users, changing system settings\n\n" +
                             "• Log User Activities: Track user actions\n" +
                             "   - Toggle on/off\n" +
                             "   - Creates audit trail for security\n" +
                             "   - Helps identify unauthorized access\n\n" +
                             "Data Protection:\n" +
                             "• Auto Backup Data: Automatically backup system data\n" +
                             "   - Toggle on/off\n" +
                             "   - Prevents data loss\n" +
                             "   - Recommended: Keep enabled\n\n" +
                             "Security Tips:\n" +
                             "• Set appropriate session timeout (not too short, not too long)\n" +
                             "• Enable password requirements for sensitive actions\n" +
                             "• Keep activity logging enabled for audit purposes"
                },
                new() 
                { 
                    Title = "Reports & Export Settings", 
                    Content = "Configure report generation and data export options:\n\n" +
                             "Report Format:\n" +
                             "• Default Report Format: Format for generated reports\n" +
                             "   - Options: PDF, Excel, Word\n" +
                             "   - Default: PDF\n" +
                             "   - Used when generating reports\n\n" +
                             "Report Appearance:\n" +
                             "• Include School Logo in Reports: Add logo to reports\n" +
                             "   - Toggle on/off\n" +
                             "   - Professional appearance for official documents\n\n" +
                             "• Auto Generate Monthly Reports: Create reports automatically\n" +
                             "   - Toggle on/off\n" +
                             "   - When on, generates reports at month end\n" +
                             "   - Saves time on routine reporting\n\n" +
                             "Export Settings:\n" +
                             "• Export Data Location: Where exported files are saved\n" +
                             "   - Options: Documents, Desktop, Downloads\n" +
                             "   - Default: Documents\n" +
                             "   - Choose based on your file organization preference\n\n" +
                             "Usage:\n" +
                             "• PDF format is best for sharing and printing\n" +
                             "• Excel format is best for data analysis\n" +
                             "• Word format is best for editable documents"
                },
                new() 
                { 
                    Title = "Dark Mode Toggle", 
                    Content = "Switch between light and dark themes:\n\n" +
                             "To Toggle Dark Mode:\n" +
                             "1. Click on your profile in the right sidebar\n" +
                             "2. Select 'Dark Mode' from the dropdown menu\n" +
                             "3. The theme switches immediately\n\n" +
                             "Theme Options:\n" +
                             "• Light Mode: Traditional light background\n" +
                             "   - Easier on eyes in bright environments\n" +
                             "   - Default theme\n\n" +
                             "• Dark Mode: Dark background with light text\n" +
                             "   - Easier on eyes in low-light environments\n" +
                             "   - Reduces eye strain during extended use\n" +
                             "   - Saves battery on OLED displays\n\n" +
                             "Theme Persistence:\n" +
                             "• Your theme preference is saved automatically\n" +
                             "• Theme persists across sessions\n" +
                             "• Applies to all pages in the application\n\n" +
                             "Quick Access:\n" +
                             "• Dark Mode toggle is always available in the profile dropdown\n" +
                             "• No need to go to Settings page\n" +
                             "• Instant theme switching"
                },
                new() 
                { 
                    Title = "Resetting Settings to Defaults", 
                    Content = "Restore all settings to their default values:\n\n" +
                             "To Reset Settings:\n" +
                             "1. Go to Settings\n" +
                             "2. Find the 'Reset to Defaults' button\n" +
                             "3. Click to reset all settings\n" +
                             "4. Confirm if prompted\n\n" +
                             "What Gets Reset:\n" +
                             "• All settings return to default values\n" +
                             "• School Information: Default school name and year\n" +
                             "• Display Preferences: Default pagination and format\n" +
                             "• Notifications: All enabled by default\n" +
                             "• Security: Default timeout and security settings\n" +
                             "• Reports: Default format and export location\n\n" +
                             "Warning:\n" +
                             "• This action cannot be undone\n" +
                             "• All your custom settings will be lost\n" +
                             "• Make sure you want to reset before confirming\n\n" +
                             "Alternative:\n" +
                             "• Instead of resetting all, you can manually change individual settings\n" +
                             "• This gives you more control over what changes"
                },
                new() 
                { 
                    Title = "Exporting and Importing Settings", 
                    Content = "Backup and restore your settings configuration:\n\n" +
                             "Exporting Settings:\n" +
                             "• Export your current settings to a file\n" +
                             "• Useful for:\n" +
                             "  - Backing up your configuration\n" +
                             "  - Sharing settings with other admins\n" +
                             "  - Restoring settings after reset\n\n" +
                             "To Export:\n" +
                             "1. Go to Settings\n" +
                             "2. Click 'Export Settings'\n" +
                             "3. Choose a location to save the file\n" +
                             "4. Settings are saved as a configuration file\n\n" +
                             "Importing Settings:\n" +
                             "• Load settings from a previously exported file\n" +
                             "• Useful for:\n" +
                             "  - Restoring backed-up settings\n" +
                             "  - Applying settings from another admin\n" +
                             "  - Quick configuration setup\n\n" +
                             "To Import:\n" +
                             "1. Go to Settings\n" +
                             "2. Click 'Import Settings'\n" +
                             "3. Select the settings file\n" +
                             "4. Settings are loaded and applied\n\n" +
                             "Note: Importing settings will replace your current settings. Make sure to export your current settings first if you want to keep them."
                }
            }
        });

        // 11. Notifications
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "Notifications",
            Description = "Viewing and managing your notifications",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Viewing Notifications", 
                    Content = "Access and view all your notifications:\n\n" +
                             "To view notifications:\n" +
                             "1. Click on your profile in the right sidebar\n" +
                             "2. Select 'Notifications' from the dropdown menu\n" +
                             "3. The Notifications page will open\n\n" +
                             "Notification Display:\n" +
                             "• All notifications are listed in chronological order\n" +
                             "• Each notification shows:\n" +
                             "  - Title: Brief summary of the notification\n" +
                             "  - Message: Detailed information\n" +
                             "  - Type: Category of notification (System, User, Warning, Info, Error)\n" +
                             "  - Timestamp: When the notification was created\n" +
                             "  - Time Ago: Relative time (e.g., '2 hours ago')\n" +
                             "  - Read Status: Whether you've viewed it\n\n" +
                             "Unread Count:\n" +
                             "• The page displays the number of unread notifications\n" +
                             "• Unread notifications are highlighted\n" +
                             "• Helps you identify which notifications need attention"
                },
                new() 
                { 
                    Title = "Understanding Notification Types", 
                    Content = "Notifications are categorized by type for easy identification:\n\n" +
                             "Notification Types:\n" +
                             "• System: System-related notifications\n" +
                             "   - Examples: Maintenance schedules, system updates\n" +
                             "   - Usually informational\n\n" +
                             "• User: User-related notifications\n" +
                             "   - Examples: New user registrations, user activity\n" +
                             "   - Tracks user-related events\n\n" +
                             "• Warning: Warning notifications\n" +
                             "   - Examples: Storage usage alerts, capacity warnings\n" +
                             "   - Requires attention but not urgent\n\n" +
                             "• Info: General information\n" +
                             "   - Examples: General announcements, updates\n" +
                             "   - Informational only\n\n" +
                             "• Error: Error notifications\n" +
                             "   - Examples: System errors, failed operations\n" +
                             "   - Requires immediate attention\n\n" +
                             "Type Indicators:\n" +
                             "• Each type may have a different color or icon\n" +
                             "• Helps you quickly identify notification importance\n" +
                             "• Use types to filter and prioritize notifications"
                },
                new() 
                { 
                    Title = "Marking Notifications as Read", 
                    Content = "Mark notifications as read to track what you've reviewed:\n\n" +
                             "To Mark Individual Notification as Read:\n" +
                             "1. Go to Notifications page\n" +
                             "2. Find the notification you want to mark\n" +
                             "3. Click on the notification or the 'Mark as Read' button\n" +
                             "4. The notification will be marked as read\n\n" +
                             "To Mark All as Read:\n" +
                             "1. Go to Notifications page\n" +
                             "2. Click the 'Mark All as Read' button\n" +
                             "3. All notifications will be marked as read\n" +
                             "4. Unread count will reset to zero\n\n" +
                             "Read Status:\n" +
                             "• Read notifications appear with different styling\n" +
                             "• Unread notifications are highlighted\n" +
                             "• Unread count decreases when you mark notifications as read\n\n" +
                             "Benefits:\n" +
                             "• Helps you track which notifications you've reviewed\n" +
                             "• Reduces clutter by distinguishing read from unread\n" +
                             "• Makes it easier to find new notifications"
                },
                new() 
                { 
                    Title = "Deleting Notifications", 
                    Content = "Remove notifications you no longer need:\n\n" +
                             "To Delete a Single Notification:\n" +
                             "1. Go to Notifications page\n" +
                             "2. Find the notification you want to delete\n" +
                             "3. Click the 'Delete' button on the notification\n" +
                             "4. The notification will be removed\n\n" +
                             "Deletion Behavior:\n" +
                             "• Deleting an unread notification reduces the unread count\n" +
                             "• Notification is permanently removed from the list\n" +
                             "• Cannot be recovered after deletion\n\n" +
                             "When to Delete:\n" +
                             "• Notifications you've already addressed\n" +
                             "• Old notifications no longer relevant\n" +
                             "• Notifications you don't need to keep\n\n" +
                             "Note: Consider marking as read instead of deleting if you might need to reference the information later."
                },
                new() 
                { 
                    Title = "Clearing All Notifications", 
                    Content = "Remove all notifications at once:\n\n" +
                             "To Clear All Notifications:\n" +
                             "1. Go to Notifications page\n" +
                             "2. Click the 'Clear All' button\n" +
                             "3. Confirm if prompted\n" +
                             "4. All notifications will be removed\n\n" +
                             "What Gets Cleared:\n" +
                             "• All notifications are removed\n" +
                             "• Both read and unread notifications are cleared\n" +
                             "• Unread count resets to zero\n\n" +
                             "Warning:\n" +
                             "• This action cannot be undone\n" +
                             "• All notification history will be lost\n" +
                             "• Make sure you don't need any notifications before clearing\n\n" +
                             "Use Cases:\n" +
                             "• Starting fresh with a clean notification list\n" +
                             "• Removing all old notifications at once\n" +
                             "• Clearing notifications after reviewing everything\n\n" +
                             "Alternative:\n" +
                             "• Instead of clearing all, you can:\n" +
                             "  - Mark all as read (keeps notifications but marks them)\n" +
                             "  - Delete individual notifications (more selective)"
                },
                new() 
                { 
                    Title = "Understanding Notification Timestamps", 
                    Content = "Notifications display when they were created:\n\n" +
                             "Timestamp Display:\n" +
                             "• Absolute Time: Exact date and time of creation\n" +
                             "   - Shows full timestamp (e.g., 'January 15, 2024 2:30 PM')\n" +
                             "   - Precise time information\n\n" +
                             "• Time Ago: Relative time display\n" +
                             "   - Shows how long ago the notification was created\n" +
                             "   - Formats:\n" +
                             "     * 'X minutes ago' (for less than 1 hour)\n" +
                             "     * 'X hours ago' (for less than 24 hours)\n" +
                             "     * 'X days ago' (for 24+ hours)\n\n" +
                             "Examples:\n" +
                             "• '5 minutes ago' - Notification created 5 minutes ago\n" +
                             "• '2 hours ago' - Notification created 2 hours ago\n" +
                             "• '3 days ago' - Notification created 3 days ago\n\n" +
                             "Benefits:\n" +
                             "• Quick understanding of notification recency\n" +
                             "• Easy to identify new vs old notifications\n" +
                             "• Helps prioritize which notifications to check first"
                },
                new() 
                { 
                    Title = "Notification Preferences", 
                    Content = "Configure how you receive and view notifications:\n\n" +
                             "Notification Settings:\n" +
                             "• Access notification preferences through Settings\n" +
                             "• Configure email notifications (see Settings & Preferences)\n" +
                             "• Set popup alert preferences\n" +
                             "• Configure notification sounds\n\n" +
                             "Settings Related to Notifications:\n" +
                             "• Email New Students: Receive email for new registrations\n" +
                             "• Email Grade Submissions: Receive email for grade updates\n" +
                             "• Show Popup Alerts: Display popup notifications\n" +
                             "• Notification Sound: Play sound for notifications\n\n" +
                             "To Configure:\n" +
                             "1. Go to Settings (from profile dropdown)\n" +
                             "2. Find 'Notifications & Alerts' section\n" +
                             "3. Adjust your preferences\n" +
                             "4. Save settings\n\n" +
                             "Best Practices:\n" +
                             "• Enable email for critical notifications\n" +
                             "• Use popup alerts for urgent information\n" +
                             "• Adjust sound settings based on your environment\n" +
                             "• Review notification settings periodically"
                }
            }
        });

        // 12. System Features
        _allCategories.Add(new HelpCategoryViewModel
        {
            Title = "System Features",
            Description = "General system features and navigation",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() 
                { 
                    Title = "Sidebar Management", 
                    Content = "Control the visibility of left and right sidebars:\n\n" +
                             "Left Sidebar:\n" +
                             "• Contains main navigation menu\n" +
                             "• Shows all available features and pages\n" +
                             "• Can be toggled on/off for more screen space\n\n" +
                             "Right Sidebar:\n" +
                             "• Displays your profile information\n" +
                             "• Shows current page statistics\n" +
                             "• Contains upcoming events calendar\n" +
                             "• Can be toggled on/off\n\n" +
                             "To Toggle Sidebars:\n" +
                             "1. Look for chevron buttons at the top of the screen\n" +
                             "2. Click the left chevron to toggle left sidebar\n" +
                             "3. Click the right chevron to toggle right sidebar\n" +
                             "4. Sidebars slide in/out smoothly\n\n" +
                             "Benefits:\n" +
                             "• More screen space when sidebars are hidden\n" +
                             "• Quick access when sidebars are visible\n" +
                             "• Customize your workspace layout\n\n" +
                             "Tip: Hide sidebars when working on detailed tasks that need more screen space."
                },
                new() 
                { 
                    Title = "Navigation Overview", 
                    Content = "Navigate through the application using various methods:\n\n" +
                             "Main Navigation Methods:\n" +
                             "• Left Sidebar: Primary navigation menu\n" +
                             "   - Click any menu item to navigate\n" +
                             "   - Active page is highlighted\n" +
                             "   - Organized by feature categories\n\n" +
                             "• Profile Dropdown: Quick access to profile features\n" +
                             "   - Profile, Settings, Notifications, Help Guide\n" +
                             "   - Dark Mode toggle\n" +
                             "   - Logout option\n\n" +
                             "• Dashboard Quick Actions: Direct links from dashboard\n" +
                             "   - Quick access to frequently used features\n" +
                             "   - Saves navigation time\n\n" +
                             "Navigation Features:\n" +
                             "• Breadcrumbs: Shows your current location (if available)\n" +
                             "• Back Button: Return to previous page (if available)\n" +
                             "• Page Titles: Clear indication of current page\n\n" +
                             "Best Practices:\n" +
                             "• Use sidebar for main navigation\n" +
                             "• Use profile dropdown for account-related actions\n" +
                             "• Use quick actions for common tasks"
                },
                new() 
                { 
                    Title = "Logging Out", 
                    Content = "Sign out of your account securely:\n\n" +
                             "To Log Out:\n" +
                             "1. Click on your profile in the right sidebar\n" +
                             "2. Select 'Logout' from the dropdown menu\n" +
                             "3. You will be signed out and returned to the login screen\n\n" +
                             "What Happens When You Log Out:\n" +
                             "• Your session is ended\n" +
                             "• You are redirected to the login page\n" +
                             "• Your authentication token is cleared\n" +
                             "• Any unsaved work should be saved before logging out\n\n" +
                             "Session Management:\n" +
                             "• If 'Keep me signed in' was checked, you may stay logged in\n" +
                             "• Session timeout settings may auto-logout after inactivity\n" +
                             "• Always log out when using a shared computer\n\n" +
                             "Security Tips:\n" +
                             "• Always log out when finished, especially on shared devices\n" +
                             "• Don't leave your session open unattended\n" +
                             "• Log out before closing the application on public computers"
                },
                new() 
                { 
                    Title = "Understanding the Interface Layout", 
                    Content = "Familiarize yourself with the application layout:\n\n" +
                             "Main Layout Components:\n" +
                             "• Top Bar: Contains sidebar toggle buttons and page information\n" +
                             "• Left Sidebar: Main navigation menu\n" +
                             "• Center Content: Main working area showing current page\n" +
                             "• Right Sidebar: Profile, statistics, and events\n\n" +
                             "Content Area:\n" +
                             "• Displays the current page or feature\n" +
                             "• Scrollable for long content\n" +
                             "• Responsive to window size\n\n" +
                             "Sidebar Information:\n" +
                             "• Left: Navigation menu with all features\n" +
                             "• Right: User profile, current page info, upcoming events\n\n" +
                             "Layout Customization:\n" +
                             "• Toggle sidebars to customize workspace\n" +
                             "• Resize window to adjust layout\n" +
                             "• Layout adapts to screen size\n\n" +
                             "Tips:\n" +
                             "• Hide sidebars for more content space\n" +
                             "• Keep sidebars visible for quick navigation\n" +
                             "• Use full screen for detailed work"
                },
                new() 
                { 
                    Title = "Search Functionality", 
                    Content = "Use search to quickly find information across features:\n\n" +
                             "Where Search is Available:\n" +
                             "• User Management: Search users by name, email, ID\n" +
                             "• Building Management: Search buildings, floors, rooms\n" +
                             "• Class Schedules: Search by subject, teacher, section\n" +
                             "• Events Dashboard: Search events by title, description\n" +
                             "• Chat: Search conversations by contact name\n" +
                             "• Help Guide: Search help articles\n\n" +
                             "How Search Works:\n" +
                             "• Type in the search box\n" +
                             "• Results filter in real-time as you type\n" +
                             "• Search is case-insensitive\n" +
                             "• Partial matches are supported\n\n" +
                             "Search Tips:\n" +
                             "• Use specific keywords for better results\n" +
                             "• Combine search with filters for precise results\n" +
                             "• Clear search to show all items again\n\n" +
                             "Best Practices:\n" +
                             "• Use search when you know what you're looking for\n" +
                             "• Use filters when you want to narrow down a category\n" +
                             "• Combine both for the most precise results"
                },
                new() 
                { 
                    Title = "Refresh and Reload Data", 
                    Content = "Refresh pages to get the latest data:\n\n" +
                             "Refresh Buttons:\n" +
                             "• Many pages have a 'Refresh' button\n" +
                             "• Usually located in the top-right area\n" +
                             "• Reloads data from the server\n\n" +
                             "When to Refresh:\n" +
                             "• After data has been updated by other users\n" +
                             "• If you suspect data is outdated\n" +
                             "• To ensure you're viewing the latest information\n" +
                             "• After making changes that should update the view\n\n" +
                             "Refresh Behavior:\n" +
                             "• Fetches latest data from the server\n" +
                             "• Updates the current view\n" +
                             "• Preserves current filters and search terms\n" +
                             "• May show a loading indicator while refreshing\n\n" +
                             "Pages with Refresh:\n" +
                             "• Dashboard: Refresh metrics and statistics\n" +
                             "• User Management: Reload user list\n" +
                             "• Class Schedules: Get latest schedules\n" +
                             "• Events Dashboard: Update events list\n" +
                             "• Chat: Refresh conversations\n\n" +
                             "Tip: Use refresh regularly to ensure you're working with current data."
                },
                new() 
                { 
                    Title = "Keyboard Shortcuts", 
                    Content = "Use keyboard shortcuts for faster navigation (if available):\n\n" +
                             "Common Shortcuts:\n" +
                             "• Navigation: Use Tab to move between fields\n" +
                             "• Enter: Submit forms or send messages\n" +
                             "• Escape: Close dialogs or cancel actions\n\n" +
                             "Form Navigation:\n" +
                             "• Tab: Move to next field\n" +
                             "• Shift+Tab: Move to previous field\n" +
                             "• Enter: Submit form (when in appropriate field)\n\n" +
                             "Dialog Actions:\n" +
                             "• Escape: Close dialog or cancel\n" +
                             "• Enter: Confirm action (when appropriate)\n\n" +
                             "Note: Specific keyboard shortcuts may vary by page and feature. Check individual feature help articles for page-specific shortcuts.\n\n" +
                             "Best Practices:\n" +
                             "• Learn shortcuts for frequently used actions\n" +
                             "• Use keyboard navigation for faster form filling\n" +
                             "• Combine mouse and keyboard for efficiency"
                },
                new() 
                { 
                    Title = "Getting Help", 
                    Content = "Access help and support resources:\n\n" +
                             "Help Guide:\n" +
                             "• Access comprehensive help documentation\n" +
                             "• Step-by-step instructions for all features\n" +
                             "• Searchable help articles\n\n" +
                             "To Access Help Guide:\n" +
                             "1. Click on your profile in the right sidebar\n" +
                             "2. Select 'Help Guide' from the dropdown menu\n" +
                             "3. Browse categories or search for specific topics\n\n" +
                             "Help Guide Features:\n" +
                             "• Organized by feature categories\n" +
                             "• Detailed articles for each feature\n" +
                             "• Search functionality to find specific topics\n" +
                             "• Contact Support option (if available)\n\n" +
                             "Using the Help Guide:\n" +
                             "• Browse categories to explore features\n" +
                             "• Click on articles to read detailed instructions\n" +
                             "• Use search to find specific topics quickly\n" +
                             "• Use the search box to filter articles\n\n" +
                             "Additional Support:\n" +
                             "• Contact Support button in Help Guide (if available)\n" +
                             "• Check system notifications for important updates\n" +
                             "• Review Settings for configuration help"
                }
            }
        });

        HelpCategories = new ObservableCollection<HelpCategoryViewModel>(_allCategories);
    }

    [RelayCommand]
    private void SearchHelp()
    {
        ApplySearch();
    }

    [RelayCommand]
    private void SelectCategory(HelpCategoryViewModel category)
    {
        SelectedCategory = category;
    }

    [RelayCommand]
    private void ContactSupport()
    {
        // TODO: Implement contact support functionality
        // This could open an email client, show a contact form, or navigate to a support page
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