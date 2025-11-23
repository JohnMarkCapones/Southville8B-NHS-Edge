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

    // Cached ViewModels for navigation performance
    private SchedulePlannerViewModel? _cachedSchedulePlannerViewModel;
    private GradeEntryViewModel? _cachedGradeEntryViewModel;
    private MyAnnouncementsViewModel? _cachedMyAnnouncementsViewModel;

    [ObservableProperty] private string _userName = "St. Yummy";
    [ObservableProperty] private string _userRole = "Senior Math Teacher";
    [ObservableProperty] private string _userInitials = "SY";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");
    [ObservableProperty] private string _academicYear = "2024-2025"; // Default fallback

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

    [ObservableProperty] private int _totalClasses = 0;
    [ObservableProperty] private int _pendingAssignments = 24;
    [ObservableProperty] private int _totalAnnouncements = 0;
    [ObservableProperty] private int _totalStudents = 0;
    [ObservableProperty] private int _unreadMessages = 0;

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
    [ObservableProperty] private bool _hasCurrentClass = false;
    [ObservableProperty] private bool _hasNextClass = false;

    [ObservableProperty] private ObservableCollection<TodayClassItem> _todayClasses = new();
    private int _currentTodayClassIndex = 0;
    public bool HasMultipleTodayClasses => TodayClasses.Count > 1;
    [ObservableProperty] private TodayClassItem? _currentTodayClass;

    [ObservableProperty] private ObservableCollection<TeacherActivityItem> _recentActivities = new();
    
    [ObservableProperty] private ObservableCollection<AnnouncementSummaryItem> _recentAnnouncements = new();

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

    // Main-level navigation action for app-level navigation (e.g., logout to login)
    public Action<ViewModelBase>? MainNavigateTo { get; set; }

    private DispatcherTimer? _todayClassRotationTimer;
    private readonly bool _enableRotation;
    private readonly bool _enableTimeUpdater;
    private DispatcherTimer? _clock;

    // Services
    private readonly ISseService _sseService;
    private readonly IApiClient _apiClient;
    private readonly ITokenStorageService _tokenStorage;
    private readonly IToastService _toastService;
    private readonly IDialogService _dialogService;
    private string? _userId;
    private string? _teacherId;
    private readonly string? _accessToken;
    private TeacherDashboardViewModel? _dashboardViewModel;

    // Added optional parameters to disable timers for unit tests.
    public TeacherShellViewModel(ISseService sseService, IApiClient apiClient, ITokenStorageService tokenStorage, IToastService toastService, IDialogService dialogService, UserDto? user = null, string? accessToken = null, bool enableRotation = true, bool enableTimeUpdater = true, Action<ViewModelBase>? mainNavigateTo = null)
    {
        _sseService = sseService;
        _apiClient = apiClient;
        _tokenStorage = tokenStorage;
        _toastService = toastService;
        _dialogService = dialogService;
        _accessToken = accessToken;
        _enableRotation = enableRotation;
        _enableTimeUpdater = enableTimeUpdater;
        MainNavigateTo = mainNavigateTo;

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
            _teacherId = user.Teacher?.Id; // Extract teacher ID from user data
            UserEmail = user.Email ?? "teacher@southville.edu.ph";
              UserRole = FormatRoleName(user.Role);
            UserInitials = GetInitialsFromEmail(user.Email);
            
            
            // Fetch full profile asynchronously
            _ = LoadUserProfileAsync();
        }

        // Set the default page to the dashboard
        _currentContent = CreateDashboardViewModel();
        UpdateColumnWidths();

        // Initialize theme without triggering change (skip in unit tests where Application.Current may be null)
        if (Application.Current is not null)
        {
            try
            {
                _isDarkMode = Application.Current.ActualThemeVariant == ThemeVariant.Dark;
                OnPropertyChanged(nameof(IsDarkMode));
            }
            catch
            {
                // Skip theme initialization if not on UI thread (unit tests)
                _isDarkMode = false;
            }
        }

        GenerateCalendarDays();
        
        // Load real data asynchronously
        // Note: LoadTeacherKpisAsync() is called after teacher ID is loaded from profile
        _ = LoadActiveAcademicYearAsync();
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
        _clock?.Stop();
        _clock = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
        _clock.Tick += (_, _) =>
        {
            CurrentDate = DateTime.Now.ToString("MMMM dd, yyyy");
            CurrentTime = DateTime.Now.ToString("hh:mm tt");
        };
        _clock.Start();
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
                    
                    // Extract teacher ID from profile
                    if (profile.Teacher != null && !string.IsNullOrEmpty(profile.Teacher.Id))
                    {
                        _teacherId = profile.Teacher.Id;
                        
                        // Load KPIs now that we have the teacher ID
                        _ = LoadTeacherKpisAsync();
                        
                        // Reload dashboard KPIs if dashboard is currently active
                        if (_dashboardViewModel != null && !string.IsNullOrEmpty(_teacherId))
                        {
                            _ = _dashboardViewModel.ReloadKpisAsync(_teacherId, _userId);
                        }
                        
                        // Load recent announcements
                        _ = LoadRecentAnnouncementsAsync();
                        
                        // Load today's schedule
                        _ = LoadTodaySchedulesAsync();
                    }
                    
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
        System.Diagnostics.Debug.WriteLine($"=== LoadRecentActivitiesAsync called, _userId: {_userId} ===");
        
        if (string.IsNullOrEmpty(_userId))
        {
            System.Diagnostics.Debug.WriteLine("User ID is empty, returning early");
            return;
        }
        
        try
        {
            System.Diagnostics.Debug.WriteLine("Calling GetMyTeacherActivitiesAsync...");
            // Fetch teacher's own activities from teacher_activities table
            var activities = await _apiClient.GetMyTeacherActivitiesAsync(limit: 10);
            
            System.Diagnostics.Debug.WriteLine($"API returned {activities?.Count ?? 0} activities");
            
            if (activities != null && activities.Count > 0)
            {
                System.Diagnostics.Debug.WriteLine($"First activity: {activities[0].Activity}");
                
                Dispatcher.UIThread.Post(() =>
                {
                    RecentActivities.Clear();
                    foreach (var activity in activities)
                    {
                        System.Diagnostics.Debug.WriteLine($"Adding activity: {activity.Activity}");
                        RecentActivities.Add(new TeacherActivityItem
                        {
                            StudentName = activity.StudentName,
                            StudentInitials = activity.StudentInitials,
                            Activity = activity.Activity,
                            TimeAgo = activity.TimeAgo
                        });
                    }
                    System.Diagnostics.Debug.WriteLine($"RecentActivities count: {RecentActivities.Count}");
                });
            }
            else
            {
                // No activities yet
                System.Diagnostics.Debug.WriteLine("No activities found, clearing collection");
                Dispatcher.UIThread.Post(() =>
                {
                    RecentActivities.Clear();
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load recent activities: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");
            // Clear on error
            Dispatcher.UIThread.Post(() =>
            {
                RecentActivities.Clear();
            });
        }
    }

    private async Task LoadTodaySchedulesAsync()
    {
        if (string.IsNullOrEmpty(_teacherId)) return;
        
        try
        {
            
            // Fetch schedules using same endpoint as SchedulePlannerView
            var today = DateTime.Now;
            var dayOfWeek = today.ToString("dddd"); // e.g., "Monday"
            
            var schedulesResponse = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                teacherId: _teacherId,
                schoolYear: "2024-2025",
                semester: "1st"
            );

            if (schedulesResponse?.Data != null)
            {
                // Filter to today's day of week
                var todaySchedules = schedulesResponse.Data
                    .Where(s => s.DayOfWeek?.Equals(dayOfWeek, StringComparison.OrdinalIgnoreCase) == true)
                    .OrderBy(s => s.StartTime)
                    .ToList();
                
                
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    UpdateCurrentAndNextClass(todaySchedules);
                });
            }
            else
            {
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load today's schedules: {ex.Message}");
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

    private void UpdateCurrentAndNextClass(List<ScheduleDto> todaySchedules)
    {
        var now = DateTime.Now.TimeOfDay;
      
        ScheduleDto? currentClass = null;
        ScheduleDto? nextClass = null;
        
        foreach (var schedule in todaySchedules)
        {
  if (schedule == null) continue;
      
       if (!TimeSpan.TryParse(schedule.StartTime, out var startTime) ||
!TimeSpan.TryParse(schedule.EndTime, out var endTime))
         continue;
            
            // Check if class is currently ongoing
            if (now >= startTime && now < endTime)
            {
                currentClass = schedule;
                // Continue to find next class after current
                continue;
            }
            
            // Check if class is upcoming (starts after now)
            if (now < startTime)
            {
                if (currentClass != null)
                {
                    // We have a current class, next upcoming is our next class
                    nextClass = schedule;
                    break;
                }
                else if (nextClass == null)
                {
                    // No current class, this is the first upcoming class
                    nextClass = schedule;
                }
            }
        }
        
        // Update current class display
        if (currentClass != null)
        {
            HasCurrentClass = true;
            CurrentClassSubject = currentClass.Subject?.SubjectName ?? "Unknown Subject";
            CurrentClassGrade = $"{currentClass.Section?.Name ?? "Unknown Section"}";
            
            var startTime = FormatTime(currentClass.StartTime);
            var endTime = FormatTime(currentClass.EndTime);
            CurrentClassTime = $"{startTime} - {endTime}";
            CurrentClassRoom = currentClass.Room?.RoomNumber ?? "TBD";
            
            // Update CurrentTodayClass for display
            CurrentTodayClass = new TodayClassItem
            {
                Subject = CurrentClassSubject,
                Grade = CurrentClassGrade,
                Time = CurrentClassTime,
                Room = CurrentClassRoom
            };
            
        }
        else
        {
            HasCurrentClass = false;
            CurrentClassSubject = "No ongoing class";
            CurrentClassGrade = "";
            CurrentClassTime = "";
            CurrentClassRoom = "";
            CurrentTodayClass = null;
        }
        
        // Update next class display
        if (nextClass != null)
        {
            HasNextClass = true;
            NextClassSubject = $"{nextClass.Subject?.SubjectName ?? "Unknown"} - {nextClass.Section?.Name ?? ""}";
            
            var startTime = FormatTime(nextClass.StartTime);
            var endTime = FormatTime(nextClass.EndTime);
            NextClassTime = $"{startTime} - {endTime}";
            
        }
        else
        {
            HasNextClass = false;
            NextClassSubject = "No upcoming classes";
            NextClassTime = "";
        }
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
        System.Diagnostics.Debug.WriteLine($"[TeacherShellViewModel] SSE metrics updated - Classes: {metrics.TotalClasses}, Announcements: {metrics.TotalAnnouncements}, Students: {metrics.TotalStudents}, Messages: {metrics.UnreadMessages}");
        Dispatcher.UIThread.Post(() =>
        {
            // Update all 4 metrics from SSE for real-time updates
            TotalClasses = metrics.TotalClasses;
            TotalAnnouncements = metrics.TotalAnnouncements;
            TotalStudents = metrics.TotalStudents;
            UnreadMessages = metrics.UnreadMessages;
            System.Diagnostics.Debug.WriteLine($"[TeacherShellViewModel] KPI values after SSE update - TotalAnnouncements: {TotalAnnouncements}");
        });
    }

    private void OnConnectionStatusChanged(object? sender, string status)
    {
    }

    private async Task LoadTeacherKpisAsync()
    {
        if (_apiClient == null || string.IsNullOrEmpty(_teacherId))
        {
            return;
        }

        try
        {
            
            // Fetch schedules to count total classes
            var schedulesResponse = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                teacherId: _teacherId,
                schoolYear: "2024-2025",
                semester: "1st"
            );

            if (schedulesResponse?.Data != null)
            {
                var scheduleCount = schedulesResponse.Data.Count;
                
                Dispatcher.UIThread.Post(() =>
                {
                    TotalClasses = scheduleCount;
                });
            }
            else
            {
            }

            // Fetch sections to count students using generic GET to handle response structure
            var sectionsResponse = await _apiClient.GetAsync<SectionListResponse>("sections?limit=100");
            
            if (sectionsResponse?.Data != null && !string.IsNullOrEmpty(_userId))
            {
                // Filter sections where teacher_id matches current user
                var teacherSections = sectionsResponse.Data
                    .Where(s => !string.IsNullOrEmpty(s.TeacherId) && s.TeacherId == _userId)
                    .ToList();


                // Fetch students for each section
                int totalStudents = 0;
                foreach (var section in teacherSections)
                {
                    try
                    {
                        var endpoint = $"students?sectionId={section.Id}&page=1&limit=100";
                        var response = await _apiClient.GetAsync<StudentListResponse>(endpoint);
                        
                        if (response?.Data != null)
                        {
                            totalStudents += response.Data.Count;
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error fetching students for section {section.Id}: {ex.Message}");
                    }
                }


                Dispatcher.UIThread.Post(() =>
                {
                    TotalStudents = totalStudents;
                });
            }
            else
            {
            }

            // Fetch announcement count
            if (!string.IsNullOrEmpty(_userId))
            {
                try
                {
                    System.Diagnostics.Debug.WriteLine($"[TeacherShellViewModel] Fetching announcement stats for userId: {_userId}");
                    var announcementStats = await _apiClient.GetAnnouncementStatsAsync(_userId);
                    if (announcementStats != null)
                    {
                        System.Diagnostics.Debug.WriteLine($"[TeacherShellViewModel] Announcement stats received - Total: {announcementStats.TotalCount}, Active: {announcementStats.ActiveCount}");
                        Dispatcher.UIThread.Post(() =>
                        {
                            TotalAnnouncements = announcementStats.TotalCount;
                            System.Diagnostics.Debug.WriteLine($"[TeacherShellViewModel] TotalAnnouncements KPI updated to: {TotalAnnouncements}");
                        });
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine("[TeacherShellViewModel] No announcement stats returned from API");
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"[TeacherShellViewModel] Error fetching announcement stats: {ex.Message}");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherShellViewModel] Cannot fetch announcement stats - userId is null or empty");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading teacher KPIs: {ex.Message}");
        }
    }


    private async Task LoadRecentAnnouncementsAsync()
    {
        if (_apiClient == null || string.IsNullOrEmpty(_userId)) return;
        
        try
        {
            
            // Fetch recent announcements (limit 5)
            var endpoint = $"announcements?teacherId={_userId}&page=1&limit=5&sortBy=createdAt&sortOrder=desc";
            var response = await _apiClient.GetAsync<AnnouncementListResponse>(endpoint);
            
            if (response?.Data != null)
            {
                var items = response.Data.Select(a => new AnnouncementSummaryItem
                {
                    Id = a.Id,
                    Title = a.Title,
                    TimeAgo = GetTimeAgo(DateTime.Parse(a.CreatedAt)),
                    Views = 0, // AnnouncementDto doesn't have view count
                    Status = a.Visibility ?? "published"
                }).ToList();
                
                Dispatcher.UIThread.Post(() =>
                {
                    RecentAnnouncements.Clear();
                    foreach (var item in items)
                        RecentAnnouncements.Add(item);
                    
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading announcements: {ex.Message}");
        }
    }

    private string GetTimeAgo(DateTime dateTime)
    {
        var span = DateTime.UtcNow - dateTime;
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
        if (span.TotalDays < 7) return $"{(int)span.TotalDays}d ago";
        return dateTime.ToString("MMM dd");
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
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to store access token: {ex.Message}");
        }
    }

    private async Task LoadActiveAcademicYearAsync()
    {
        try
        {
            var academicYear = await _apiClient.GetActiveAcademicYearAsync();
            if (academicYear != null)
            {
                // Debug: Log the raw DTO values to see what we're getting
                System.Diagnostics.Debug.WriteLine($"AcademicYear DTO received:");
                System.Diagnostics.Debug.WriteLine($"  Id: {academicYear.Id}");
                System.Diagnostics.Debug.WriteLine($"  YearName: {academicYear.YearName}");
                System.Diagnostics.Debug.WriteLine($"  StartDate: {academicYear.StartDate}");
                System.Diagnostics.Debug.WriteLine($"  EndDate: {academicYear.EndDate}");
                System.Diagnostics.Debug.WriteLine($"  IsActive: {academicYear.IsActive}");
                
                var displayName = academicYear.GetDisplayName();
                
                // If GetDisplayName returns "N/A", it means all fields are empty/null
                // In this case, keep the default value instead of showing "N/A"
                if (displayName == "N/A")
                {
                    System.Diagnostics.Debug.WriteLine("AcademicYear DTO has no usable data (all fields null/empty), keeping default value");
                    // Keep the default "2024-2025" value
                }
                else
                {
                    Dispatcher.UIThread.Post(() =>
                    {
                        AcademicYear = displayName;
                        System.Diagnostics.Debug.WriteLine($"Active academic year loaded: {AcademicYear}");
                    });
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("No active academic year found (API returned null), keeping default value");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to load active academic year: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");
            // Keep the default "2024-2025" value on error
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

    private TeacherDashboardViewModel CreateDashboardViewModel()
    {
        _dashboardViewModel = new(_apiClient, _teacherId, _userId)
        {
            NavigateToSchedulePlannerCommand = NavigateToSchedulePlannerCommand,
            NavigateToGradeEntryCommand = NavigateToGradeEntryCommand,
            NavigateToStudentManagementCommand = NavigateToStudentManagementCommand,
            NavigateToMyAnnouncementsCommand = NavigateToMyAnnouncementsCommand,
            NavigateToMessagingCommand = NavigateToMessagingCommand
        };
        return _dashboardViewModel;
    }

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
        if (string.IsNullOrEmpty(_userId))
        {
            return;
        }
        
        CurrentContent = new ProfileViewModel(_apiClient, _userId);
        CurrentPage = "Profile";
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private void NavigateToSettings()
    {
        var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
        var toastService = ServiceLocator.Services.GetRequiredService<IToastService>();
        CurrentContent = new SettingsViewModel(apiClient, toastService);
        CurrentPage = "Settings";
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private void NavigateToNotifications()
    {
        CurrentContent = new NotificationsViewModel(_apiClient);
        CurrentPage = "Notifications";
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private void NavigateToHelpGuide()
    {
        CurrentContent = new Teacher.HelpGuideViewModel();
        CurrentPage = "Help Guide";
        IsUserDropdownVisible = false;
    }

    [RelayCommand]
    private async Task Logout()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== TEACHER LOGOUT STARTED ===");
            System.Diagnostics.Debug.WriteLine($"MainNavigateTo is null: {MainNavigateTo == null}");
            
            CloseUserDropdown();
            
            // Clear cached ViewModels
            System.Diagnostics.Debug.WriteLine("Clearing cached ViewModels...");
            _cachedSchedulePlannerViewModel = null;
            _cachedGradeEntryViewModel = null;
            _cachedMyAnnouncementsViewModel = null;
            _dashboardViewModel = null;
            System.Diagnostics.Debug.WriteLine("Cached ViewModels cleared");
            
            // Reset current content
            System.Diagnostics.Debug.WriteLine("Resetting CurrentContent...");
            CurrentContent = null!;
            System.Diagnostics.Debug.WriteLine("CurrentContent reset");
            
            // Call auth service logout
            System.Diagnostics.Debug.WriteLine("Calling AuthService.LogoutAsync...");
            var authService = ServiceLocator.Services.GetRequiredService<Services.IAuthService>();
            await authService.LogoutAsync();
            System.Diagnostics.Debug.WriteLine("AuthService.LogoutAsync completed");
            
            // Reset theme to Light mode for login screen
            if (Application.Current != null)
            {
                Application.Current.RequestedThemeVariant = ThemeVariant.Light;
                System.Diagnostics.Debug.WriteLine("Theme reset to Light mode");
            }
            
            // Show success message
            _toastService.Success("You have been logged out successfully", "Goodbye!");
            
            // Navigate to login screen
            System.Diagnostics.Debug.WriteLine("Creating LoginViewModel...");
            var roleValidationService = ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>();
            var loginVm = new LoginViewModel(authService, _toastService, roleValidationService, _dialogService);
            System.Diagnostics.Debug.WriteLine($"LoginViewModel created: {loginVm != null}");
            
            if (MainNavigateTo != null)
            {
   loginVm!.NavigateTo = MainNavigateTo;
       System.Diagnostics.Debug.WriteLine($"LoginViewModel.NavigateTo set to MainNavigateTo");
   System.Diagnostics.Debug.WriteLine("Invoking MainNavigateTo...");
   MainNavigateTo.Invoke(loginVm!);
   System.Diagnostics.Debug.WriteLine("MainNavigateTo invoked successfully");
 }
            else
            {
                System.Diagnostics.Debug.WriteLine("ERROR: MainNavigateTo is NULL - cannot navigate to login!");
            }
            
            System.Diagnostics.Debug.WriteLine("=== TEACHER LOGOUT COMPLETED ===");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"=== TEACHER LOGOUT ERROR ===");
            System.Diagnostics.Debug.WriteLine($"Exception: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"StackTrace: {ex.StackTrace}");
            
            var authService = ServiceLocator.Services.GetRequiredService<Services.IAuthService>();
            
            // Reset theme to Light mode for login screen
            if (Application.Current != null)
            {
                Application.Current.RequestedThemeVariant = ThemeVariant.Light;
                System.Diagnostics.Debug.WriteLine("Theme reset to Light mode (fallback path)");
            }
            
            _toastService.Warning("Logout completed with warnings", "Warning");
            
            var roleValidationService = ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>();
            var loginVm = new LoginViewModel(authService, _toastService, roleValidationService, _dialogService);
            
            if (MainNavigateTo != null)
            {
                loginVm.NavigateTo = MainNavigateTo;
                MainNavigateTo.Invoke(loginVm);
            }
        }
    }

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
        
        var dashboard = CreateDashboardViewModel();
        CurrentContent = dashboard;
        CurrentPage = "Dashboard";
        
        // Reload KPIs when navigating to dashboard to ensure fresh data
        if (dashboard != null)
        {
            _ = dashboard.ReloadKpisAsync();
        }
    }

    [RelayCommand]
    private void NavigateToSchedulePlanner()
    {
        
        // Reuse cached instance if available
        if (_cachedSchedulePlannerViewModel == null)
        {
            _cachedSchedulePlannerViewModel = new SchedulePlannerViewModel(_apiClient, _teacherId, _dialogService);
        }
        
        CurrentContent = _cachedSchedulePlannerViewModel;
        CurrentPage = "Schedule Planner";
    }

    [RelayCommand]
    private void NavigateToGradeEntry()
    {
        // Reuse cached instance if available
        if (_cachedGradeEntryViewModel == null)
        {
            _cachedGradeEntryViewModel = new GradeEntryViewModel(_apiClient, _toastService);
        }
        
        CurrentContent = _cachedGradeEntryViewModel;
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
        if (string.IsNullOrEmpty(_userId))
        {
            return;
        }
        
        // Reuse cached instance if available
        if (_cachedMyAnnouncementsViewModel == null)
        {
            _cachedMyAnnouncementsViewModel = new MyAnnouncementsViewModel(_apiClient, _dialogService, _userId);
            _cachedMyAnnouncementsViewModel.NavigateTo = inner => CurrentContent = inner;
        }
        
        CurrentContent = _cachedMyAnnouncementsViewModel;
        CurrentPage = "My Announcements";
    }

    [RelayCommand]
    private void NavigateToMessaging()
    {
        var chatService = ServiceLocator.Services.GetRequiredService<Services.IChatService>();
        var vm = new MessagingViewModel(chatService, _userId);
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
    public bool IsHelpGuideActive => CurrentPage == "Help Guide";

    partial void OnCurrentPageChanged(string value)
    {
        OnPropertyChanged(nameof(IsDashboardActive));
        OnPropertyChanged(nameof(IsSchedulePlannerActive));
        OnPropertyChanged(nameof(IsGradeEntryActive));
        OnPropertyChanged(nameof(IsStudentManagementActive));
        OnPropertyChanged(nameof(IsMyAnnouncementsActive));
        OnPropertyChanged(nameof(IsMessagingActive));
        OnPropertyChanged(nameof(IsHelpGuideActive));
    }

    partial void OnIsLeftSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowLeftSidebarToggle));
    partial void OnIsRightSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowRightSidebarToggle));

    [RelayCommand]
    private void ToggleDarkMode()
    {
        IsDarkMode = !IsDarkMode;
        try
        {
            if (Application.Current is not null)
                Application.Current.RequestedThemeVariant = IsDarkMode ? ThemeVariant.Dark : ThemeVariant.Light;
        }
        catch
        {
            // Skip theme change if not on UI thread (unit tests)
        }
        IsUserDropdownVisible = false;
    }

    private void DisposeCurrentContent()
    {
        if (CurrentContent is IDisposable disposable)
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
            _clock?.Stop();
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

public partial class AnnouncementSummaryItem : ViewModelBase
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _timeAgo = "";
    [ObservableProperty] private int _views = 0;
    [ObservableProperty] private string _status = "published"; // draft, published
}