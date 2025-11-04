using Avalonia;
using Avalonia.Media;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq; // added for max calculations
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System.Threading.Tasks;
using Avalonia.Threading;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class TeacherDashboardViewModel : ViewModelBase
{
    // Dependencies
    private readonly IApiClient? _apiClient;
    private readonly string? _teacherId;
    private readonly string? _userId;

    // Cache timestamps
    private DateTime? _lastKpiRefresh;
    private DateTime? _lastAnnouncementsRefresh;
    private DateTime? _lastScheduleRefresh;
    private DateTime? _lastWeeklyScheduleRefresh;
    private DateTime? _lastGradeEntryRefresh;
    private DateTime? _lastSectionsRefresh;
    private DateTime? _lastStudentsRefresh;

    // Refresh state
    private DateTime? _lastRefreshTime;

    // Cache duration (5 minutes)
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    // Refresh cooldown (30 seconds)
    private static readonly TimeSpan RefreshCooldown = TimeSpan.FromSeconds(30);

    // Main Statistics
    [ObservableProperty] private int _myStudents = 180;
    [ObservableProperty] private int _activeClasses = 6;
    [ObservableProperty] private int _upcomingLessons = 8;
    [ObservableProperty] private int _unreadMessages = 12;
    
    // New KPI Statistics
    [ObservableProperty] private int _totalAnnouncements = 0;
    [ObservableProperty] private int _totalSections = 0;

    // Schedule Overview
    [ObservableProperty] private int _todayClasses = 4;
    [ObservableProperty] private int _tomorrowClasses = 5;
    [ObservableProperty] private string _nextClass = "Mathematics - Grade 8A";
    [ObservableProperty] private string _nextClassTime = "10:00 AM - 11:30 AM";

    // Weekly Statistics
    [ObservableProperty] private ObservableCollection<WeeklyClassViewModel> _weeklySchedule = default!;

    // Today's Schedule
    [ObservableProperty] private ObservableCollection<DashboardClassViewModel> _todaySchedule = default!;

    // Students Needing Attention
    [ObservableProperty] private ObservableCollection<StudentAtRiskViewModel> _studentsNeedingAttention = default!;

    // My Announcements
    [ObservableProperty] private ObservableCollection<AnnouncementSummaryViewModel> _myAnnouncements = default!;

    // Grade Entry Quick Access
    [ObservableProperty] private ObservableCollection<GradeEntrySectionViewModel> _gradeEntrySections = default!;

    // My Sections Overview
    [ObservableProperty] private ObservableCollection<SectionOverviewViewModel> _mySections = default!;

    // Refresh state properties
    [ObservableProperty] private bool _isRefreshing;
    [ObservableProperty] private string _lastRefreshText = "Never";
    [ObservableProperty] private bool _canRefresh = true;

    // Quick Action Commands
    public IRelayCommand? NavigateToSchedulePlannerCommand { get; set; }
    public IRelayCommand? NavigateToGradeEntryCommand { get; set; }
    public IRelayCommand? NavigateToStudentManagementCommand { get; set; }
    public IRelayCommand? NavigateToMyAnnouncementsCommand { get; set; } = default!
;
    public IRelayCommand? NavigateToMessagingCommand { get; set; }

    // Computed Properties
    public string WelcomeMessage => $"Good {GetTimeOfDay()}, ready to inspire minds today?";

    public TeacherDashboardViewModel(IApiClient? apiClient = null, string? teacherId = null, string? userId = null)
    {
        _apiClient = apiClient;
        _teacherId = teacherId;
        _userId = userId;

        // Initialize with placeholder items for each day to prevent index out of range errors
        WeeklySchedule = new ObservableCollection<WeeklyClassViewModel>
        {
            new() { Day = "Mon", ClassCount = 0, Students = 0, Hours = "Loading..." },
            new() { Day = "Tue", ClassCount = 0, Students = 0, Hours = "Loading..." },
            new() { Day = "Wed", ClassCount = 0, Students = 0, Hours = "Loading..." },
            new() { Day = "Thu", ClassCount = 0, Students = 0, Hours = "Loading..." },
            new() { Day = "Fri", ClassCount = 0, Students = 0, Hours = "Loading..." },
            new() { Day = "Sat", ClassCount = 0, Students = 0, Hours = "Loading..." },
            new() { Day = "Sun", ClassCount = 0, Students = 0, Hours = "Rest Day" }
        };
        TodaySchedule = new ObservableCollection<DashboardClassViewModel>();
        StudentsNeedingAttention = new ObservableCollection<StudentAtRiskViewModel>();
        InitializeMyAnnouncements();
        GradeEntrySections = new ObservableCollection<GradeEntrySectionViewModel>();
        MySections = new ObservableCollection<SectionOverviewViewModel>();

        // Load real KPI data if API client is available
        if (_apiClient != null && !string.IsNullOrEmpty(_teacherId))
        {
            _ = LoadDashboardKpisAsync(forceRefresh: false);
            _ = LoadMyAnnouncementsAsync(forceRefresh: false);
            _ = LoadWeeklyScheduleAsync(_teacherId, forceRefresh: false);
        }
    }

    private string GetTimeOfDay()
    {
        var hour = DateTime.Now.Hour;
        return hour switch
        {
            < 12 => "morning",
            < 17 => "afternoon",
            _ => "evening"
        };
    }

    // Cache helper methods
    private bool ShouldRefreshCache(DateTime? lastRefresh)
    {
        if (lastRefresh == null) return true;
        return DateTime.Now - lastRefresh.Value > CacheDuration;
    }

    private bool CanRefreshNow()
    {
        if (_lastRefreshTime == null) return true;
        return DateTime.Now - _lastRefreshTime.Value > RefreshCooldown;
    }

    private void UpdateLastRefreshText()
    {
        if (_lastRefreshTime == null)
        {
            LastRefreshText = "Never";
            return;
        }
        
        var elapsed = DateTime.Now - _lastRefreshTime.Value;
        if (elapsed.TotalSeconds < 60)
            LastRefreshText = $"{(int)elapsed.TotalSeconds}s ago";
        else if (elapsed.TotalMinutes < 60)
            LastRefreshText = $"{(int)elapsed.TotalMinutes}m ago";
        else
            LastRefreshText = $"{(int)elapsed.TotalHours}h ago";
    }

    private void InitializeMyAnnouncements()
    {
        MyAnnouncements = new ObservableCollection<AnnouncementSummaryViewModel>();
    }

    private async Task LoadMyAnnouncementsAsync(bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastAnnouncementsRefresh))
        {
            return;
        }

        if (_apiClient == null || string.IsNullOrEmpty(_userId))
        {
            return;
        }

        try
        {
            
            var response = await _apiClient.GetAnnouncementsAsync(
                teacherId: _userId,
                page: 1,
                limit: 5,
                includeExpired: false
            );

            if (response?.Data != null)
            {
                
                var announcements = response.Data.Select(a => new AnnouncementSummaryViewModel
                {
                    Id = a.Id,
                    Title = a.Title,
                    TimeAgo = GetTimeAgo(DateTime.Parse(a.CreatedAt)),
                    ViewsCount = 0, // Views not available in current DTO
                    Status = a.Visibility ?? "public"
                }).ToList();

                Dispatcher.UIThread.Post(() =>
                {
                    MyAnnouncements.Clear();
                    foreach (var ann in announcements)
                    {
                        MyAnnouncements.Add(ann);
                    }
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] Error loading announcements: {ex.Message}");
        }
        finally
        {
            _lastAnnouncementsRefresh = DateTime.Now;
        }
    }

    private string GetTimeAgo(DateTime dateTime)
    {
        var span = DateTime.UtcNow - dateTime.ToUniversalTime();
        if (span.TotalMinutes < 1) return "just now";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
        if (span.TotalDays < 7) return $"{(int)span.TotalDays}d ago";
        if (span.TotalDays < 30) return $"{(int)span.TotalDays / 7}w ago";
        return dateTime.ToString("MMM dd");
    }



    [RelayCommand] 
    private async Task RefreshDashboard()
    {
        if (!CanRefreshNow())
        {
            return;
        }
        
        if (IsRefreshing)
        {
            return;
        }
        
        try
        {
            IsRefreshing = true;
            CanRefresh = false;
            
            
            await ReloadKpisAsync(_teacherId, _userId, forceRefresh: true);
            
            _lastRefreshTime = DateTime.Now;
            UpdateLastRefreshText();
            
            
            // Start cooldown timer
            _ = Task.Run(async () =>
            {
                await Task.Delay(RefreshCooldown);
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    CanRefresh = true;
                    RefreshDashboardCommand.NotifyCanExecuteChanged();
                });
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Refresh failed: {ex.Message}");
        }
        finally
        {
            IsRefreshing = false;
        }
    }
    [RelayCommand] private void ViewAllActivities() { }
    [RelayCommand] private void ViewDetailedReports() { }
    [RelayCommand] private void StartClass(DashboardClassViewModel classItem) { }

    private async Task LoadDashboardKpisAsync(string? teacherId = null, string? userId = null, bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastKpiRefresh))
        {
            return;
        }

        // Use provided IDs or fall back to field values
        var effectiveTeacherId = teacherId ?? _teacherId;
        var effectiveUserId = userId ?? _userId;
        
        if (_apiClient == null || string.IsNullOrEmpty(effectiveTeacherId))
        {
            return;
        }

        try
        {

            // Fetch schedules to count total classes
            var schedulesResponse = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                teacherId: effectiveTeacherId,
                schoolYear: "2024-2025",
                semester: "1st"
            );

            if (schedulesResponse?.Data != null)
            {
                var scheduleCount = schedulesResponse.Data.Count;

                Dispatcher.UIThread.Post(() =>
                {
                    ActiveClasses = scheduleCount;
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No schedules data returned");
            }

            // Fetch sections to count students using generic GET to handle response structure
            var sectionsResponse = await _apiClient.GetAsync<SectionListResponse>("sections?limit=100");

            if (sectionsResponse?.Data != null && !string.IsNullOrEmpty(effectiveUserId))
            {
                
                // Filter sections where teacher_id matches current user
                var teacherSections = sectionsResponse.Data
                    .Where(s => !string.IsNullOrEmpty(s.TeacherId) && s.TeacherId == effectiveUserId)
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
                        System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error fetching students for section {section.Id}: {ex.Message}");
                    }
                }


                Dispatcher.UIThread.Post(() =>
                {
                    MyStudents = totalStudents;
                    TotalSections = teacherSections.Count;
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No sections data returned or userId is null");
            }
            
            // Fetch announcement count
            if (!string.IsNullOrEmpty(effectiveUserId))
            {
                try
                {
                    var announcementStats = await _apiClient.GetAnnouncementStatsAsync(effectiveUserId);
                    if (announcementStats != null)
                    {
                        Dispatcher.UIThread.Post(() =>
                        {
                            TotalAnnouncements = announcementStats.TotalCount;
                        });
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error fetching announcement stats: {ex.Message}");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? ERROR loading dashboard KPIs: {ex.Message}");
        }
        finally
        {
            _lastKpiRefresh = DateTime.Now;
        }
    }
    
    private async Task LoadTodaySchedulesAsync(string? teacherId = null, bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastScheduleRefresh))
        {
            return;
        }

        var effectiveTeacherId = teacherId ?? _teacherId;

        if (_apiClient == null || string.IsNullOrEmpty(effectiveTeacherId))
        {
            return;
        }

        try
        {
            
            // Get today's day of week
            var today = DateTime.Now;
            var dayOfWeek = today.ToString("dddd"); // e.g., "Monday"
            var currentTime = today.TimeOfDay;
            
            
            // Fetch schedules using same endpoint
            var schedulesResponse = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                teacherId: effectiveTeacherId,
                schoolYear: "2024-2025",
                semester: "1st"
            );

            if (schedulesResponse?.Data != null)
            {
                // Filter to today's day of week and order by start time
                var todaySchedules = schedulesResponse.Data
                    .Where(s => s.DayOfWeek?.Equals(dayOfWeek, StringComparison.OrdinalIgnoreCase) == true)
                    .OrderBy(s => s.StartTime)
                    .ToList();
                
                
                // Transform to DashboardClassViewModel
                var dashboardClasses = new List<DashboardClassViewModel>();
                DashboardClassViewModel? nextClass = null;
                
                foreach (var schedule in todaySchedules)
                {
                    var startTime = ParseTime(schedule.StartTime ?? "");
                    var endTime = ParseTime(schedule.EndTime ?? "");
                    
                    // Determine status based on current time
                    string status;
                    if (endTime < currentTime)
                    {
                        status = "Completed";
                    }
                    else if (startTime <= currentTime && currentTime < endTime)
                    {
                        status = "In Progress";
                    }
                    else if (startTime > currentTime && nextClass == null)
                    {
                        status = "Next";
                        nextClass = new DashboardClassViewModel(); // Mark for next class
                    }
                    else
                    {
                        status = "Upcoming";
                    }
                    
                    var classVm = new DashboardClassViewModel
                    {
                        Subject = schedule.Subject?.SubjectName ?? "Unknown Subject",
                        Grade = schedule.Section?.Name ?? schedule.Section?.GradeLevel ?? "Unknown Section",
                        Time = FormatTimeRange(schedule.StartTime, schedule.EndTime),
                        Room = schedule.Room?.RoomNumber != null ? $"Room {schedule.Room.RoomNumber}" : "TBD",
                        StudentsCount = 0, // Will need to fetch from section if needed
                        Status = status
                    };
                    
                    dashboardClasses.Add(classVm);
                }
                
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    TodaySchedule.Clear();
                    foreach (var classVm in dashboardClasses)
                    {
                        TodaySchedule.Add(classVm);
                    }
                    
                    TodayClasses = dashboardClasses.Count;
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No schedules data returned");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error loading today's schedules: {ex.Message}");
        }
        finally
        {
            _lastScheduleRefresh = DateTime.Now;
        }
    }

    // Helper method to parse time string
    private static TimeSpan ParseTime(string timeString)
    {
        if (string.IsNullOrEmpty(timeString))
            return TimeSpan.Zero;

        // Parse "HH:mm:ss" format
        if (timeString.Length >= 5 && TimeSpan.TryParse(timeString.Substring(0, 5), out var time))
            return time;

        return TimeSpan.Zero;
    }

    // Helper method to format time range
    private static string FormatTimeRange(string? startTime, string? endTime)
    {
        if (string.IsNullOrEmpty(startTime) || string.IsNullOrEmpty(endTime))
            return "TBD";
        
        var start = ParseTime(startTime);
        var end = ParseTime(endTime);
        
        return $"{start:hh\\:mm} - {end:hh\\:mm}";
    }
    
    private async Task LoadWeeklyScheduleAsync(string? teacherId = null, bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastWeeklyScheduleRefresh))
        {
            return;
        }

        var effectiveTeacherId = teacherId ?? _teacherId;

        if (_apiClient == null || string.IsNullOrEmpty(effectiveTeacherId))
        {
            return;
        }

        try
        {
            
            // Fetch all schedules for the teacher
            var schedulesResponse = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                teacherId: effectiveTeacherId,
                schoolYear: "2024-2025",
                semester: "1st"
            );

            if (schedulesResponse?.Data != null)
            {
                
                // Group schedules by day of week
                var schedulesByDay = schedulesResponse.Data
                    .GroupBy(s => s.DayOfWeek ?? "Unknown")
                    .ToDictionary(g => g.Key, g => g.ToList());
                
                // Create weekly schedule view models for each day
                var daysOfWeek = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
                var dayAbbreviations = new Dictionary<string, string>
                {
                    { "Monday", "Mon" },
                    { "Tuesday", "Tue" },
                    { "Wednesday", "Wed" },
                    { "Thursday", "Thu" },
                    { "Friday", "Fri" },
                    { "Saturday", "Sat" },
                    { "Sunday", "Sun" }
                };
                
                var weeklySchedule = new List<WeeklyClassViewModel>();
                
                foreach (var day in daysOfWeek)
                {
                    var daySchedules = schedulesByDay.ContainsKey(day) ? schedulesByDay[day] : new List<ScheduleDto>();
                    var classCount = daySchedules.Count;
                    
                    // Count unique students across all sections for this day
                    var uniqueStudentCount = 0;
                    if (daySchedules.Any())
                    {
                        // Fetch student counts for each section in this day's schedules
                        var sectionIds = daySchedules
                            .Select(s => s.SectionId)
                            .Distinct()
                            .Where(id => !string.IsNullOrEmpty(id))
                            .ToList();
                        
                        foreach (var sectionId in sectionIds)
                        {
                            try
                            {
                                var studentsResponse = await _apiClient.GetAsync<StudentListResponse>($"students?sectionId={sectionId}&limit=1000");
                                if (studentsResponse?.Data != null)
                                {
                                    uniqueStudentCount += studentsResponse.Data.Count;
                                }
                            }
                            catch (Exception ex)
                            {
                                System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] Error fetching students for section {sectionId}: {ex.Message}");
                            }
                        }
                    }
                    
                    // Format hours range
                    var hours = "Rest Day";
                    if (daySchedules.Any())
                    {
                        var earliestStart = daySchedules.Min(s => ParseTime(s.StartTime ?? ""));
                        var latestEnd = daySchedules.Max(s => ParseTime(s.EndTime ?? ""));
                        hours = $"{earliestStart:hh\\:mm}-{latestEnd:hh\\:mm}";
                    }
                    
                    weeklySchedule.Add(new WeeklyClassViewModel
                    {
                        Day = dayAbbreviations[day],
                        ClassCount = classCount,
                        Students = uniqueStudentCount,
                        Hours = hours
                    });
                }
                
                // Mark today and peak day for styling
                var todayAbbrev = DateTime.Now.DayOfWeek switch
                {
                    DayOfWeek.Monday => "Mon",
                    DayOfWeek.Tuesday => "Tue",
                    DayOfWeek.Wednesday => "Wed",
                    DayOfWeek.Thursday => "Thu",
                    DayOfWeek.Friday => "Fri",
                    DayOfWeek.Saturday => "Sat",
                    DayOfWeek.Sunday => "Sun",
                    _ => string.Empty
                };

                int maxClasses = weeklySchedule.Max(w => w.ClassCount);
                foreach (var item in weeklySchedule)
                {
                    item.IsToday = item.Day == todayAbbrev;
                    item.IsPeakDay = item.ClassCount == maxClasses && maxClasses > 0;
                }
                
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    // Update existing items instead of clearing to maintain XAML array index bindings
                    for (int i = 0; i < weeklySchedule.Count && i < WeeklySchedule.Count; i++)
                    {
                        WeeklySchedule[i].Day = weeklySchedule[i].Day;
                        WeeklySchedule[i].ClassCount = weeklySchedule[i].ClassCount;
                        WeeklySchedule[i].Students = weeklySchedule[i].Students;
                        WeeklySchedule[i].Hours = weeklySchedule[i].Hours;
                        WeeklySchedule[i].IsToday = weeklySchedule[i].IsToday;
                        WeeklySchedule[i].IsPeakDay = weeklySchedule[i].IsPeakDay;
                        WeeklySchedule[i].UpdateVisualState();
                    }
                    
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No schedules data returned for weekly view");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error loading weekly schedule: {ex.Message}");
        }
        finally
        {
            _lastWeeklyScheduleRefresh = DateTime.Now;
        }
    }
    
    // Public method to reload KPIs (can be called when navigating to dashboard)
    public async Task ReloadKpisAsync(string? teacherId = null, string? userId = null, bool forceRefresh = false)
    {
        
        // Load KPIs using provided IDs or fall back to current ones
        await LoadDashboardKpisAsync(teacherId ?? _teacherId, userId ?? _userId, forceRefresh);
        
        // Load announcements after KPIs are loaded
        _ = LoadMyAnnouncementsAsync(forceRefresh);
        
        // Load today's schedules
        _ = LoadTodaySchedulesAsync(teacherId ?? _teacherId, forceRefresh);
        
        // Load grade entry sections
        _ = LoadGradeEntrySectionsAsync(userId ?? _userId, forceRefresh);
        
        // Load my sections overview
        _ = LoadMySectionsAsync(userId ?? _userId, forceRefresh);
        
        // Load students needing attention
        _ = LoadStudentsNeedingAttentionAsync(userId ?? _userId, forceRefresh);
        
        // Load weekly schedule overview
        _ = LoadWeeklyScheduleAsync(teacherId ?? _teacherId, forceRefresh);
    }
    
    private async Task LoadGradeEntrySectionsAsync(string? userId = null, bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastGradeEntryRefresh))
        {
            return;
        }

        var effectiveUserId = userId ?? _userId;

        if (_apiClient == null || string.IsNullOrEmpty(effectiveUserId))
        {
            return;
        }

        try
        {
            
            // Fetch sections where this teacher is the adviser
            var sectionsResponse = await _apiClient.GetAsync<SectionListResponse>("sections?limit=100");
            
            if (sectionsResponse?.Data != null)
            {
                // Filter sections where teacher_id matches current user
                var teacherSections = sectionsResponse.Data
                    .Where(s => !string.IsNullOrEmpty(s.TeacherId) && s.TeacherId == effectiveUserId)
                    .ToList();
                
                
                var gradeEntrySections = new List<GradeEntrySectionViewModel>();
                
                foreach (var section in teacherSections)
                {
                    // For now, show mock pending/recent counts
                    // In the future, you can fetch actual submission data from the API
                    var random = new Random();
                    var pendingCount = random.Next(0, 15);
                    var recentCount = random.Next(0, 8);
                    
                    var sectionVm = new GradeEntrySectionViewModel
                    {
                        SectionId = section.Id,
                        SectionName = section.Name ?? "Unknown Section",
                        GradeLevel = section.GradeLevel ?? "",
                        PendingSubmissions = pendingCount,
                        RecentSubmissions = recentCount,
                        LastSubmissionTime = recentCount > 0 ? DateTime.Now.AddHours(-random.Next(1, 24)) : (DateTime?)null
                    };
                    
                    gradeEntrySections.Add(sectionVm);
                }
                
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    GradeEntrySections.Clear();
                    foreach (var section in gradeEntrySections)
                    {
                        GradeEntrySections.Add(section);
                    }
                    
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No sections data returned");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error loading grade entry sections: {ex.Message}");
        }
        finally
        {
            _lastGradeEntryRefresh = DateTime.Now;
        }
    }
    
    private async Task LoadMySectionsAsync(string? userId = null, bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastSectionsRefresh))
        {
            return;
        }

        var effectiveUserId = userId ?? _userId;
        
        if (_apiClient == null || string.IsNullOrEmpty(effectiveUserId))
        {
            return;
        }

        try
        {
            
            // Fetch sections where this teacher is assigned
            var sectionsResponse = await _apiClient.GetAsync<SectionListResponse>("sections?limit=100");
            
            if (sectionsResponse?.Data != null)
            {
                // Filter sections where teacher_id matches current user
                var teacherSections = sectionsResponse.Data
                    .Where(s => !string.IsNullOrEmpty(s.TeacherId) && s.TeacherId == effectiveUserId)
                    .ToList();
                
                
                var sectionOverviews = new List<SectionOverviewViewModel>();
                
                foreach (var section in teacherSections)
                {
                    // Fetch student count for this section
                    var studentsResponse = await _apiClient.GetAsync<StudentListResponse>($"students?sectionId={section.Id}&limit=1000");
                    var studentCount = studentsResponse?.Data?.Count ?? 0;
                    
                    var sectionVm = new SectionOverviewViewModel
                    {
                        SectionId = section.Id,
                        SectionName = section.Name ?? "Unknown Section",
                        GradeLevel = section.GradeLevel ?? "",
                        StudentCount = studentCount
                    };
                    
                    sectionOverviews.Add(sectionVm);
                }
                
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    MySections.Clear();
                    foreach (var section in sectionOverviews)
                    {
                        MySections.Add(section);
                    }
                    
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No sections data returned");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error loading my sections: {ex.Message}");
        }
        finally
        {
            _lastSectionsRefresh = DateTime.Now;
        }
    }
    
    private async Task LoadStudentsNeedingAttentionAsync(string? userId = null, bool forceRefresh = false)
    {
        // Check cache unless forcing refresh
        if (!forceRefresh && !ShouldRefreshCache(_lastStudentsRefresh))
        {
            return;
        }

        var effectiveUserId = userId ?? _userId;
        
        if (_apiClient == null || string.IsNullOrEmpty(effectiveUserId))
        {
            return;
        }

        try
        {
            
            // Fetch sections where this teacher is assigned
            var sectionsResponse = await _apiClient.GetAsync<SectionListResponse>("sections?limit=100");
            
            if (sectionsResponse?.Data != null)
            {
                // Filter sections where teacher_id matches current user
                var teacherSections = sectionsResponse.Data
                    .Where(s => !string.IsNullOrEmpty(s.TeacherId) && s.TeacherId == effectiveUserId)
                    .Select(s => s.Id)
                    .ToList();
                
                if (!teacherSections.Any())
                {
                    return;
                }
                
                
                // Fetch all students with GWA from teacher's sections
                var studentsAtRisk = new List<StudentAtRiskViewModel>();
                
                // Fetch GWA list once for all advisory students (only includes advisory section)
                var sectionGwaResponse = await _apiClient.GetAdvisoryStudentsWithGwaAsync("Q1", "2024-2025");
                
                if (sectionGwaResponse?.Students != null)
                {
                    
                    // Filter students with GWA below 80
                    foreach (var studentGwa in sectionGwaResponse.Students)
                    {
                        if (studentGwa.Gwa.HasValue && studentGwa.Gwa < 80) // Students with GWA below 80 need attention
                        {
                            var statusText = studentGwa.Gwa < 75 ? "Failing" : "At Risk";
                            var statusColor = studentGwa.Gwa < 75 ? "DangerBrush" : "WarningBrush";
                            
                            studentsAtRisk.Add(new StudentAtRiskViewModel
                            {
                                StudentId = studentGwa.StudentId,
                                StudentName = studentGwa.StudentName,
                                StudentNumber = studentGwa.StudentNumber,
                                Gwa = studentGwa.Gwa.Value,
                                GradingPeriod = "Q1",
                                HonorStatus = studentGwa.HonorStatus ?? "None",
                                SectionName = sectionGwaResponse.SectionName,
                                StatusText = statusText,
                                StatusColorKey = statusColor
                            });
                        }
                    }
                }
                else
                {
                }
                
                
                // Sort by GWA (lowest first) and take top 6
                var topAtRisk = studentsAtRisk
                    .OrderBy(s => s.Gwa)
                    .Take(6)
                    .ToList();
                
                
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    StudentsNeedingAttention.Clear();
                    foreach (var student in topAtRisk)
                    {
                        StudentsNeedingAttention.Add(student);
                    }
                    
                });
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ? No sections data returned");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ? Error loading students needing attention: {ex.Message}");
        }
        finally
        {
            _lastStudentsRefresh = DateTime.Now;
        }
    }
}

public partial class WeeklyClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _day = "";
    [ObservableProperty] private int _classCount;
    [ObservableProperty] private int _students;
    [ObservableProperty] private string _hours = "";
    [ObservableProperty] private bool _isToday;
    [ObservableProperty] private bool _isPeakDay;
    [ObservableProperty] private IBrush _backgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _textBrush = Brushes.Transparent;

    public bool HasClasses => ClassCount > 0;

    partial void OnClassCountChanged(int value) => OnPropertyChanged(nameof(HasClasses));
    partial void OnIsTodayChanged(bool value) => UpdateVisualState();
    partial void OnIsPeakDayChanged(bool value) => UpdateVisualState();

    private static IBrush Resolve(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    public void UpdateVisualState()
    {
        var success = Resolve("SuccessBrush");
        var infoSoft = Resolve("InfoSoftBrush");
        var accentSoft = Resolve("AccentSoftBrush");
        var accentText = Resolve("AccentTextOnAccentBrush");
        var textPrimary = Resolve("TextPrimaryBrush");

        if (IsToday)
        {
            BackgroundBrush = success;
            TextBrush = accentText;
        }
        else if (IsPeakDay)
        {
            BackgroundBrush = infoSoft;
            TextBrush = textPrimary;
        }
        else
        {
            BackgroundBrush = accentSoft;
            TextBrush = textPrimary;
        }
    }
}

public partial class DashboardClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _time = "";
    [ObservableProperty] private string _room = "";
    [ObservableProperty] private int _studentsCount;
    [ObservableProperty] private string _status = ""; // Completed, Next, Upcoming, In Progress

    public object StatusColor
    {
        get
        {
            var key = Status switch
            {
                "Completed" => "SuccessBrush",
                "Next" => "WarningBrush",
                "Upcoming" => "TextMutedBrush",
                "In Progress" => "InfoBrush",
                _ => "TextMutedBrush"
            };
            var app = Application.Current;
            if (app != null && app.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
                return b;
            return Brushes.Transparent;
        }
    }

    partial void OnStatusChanged(string value) => OnPropertyChanged(nameof(StatusColor));
}

public partial class TeacherActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _student = "";
    [ObservableProperty] private string _action = "";
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private string _icon = ""; // legacy emoji fallback
    [ObservableProperty] private string _type = ""; // Submission, Question, Achievement, Review, Late, Collaboration

    public string Description => string.IsNullOrWhiteSpace(Student) ? Action : string.IsNullOrWhiteSpace(Action) ? Student : $"{Student} {Action}";

    public string IconName => Type switch
    {
        "Submission" => "Send",
        "Question" => "QuestionCircle",
        "Achievement" => "Trophy", // changed from RibbonStar (not rendering) to Trophy
        "Review" => "Search",
        "Late" => "Clock",
        "Collaboration" => "PeopleTeam",
            _ => "Info"
    };

    public IBrush TypeColor
    {
        get
        {
            var key = Type switch
            {
                "Submission" => "SuccessBrush",
                "Question" => "InfoBrush",
                "Achievement" => "WarningBrush",
                "Review" => "AccentBrush",
                "Late" => "DangerBrush",
                "Collaboration" => "AccentBrush",
                _ => "TextMutedBrush"
            };
            var app = Application.Current;
            if (app != null && app.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
                return b;
            return Brushes.Transparent;
        }
    }
}

public partial class StudentAtRiskViewModel : ViewModelBase
{
    [ObservableProperty] private string _studentId = "";
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _studentNumber = "";
    [ObservableProperty] private decimal _gwa;
    [ObservableProperty] private string _gradingPeriod = "";
    [ObservableProperty] private string _honorStatus = "";
    [ObservableProperty] private string _sectionName = "";
    [ObservableProperty] private string _statusText = "";
    [ObservableProperty] private string _statusColorKey = "";
    
    public string GwaText => $"{Gwa:F2}";
    
    public IBrush StatusColor
    {
        get
        {
            if (Application.Current is { } app && app.Resources.TryGetResource(StatusColorKey, app.ActualThemeVariant, out var value) && value is IBrush b)
                return b;
            return Brushes.Transparent;
        }
    }
    
    public IBrush GwaColor => Gwa < 75 ? Resolve("DangerBrush") : Gwa < 80 ? Resolve("WarningBrush") : Resolve("SuccessBrush");
    
    private static IBrush Resolve(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
            return b;
        return Brushes.Transparent;
    }
}

public partial class AnnouncementSummaryViewModel : ViewModelBase
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _timeAgo = "";
    [ObservableProperty] private int _viewsCount = 0;
    [ObservableProperty] private string _status = "public";
    
    public IBrush StatusBrush
    {
        get
        {
            var key = Status switch
            {
                "public" => "SuccessBrush",
                "private" => "WarningBrush",
                _ => "TextMutedBrush"
            };
            var app = Application.Current;
            if (app != null && app.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
                return b;
            return Brushes.Transparent;
        }
    }

    partial void OnStatusChanged(string value) => OnPropertyChanged(nameof(StatusBrush));
}

public partial class ClassStatViewModel : ViewModelBase
{
    [ObservableProperty] private string _className = "";
    [ObservableProperty] private int _studentsCount;
    [ObservableProperty] private double _attendanceRate;
    [ObservableProperty] private double _averageGrade;
}

public partial class SectionOverviewViewModel : ViewModelBase
{
    [ObservableProperty] private string _sectionId = "";
    [ObservableProperty] private string _sectionName = "";
    [ObservableProperty] private string _gradeLevel = "";
    [ObservableProperty] private int _studentCount;
    
    public string StudentCountText => $"{StudentCount} student{(StudentCount != 1 ? "s" : "")}";
}

public partial class GradeEntrySectionViewModel : ViewModelBase
{
    [ObservableProperty] private string _sectionId = "";
    [ObservableProperty] private string _sectionName = "";
    [ObservableProperty] private string _gradeLevel = "";
    [ObservableProperty] private int _pendingSubmissions;
    [ObservableProperty] private int _recentSubmissions;
    [ObservableProperty] private DateTime? _lastSubmissionTime;

    public string LastSubmissionText => LastSubmissionTime.HasValue 
        ? GetTimeAgo(LastSubmissionTime.Value) 
        : "No recent submissions";
    
    public string PendingText => PendingSubmissions > 0 
        ? $"{PendingSubmissions} pending" 
        : "All graded";
    
    public bool HasPending => PendingSubmissions > 0;
    
    private static string GetTimeAgo(DateTime dateTime)
    {
        var span = DateTime.Now - dateTime;
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
        if (span.TotalDays < 7) return $"{(int)span.TotalDays}d ago";
        return dateTime.ToString("MMM dd");
    }
}