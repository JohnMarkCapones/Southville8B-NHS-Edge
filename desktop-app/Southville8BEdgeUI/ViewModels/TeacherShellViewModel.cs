using Avalonia.Controls;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.ViewModels.Teacher;
using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Input;
using Avalonia;
using Avalonia.Styling;
using Avalonia.Threading;

namespace Southville8BEdgeUI.ViewModels;

public partial class TeacherShellViewModel : ViewModelBase
{
    [ObservableProperty]
    private ViewModelBase _currentContent;

    [ObservableProperty]
    private string _currentPage = "Dashboard";

    [ObservableProperty]
    private bool _isLeftSidebarVisible = true;

    [ObservableProperty]
    private bool _isRightSidebarVisible = true;

    [ObservableProperty] private string _userName = "St. Yummy";
    [ObservableProperty] private string _userRole = "Senior Math Teacher";
    [ObservableProperty] private string _userInitials = "SY";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");

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

    [ObservableProperty] private int _totalClasses = 6;
    [ObservableProperty] private int _pendingAssignments = 24;
    [ObservableProperty] private int _totalStudents = 180;
    [ObservableProperty] private int _unreadMessages = 12;

    // Calendar / Dates
    private DateTime _currentMonthDate = DateTime.Today; // internal reference for accurate calendar
    [ObservableProperty] private string _currentMonth = DateTime.Today.ToString("MMMM yyyy");
    [ObservableProperty] private string _todayDate = DateTime.Today.Day.ToString();

    [ObservableProperty] private string _nextClassSubject = "Science - Grade 8-B";
    [ObservableProperty] private string _nextClassTime = "10:00 AM - 11:30 AM";

    [ObservableProperty] private string _currentClassSubject = "Mathematics";
    [ObservableProperty] private string _currentClassGrade = "Grade 8-A Mathematics";
    [ObservableProperty] private string _currentClassTime = "08:00 AM - 09:30 AM";
    [ObservableProperty] private string _currentClassRoom = "Room 101";

    [ObservableProperty] private ObservableCollection<TodayClassItem> _todayClasses = new();
    private int _currentTodayClassIndex = 0;
    public bool HasMultipleTodayClasses => TodayClasses.Count > 1;
    [ObservableProperty] private TodayClassItem? _currentTodayClass;

    [ObservableProperty] private ObservableCollection<TeacherActivityItem> _recentActivities = new();

    [ObservableProperty] private ObservableCollection<CalendarDayItem> _calendarDays = new();
    [ObservableProperty] private ObservableCollection<CalendarDayItem> _firstWeekDays = new();

    // Internal month grid (42 cells) used for week paging
    private readonly List<CalendarDayItem> _monthGridDays = new();
    private int _currentWeekIndex = 0; // 0-based week index within month grid
    private int _maxWeekIndex = 0;     // last week that still contains at least one day of the current month

    [ObservableProperty] private GridLength _leftColumnWidth = new(260);
    [ObservableProperty] private GridLength _rightColumnWidth = new(260);

    public bool ShowLeftSidebarToggle => !IsLeftSidebarVisible;
    public bool ShowRightSidebarToggle => !IsRightSidebarVisible;

    private DispatcherTimer? _todayClassRotationTimer;

    public TeacherShellViewModel()
    {
        // Set the default page to the dashboard
        _currentContent = CreateDashboardViewModel();
        InitializeRecentActivities();
        InitializeTodayClasses();
        GenerateCalendarDays();
        StartTodayClassRotation();
        UpdateColumnWidths();

        // Initialize based on current theme (system/default)
        IsDarkMode = Application.Current?.ActualThemeVariant == ThemeVariant.Dark;

        // Update time every minute (placeholder)
        StartTimeUpdater();
    }

    private void StartTimeUpdater()
    {
        CurrentTime = DateTime.Now.ToString("hh:mm tt");
        CurrentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    }

    private void InitializeRecentActivities()
    {
        RecentActivities = new ObservableCollection<TeacherActivityItem>
        {
            new() { StudentName = "John Smith",  StudentInitials = "JS", Activity = "Submitted Assignment #3",      TimeAgo = "1hr ago"},
            new() { StudentName = "Maria Garcia",StudentInitials = "MG", Activity = "Asked question in Math class", TimeAgo = "2hrs ago"},
            new() { StudentName = "Anna Lee",    StudentInitials = "AL", Activity = "Completed quiz successfully",  TimeAgo = "3hrs ago"}
        };
    }

    private void InitializeTodayClasses()
    {
        TodayClasses = new ObservableCollection<TodayClassItem>
        {
            new() { Subject="Mathematics", Grade="Grade 8-A Mathematics", Time="08:00 AM - 09:30 AM", Room="Room 101" },
            new() { Subject="Science",     Grade="Grade 8-B Science",      Time="10:00 AM - 11:30 AM", Room="Laboratory 2" },
            new() { Subject="English",     Grade="Grade 8-C English",      Time="01:00 PM - 02:30 PM", Room="Room 203" },
            new() { Subject="Advisory",    Grade="Advisory Period",        Time="03:00 PM - 03:30 PM", Room="Faculty Hall" }
        };
        _currentTodayClassIndex = 0;
        ApplyCurrentTodayClass();
    }

    private void ApplyCurrentTodayClass()
    {
        if (TodayClasses.Count == 0) return;
        var current = TodayClasses[_currentTodayClassIndex];
        CurrentClassSubject = current.Subject;
        CurrentClassGrade = current.Grade;
        CurrentClassTime = current.Time;
        CurrentClassRoom = current.Room;
        CurrentTodayClass = current;

        if (TodayClasses.Count > 1)
        {
            var next = TodayClasses[(_currentTodayClassIndex + 1) % TodayClasses.Count];
            NextClassSubject = next.Grade;
            NextClassTime = next.Time;
        }
        else
        {
            NextClassSubject = current.Grade;
            NextClassTime = current.Time;
        }
        OnPropertyChanged(nameof(HasMultipleTodayClasses));
    }

    // Accurate monthly calendar (6 weeks grid) starting Monday
    private void GenerateCalendarDays()
    {
        CalendarDays.Clear();
        _monthGridDays.Clear();
        CurrentMonth = _currentMonthDate.ToString("MMMM yyyy");

        var firstDayOfMonth = new DateTime(_currentMonthDate.Year, _currentMonthDate.Month, 1);
        int firstDayIndex = ((int)firstDayOfMonth.DayOfWeek + 6) % 7; // Monday=0
        var startDate = firstDayOfMonth.AddDays(-firstDayIndex);

        const int totalCells = 42; // 6x7 grid
        for (int i = 0; i < totalCells; i++)
        {
            var date = startDate.AddDays(i);
            var dayItem = new CalendarDayItem
            {
                Day = date.Day.ToString(),
                IsToday = date.Date == DateTime.Today,
                IsCurrentMonth = date.Month == _currentMonthDate.Month,
                Date = date
            };
            CalendarDays.Add(dayItem);
            _monthGridDays.Add(dayItem);
        }

        // Determine max week index that contains at least one current-month day
        _maxWeekIndex = 0;
        for (int w = 0; w < 6; w++)
        {
            var weekDays = _monthGridDays.Skip(w * 7).Take(7);
            if (weekDays.Any(d => d.IsCurrentMonth))
                _maxWeekIndex = w; // update until last valid
        }

        // Set current week to week containing today (if in displayed month) else first week
        var todayIndex = _monthGridDays.FindIndex(d => d.Date.Date == DateTime.Today.Date);
        if (todayIndex >= 0)
            _currentWeekIndex = todayIndex / 7;
        else
            _currentWeekIndex = 0;

        UpdateFirstWeekSubset();
    }

    private void UpdateFirstWeekSubset()
    {
        FirstWeekDays.Clear();
        var weekDays = _monthGridDays.Skip(_currentWeekIndex * 7).Take(7).ToList();
        foreach (var d in weekDays)
            FirstWeekDays.Add(d);
    }

    private TeacherDashboardViewModel CreateDashboardViewModel() => new()
    {
        NavigateToSchedulePlannerCommand = NavigateToSchedulePlannerCommand,
        NavigateToGradeEntryCommand = NavigateToGradeEntryCommand,
        NavigateToStudentManagementCommand = NavigateToStudentManagementCommand,
        NavigateToMyAnnouncementsCommand = NavigateToMyAnnouncementsCommand,
        NavigateToMessagingCommand = NavigateToMessagingCommand
    };

    private void UpdateColumnWidths()
    {
        LeftColumnWidth = IsLeftSidebarVisible ? new GridLength(260) : new GridLength(0);
        RightColumnWidth = IsRightSidebarVisible ? new GridLength(260) : new GridLength(0);
    }

    private void StartTodayClassRotation()
    {
        _todayClassRotationTimer?.Stop();
        if (TodayClasses.Count <= 1) return;
        _todayClassRotationTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(3) };
        _todayClassRotationTimer.Tick += (_, _) =>
        {
            if (TodayClasses.Count <= 1) { _todayClassRotationTimer!.Stop(); return; }
            NextTodayClass();
        };
        _todayClassRotationTimer.Start();
    }

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

    [RelayCommand]
    private void ToggleUserDropdown() => IsUserDropdownVisible = !IsUserDropdownVisible;

    [RelayCommand]
    private void CloseUserDropdown() => IsUserDropdownVisible = false;

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

    [RelayCommand]
    private void Logout() => IsUserDropdownVisible = false;

    // Calendar navigation
    [RelayCommand]
    private void NavigatePreviousMonth()
    {
        // If we are at the first visible week, move to previous month and show its last week
        if (_currentWeekIndex == 0)
        {
            _currentMonthDate = _currentMonthDate.AddMonths(-1);
            GenerateCalendarDays(); // regenerates grid & sets default week
            _currentWeekIndex = _maxWeekIndex; // jump to last week of new month
            UpdateFirstWeekSubset();
        }
        else
        {
            _currentWeekIndex--;
            UpdateFirstWeekSubset();
        }
    }

    [RelayCommand]
    private void NavigateNextMonth()
    {
        // If we are at the final week that contains days in this month, advance to next month first week
        if (_currentWeekIndex >= _maxWeekIndex)
        {
            _currentMonthDate = _currentMonthDate.AddMonths(1);
            GenerateCalendarDays(); // regenerates grid & sets default week
            _currentWeekIndex = 0; // ensure first week
            UpdateFirstWeekSubset();
        }
        else
        {
            _currentWeekIndex++;
            UpdateFirstWeekSubset();
        }
    }

    [RelayCommand]
    private void ViewFullSchedule() => NavigateToSchedulePlanner();

    [RelayCommand]
    private void NextTodayClass()
    {
        if (TodayClasses.Count <= 1) return;
        _currentTodayClassIndex = (_currentTodayClassIndex + 1) % TodayClasses.Count;
        ApplyCurrentTodayClass();
        if (_todayClassRotationTimer is { IsEnabled: true })
        {
            _todayClassRotationTimer.Stop();
            _todayClassRotationTimer.Start();
        }
    }

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
        vm.NavigateTo = inner => CurrentContent = inner;
        CurrentContent = vm;
        CurrentPage = "My Announcements";
    }

    [RelayCommand]
    private void NavigateToMessaging()
    {
        var vm = new MessagingViewModel();
        vm.NavigateTo = inner => CurrentContent = inner;
        CurrentContent = vm;
        CurrentPage = "Messaging";
    }

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

    partial void OnIsLeftSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowLeftSidebarToggle));
    partial void OnIsRightSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowRightSidebarToggle));

    [RelayCommand]
    private void ToggleDarkMode()
    {
        IsDarkMode = !IsDarkMode;
        Application.Current!.RequestedThemeVariant = IsDarkMode ? ThemeVariant.Dark : ThemeVariant.Light;
        IsUserDropdownVisible = false;
    }
}

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
    [ObservableProperty] private bool _isCurrentMonth = false;
    [ObservableProperty] private DateTime _date = DateTime.MinValue;
}

public partial class TodayClassItem : ViewModelBase
{
    [ObservableProperty] private string _subject = string.Empty;
    [ObservableProperty] private string _grade = string.Empty;
    [ObservableProperty] private string _time = string.Empty;
    [ObservableProperty] private string _room = string.Empty;
}