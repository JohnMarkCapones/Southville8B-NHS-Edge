using Avalonia;
using Avalonia.Controls;
using Avalonia.Styling;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI.ViewModels.Admin;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Avalonia.Threading;

namespace Southville8BEdgeUI.ViewModels;

public partial class AdminShellViewModel : ViewModelBase
{
    [ObservableProperty]
    private ViewModelBase _currentContent;
    [ObservableProperty]
    private string _currentPage = "Dashboard";
    [ObservableProperty]
    private bool _isLeftSidebarVisible = true;
    [ObservableProperty]
    private bool _isRightSidebarVisible = true;
    [ObservableProperty]
    private bool _isUserDropdownVisible = false;
    [ObservableProperty]
    private bool _isDarkMode = false; // toggled and applied via partial method after initialization

    [ObservableProperty] private string _userName = "Richard Ramos Jr";
    [ObservableProperty] private string _userRole = "Administrator";
    [ObservableProperty] private string _userInitials = "RR";
    [ObservableProperty] private string _userEmail = "richard.ramos@southville.edu.ph";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");
    [ObservableProperty] private string _currentVersion = "1.0.0";

    // Dynamic calendar (week pager similar to TeacherShell)
    private DateTime _currentMonthDate = DateTime.Today;
    [ObservableProperty] private string _currentMonth = DateTime.Today.ToString("MMMM yyyy");
    [ObservableProperty] private ObservableCollection<CalendarDayItem> _firstWeekDays = new();
    private readonly List<CalendarDayItem> _monthGridDays = new();
    private int _currentWeekIndex = 0;
    private int _maxWeekIndex = 0;

    // Rotating "Today" event/classes (replacing static XAML mock)
    [ObservableProperty] private ObservableCollection<TodayClassItem> _todayClasses = new();
    private int _currentTodayClassIndex = 0;
    [ObservableProperty] private TodayClassItem? _currentTodayClass;
    [ObservableProperty] private string _nextClassSubject = string.Empty;
    [ObservableProperty] private string _nextClassTime = string.Empty;
    [ObservableProperty] private string _currentClassSubject = string.Empty;
    [ObservableProperty] private string _currentClassGrade = string.Empty; // reused name for description/title
    [ObservableProperty] private string _currentClassTime = string.Empty;
    [ObservableProperty] private string _currentClassRoom = string.Empty;
    public bool HasMultipleTodayClasses => TodayClasses.Count > 1;

    private DispatcherTimer? _todayRotationTimer;

    [ObservableProperty] private GridLength _leftColumnWidth = new(260);
    [ObservableProperty] private GridLength _rightColumnWidth = new(260);

    // Flag to suppress applying a theme while initializing (so we respect OS/default app theme)
    private bool _suppressThemeApply = true;

    public bool ShowLeftSidebarToggle => !IsLeftSidebarVisible;
    public bool ShowRightSidebarToggle => !IsRightSidebarVisible;

    public Action<ViewModelBase>? NavigateTo { get; set; }

    // Added optional parameter enableRotation (default true) to allow unit tests to disable DispatcherTimer creation.
    public AdminShellViewModel(bool enableRotation = true)
    {
        _currentContent = CreateDashboardViewModel();
        UpdateColumnWidths();

        // Initialize theme without triggering change
        if (Application.Current is not null)
        {
            _isDarkMode = Application.Current.ActualThemeVariant == ThemeVariant.Dark;
            OnPropertyChanged(nameof(IsDarkMode));
        }
        _suppressThemeApply = false;

        InitializeTodayClasses();
        GenerateCalendarDays();
        if (enableRotation)
            StartTodayRotation();
    }

    private void InitializeTodayClasses()
    {
        // Mock data moved from XAML (admin events / activities)
        TodayClasses = new ObservableCollection<TodayClassItem>
        {
            new() { Subject="Educational Field Trip", Grade="Training - Pending", Time="06:00 AM - 11:00 PM", Room="Off-Campus" },
            new() { Subject="Faculty Meeting", Grade="Meeting - Confirmed", Time="01:00 PM - 02:00 PM", Room="Conference Hall" },
            new() { Subject="Library System Maintenance", Grade="System - Scheduled", Time="03:00 PM - 04:30 PM", Room="IT Lab" }
        };
        _currentTodayClassIndex = 0;
        ApplyCurrentTodayClass();
    }

    private void ApplyCurrentTodayClass()
    {
        // Handle empty collection: clear stale UI state and stop rotation timer
        if (TodayClasses.Count == 0)
        {
            _todayRotationTimer?.Stop();
            CurrentTodayClass = null;
            CurrentClassSubject = string.Empty;
            CurrentClassGrade = string.Empty;
            CurrentClassTime = string.Empty;
            CurrentClassRoom = string.Empty;
            NextClassSubject = string.Empty;
            NextClassTime = string.Empty;
            OnPropertyChanged(nameof(HasMultipleTodayClasses));
            return;
        }
        var current = TodayClasses[_currentTodayClassIndex];
        CurrentClassSubject = current.Subject;
        CurrentClassGrade = current.Grade;
        CurrentClassTime = current.Time;
        CurrentClassRoom = current.Room;
        CurrentTodayClass = current;

        if (TodayClasses.Count > 1)
        {
            var next = TodayClasses[(_currentTodayClassIndex + 1) % TodayClasses.Count];
            NextClassSubject = next.Subject;
            NextClassTime = next.Time;
        }
        else
        {
            NextClassSubject = current.Subject;
            NextClassTime = current.Time;
        }
        OnPropertyChanged(nameof(HasMultipleTodayClasses));
    }

    private void StartTodayRotation()
    {
        _todayRotationTimer?.Stop();
        if (TodayClasses.Count <= 1) return;
        _todayRotationTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(3) };
        _todayRotationTimer.Tick += (_, _) => NextTodayClass();
        _todayRotationTimer.Start();
    }

    private void GenerateCalendarDays()
    {
        _monthGridDays.Clear();
        CurrentMonth = _currentMonthDate.ToString("MMMM yyyy");
        var firstDay = new DateTime(_currentMonthDate.Year, _currentMonthDate.Month, 1);
        int firstIndex = ((int)firstDay.DayOfWeek + 6) % 7; // Monday=0
        var startDate = firstDay.AddDays(-firstIndex);
        const int total = 42;
        for (int i = 0; i < total; i++)
        {
            var date = startDate.AddDays(i);
            _monthGridDays.Add(new CalendarDayItem
            {
                Day = date.Day.ToString(),
                IsToday = date.Date == DateTime.Today,
                IsCurrentMonth = date.Month == _currentMonthDate.Month,
                Date = date
            });
        }
        _maxWeekIndex = 0;
        for (int w = 0; w < 6; w++)
        {
            if (_monthGridDays.Skip(w * 7).Take(7).Any(d => d.IsCurrentMonth))
                _maxWeekIndex = w;
        }
        var todayIndex = _monthGridDays.FindIndex(d => d.Date.Date == DateTime.Today.Date && d.IsCurrentMonth);
        _currentWeekIndex = todayIndex >= 0 ? todayIndex / 7 : 0;
        UpdateWeekSubset();
    }

    private void UpdateWeekSubset()
    {
        FirstWeekDays.Clear();
        foreach (var d in _monthGridDays.Skip(_currentWeekIndex * 7).Take(7))
            FirstWeekDays.Add(d);
    }

    private AdminDashboardViewModel CreateDashboardViewModel() => new()
    {
        NavigateToRoomManagementCommand = NavigateToRoomManagementCommand,
        NavigateToEventsDashboardCommand = NavigateToEventsDashboardCommand,
        NavigateToUserManagementCommand = NavigateToUserManagementCommand,
        NavigateToChatCommand = NavigateToChatCommand,
        NavigateToELibraryCommand = NavigateToELibraryCommand
    };

    private void UpdateColumnWidths()
    {
        LeftColumnWidth = IsLeftSidebarVisible ? new GridLength(260) : new GridLength(0);
        RightColumnWidth = IsRightSidebarVisible ? new GridLength(260) : new GridLength(0);
    }

    [RelayCommand] private void ToggleLeftSidebar() { IsLeftSidebarVisible = !IsLeftSidebarVisible; UpdateColumnWidths(); }
    [RelayCommand] private void ToggleRightSidebar() { IsRightSidebarVisible = !IsRightSidebarVisible; UpdateColumnWidths(); }
    [RelayCommand] private void ToggleUserDropdown() => IsUserDropdownVisible = !IsUserDropdownVisible;
    [RelayCommand] private void CloseUserDropdown() => IsUserDropdownVisible = false;

    [RelayCommand]
    private void NavigateToAlerts()
    {
        CurrentContent = new AlertsViewModel();
        CurrentPage = "Alerts";
        CloseUserDropdown();
    }

    [RelayCommand] private void NavigateToDashboard() { CurrentContent = CreateDashboardViewModel(); CurrentPage = "Dashboard"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToRoomManagement() { var vm = new RoomManagementViewModel(); vm.NavigateTo = inner => CurrentContent = inner; vm.NavigateBack = () => NavigateToDashboard(); CurrentContent = vm; CurrentPage = "Room Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToEventsDashboard() { var vm = new EventDashboardViewModel(); vm.NavigateTo = inner => CurrentContent = inner; vm.NavigateBack = () => NavigateToDashboard(); CurrentContent = vm; CurrentPage = "Events Dashboard"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToELibrary() { CurrentContent = new ELibraryManagementViewModel(); CurrentPage = "E-Library Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToUserManagement() { CurrentContent = CreateUserManagementViewModel(); CurrentPage = "User Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToChat() { var vm = new ChatViewModel(); vm.NavigateTo = inner => CurrentContent = inner; vm.NavigateBack = () => NavigateToDashboard(); CurrentContent = vm; CurrentPage = "Chat"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToProfile() { CurrentContent = new ProfileViewModel(); CurrentPage = "Profile"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToSettings() { CurrentContent = new SettingsViewModel(); CurrentPage = "Settings"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToNotifications() { CurrentContent = new NotificationsViewModel(); CurrentPage = "Notifications"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToHelpGuide() { CurrentContent = new HelpGuideViewModel(); CurrentPage = "Help Guide"; CloseUserDropdown(); }

    [RelayCommand]
    private void ToggleDarkMode()
    {
        IsDarkMode = !IsDarkMode; // triggers partial method
        CloseUserDropdown();
    }

    [RelayCommand] private void Logout() 
    { 
        CloseUserDropdown(); 
        var authService = ServiceLocator.Services.GetRequiredService<Services.IAuthService>();
        var toastService = ServiceLocator.Services.GetRequiredService<Services.IToastService>();
        var roleValidationService = ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>();
        NavigateTo?.Invoke(new LoginViewModel(authService, toastService, roleValidationService)); 
    }
    [RelayCommand] private void DismissAlert(SystemAlertViewModel alert) { if (CurrentContent is AdminDashboardViewModel d) d.SystemAlerts.Remove(alert); }

    // Calendar week navigation (previous / next) - wraps across months
    [RelayCommand]
    private void NavigatePreviousMonth()
    {
        if (_currentWeekIndex == 0)
        {
            _currentMonthDate = _currentMonthDate.AddMonths(-1);
            GenerateCalendarDays();
            _currentWeekIndex = _maxWeekIndex;
            UpdateWeekSubset();
        }
        else
        {
            _currentWeekIndex--;
            UpdateWeekSubset();
        }
    }

    [RelayCommand]
    private void NavigateNextMonth()
    {
        if (_currentWeekIndex >= _maxWeekIndex)
        {
            _currentMonthDate = _currentMonthDate.AddMonths(1);
            GenerateCalendarDays();
            _currentWeekIndex = 0;
            UpdateWeekSubset();
        }
        else
        {
            _currentWeekIndex++;
            UpdateWeekSubset();
        }
    }

    [RelayCommand]
    private void NextTodayClass()
    {
        if (TodayClasses.Count <= 1) return;
        _currentTodayClassIndex = (_currentTodayClassIndex + 1) % TodayClasses.Count;
        ApplyCurrentTodayClass();
        if (_todayRotationTimer is { IsEnabled: true }) { _todayRotationTimer.Stop(); _todayRotationTimer.Start(); }
    }

    private UserManagementViewModel CreateUserManagementViewModel()
    {
        var vm = new UserManagementViewModel();
        vm.NavigateTo = innerVm => CurrentContent = innerVm;
        vm.NavigateBack = () => NavigateToDashboard();
        return vm;
    }

    // Existing active-page flags
    public bool IsDashboardActive => CurrentPage == "Dashboard";
    public bool IsRoomManagementActive => CurrentPage == "Room Management";
    public bool IsEventsDashboardActive => CurrentPage == "Events Dashboard";
    public bool IsELibraryActive => CurrentPage == "E-Library Management";
    public bool IsUserManagementActive => CurrentPage == "User Management";
    public bool IsChatActive => CurrentPage == "Chat";
    public bool IsProfileActive => CurrentPage == "Profile";
    public bool IsSettingsActive => CurrentPage == "Settings";
    public bool IsNotificationsActive => CurrentPage == "Notifications";
    public bool IsHelpGuideActive => CurrentPage == "Help Guide";
    public bool IsAlertsActive => CurrentPage == "Alerts";

    partial void OnCurrentPageChanged(string value)
    {
        OnPropertyChanged(nameof(IsDashboardActive));
        OnPropertyChanged(nameof(IsRoomManagementActive));
        OnPropertyChanged(nameof(IsEventsDashboardActive));
        OnPropertyChanged(nameof(IsELibraryActive));
        OnPropertyChanged(nameof(IsUserManagementActive));
        OnPropertyChanged(nameof(IsChatActive));
        OnPropertyChanged(nameof(IsProfileActive));
        OnPropertyChanged(nameof(IsSettingsActive));
        OnPropertyChanged(nameof(IsNotificationsActive));
        OnPropertyChanged(nameof(IsHelpGuideActive));
        OnPropertyChanged(nameof(IsAlertsActive));
    }

    partial void OnIsLeftSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowLeftSidebarToggle));
    partial void OnIsRightSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowRightSidebarToggle));

    partial void OnIsDarkModeChanged(bool value)
    {
        if (_suppressThemeApply) return;
        if (Application.Current is null) return;
        Application.Current.RequestedThemeVariant = value ? ThemeVariant.Dark : ThemeVariant.Light;
        if (CurrentContent is AdminDashboardViewModel dashboard)
        {
            foreach (var stat in dashboard.WeeklyStats)
                stat.RefreshTheme();
        }
    }
}