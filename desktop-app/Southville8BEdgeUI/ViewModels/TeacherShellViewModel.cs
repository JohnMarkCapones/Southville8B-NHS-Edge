using Avalonia.Controls;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.ViewModels.Teacher;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Input;
using Avalonia;
using Avalonia.Styling;
using Avalonia.Threading;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using System.Globalization;

namespace Southville8BEdgeUI.ViewModels;

public partial class TeacherShellViewModel : ViewModelBase, IDisposable
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
    private readonly bool _enableRotation;
    private readonly bool _enableTimeUpdater;

    // Services
    private readonly ISseService _sseService;
    private readonly IApiClient _apiClient;
    private readonly ITokenStorageService _tokenStorage;
    private readonly IToastService _toastService;
    private string? _userId;
    private readonly string? _accessToken;

    // Flag to suppress applying a theme while initializing (so we respect OS/default app theme)
    private bool _suppressThemeApply = true;

    // Added optional parameters to disable timers for unit tests.
    public TeacherShellViewModel(ISseService sseService, IApiClient apiClient, ITokenStorageService tokenStorage, IToastService toastService, UserDto? user = null, string? accessToken = null, bool enableRotation = true, bool enableTimeUpdater = true)
    {
        _sseService = sseService;
        _apiClient = apiClient;
        _tokenStorage = tokenStorage;
        _toastService = toastService;
        _accessToken = accessToken;
        _enableRotation = enableRotation;
        _enableTimeUpdater = enableTimeUpdater;

        // Set the access token on the API client immediately
        if (!string.IsNullOrEmpty(accessToken))
        {
            _apiClient.SetAccessToken(accessToken);
            // Store token in background for future sessions (fire-and-forget)
            _ = StoreAccessTokenAsync(accessToken);
        }

        // Initialize with basic data from login
        if (user != null)
        {
            _userId = user.Id;
            UserEmail = user.Email ?? "teacher@southville.edu.ph";
              UserRole = FormatRoleName(user.Role?.Name);
            UserInitials = GetInitialsFromEmail(user.Email);
            
            // Fetch full profile asynchronously
            _ = LoadUserProfileAsync();
        }

        // Set the default page to the dashboard
        _currentContent = CreateDashboardViewModel();
        UpdateColumnWidths();

        // Initialize theme without triggering change
        if (Application.Current is not null)
        {
            _isDarkMode = Application.Current.ActualThemeVariant == ThemeVariant.Dark;
            OnPropertyChanged(nameof(IsDarkMode));
        }
        _suppressThemeApply = false;

        GenerateCalendarDays();
        
        // Load real data asynchronously
        _ = LoadTodaySchedulesAsync();
        _ = LoadRecentActivitiesAsync();
        _ = LoadTodayEventsAsync();

        if (_enableRotation) StartTodayClassRotation();

        // Initialize SSE connection
        InitializeSseConnection();

        if (_enableTimeUpdater)
            StartTimeUpdater();
    }

    private void StartTimeUpdater()
    {
        CurrentTime = DateTime.Now.ToString("hh:mm tt");
        CurrentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    }

    private static string FormatRoleName(string? role)
    {
        if (string.IsNullOrEmpty(role)) return "Teacher";
        
        return role.ToLowerInvariant() switch
        {
            "admin" => "Administrator",
            "teacher" => "Teacher",
            "student" => "Student",
            _ => role
        };
    }

    private static string GetInitialsFromEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "T";
        
        var username = email.Split('@')[0];
        if (username.Length > 0)
            return username[0].ToString().ToUpper();
        
        return "T";
    }

    private static string GetInitialsFromName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return "T";
        
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "T";
        if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
        
        // First and last name initials
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }

    private async Task LoadUserProfileAsync()
    {
        if (string.IsNullOrEmpty(_userId)) return;
        
        try
        {
            var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
            
            // Use the token if available (from login), otherwise rely on storage
            UserProfile? profile;
            if (!string.IsNullOrEmpty(_accessToken))
            {
                profile = await apiClient.GetUserProfileAsync(_userId, _accessToken);
            }
            else
            {
                profile = await apiClient.GetUserProfileAsync(_userId);
            }
            
            if (profile != null)
            {
                Dispatcher.UIThread.Post(() =>
                {
                    UserName = profile.FullName ?? "Teacher";
                    UserEmail = profile.Email;
                    UserRole = FormatRoleName(profile.Role?.Name);
                    UserInitials = GetInitialsFromName(profile.FullName);
                    
                    System.Diagnostics.Debug.WriteLine($"User profile loaded: {UserName} ({UserRole})");
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load user profile: {ex.Message}");
            // Keep the default values from login response
        }
    }

    private async Task LoadRecentActivitiesAsync()
    {
        if (string.IsNullOrEmpty(_userId)) return;
        
        try
        {
            var activities = await _apiClient.GetTeacherRecentActivitiesAsync(_userId);
            if (activities != null)
            {
                Dispatcher.UIThread.Post(() =>
                {
                    RecentActivities.Clear();
                    foreach (var activity in activities)
                    {
                        RecentActivities.Add(new TeacherActivityItem
                        {
                            StudentName = activity.StudentName,
                            StudentInitials = activity.StudentInitials,
                            Activity = activity.Activity,
                            TimeAgo = activity.TimeAgo
                        });
                    }
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load recent activities: {ex.Message}");
            // Fallback to mock data
            Dispatcher.UIThread.Post(() =>
            {
                RecentActivities = new ObservableCollection<TeacherActivityItem>
                {
                    new() { StudentName = "John Smith",  StudentInitials = "JS", Activity = "Submitted Assignment #3",      TimeAgo = "1hr ago"},
                    new() { StudentName = "Maria Garcia",StudentInitials = "MG", Activity = "Asked question in Math class", TimeAgo = "2hrs ago"},
                    new() { StudentName = "Anna Lee",    StudentInitials = "AL", Activity = "Completed quiz successfully",  TimeAgo = "3hrs ago"}
                };
            });
        }
    }

    private async Task LoadTodaySchedulesAsync()
    {
        if (string.IsNullOrEmpty(_userId)) return;
        
        try
        {
            var schedules = await _apiClient.GetTeacherTodaySchedulesAsync(_userId);
            if (schedules != null)
            {
                Dispatcher.UIThread.Post(() =>
                {
                    TodayClasses.Clear();
                    foreach (var schedule in schedules)
                    {
                        var subjectName = schedule.Subject?.SubjectName ?? "Unknown Subject";
                        var sectionName = schedule.Section?.Name ?? "Unknown Section";
                        var roomName = schedule.Room?.RoomNumber ?? "TBD";
                        
                        // Format time from "08:00" to "08:00 AM"
                        var startTime = FormatTime(schedule.StartTime);
                        var endTime = FormatTime(schedule.EndTime);
                        var timeRange = $"{startTime} - {endTime}";
                        
                        TodayClasses.Add(new TodayClassItem
                        {
                            Subject = subjectName,
                            Grade = $"{sectionName}",
                            Time = timeRange,
                            Room = roomName
                        });
                    }
                    
                    _currentTodayClassIndex = 0;
                    ApplyCurrentTodayClass();
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load today's schedules: {ex.Message}");
            // Fallback to mock data
            Dispatcher.UIThread.Post(() =>
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
            });
        }
    }

    private static string FormatTime(string time)
    {
        if (string.IsNullOrEmpty(time)) return "TBD";
        
        if (TimeSpan.TryParse(time, out var timeSpan))
        {
            var hour = timeSpan.Hours;
            var minute = timeSpan.Minutes;
            var period = hour >= 12 ? "PM" : "AM";
            
            if (hour == 0) hour = 12;
            else if (hour > 12) hour -= 12;
            
            return $"{hour:D2}:{minute:D2} {period}";
        }
        
        return time; // Return as-is if parsing fails
    }

    private void InitializeSseConnection()
    {
        if (string.IsNullOrEmpty(_userId)) return;
        
        // Subscribe to SSE events
        _sseService.TeacherMetricsUpdated += OnTeacherMetricsUpdated;
        _sseService.ConnectionStatusChanged += OnConnectionStatusChanged;

        // Start SSE connection
        _ = Task.Run(async () =>
        {
            try
            {
                await _sseService.StartAsync("desktop-sidebar/teacher/kpi/stream");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to start SSE connection: {ex.Message}");
            }
        });
    }

    private void OnTeacherMetricsUpdated(object? sender, TeacherSidebarMetrics metrics)
    {
        Dispatcher.UIThread.Post(() =>
        {
            TotalClasses = metrics.TotalClasses;
            PendingAssignments = metrics.PendingAssignments;
            TotalStudents = metrics.TotalStudents;
            UnreadMessages = metrics.UnreadMessages;
        });
    }

    private void OnConnectionStatusChanged(object? sender, string status)
    {
        System.Diagnostics.Debug.WriteLine($"SSE Connection Status: {status}");
    }

    private async Task LoadTodayEventsAsync()
    {
        try
        {
            var today = DateTime.Now.Date;
            var end = today.AddDays(7);
            var startStr = today.ToString("yyyy-MM-dd");
            var endStr = end.ToString("yyyy-MM-dd");

            // Fetch published events within range using generic GET to pass date filters
            var endpoint = $"events?page=1&limit=50&status=published&startDate={startStr}&endDate={endStr}";
            var response = await _apiClient.GetAsync<EventListResponse>(endpoint);
            if (response?.Data == null)
            {
                return;
            }

            var events = response.Data;
            var todayStr = today.ToString("yyyy-MM-dd");

            // Find today's events
            var todayEvents = events
                .Where(e => string.Equals(e.Date, todayStr, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (todayEvents.Any())
            {
                Dispatcher.UIThread.Post(() =>
                {
                    // Update next class info with today's first event if no classes scheduled
                    if (TodayClasses.Count == 0 && todayEvents.Count > 0)
                    {
                        var firstEvent = todayEvents.First();
                        NextClassSubject = firstEvent.Title;
                        NextClassTime = FormatTime(firstEvent.Time);
                    }
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load today's events: {ex.Message}");
        }
    }

    private async Task StoreAccessTokenAsync(string accessToken)
    {
        try
        {
            // Calculate expiration time (typically JWT tokens expire in 1 hour)
            var expiresAt = DateTime.UtcNow.AddHours(1);
            await _tokenStorage.SaveTokensAsync(accessToken, string.Empty, expiresAt);
            System.Diagnostics.Debug.WriteLine("Access token stored successfully");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to store access token: {ex.Message}");
        }
    }

    private void ApplyCurrentTodayClass()
    {
        // Clear state if no classes; prevents stale UI and stops rotation
        if (TodayClasses.Count == 0)
        {
            _todayClassRotationTimer?.Stop();
            _currentTodayClassIndex = 0;
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
            NextClassSubject = next.Subject; // was next.Grade
            NextClassTime = next.Time;
        }
        else
        {
            NextClassSubject = current.Subject; // was current.Grade
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
        if (TodayClasses.Count == 0)
        {
            // Ensure state cleared if collection emptied externally
            ApplyCurrentTodayClass();
            return;
        }
        if (TodayClasses.Count == 1)
        {
            // Just re-apply to keep consistency (no rotation possible)
            _currentTodayClassIndex = 0;
            ApplyCurrentTodayClass();
            return;
        }
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
        CurrentContent = new GradeEntryViewModel(_apiClient, _toastService);
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
        if (Application.Current is not null)
            Application.Current.RequestedThemeVariant = IsDarkMode ? ThemeVariant.Dark : ThemeVariant.Light;
        IsUserDropdownVisible = false;
    }

    private void DisposeCurrentContent()
    {
        if (_currentContent is IDisposable disposable)
        {
            disposable.Dispose();
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposing)
        {
            // Unsubscribe from SSE events
            _sseService.TeacherMetricsUpdated -= OnTeacherMetricsUpdated;
            _sseService.ConnectionStatusChanged -= OnConnectionStatusChanged;

            // Stop SSE connection
            _ = Task.Run(async () =>
            {
                try
                {
                    await _sseService.StopAsync();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error stopping SSE connection: {ex.Message}");
                }
            });

            // Dispose current content
            DisposeCurrentContent();

            // Stop timers
            _todayClassRotationTimer?.Stop();
        }
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