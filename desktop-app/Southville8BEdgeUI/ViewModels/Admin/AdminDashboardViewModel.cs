using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Avalonia;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.Threading;
using Southville8BEdgeUI.Converters;
using Avalonia.Data;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class AdminDashboardViewModel : ViewModelBase, IDisposable
{
    private readonly IApiClient _apiClient;
    private readonly ISseService _sseService;

    // Main Statistics
    [ObservableProperty] private int _totalStudents = 1512;
    [ObservableProperty] private int _activeTeachers = 45;
    [ObservableProperty] private int _totalSections = 144;
    [ObservableProperty] private int _totalStaff = 12;
    [ObservableProperty] private int _upcomingEventsCount = 8;
    [ObservableProperty] private int _availableRoomsCount = 0;
    [ObservableProperty] private int _totalRooms = 0;

    // Loading and Error States
    [ObservableProperty] private bool _isLoadingMetrics;
    [ObservableProperty] private bool _hasMetricsError;

    // Performance Metrics
    [ObservableProperty] private double _studentAttendanceRate = 94.2;
    [ObservableProperty] private double _teacherSatisfactionRate = 87.5;
    [ObservableProperty] private double _systemUptime = 99.8;
    [ObservableProperty] private int _onlineUsersCount = 324;

    // Room Status Summary
    [ObservableProperty] private double _roomUtilization = 0;
    [ObservableProperty] private int _occupiedRooms = 0;
    [ObservableProperty] private int _roomsInMaintenance = 0;
    [ObservableProperty] private int _roomsBooked = 12;

    // System Overview
    [ObservableProperty] private int _totalBuildings = 0;
    [ObservableProperty] private int _totalDepartments = 0;
    [ObservableProperty] private int _totalUsers = 0;

    // Weekly Statistics
    [ObservableProperty] private ObservableCollection<WeeklyStatViewModel> _weeklyStats = default!;
    // Upcoming Events
    [ObservableProperty] private ObservableCollection<DashboardEventViewModel> _upcomingEvents = default!;
    // Recent Activity
    [ObservableProperty] private ObservableCollection<DashboardActivityViewModel> _recentActivities = default!;
    // System Alerts
    [ObservableProperty] private ObservableCollection<SystemAlertViewModel> _systemAlerts = default!;
    // Admin Metrics
    [ObservableProperty] private ObservableCollection<AdminMetricViewModel> _adminMetrics = default!;
    // Grade Distribution
    [ObservableProperty] private ObservableCollection<GradeDistributionViewModel> _gradeDistribution = default!;

    // Quick Action Commands
    public IRelayCommand? NavigateToBuildingManagementCommand { get; set; }
    public IRelayCommand? NavigateToEventsDashboardCommand { get; set; }
    public IRelayCommand? NavigateToUserManagementCommand { get; set; }
    public IRelayCommand? NavigateToChatCommand { get; set; }
    public IRelayCommand? NavigateToELibraryCommand { get; set; }

    // Computed Properties
    public double RoomOccupancyRate => TotalRooms > 0 ? (double)OccupiedRooms / TotalRooms * 100 : 0;
    public string SystemStatus => SystemUptime > 99.5 ? "Excellent" : SystemUptime > 95 ? "Good" : "Needs Attention";

    public IBrush SystemStatusBrush => ResolveBrush(
        SystemUptime > 99.5 ? "SuccessBrush" : SystemUptime > 95 ? "WarningBrush" : "DangerBrush",
        "TextPrimaryBrush");

    public AdminDashboardViewModel(IApiClient apiClient, ISseService sseService, string? accessToken = null)
    {
        _apiClient = apiClient;
        _sseService = sseService;
        
        // Set access token immediately if provided
        if (!string.IsNullOrEmpty(accessToken))
        {
            _apiClient.SetAccessToken(accessToken);
        }
        
        InitializeWeeklyStats();
        InitializeUpcomingEvents();
        InitializeRecentActivities();
        InitializeSystemAlerts();
        InitializeAdminMetrics();
        InitializeGradeDistribution();
        
        // Subscribe to SSE updates
        SubscribeToDashboardUpdates();
        
        // Load initial metrics
        _ = LoadDashboardMetrics();
    }

    private string FormatEventTime(string date, string time)
    {
        // Format as Today/Tomorrow or MMM d, h:mm tt
        if (!DateTime.TryParse(date, out var d)) return $"{date} {time}";
        if (TimeSpan.TryParse(time, out var ts)) d = d.Date.Add(ts);
        var today = DateTime.Today;
        if (d.Date == today) return $"Today, {d: h:mm tt}".Trim();
        if (d.Date == today.AddDays(1)) return $"Tomorrow, {d: h:mm tt}".Trim();
        return d.ToString("MMM d, h:mm tt");
    }

    private async Task LoadUpcomingEventsAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOADING UPCOMING EVENTS ===");
            
            // Fetch published events (limit higher to account for client-side filtering)
            var response = await _apiClient.GetEventsAsync(page: 1, limit: 20, status: "published");
            var items = new List<DashboardEventViewModel>();
            
            if (response?.Data != null)
            {
                System.Diagnostics.Debug.WriteLine($"Fetched {response.Data.Count} published events");
                
                // Filter for future events only and sort by date
                var upcomingEvents = response.Data
                    .Where(ev => DateTime.TryParse(ev.Date, out var date) && date.Date >= DateTime.Today)
                    .OrderBy(ev => ev.Date)
                    .ThenBy(ev => ev.Time)
                    .Take(5)
                    .ToList();
                
                System.Diagnostics.Debug.WriteLine($"Filtered to {upcomingEvents.Count} upcoming events");
                
                foreach (var ev in upcomingEvents)
                {
                    var type = ev.Tags != null && ev.Tags.Count > 0 ? ev.Tags[0].Name : "General";
                    
                    // Use tag name as priority indicator
                    var priority = "Low"; // Default
                    if (ev.Tags != null && ev.Tags.Count > 0)
                    {
                        priority = ev.Tags[0].Name; // Use first tag name as priority
                    }

                    items.Add(new DashboardEventViewModel
                    {
                        Title = ev.Title,
                        Time = FormatEventTime(ev.Date, ev.Time),
                        Location = string.IsNullOrWhiteSpace(ev.Location) ? "TBA" : ev.Location,
                        Type = type,
                        Priority = "" // No priority indicator
                    });
                }
            }

            Dispatcher.UIThread.Post(() =>
            {
                UpcomingEvents.Clear();
                foreach (var item in items) 
                {
                    UpcomingEvents.Add(item);
                    System.Diagnostics.Debug.WriteLine($"Added event: {item.Title} - {item.Time}");
                }
            });
            
            System.Diagnostics.Debug.WriteLine($"=== LOADED {items.Count} UPCOMING EVENTS ===");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading upcoming events: {ex.Message}");
        }
    }
    private static IBrush ResolveBrush(string key, string fallbackKey)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b)
                return b;
            if (app.TryGetResource(fallbackKey, app.ActualThemeVariant, out var f) && f is IBrush fb)
                return fb;
        }
        return Brushes.Transparent;
    }

    private void InitializeWeeklyStats()
    {
        WeeklyStats = new ObservableCollection<WeeklyStatViewModel>();
    }

    private void InitializeUpcomingEvents()
    {
        // Initialize empty; populated from API in LoadUpcomingEventsAsync
        UpcomingEvents = new ObservableCollection<DashboardEventViewModel>();
    }

    private void InitializeRecentActivities()
    {
        RecentActivities = new ObservableCollection<DashboardActivityViewModel>();
        // Load activities from API
        _ = LoadRecentActivitiesAsync();
    }

    private void InitializeSystemAlerts()
    {
        SystemAlerts = new ObservableCollection<SystemAlertViewModel>();
    }

    private void InitializeAdminMetrics()
    {
        AdminMetrics = new ObservableCollection<AdminMetricViewModel>
        {
            new() { Title = "Active Events", PrimaryValueText = "Loading...", SecondaryText = "", Icon = "Calendar" },
            new() { Title = "Total Schedules", PrimaryValueText = "Loading...", SecondaryText = "", Icon = "CalendarClock" },
            new() { Title = "Avg Class Size", PrimaryValueText = "Loading...", SecondaryText = "", Icon = "People" },
            new() { Title = "Section Coverage", PrimaryValueText = "Loading...", SecondaryText = "", Icon = "ChartMultiple" }
        };
    }

    private void InitializeGradeDistribution()
    {
        // Initialize as empty; will be populated from API in LoadGradeDistributionAsync()
        GradeDistribution = new ObservableCollection<GradeDistributionViewModel>();
    }

    [RelayCommand] 
    private void RefreshDashboard() 
    { 
        _ = LoadDashboardMetrics();
    }
    
    [RelayCommand] private void ViewAllAlerts() { }
    [RelayCommand] private void DismissAlert(SystemAlertViewModel alert) { SystemAlerts.Remove(alert); }
    [RelayCommand] private void ViewDetailedReports() { }

    private async Task LoadDashboardMetrics()
    {
        IsLoadingMetrics = true;
        HasMetricsError = false;
        
        try 
        {
            var metrics = await _apiClient.GetAdminDashboardMetricsAsync();
            if (metrics != null)
            {
                TotalStudents = metrics.TotalStudents;
                ActiveTeachers = metrics.ActiveTeachers;
                TotalSections = metrics.TotalSections;
                OnlineUsersCount = metrics.OnlineUsersCount;
            }

            // Load admin metrics
            await LoadAdminMetricsAsync();
            
            // Load system overview metrics
            await LoadSystemOverviewAsync();

            // Load grade distribution (students by grade 7-10)
            await LoadGradeDistributionAsync();
            
            // Load room status
            await LoadRoomStatusAsync();
            
            // Load upcoming events (top 5)
            await LoadUpcomingEventsAsync();
            
            // Load recent activities
            await LoadRecentActivitiesAsync();

            // Load weekly stats
            await LoadWeeklyStatsAsync();

            // Load system alerts
            await LoadSystemAlertsAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading dashboard metrics: {ex.Message}");
            HasMetricsError = true;
            // Keep existing values as fallback
        }
        finally
        {
            IsLoadingMetrics = false;
        }
    }

    private async Task LoadGradeDistributionAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOADING GRADE DISTRIBUTION ===");
            
            // 1) Try authoritative stats endpoint first
            var dist = await _apiClient.GetStudentDistributionAsync();
            if (dist != null && dist.Grades.Count > 0 && dist.Total > 0)
            {
                System.Diagnostics.Debug.WriteLine($"Authoritative stats found. Total={dist.Total}");

                var colorMap = new Dictionary<string, string>
                {
                    ["Grade 7"] = "InfoBrush",
                    ["Grade 8"] = "SuccessBrush",
                    ["Grade 9"] = "WarningBrush",
                    ["Grade 10"] = "PurpleBrush",
                };

                var total = dist.Total;
                double pct(int c) => total > 0 ? Math.Round((double)c / total * 100, 1) : 0;

                var items = new List<GradeDistributionViewModel>();
                foreach (var g in dist.Grades)
                {
                    if (!colorMap.ContainsKey(g.Grade)) continue;
                    items.Add(new GradeDistributionViewModel
                    {
                        Grade = g.Grade,
                        StudentCount = g.Count,
                        Percentage = pct(g.Count),
                        ColorKey = colorMap[g.Grade]
                    });
                }

                // Keep display order 7..10
                items = items.OrderBy(i => i.Grade).ToList();

                Dispatcher.UIThread.Post(() =>
                {
                    GradeDistribution.Clear();
                    foreach (var item in items)
                        GradeDistribution.Add(item);
                });
                return;
            }

            // 2) Fallback: fetch users and compute client-side
            // Fetch students without relying on role filter; page through results if needed
            var allUsers = new List<UserDto>();
            int page = 1;
            const int pageSize = 200; // smaller pages for reliability
            while (true)
            {
                var resp = await _apiClient.GetUsersAsync(role: null, status: null, page: page, limit: pageSize);
                var users = resp?.Users ?? new List<UserDto>();
                System.Diagnostics.Debug.WriteLine($"Fetched page {page}, count={users.Count}");
                allUsers.AddRange(users);
                var totalPages = resp?.Pagination?.TotalPages ?? 0;
                if (users.Count < pageSize || page >= totalPages || totalPages == 0)
                    break;
                page++;
            }

            // Filter only students by role name
            var students = allUsers.Where(u => string.Equals(u.Role, "Student", StringComparison.OrdinalIgnoreCase)).ToList();
            System.Diagnostics.Debug.WriteLine($"Total users fetched: {allUsers.Count}; Students filtered: {students.Count}");

            // Parse grade level and filter 7-10 only
            var countsByGrade = new Dictionary<int, int> { {7,0},{8,0},{9,0},{10,0} };

            foreach (var s in students)
            {
                var gradeStr = s.GradeLevel ?? "";
                int grade = 0;
                
                if (int.TryParse(gradeStr.Trim(), out grade))
                {
                    // parsed numeric
                }
                else if (gradeStr.StartsWith("Grade", StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart = gradeStr.Substring("Grade".Length).Trim();
                    int.TryParse(numberPart, out grade);
                }
                
                if (grade >= 7 && grade <= 10)
                {
                    countsByGrade[grade]++;
                }
            }
            
            System.Diagnostics.Debug.WriteLine($"Final counts: G7={countsByGrade[7]}, G8={countsByGrade[8]}, G9={countsByGrade[9]}, G10={countsByGrade[10]}");

            var totalFallback = countsByGrade.Values.Sum();
            double pctFallback(int c) => totalFallback > 0 ? Math.Round((double)c / totalFallback * 100, 1) : 0;

            var itemsFallback = new List<GradeDistributionViewModel>
            {
                new() { Grade = "Grade 7", StudentCount = countsByGrade[7], Percentage = pctFallback(countsByGrade[7]), ColorKey = "InfoBrush" },
                new() { Grade = "Grade 8", StudentCount = countsByGrade[8], Percentage = pctFallback(countsByGrade[8]), ColorKey = "SuccessBrush" },
                new() { Grade = "Grade 9", StudentCount = countsByGrade[9], Percentage = pctFallback(countsByGrade[9]), ColorKey = "WarningBrush" },
                new() { Grade = "Grade 10", StudentCount = countsByGrade[10], Percentage = pctFallback(countsByGrade[10]), ColorKey = "PurpleBrush" }
            };

            Dispatcher.UIThread.Post(() =>
            {
                GradeDistribution.Clear();
                foreach (var item in itemsFallback)
                {
                    GradeDistribution.Add(item);
                }
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading grade distribution: {ex.Message}");
            // Keep previous values if any
        }
    }
    
    private async Task LoadSystemOverviewAsync()
    {
        try
        {
            // 1. Total Buildings
            var buildings = await _apiClient.GetBuildingsAsync();
            TotalBuildings = buildings?.Count ?? 0;
            
            // 2. Total Rooms (already have from TotalRooms property, but ensure it's updated)
            var rooms = await _apiClient.GetRoomsAsync();
            if (rooms != null)
            {
                Dispatcher.UIThread.Post(() => TotalRooms = rooms.Count);
            }
            
            // 3. Total Departments
            var departments = await _apiClient.GetDepartmentsAsync();
            TotalDepartments = departments?.Total ?? 0;
            
            // 4. Total Users (Students + Teachers + Staff)
            Dispatcher.UIThread.Post(() => TotalUsers = TotalStudents + ActiveTeachers + TotalStaff);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading system overview: {ex.Message}");
        }
    }

    private async Task LoadRoomStatusAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOADING ROOM STATUS ===");
            
            // Fetch all rooms
            var rooms = await _apiClient.GetRoomsAsync();
            
            if (rooms == null || rooms.Count == 0)
            {
                System.Diagnostics.Debug.WriteLine("No rooms found");
                Dispatcher.UIThread.Post(() =>
                {
                    AvailableRoomsCount = 0;
                    OccupiedRooms = 0;
                    RoomsInMaintenance = 0;
                    RoomUtilization = 0;
                });
                return;
            }
            
            System.Diagnostics.Debug.WriteLine($"Total rooms fetched: {rooms.Count}");
            
            // Aggregate by status
            int available = 0;
            int occupied = 0;
            int maintenance = 0;
            
            foreach (var room in rooms)
            {
                var status = room.Status?.Trim() ?? "";
                switch (status.ToLower())
                {
                    case "available":
                        available++;
                        break;
                    case "occupied":
                        occupied++;
                        break;
                    case "maintenance":
                        maintenance++;
                        break;
                }
            }
            
            System.Diagnostics.Debug.WriteLine($"Room counts - Available: {available}, Occupied: {occupied}, Maintenance: {maintenance}");
            
            // Calculate utilization percentage
            int total = rooms.Count;
            double utilization = total > 0 ? Math.Round((double)occupied / total * 100, 1) : 0;
            
            System.Diagnostics.Debug.WriteLine($"Total rooms: {total}, Utilization: {utilization}%");
            
            // Update properties on UI thread
            Dispatcher.UIThread.Post(() =>
            {
                AvailableRoomsCount = available;
                OccupiedRooms = occupied;
                RoomsInMaintenance = maintenance;
                RoomUtilization = utilization;
            });
            
            System.Diagnostics.Debug.WriteLine("=== ROOM STATUS LOADED ===");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading room status: {ex.Message}");
        }
    }

    private async Task LoadWeeklyStatsAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOADING WEEKLY STATS ===");
            
            // 1. Prepare days
            var days = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
            var shortDays = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
            
            // 2. Fetch Students to calculate section counts
            // We fetch students directly to get accurate enrollment counts per section
            var studentsResp = await _apiClient.GetAsync<StudentListResponse>("students?limit=1000");
            var students = studentsResp?.Data ?? new List<StudentDto>();
            
            var sectionStudentCountMap = students
                .Where(s => !string.IsNullOrEmpty(s.SectionId))
                .GroupBy(s => s.SectionId!)
                .ToDictionary(g => g.Key, g => g.Count());

            // 3. Fetch Events for this week
            var eventsResponse = await _apiClient.GetEventsAsync(page: 1, limit: 100, status: "published");
            var allEvents = eventsResponse?.Data ?? new List<EventDto>();
            
            // Filter events for this week (Mon-Sun)
            var today = DateTime.Today;
            var currentDayOfWeek = (int)today.DayOfWeek;
            var daysFromMonday = currentDayOfWeek == 0 ? 6 : currentDayOfWeek - 1;
            var startOfWeek = today.AddDays(-daysFromMonday);
            var endOfWeek = startOfWeek.AddDays(6);
            
            var eventsByDay = new Dictionary<string, int>();
            foreach (var day in days) eventsByDay[day] = 0;

            foreach (var ev in allEvents)
            {
                if (DateTime.TryParse(ev.Date, out var date))
                {
                    if (date.Date >= startOfWeek && date.Date <= endOfWeek)
                    {
                        eventsByDay[date.DayOfWeek.ToString()]++;
                    }
                }
            }

            // 4. Fetch Schedules for each day
            var tasks = days.Select(async (day, index) => 
            {
                int roomBookings = 0;
                int studentCount = 0;
                
                try 
                {
                    var schedulesResp = await _apiClient.GetSchedulesAsync(limit: 100, dayOfWeek: day);
                    if (schedulesResp?.Data != null)
                    {
                        roomBookings = schedulesResp.Data.Count;
                        studentCount = schedulesResp.Data.Sum(s => sectionStudentCountMap.ContainsKey(s.SectionId) ? sectionStudentCountMap[s.SectionId] : 0);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error fetching schedules for {day}: {ex.Message}");
                }

                return new WeeklyStatViewModel 
                { 
                    Day = shortDays[index], 
                    StudentCount = studentCount, 
                    EventCount = eventsByDay.ContainsKey(day) ? eventsByDay[day] : 0, 
                    RoomBookings = roomBookings 
                };
            });

            var results = await Task.WhenAll(tasks);
            
            // 5. Update UI
            int maxStudents = results.Any() ? results.Max(s => s.StudentCount) : 0;
            double avgStudents = results.Any() ? results.Average(s => s.StudentCount) : 0;
            string todayAbbrev = today.DayOfWeek.ToString().Substring(0, 3);

            foreach (var item in results)
            {
                item.IsPeak = maxStudents > 0 && item.StudentCount == maxStudents;
                item.IsToday = item.Day == todayAbbrev;
                item.IsAboveAverage = item.StudentCount >= avgStudents;
                item.RefreshTheme();
            }

            Dispatcher.UIThread.Post(() =>
            {
                WeeklyStats.Clear();
                foreach (var item in results)
                {
                    WeeklyStats.Add(item);
                }
            });
            
            System.Diagnostics.Debug.WriteLine("=== WEEKLY STATS LOADED ===");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading weekly stats: {ex.Message}");
        }
    }

    private async Task LoadSystemAlertsAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOADING SYSTEM ALERTS ===");
            
            var alertsResp = await _apiClient.GetAlertsAsync(limit: 10);
            var alerts = alertsResp?.Data ?? new List<AlertDto>();
            
            var items = new List<SystemAlertViewModel>();
            foreach (var alert in alerts)
            {
                string severity = (alert.Type?.ToLower() ?? "info") switch
                {
                    "error" => "Critical",
                    "warning" => "Warning",
                    "success" => "Success",
                    "info" => "Info",
                    "system" => "Info",
                    _ => "Info"
                };
                
                var diff = DateTimeOffset.UtcNow - alert.CreatedAt;
                string timeAgo;
                if (diff.TotalMinutes < 60) timeAgo = $"{(int)diff.TotalMinutes}m ago";
                else if (diff.TotalHours < 24) timeAgo = $"{(int)diff.TotalHours}h ago";
                else timeAgo = $"{(int)diff.TotalDays}d ago";

                items.Add(new SystemAlertViewModel
                {
                    Title = alert.Title,
                    Message = alert.Message,
                    Severity = severity,
                    Timestamp = timeAgo
                });
            }
            
            Dispatcher.UIThread.Post(() =>
            {
                SystemAlerts.Clear();
                foreach (var item in items)
                {
                    SystemAlerts.Add(item);
                }
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading system alerts: {ex.Message}");
        }
    }

    private async Task LoadAdminMetricsAsync()
    {
        try
        {
            // 1. Active Events (upcoming/ongoing events)
            var eventsResponse = await _apiClient.GetEventsAsync(page: 1, limit: 100, status: "upcoming");
            int activeEventsCount = 0;
            if (eventsResponse?.Data != null)
            {
                activeEventsCount = eventsResponse.Data.Count(e => e.Status == "upcoming" || e.Status == "ongoing");
            }
            
            // 2. Total Schedules
            var schedulesResponse = await _apiClient.GetSchedulesAsync(page: 1, limit: 100);
            int totalSchedules = 0;
            if (schedulesResponse?.Data != null)
            {
                totalSchedules = schedulesResponse.Data.Count;
            }

            // 3. Average Class Size (calculated from existing metrics)
            double avgClassSize = TotalSections > 0 ? (double)TotalStudents / TotalSections : 0;

            // 4. Section Coverage (sections with schedules / total sections)
            double sectionCoverage = 0;
            if (schedulesResponse?.Data != null && TotalSections > 0)
            {
                var uniqueSectionsWithSchedules = schedulesResponse.Data.Select(s => s.SectionId).Distinct().Count();
                sectionCoverage = Math.Round((double)uniqueSectionsWithSchedules / TotalSections * 100, 1);
            }

            // Update AdminMetrics collection
            Dispatcher.UIThread.Post(() =>
            {
                if (AdminMetrics.Count >= 4)
                {
                    AdminMetrics[0].PrimaryValueText = $"{activeEventsCount} Events";
                    AdminMetrics[1].PrimaryValueText = $"{totalSchedules} Classes";
                    AdminMetrics[2].PrimaryValueText = $"{avgClassSize:F0} Students";
                    AdminMetrics[3].PrimaryValueText = $"{sectionCoverage:F1}%";
                    
                    // Optional: Add secondary text
                    AdminMetrics[0].SecondaryText = activeEventsCount > 0 ? "Active" : "None scheduled";
                    AdminMetrics[1].SecondaryText = totalSchedules > 0 ? "Scheduled" : "No schedules";
                }
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading admin metrics: {ex.Message}");
            Dispatcher.UIThread.Post(() =>
            {
                if (AdminMetrics.Count >= 4)
                {
                    AdminMetrics[0].PrimaryValueText = "N/A";
                    AdminMetrics[1].PrimaryValueText = "N/A";
                    AdminMetrics[2].PrimaryValueText = "N/A";
                    AdminMetrics[3].PrimaryValueText = "N/A";
                }
            });
        }
    }

    private async Task LoadRecentActivitiesAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== LOADING RECENT ACTIVITIES ===");
            
            var activities = await _apiClient.GetAdminActivitiesAsync(limit: 10);
            
            if (activities != null && activities.Count > 0)
            {
                System.Diagnostics.Debug.WriteLine($"Fetched {activities.Count} activities");
                
                var activityViewModels = activities.Select(activity =>
                {
                    // Parse the timestamp and calculate relative time
                    DateTime createdAt = DateTime.UtcNow;
                    if (DateTime.TryParse(activity.CreatedAt, out var parsedDate))
                    {
                        createdAt = parsedDate.ToUniversalTime();
                    }
                    
                    var diff = DateTime.UtcNow - createdAt;
                    string timestamp;
                    if (diff.TotalMinutes < 60)
                        timestamp = $"{(int)diff.TotalMinutes}m ago";
                    else if (diff.TotalHours < 24)
                        timestamp = $"{(int)diff.TotalHours}h ago";
                    else
                        timestamp = $"{(int)diff.TotalDays}d ago";
                    
                    // Map action_type to Type for color coding
                    string type = activity.ActionType switch
                    {
                        "system_backup" or "system_maintenance" or "system_update" => "System",
                        "room_booking_approved" or "news_approved" or "schedule_approved" => "Approval",
                        "event_created" or "event_updated" or "event_deleted" => "Event",
                        "student_registered" or "user_created" => "Registration",
                        "grade_entered" or "grade_updated" => "Academic",
                        "message_sent" or "announcement_created" => "Communication",
                        _ => "System"
                    };
                    
                    // Map icon names from database to Avalonia FluentIcons
                    string icon = activity.Icon ?? "Info";
                    icon = icon switch
                    {
                        "Database" => "DatabaseRegular",
                        "CheckCircle" => "CheckmarkCircleRegular",
                        "Calendar" => "CalendarRegular",
                        "UserPlus" => "PersonAddRegular",
                        "FileText" => "DocumentRegular",
                        "MessageCircle" => "ChatRegular",
                        "Tool" => "WrenchRegular",
                        _ => icon
                    };
                    
                    // User name comes from API, description is the full action text
                    var user = activity.UserName ?? "System";
                    var action = activity.Description;
                    
                    return new DashboardActivityViewModel
                    {
                        User = user,
                        Action = action,
                        Timestamp = timestamp,
                        Icon = icon,
                        Type = type
                    };
                }).ToList();
                
                Dispatcher.UIThread.Post(() =>
                {
                    RecentActivities.Clear();
                    foreach (var vm in activityViewModels)
                    {
                        RecentActivities.Add(vm);
                    }
                });
                
                System.Diagnostics.Debug.WriteLine("=== RECENT ACTIVITIES LOADED ===");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("No activities returned from API");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading recent activities: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
        }
    }

    private void SubscribeToDashboardUpdates()
    {
        _sseService.DashboardMetricsUpdated += OnDashboardMetricsUpdated;
    }

    private void OnDashboardMetricsUpdated(object? sender, AdminDashboardMetrics metrics)
    {
        // Marshal property updates to UI thread to avoid cross-thread binding exceptions
        Dispatcher.UIThread.Post(() =>
        {
            TotalStudents = metrics.TotalStudents;
            ActiveTeachers = metrics.ActiveTeachers;
            TotalSections = metrics.TotalSections;
            OnlineUsersCount = metrics.OnlineUsersCount;
        });
    }

    public void Dispose()
    {
        // Unsubscribe from SSE events to prevent memory leaks
        if (_sseService != null)
        {
            _sseService.DashboardMetricsUpdated -= OnDashboardMetricsUpdated;
        }
    }
}

public partial class WeeklyStatViewModel : ViewModelBase
{
    [ObservableProperty] private string _day = "";
    [ObservableProperty] private int _studentCount;
    [ObservableProperty] private int _eventCount;
    [ObservableProperty] private int _roomBookings;

    public bool IsPeak { get; set; }
    public bool IsToday { get; set; }
    public bool IsAboveAverage { get; set; }

    private static IBrush Resolve(string key, string fallbackKey)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallbackKey, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush BackgroundBrush
    {
        get
        {
            if (IsPeak) return Resolve("InfoSoftBrush", "GraySoftBrush");
            if (IsToday || IsAboveAverage) return Resolve("TealSoftBrush", "SuccessSoftBrush");
            return Resolve("GraySoftBrush", "AccentSoftBrush");
        }
    }

    public IBrush StudentsLabelBrush
    {
        get
        {
            if (IsPeak) return Resolve("InfoBrush", "TextMutedBrush");
            if (IsToday || IsAboveAverage) return Resolve("SuccessBrush", "TextMutedBrush");
            return Resolve("TextMutedBrush", "TextSecondaryBrush");
        }
    }

    public void RefreshTheme()
    {
        OnPropertyChanged(nameof(BackgroundBrush));
        OnPropertyChanged(nameof(StudentsLabelBrush));
    }
}

public partial class DashboardEventViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _time = "";
    [ObservableProperty] private string _location = "";
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private string _priority = "";

    private static IBrush RB(string key) => AdminDashboardViewModel.ResolveBrushStatic(key, "TextMutedBrush");

    // Use generated properties (Type / Priority) instead of backing fields to avoid MVVMTK0034
    public IBrush TypeBrush => Type switch
    {
        "Competition" => RB("PurpleBrush"),
        "Academic" => RB("IndigoBrush"),
        "Holiday" => RB("WarningBrush"),
        "Sports" => RB("SuccessBrush"),
        "Meeting" => RB("GrayButtonBrush"),
        _ => RB("TextMutedBrush")
    };

    public IBrush PriorityBrush => Priority switch
    {
        "High" => RB("DangerBrush"),
        "Medium" => RB("WarningBrush"),
        "Low" => RB("SuccessBrush"),
        _ => RB("TextMutedBrush")
    };
}

public partial class DashboardActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _user = "";
    [ObservableProperty] private string _action = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private string _icon = ""; // Fluent icon name
    [ObservableProperty] private string _type = "";

    private static IBrush RB(string key) => AdminDashboardViewModel.ResolveBrushStatic(key, "TextMutedBrush");

    // Use generated Type property
    public IBrush TypeBrush => Type switch
    {
        "System" => RB("GrayButtonBrush"),
        "Approval" => RB("SuccessBrush"),
        "Event" => RB("InfoBrush"),
        "Registration" => RB("PurpleBrush"),
        "Academic" => RB("WarningBrush"),
        "Communication" => RB("PinkBrush"),
        "Maintenance" => RB("DangerBrush"),
        _ => RB("TextMutedBrush")
    };

    // Just return the action description directly
    public string Description => Action;

    partial void OnUserChanged(string value) => OnPropertyChanged(nameof(Description));
    partial void OnActionChanged(string value) => OnPropertyChanged(nameof(Description));
}

public partial class SystemAlertViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _message = "";
    [ObservableProperty] private string _severity = "";
    [ObservableProperty] private string _timestamp = "";

    private static IBrush RB(string key) => AdminDashboardViewModel.ResolveBrushStatic(key, "TextMutedBrush");

    // Use generated Severity property
    public IBrush SeverityBrush => Severity switch
    {
        "Critical" => RB("DangerBrush"),
        "Warning" => RB("WarningBrush"),
        "Info" => RB("InfoBrush"),
        _ => RB("GrayButtonBrush")
    };

    // Fluent icon name instead of emoji
    public string SeverityIcon => Severity switch
    {
        "Critical" => "ErrorCircle",
        "Warning" => "Warning",
        "Info" => "Info",
        _ => "Info"
    };
}

public partial class AdminMetricViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _primaryValueText = "";
    [ObservableProperty] private string _secondaryText = "";
    [ObservableProperty] private string _icon = ""; // Fluent icon name
}

public partial class GradeDistributionViewModel : ViewModelBase
{
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private int _studentCount;
    [ObservableProperty] private double _percentage;
    [ObservableProperty] private string _colorKey = "";

    public IBrush ColorBrush => AdminDashboardViewModel.ResolveBrushStatic(ColorKey, "AccentBrush");

    // Notify dependent brush when the key changes
    partial void OnColorKeyChanged(string value) => OnPropertyChanged(nameof(ColorBrush));
}

public partial class DetailedEventViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _description = "";
    [ObservableProperty] private DateTime _startTime;
    [ObservableProperty] private DateTime _endTime;
    [ObservableProperty] private string _location = "";
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private int _attendeeCount;

    public string TimeRange => $"{StartTime:MMM dd, hh:mm tt} - {EndTime:hh:mm tt}";
    public string StatusText => Status switch
    {
        "upcoming" => "Upcoming",
        "ongoing" => "Ongoing", 
        "completed" => "Completed",
        "cancelled" => "Cancelled",
        _ => Status
    };

    public IBrush StatusBrush => Status switch
    {
        "upcoming" => AdminDashboardViewModel.ResolveBrushStatic("InfoBrush", "TextPrimaryBrush"),
        "ongoing" => AdminDashboardViewModel.ResolveBrushStatic("SuccessBrush", "TextPrimaryBrush"),
        "completed" => AdminDashboardViewModel.ResolveBrushStatic("TextMutedBrush", "TextPrimaryBrush"),
        "cancelled" => AdminDashboardViewModel.ResolveBrushStatic("DangerBrush", "TextPrimaryBrush"),
        _ => AdminDashboardViewModel.ResolveBrushStatic("TextMutedBrush", "TextPrimaryBrush")
    };

    partial void OnStartTimeChanged(DateTime value) => OnPropertyChanged(nameof(TimeRange));
    partial void OnEndTimeChanged(DateTime value) => OnPropertyChanged(nameof(TimeRange));
    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(StatusText));
        OnPropertyChanged(nameof(StatusBrush));
    }
}

public partial class RecentActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _user = "";
    [ObservableProperty] private string _action = "";
    [ObservableProperty] private string _target = "";
    [ObservableProperty] private DateTime _timestamp;
    [ObservableProperty] private string _type = "";

    public string TimeAgo
    {
        get
        {
            var diff = DateTime.Now - Timestamp;
            if (diff.TotalMinutes < 60)
                return $"{(int)diff.TotalMinutes}m ago";
            if (diff.TotalHours < 24)
                return $"{(int)diff.TotalHours}h ago";
            return $"{(int)diff.TotalDays}d ago";
        }
    }

    public string Description => $"{User} {Action} {Target}";
    public string IconName => Type switch
    {
        "user" => "Person",
        "system" => "Settings",
        "security" => "Shield",
        "data" => "Database",
        _ => "Info"
    };

    partial void OnTimestampChanged(DateTime value) => OnPropertyChanged(nameof(TimeAgo));
    partial void OnUserChanged(string value) => OnPropertyChanged(nameof(Description));
    partial void OnActionChanged(string value) => OnPropertyChanged(nameof(Description));
    partial void OnTargetChanged(string value) => OnPropertyChanged(nameof(Description));
}

// Static helper for nested VM brush resolution
partial class AdminDashboardViewModel
{
    internal static IBrush ResolveBrushStatic(string key, string fallbackKey)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b)
                return b;
            if (app.TryGetResource(fallbackKey, app.ActualThemeVariant, out var f) && f is IBrush fb)
                return fb;
        }
        return Brushes.Transparent;
    }
}