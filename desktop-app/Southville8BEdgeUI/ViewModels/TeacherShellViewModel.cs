using Avalonia.Controls;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.ViewModels.Teacher;
using System;
using System.Collections.ObjectModel;
using System.Windows.Input;
using Avalonia;
using Avalonia.Styling;

namespace Southville8BEdgeUI.ViewModels;

public partial class TeacherShellViewModel : ViewModelBase
{
    [ObservableProperty]
    private ViewModelBase _currentContent;

    [ObservableProperty]
    private string _currentPage = "Dashboard";

    // Sidebar visibility properties
    [ObservableProperty]
    private bool _isLeftSidebarVisible = true;

    [ObservableProperty]
    private bool _isRightSidebarVisible = true;

    // Properties for the right sidebar - User Profile
    [ObservableProperty] private string _userName = "St. Yummy";
    [ObservableProperty] private string _userRole = "Senior Math Teacher";
    [ObservableProperty] private string _userInitials = "SY";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");

    // Profile dropdown state/content (manual properties to avoid source generator dependency in tooling)
    private bool _isUserDropdownVisible;
    public bool IsUserDropdownVisible
    {
        get => _isUserDropdownVisible;
        set => SetProperty(ref _isUserDropdownVisible, value);
    }

    private string _userEmail = "st.yummy@nhis.edu";
    public string UserEmail
    {
        get => _userEmail;
        set => SetProperty(ref _userEmail, value);
    }

    private bool _isDarkMode;
    public bool IsDarkMode
    {
        get => _isDarkMode;
        set => SetProperty(ref _isDarkMode, value);
    }

    // Statistics Cards Data
    [ObservableProperty] private int _totalClasses = 6;
    [ObservableProperty] private int _pendingAssignments = 24;
    [ObservableProperty] private int _totalStudents = 180;
    [ObservableProperty] private int _unreadMessages = 12;

    // Today's Schedule
    [ObservableProperty] private string _currentMonth = DateTime.Now.ToString("MMMM yyyy");
    [ObservableProperty] private string _todayDate = DateTime.Now.Day.ToString();
    [ObservableProperty] private string _nextClassSubject = "Science - Grade 8-B";
    [ObservableProperty] private string _nextClassTime = "10:00 AM - 11:30 AM";

    // Today's Current Class
    [ObservableProperty] private string _currentClassSubject = "Mathematics";
    [ObservableProperty] private string _currentClassGrade = "Grade 8-A Mathematics";
    [ObservableProperty] private string _currentClassTime = "08:00 AM - 09:30 AM";
    [ObservableProperty] private string _currentClassRoom = "Room 101";

    // Recent Activities Collection
    [ObservableProperty] private ObservableCollection<TeacherActivityItem> _recentActivities = new();

    // Calendar Days Collection for the mini calendar
    [ObservableProperty] private ObservableCollection<CalendarDayItem> _calendarDays = new();

    // Grid column properties for flexible layout
    [ObservableProperty] private GridLength _leftColumnWidth = new(260);
    [ObservableProperty] private GridLength _rightColumnWidth = new(260);

    // Computed properties for sidebar button visibility
    public bool ShowLeftSidebarToggle => !IsLeftSidebarVisible;
    public bool ShowRightSidebarToggle => !IsRightSidebarVisible;

    public TeacherShellViewModel()
    {
        // Set the default page to the dashboard
        _currentContent = CreateDashboardViewModel();
        InitializeRecentActivities();
        InitializeCalendarDays();
        UpdateColumnWidths();

        // Initialize based on current theme (system/default)
        IsDarkMode = Application.Current?.ActualThemeVariant == ThemeVariant.Dark;

        // Update time every minute
        StartTimeUpdater();
    }

    private void StartTimeUpdater()
    {
        // In a real application, you'd use a timer to update time
        // For now, we'll just set it once
        CurrentTime = DateTime.Now.ToString("hh:mm tt");
        CurrentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    }

    private void InitializeRecentActivities()
    {
        RecentActivities = new ObservableCollection<TeacherActivityItem>
        {
            new()
            {
                StudentName = "John Smith",
                StudentInitials = "JS",
                Activity = "Submitted Assignment #3",
                TimeAgo = "1hr ago"
            },
            new()
            {
                StudentName = "Maria Garcia",
                StudentInitials = "MG",
                Activity = "Asked question in Math class",
                TimeAgo = "2hrs ago"
            },
            new()
            {
                StudentName = "Anna Lee",
                StudentInitials = "AL",
                Activity = "Completed quiz successfully",
                TimeAgo = "3hrs ago"
            }
        };
    }

    private void InitializeCalendarDays()
    {
        CalendarDays = new ObservableCollection<CalendarDayItem>
        {
            new() { Day = "16", IsToday = false },
            new() { Day = "17", IsToday = false },
            new() { Day = "18", IsToday = false },
            new() { Day = "19", IsToday = true },
            new() { Day = "20", IsToday = false },
            new() { Day = "21", IsToday = false },
            new() { Day = "22", IsToday = false }
        };
    }

    private TeacherDashboardViewModel CreateDashboardViewModel()
    {
        return new TeacherDashboardViewModel
        {
            NavigateToSchedulePlannerCommand = NavigateToSchedulePlannerCommand,
            NavigateToGradeEntryCommand = NavigateToGradeEntryCommand,
            NavigateToStudentManagementCommand = NavigateToStudentManagementCommand,
            NavigateToMyAnnouncementsCommand = NavigateToMyAnnouncementsCommand,
            NavigateToMessagingCommand = NavigateToMessagingCommand
        };
    }

    private void UpdateColumnWidths()
    {
        LeftColumnWidth = IsLeftSidebarVisible ? new GridLength(260) : new GridLength(0);
        RightColumnWidth = IsRightSidebarVisible ? new GridLength(260) : new GridLength(0);
    }

    // Sidebar toggle commands
    [RelayCommand]
    private void ToggleLeftSidebar()
    {
        IsLeftSidebarVisible = !IsLeftSidebarVisible;
        UpdateColumnWidths();
    }

    [RelayCommand]
    private void ToggleRightSidebar()
    {
        IsRightSidebarVisible = !IsRightSidebarVisible;
        UpdateColumnWidths();
    }

    // Profile dropdown commands
    [RelayCommand]
    private void ToggleUserDropdown()
    {
        IsUserDropdownVisible = !IsUserDropdownVisible;
    }

    [RelayCommand]
    private void CloseUserDropdown()
    {
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private void NavigateToProfile()
    {
        CurrentContent = new ProfileViewModel();
        CurrentPage = "Profile";
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private void NavigateToSettings()
    {
        CurrentContent = new SettingsViewModel();
        CurrentPage = "Settings";
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private void NavigateToNotifications()
    {
        CurrentContent = new NotificationsViewModel();
        CurrentPage = "Notifications";
        IsUserDropdownVisible = false;
    }

    // Logout command
    [RelayCommand]
    private void Logout()
    {
        // TODO: Implement logout logic - clear user session, navigate to login page
        IsUserDropdownVisible = false;
    }

    // Calendar navigation commands
    [RelayCommand]
    private void NavigatePreviousMonth()
    {
        // TODO: Implement previous month navigation
    }

    [RelayCommand]
    private void NavigateNextMonth()
    {
        // TODO: Implement next month navigation
    }

    [RelayCommand]
    private void ViewFullSchedule()
    {
        NavigateToSchedulePlanner();
    }

    // Navigation commands
    [RelayCommand]
    private void NavigateToDashboard()
    {
        CurrentContent = CreateDashboardViewModel();
        CurrentPage = "Dashboard";
    }

    [RelayCommand]
    private void NavigateToSchedulePlanner()
    {
        CurrentContent = new SchedulePlannerViewModel();
        CurrentPage = "Schedule Planner";
    }

    [RelayCommand]
    private void NavigateToGradeEntry()
    {
        CurrentContent = new GradeEntryViewModel();
        CurrentPage = "Grade Entry";
    }

    [RelayCommand]
    private void NavigateToStudentManagement()
    {
        CurrentContent = new StudentManagementViewModel();
        CurrentPage = "Student Management";
    }

    [RelayCommand]
    private void NavigateToMyAnnouncements()
    {
        var vm = new MyAnnouncementsViewModel();
        vm.NavigateTo = inner => CurrentContent = inner; // enable nested navigation (NewAnnouncementView)
        CurrentContent = vm;
        CurrentPage = "My Announcements";
    }

    [RelayCommand]
    private void NavigateToMessaging()
    {
        var vm = new MessagingViewModel();
        vm.NavigateTo = inner => CurrentContent = inner; // enable nested navigation to NewChatView
        CurrentContent = vm;
        CurrentPage = "Messaging";
    }

    // Helper methods to check current page
    public bool IsDashboardActive => CurrentPage == "Dashboard";
    public bool IsSchedulePlannerActive => CurrentPage == "Schedule Planner";
    public bool IsGradeEntryActive => CurrentPage == "Grade Entry";
    public bool IsStudentManagementActive => CurrentPage == "Student Management";
    public bool IsMyAnnouncementsActive => CurrentPage == "My Announcements";
    public bool IsMessagingActive => CurrentPage == "Messaging";

    partial void OnCurrentPageChanged(string value)
    {
        OnPropertyChanged(nameof(IsDashboardActive));
        OnPropertyChanged(nameof(IsSchedulePlannerActive));
        OnPropertyChanged(nameof(IsGradeEntryActive));
        OnPropertyChanged(nameof(IsStudentManagementActive));
        OnPropertyChanged(nameof(IsMyAnnouncementsActive));
        OnPropertyChanged(nameof(IsMessagingActive));
    }

    partial void OnIsLeftSidebarVisibleChanged(bool value)
    {
        OnPropertyChanged(nameof(ShowLeftSidebarToggle));
    }

    partial void OnIsRightSidebarVisibleChanged(bool value)
    {
        OnPropertyChanged(nameof(ShowRightSidebarToggle));
    }

    // Dark mode toggle command using MVVM Toolkit
    [RelayCommand]
    private void ToggleDarkMode()
    {
        IsDarkMode = !IsDarkMode;
        Application.Current!.RequestedThemeVariant = IsDarkMode ? ThemeVariant.Dark : ThemeVariant.Light;
        // Close profile dropdown after toggling theme (parity with AdminShellView)
        IsUserDropdownVisible = false;
    }
}

// Supporting ViewModels for the shell
public partial class TeacherActivityItem : ViewModelBase
{
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _studentInitials = "";
    [ObservableProperty] private string _activity = "";
    [ObservableProperty] private string _timeAgo = "";
}

public partial class CalendarDayItem : ViewModelBase
{
    [ObservableProperty] private string _day = "";
    [ObservableProperty] private bool _isToday = false;
}