using Avalonia;
using Avalonia.Controls;
using Avalonia.Styling;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI.ViewModels.Admin;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Threading;
using System.Globalization;

namespace Southville8BEdgeUI.ViewModels;

public partial class AdminShellViewModel : ViewModelBase, IDisposable
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

    [ObservableProperty] private string _userName = "User";
    [ObservableProperty] private string _userRole = "User";
    [ObservableProperty] private string _userInitials = "U";
    [ObservableProperty] private string _userEmail = "user@southville.edu.ph";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");
    [ObservableProperty] private string _currentVersion = "1.0.0";

    // SSE KPI Metrics Properties
    [ObservableProperty] private int _eventsCount = 120;
    [ObservableProperty] private int _teachersCount = 45;
    [ObservableProperty] private int _studentsCount = 1512;
    [ObservableProperty] private int _sectionsCount = 144;
    [ObservableProperty] private string _connectionStatus = "Disconnected";

    // Services
    private readonly ISseService _sseService;
    private readonly IApiClient _apiClient;
    private readonly ITokenStorageService _tokenStorage;
    private string? _userId;
    private readonly string? _accessToken;

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
    private DispatcherTimer? _clock;
    private SidebarMetrics? _lastValidMetrics;
    private SidebarMetrics? _pendingMetrics;
    private DispatcherTimer? _metricsApplyTimer;

    public bool ShowLeftSidebarToggle => !IsLeftSidebarVisible;
    public bool ShowRightSidebarToggle => !IsRightSidebarVisible;

    public Action<ViewModelBase>? NavigateTo { get; set; }
    
    // Main-level navigation action for app-level navigation (e.g., logout to login)
    public Action<ViewModelBase>? MainNavigateTo { get; set; }
    
    // Cached ViewModel instances
    private UserManagementViewModel? _cachedUserManagementViewModel;
    private ClassSchedulesViewModel? _cachedClassSchedulesViewModel;
    private EventDashboardViewModel? _cachedEventDashboardViewModel;
    private BuildingManagementViewModel? _cachedBuildingManagementViewModel;

    // Sidebar events (current/next + upcoming page)
    [ObservableProperty] private EventDto? _currentEvent;
    [ObservableProperty] private EventDto? _nextEvent;
    [ObservableProperty] private ObservableCollection<EventDto> _upcomingEvents = new();
    [ObservableProperty] private bool _hasCurrentEvent;
    [ObservableProperty] private bool _hasNextEvent;

    // Computed properties for 12-hour formatted times with day of week
    public string CurrentEventTimeFormatted => FormatTimeWithDay(CurrentEvent);
    public string NextEventTimeFormatted => FormatTimeWithDay(NextEvent);

    private string FormatTimeWithDay(EventDto? eventDto)
    {
        if (eventDto == null)
            return "N/A";
        
        string dayOfWeek = GetDayOfWeek(eventDto.Date);
        string timeFormatted = FormatTime(eventDto.Time);
        
        return $"{dayOfWeek}, {timeFormatted}";
    }

    private string GetDayOfWeek(string dateString)
    {
        if (DateTime.TryParse(dateString, out var date))
        {
            return date.ToString("dddd"); // e.g., "Tuesday", "Wednesday"
        }
        return "N/A";
    }

    private string FormatTime(string? time)
    {
        if (string.IsNullOrEmpty(time))
            return "N/A";
        
        if (TimeSpan.TryParse(time, out var timeSpan))
        {
            var dateTime = DateTime.Today.Add(timeSpan);
            return dateTime.ToString("h:mm tt"); // e.g., "9:00 AM"
        }
        
        return time;
    }

    // Added optional parameter enableRotation (default true) to allow unit tests to disable DispatcherTimer creation.
    public AdminShellViewModel(ISseService sseService, IApiClient apiClient, ITokenStorageService tokenStorage, UserDto? user = null, string? accessToken = null, bool enableRotation = true, Action<ViewModelBase>? mainNavigateTo = null)
    {
        _sseService = sseService;
        _apiClient = apiClient;
        _tokenStorage = tokenStorage;
        _accessToken = accessToken;
        
        // Store the main-level navigation action
        MainNavigateTo = mainNavigateTo;
        
        // Create dashboard immediately with token (no async initialization needed)
        _currentContent = CreateDashboardViewModel();
        
        // Store token in background for future sessions (fire-and-forget)
        if (!string.IsNullOrEmpty(accessToken))
        {
            _ = StoreAccessTokenAsync(accessToken);
        }
        
        // Initialize with basic data from login
        if (user != null)
        {
            _userId = user.Id;
            UserEmail = user.Email ?? "user@southville.edu.ph";
            UserRole = FormatRoleName(user.Role?.Name);
            UserInitials = GetInitialsFromEmail(user.Email);
            
            // Fetch full profile asynchronously
            _ = LoadUserProfileAsync();
        }
        
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
        // Remove auto-rotation per requirement (keep data structure for now but do not start timer)

        // Initialize SSE connection
        InitializeSseConnection();

        // Load sidebar events (today + next 7 days)
        _ = LoadSidebarEventsAsync();

        // Realtime clock for date/time display
        _clock?.Stop();
        _clock = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
        _clock.Tick += (_, _) =>
        {
            CurrentDate = DateTime.Now.ToString("MMMM dd, yyyy");
            CurrentTime = DateTime.Now.ToString("hh:mm tt");
        };
        _clock.Start();
    }


    private void InitializeSseConnection()
    {
        // Subscribe to SSE events
        _sseService.MetricsUpdated += OnMetricsUpdated;
        _sseService.ConnectionStatusChanged += OnConnectionStatusChanged;

        // Start SSE connection
        _ = Task.Run(async () =>
        {
            try
            {
                await _sseService.StartAsync("desktop-sidebar/kpi/stream");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to start SSE connection: {ex.Message}");
            }
        });
    }

    private void OnMetricsUpdated(object? sender, SidebarMetrics metrics)
    {
        // Guard: ignore transient all-zero snapshots while connected (likely heartbeat/placeholder)
        bool looksEmpty = metrics.Events == 0 && metrics.Teachers == 0 && metrics.Students == 0 && metrics.Sections == 0;
        if (looksEmpty && !string.Equals(ConnectionStatus, "Disconnected", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        // Debounce/coalesce: keep only latest metrics within a short window
        _pendingMetrics = metrics;
        _metricsApplyTimer ??= new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(200) };
        _metricsApplyTimer.Tick -= ApplyPendingMetrics;
        _metricsApplyTimer.Tick += ApplyPendingMetrics;
        _metricsApplyTimer.Stop();
        _metricsApplyTimer.Start();
    }

    private void ApplyPendingMetrics(object? sender, EventArgs e)
    {
        _metricsApplyTimer?.Stop();
        var snapshot = _pendingMetrics;
        _pendingMetrics = null;
        if (snapshot == null) return;

        _lastValidMetrics = snapshot;
        Dispatcher.UIThread.Post(() =>
        {
            EventsCount = snapshot.Events;
            TeachersCount = snapshot.Teachers;
            StudentsCount = snapshot.Students;
            SectionsCount = snapshot.Sections;
        });
    }

    private void OnConnectionStatusChanged(object? sender, string status)
    {
        Dispatcher.UIThread.Post(() => ConnectionStatus = status);
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
                    UserName = profile.FullName ?? "User";
                    UserEmail = profile.Email;
                    UserRole = FormatRoleName(profile.Role?.Name);
                    UserInitials = GetInitialsFromName(profile.FullName);
                    
                    System.Diagnostics.Debug.WriteLine($"User profile loaded: {UserName} ({UserRole})");
                });
            }
        }
        catch (UnauthorizedException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load user profile: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Exception type: {ex.GetType().Name}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            // Keep the default values from login response
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load user profile: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Exception type: {ex.GetType().Name}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            // Keep the default values from login response
        }
    }

    private static string FormatRoleName(string? role)
    {
        if (string.IsNullOrEmpty(role)) return "User";
        
        return role.ToLowerInvariant() switch
        {
            "admin" => "Administrator",
            "teacher" => "Teacher",
            "student" => "Student",
            _ => role
        };
    }

    private static string GetInitialsFromName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return "U";
        
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "U";
        if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
        
        // First and last name initials
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }

    private static string GetInitialsFromEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "U";
        
        var username = email.Split('@')[0];
        if (username.Length > 0)
            return username[0].ToString().ToUpper();
        
        return "U";
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

    // Loads current and next events and the first page of upcoming events (5 items)
    private async Task LoadSidebarEventsAsync()
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
                CurrentEvent = null;
                NextEvent = null;
                UpcomingEvents.Clear();
                return;
            }

            var events = response.Data;

            // Build comparable DateTime for each event using date + time (time may be HH:mm or HH:mm:ss)
            static DateTime? toDateTime(EventDto e)
            {
                if (string.IsNullOrWhiteSpace(e.Date)) return null;
                if (!DateTime.TryParseExact(e.Date, new[] { "yyyy-MM-dd", "yyyy-M-d" }, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var d))
                    return null;
                if (string.IsNullOrWhiteSpace(e.Time)) return d;
                // Normalize time
                if (TimeSpan.TryParse(e.Time, out var ts))
                    return d.Date.Add(ts);
                return d;
            }

            var now = DateTime.Now;
            var todayStr = today.ToString("yyyy-MM-dd");

            var candidatesToday = events
                .Where(e => string.Equals(e.Date, todayStr, StringComparison.OrdinalIgnoreCase))
                .ToList();

            EventDto? current = candidatesToday
                .Where(e =>
                {
                    var dt = toDateTime(e);
                    return dt.HasValue && dt.Value <= now;
                })
                .OrderBy(e => toDateTime(e))
                .LastOrDefault();

            EventDto? next = events
                .Where(e =>
                {
                    var dt = toDateTime(e);
                    return dt.HasValue && dt.Value > now;
                })
                .OrderBy(e => toDateTime(e))
                .FirstOrDefault();

            CurrentEvent = current;
            HasCurrentEvent = CurrentEvent != null;
            NextEvent = next;
            HasNextEvent = NextEvent != null;

            // Upcoming list starting after now, take next 5
            var upcoming = events
                .Where(e =>
                {
                    var dt = toDateTime(e);
                    return dt.HasValue && dt.Value >= now;
                })
                .OrderBy(e => toDateTime(e))
                .Take(5)
                .ToList();

            UpcomingEvents.Clear();
            foreach (var ev in upcoming) UpcomingEvents.Add(ev);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load sidebar events: {ex.Message}");
            CurrentEvent = null;
            NextEvent = null;
            UpcomingEvents.Clear();
        }
    }

    // Property change handlers for computed time properties
    partial void OnCurrentEventChanged(EventDto? value)
    {
        OnPropertyChanged(nameof(CurrentEventTimeFormatted));
    }

    partial void OnNextEventChanged(EventDto? value)
    {
        OnPropertyChanged(nameof(NextEventTimeFormatted));
    }

    [RelayCommand]
    private async Task MarkCurrentEventCompleted()
    {
        if (CurrentEvent == null || string.IsNullOrWhiteSpace(CurrentEvent.Id)) return;
        try
        {
            await _apiClient.UpdateEventAsync(CurrentEvent.Id, new UpdateEventDto { Status = "completed" });
            await LoadSidebarEventsAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to complete current event: {ex.Message}");
        }
    }

    [RelayCommand]
    private void ViewMoreEvents()
    {
        DisposeCurrentContent();
        var vm = CreateEventDashboardViewModel();
        vm.PageSize = 5; // paginate by 5 as requested
        CurrentContent = vm;
        CurrentPage = "Events Dashboard";
        CloseUserDropdown();
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

    private void DisposeCurrentContent()
    {
        if (CurrentContent is IDisposable disposable)
        {
            // Clear cache when disposing UserManagementViewModel
            if (disposable is UserManagementViewModel)
            {
                _cachedUserManagementViewModel = null;
            }
            
            // Clear cache when disposing ClassSchedulesViewModel
            if (disposable is ClassSchedulesViewModel)
            {
                _cachedClassSchedulesViewModel = null;
            }
            
            // Clear cache when disposing EventDashboardViewModel
            if (disposable is EventDashboardViewModel)
            {
                _cachedEventDashboardViewModel = null;
            }
            
            // Clear cache when disposing BuildingManagementViewModel
            if (disposable is BuildingManagementViewModel)
            {
                _cachedBuildingManagementViewModel = null;
            }
            
            disposable.Dispose();
        }
    }

    private AdminDashboardViewModel CreateDashboardViewModel() => new(_apiClient, _sseService, _accessToken)
    {
        NavigateToBuildingManagementCommand = NavigateToBuildingManagementCommand,
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
        var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
        CurrentContent = new AlertsViewModel(apiClient);
        CurrentPage = "Alerts";
        CloseUserDropdown();
    }

    [RelayCommand] private void NavigateToDashboard() 
    { 
        DisposeCurrentContent();
        CurrentContent = CreateDashboardViewModel(); 
        CurrentPage = "Dashboard"; 
        CloseUserDropdown(); 
    }
    [RelayCommand] private void NavigateToBuildingManagement() 
    { 
        DisposeCurrentContent();
        CurrentContent = CreateBuildingManagementViewModel(); 
        CurrentPage = "Building Management"; 
        CloseUserDropdown(); 
    }
    [RelayCommand] private void NavigateToClassSchedules() 
    { 
        DisposeCurrentContent();
        CurrentContent = CreateClassSchedulesViewModel(); 
        CurrentPage = "Class Schedules"; 
        CloseUserDropdown(); 
    }
    [RelayCommand] private void NavigateToEventsDashboard() 
    { 
        DisposeCurrentContent();
        CurrentContent = CreateEventDashboardViewModel(); 
        CurrentPage = "Events Dashboard"; 
        CloseUserDropdown(); 
    }
    [RelayCommand] private void NavigateToELibrary() { CurrentContent = new ELibraryManagementViewModel(); CurrentPage = "E-Library Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToUserManagement() 
    { 
        DisposeCurrentContent();
        CurrentContent = CreateUserManagementViewModel(); 
        CurrentPage = "User Management"; 
        CloseUserDropdown(); 
    }
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

    [RelayCommand]
    private async Task Logout()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOGOUT STARTED ===");
            System.Diagnostics.Debug.WriteLine($"MainNavigateTo is null: {MainNavigateTo == null}");
            
            CloseUserDropdown();
            
            // Show confirmation dialog
            // Note: In a real implementation, you would show a proper dialog
            // For now, we'll proceed directly with logout
            
            // Clear all cached ViewModels to free memory
            System.Diagnostics.Debug.WriteLine("Clearing cached ViewModels...");
            _cachedUserManagementViewModel = null;
            _cachedClassSchedulesViewModel = null;
            _cachedEventDashboardViewModel = null;
            _cachedBuildingManagementViewModel = null;
            System.Diagnostics.Debug.WriteLine("Cached ViewModels cleared");
            
            // Reset current content
            System.Diagnostics.Debug.WriteLine("Resetting CurrentContent...");
            CurrentContent = null!;
            System.Diagnostics.Debug.WriteLine("CurrentContent reset");
            
            // Call auth service logout (clears tokens and user data)
            System.Diagnostics.Debug.WriteLine("Calling AuthService.LogoutAsync...");
            var authService = ServiceLocator.Services.GetRequiredService<Services.IAuthService>();
            await authService.LogoutAsync();
            System.Diagnostics.Debug.WriteLine("AuthService.LogoutAsync completed");
            
            // Show success message
            var toastService = ServiceLocator.Services.GetRequiredService<Services.IToastService>();
            toastService.Success("You have been logged out successfully", "Goodbye!");
            
            // Navigate to login screen
            System.Diagnostics.Debug.WriteLine("Creating LoginViewModel...");
            var roleValidationService = ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>();
            var dialogService = ServiceLocator.Services.GetRequiredService<Services.IDialogService>();
            var loginVm = new LoginViewModel(authService, toastService, roleValidationService, dialogService);
            System.Diagnostics.Debug.WriteLine($"LoginViewModel created: {loginVm != null}");
            
            // Set NavigateTo on the new LoginViewModel so it can navigate to AdminShell after login
            loginVm.NavigateTo = MainNavigateTo;
            System.Diagnostics.Debug.WriteLine($"LoginViewModel.NavigateTo set to MainNavigateTo");
            
            System.Diagnostics.Debug.WriteLine($"About to invoke MainNavigateTo with LoginViewModel");
            System.Diagnostics.Debug.WriteLine($"MainNavigateTo is null: {MainNavigateTo == null}");
            
            if (MainNavigateTo != null)
            {
                System.Diagnostics.Debug.WriteLine("Invoking MainNavigateTo...");
                MainNavigateTo.Invoke(loginVm);
                System.Diagnostics.Debug.WriteLine("MainNavigateTo invoked successfully");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("ERROR: MainNavigateTo is NULL - cannot navigate to login!");
            }
            
            System.Diagnostics.Debug.WriteLine("=== LOGOUT COMPLETED ===");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"=== LOGOUT ERROR ===");
            System.Diagnostics.Debug.WriteLine($"Exception: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");
            
            // Even if there's an error, still try to navigate to login
            var authService = ServiceLocator.Services.GetRequiredService<Services.IAuthService>();
            var toastService = ServiceLocator.Services.GetRequiredService<Services.IToastService>();
            var roleValidationService = ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>();
            
            toastService.Warning("Logout completed with warnings", "Warning");
            
            var dialogService = ServiceLocator.Services.GetRequiredService<Services.IDialogService>();
            var loginVm = new LoginViewModel(authService, toastService, roleValidationService, dialogService);
            loginVm.NavigateTo = MainNavigateTo;
            System.Diagnostics.Debug.WriteLine($"Fallback: MainNavigateTo is null: {MainNavigateTo == null}");
            MainNavigateTo?.Invoke(loginVm);
        }
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
        // Return cached instance if exists
        if (_cachedUserManagementViewModel != null)
        {
            // Show loading state briefly for better UX, then clear it immediately
            // since data is already loaded
            _cachedUserManagementViewModel.ShowLoadingState();
            _ = Task.Run(async () =>
            {
                await Task.Delay(100); // Brief visual feedback
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    _cachedUserManagementViewModel.IsLoading = false;
                });
            });
            return _cachedUserManagementViewModel;
        }

        // Create new instance
        var toastService = ServiceLocator.Services.GetRequiredService<Services.IToastService>();
        var dialogService = ServiceLocator.Services.GetRequiredService<Services.IDialogService>();
        var vm = new UserManagementViewModel(_apiClient, toastService, dialogService);
        vm.NavigateTo = innerVm => CurrentContent = innerVm;
        vm.NavigateBack = () => NavigateToDashboard();
        
        // Cache the instance
        _cachedUserManagementViewModel = vm;
        
        return vm;
    }

    private ClassSchedulesViewModel CreateClassSchedulesViewModel()
    {
        // Return cached instance if exists
        if (_cachedClassSchedulesViewModel != null)
        {
            return _cachedClassSchedulesViewModel;
        }

        // Create new instance
        var toastService = ServiceLocator.Services.GetRequiredService<Services.IToastService>();
        var vm = new ClassSchedulesViewModel(_apiClient, toastService);
        vm.NavigateTo = innerVm => CurrentContent = innerVm;
        vm.NavigateBack = () => NavigateToDashboard();
        
        // Cache the instance
        _cachedClassSchedulesViewModel = vm;
        
        return vm;
    }

    private EventDashboardViewModel CreateEventDashboardViewModel()
    {
        // Return cached instance if exists
        if (_cachedEventDashboardViewModel != null)
        {
            return _cachedEventDashboardViewModel;
        }

        // Create new instance
        var vm = new EventDashboardViewModel(_apiClient);
        vm.NavigateTo = innerVm => CurrentContent = innerVm;
        vm.NavigateBack = () => NavigateToDashboard();
        
        // Cache the instance
        _cachedEventDashboardViewModel = vm;
        
        return vm;
    }

    private BuildingManagementViewModel CreateBuildingManagementViewModel()
    {
        if (_cachedBuildingManagementViewModel != null)
        {
            _cachedBuildingManagementViewModel.ShowLoadingState();
            _ = Task.Run(async () =>
            {
                await Task.Delay(100); // Brief visual feedback
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    _cachedBuildingManagementViewModel.IsLoading = false;
                });
            });
            return _cachedBuildingManagementViewModel;
        }

        var vm = new BuildingManagementViewModel(_apiClient);
        vm.NavigateTo = inner => CurrentContent = inner;
        vm.NavigateBack = () => NavigateToDashboard();
        _cachedBuildingManagementViewModel = vm;
        return vm;
    }

    // Existing active-page flags
    public bool IsDashboardActive => CurrentPage == "Dashboard";
    public bool IsBuildingManagementActive => CurrentPage == "Building Management";
    public bool IsClassSchedulesActive => CurrentPage == "Class Schedules";
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
        OnPropertyChanged(nameof(IsBuildingManagementActive));
        OnPropertyChanged(nameof(IsClassSchedulesActive));
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

    public void Dispose()
    {
        _clock?.Stop();
        _metricsApplyTimer?.Stop();
    }
}