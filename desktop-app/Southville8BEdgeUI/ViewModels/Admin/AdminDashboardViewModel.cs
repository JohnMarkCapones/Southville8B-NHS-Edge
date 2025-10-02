using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;
using System;
using Avalonia;
using Avalonia.Media;
using Avalonia.Styling;
using Southville8BEdgeUI.Converters;
using Avalonia.Data;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class AdminDashboardViewModel : ViewModelBase
{
    // Main Statistics
    [ObservableProperty] private int _totalStudents = 1512;
    [ObservableProperty] private int _activeTeachers = 45;
    [ObservableProperty] private int _totalStaff = 12;
    [ObservableProperty] private int _upcomingEventsCount = 8;
    [ObservableProperty] private int _availableRoomsCount = 15;
    [ObservableProperty] private int _totalRooms = 36;

    // Performance Metrics
    [ObservableProperty] private double _studentAttendanceRate = 94.2;
    [ObservableProperty] private double _teacherSatisfactionRate = 87.5;
    [ObservableProperty] private double _systemUptime = 99.8;
    [ObservableProperty] private int _onlineUsersCount = 324;

    // Room Status Summary
    [ObservableProperty] private double _roomUtilization = 35.4;
    [ObservableProperty] private int _occupiedRooms = 18;
    [ObservableProperty] private int _roomsInMaintenance = 3;
    [ObservableProperty] private int _roomsBooked = 12;

    // Financial Overview
    [ObservableProperty] private decimal _monthlyRevenue = 245000.00m;
    [ObservableProperty] private decimal _operatingCosts = 180000.00m;
    [ObservableProperty] private decimal _budgetUtilization = 73.5m;

    // Weekly Statistics
    [ObservableProperty] private ObservableCollection<WeeklyStatViewModel> _weeklyStats = default!;
    // Upcoming Events
    [ObservableProperty] private ObservableCollection<DashboardEventViewModel> _upcomingEvents = default!;
    // Recent Activity
    [ObservableProperty] private ObservableCollection<DashboardActivityViewModel> _recentActivities = default!;
    // System Alerts
    [ObservableProperty] private ObservableCollection<SystemAlertViewModel> _systemAlerts = default!;
    // Top Performance Metrics
    [ObservableProperty] private ObservableCollection<PerformanceMetricViewModel> _performanceMetrics = default!;
    // Grade Distribution
    [ObservableProperty] private ObservableCollection<GradeDistributionViewModel> _gradeDistribution = default!;

    // Quick Action Commands
    public IRelayCommand? NavigateToRoomManagementCommand { get; set; }
    public IRelayCommand? NavigateToEventsDashboardCommand { get; set; }
    public IRelayCommand? NavigateToUserManagementCommand { get; set; }
    public IRelayCommand? NavigateToChatCommand { get; set; }
    public IRelayCommand? NavigateToELibraryCommand { get; set; }

    // Computed Properties
    public decimal NetRevenue => MonthlyRevenue - OperatingCosts;
    public double RoomOccupancyRate => TotalRooms > 0 ? (double)OccupiedRooms / TotalRooms * 100 : 0;
    public string SystemStatus => SystemUptime > 99.5 ? "Excellent" : SystemUptime > 95 ? "Good" : "Needs Attention";

    public IBrush SystemStatusBrush => ResolveBrush(
        SystemUptime > 99.5 ? "SuccessBrush" : SystemUptime > 95 ? "WarningBrush" : "DangerBrush",
        "TextPrimaryBrush");

    public AdminDashboardViewModel()
    {
        InitializeWeeklyStats();
        InitializeUpcomingEvents();
        InitializeRecentActivities();
        InitializeSystemAlerts();
        InitializePerformanceMetrics();
        InitializeGradeDistribution();
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
        var stats = new[]
        {
            new WeeklyStatViewModel { Day = "Mon", StudentCount = 1480, EventCount = 3, RoomBookings = 28 },
            new WeeklyStatViewModel { Day = "Tue", StudentCount = 1495, EventCount = 2, RoomBookings = 32 },
            new WeeklyStatViewModel { Day = "Wed", StudentCount = 1502, EventCount = 4, RoomBookings = 35 },
            new WeeklyStatViewModel { Day = "Thu", StudentCount = 1489, EventCount = 1, RoomBookings = 29 },
            new WeeklyStatViewModel { Day = "Fri", StudentCount = 1512, EventCount = 5, RoomBookings = 31 },
            new WeeklyStatViewModel { Day = "Sat", StudentCount = 892, EventCount = 2, RoomBookings = 15 },
            new WeeklyStatViewModel { Day = "Sun", StudentCount = 654, EventCount = 1, RoomBookings = 8 }
        };

        int max = stats.Max(s => s.StudentCount);
        string todayAbbrev = DateTime.Today.DayOfWeek switch
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

        foreach (var item in stats)
        {
            item.IsPeak = item.StudentCount == max;
            item.IsToday = item.Day == todayAbbrev;
            item.IsAboveAverage = item.StudentCount >= 1500;
            item.RefreshTheme();
        }

        WeeklyStats = new ObservableCollection<WeeklyStatViewModel>(stats);
    }

    private void InitializeUpcomingEvents()
    {
        UpcomingEvents = new ObservableCollection<DashboardEventViewModel>
        {
            new() { Title = "Science Fair", Time = "Tomorrow, 9:00 AM", Location = "Gymnasium", Type = "Competition", Priority = "High" },
            new() { Title = "Parent-Teacher Conference", Time = "Mar 15, 3:00 PM", Location = "Main Hall", Type = "Meeting", Priority = "Medium" },
            new() { Title = "Digital Literacy Workshop", Time = "Mar 25, 1:00 PM", Location = "Online", Type = "Academic", Priority = "Low" },
            new() { Title = "Basketball Championship", Time = "Mar 28, 2:00 PM", Location = "Gymnasium", Type = "Sports", Priority = "High" },
            new() { Title = "Spring Break", Time = "Apr 1 - Apr 5", Location = "School Closed", Type = "Holiday", Priority = "Medium" }
        };
    }

    private void InitializeRecentActivities()
    {
        RecentActivities = new ObservableCollection<DashboardActivityViewModel>
        {
            new() { User = "System", Action = "automated backup completed successfully", Timestamp = "2m ago", Icon = "Save", Type = "System" },
            new() { User = "Robert Wilson", Action = "approved room booking for 'Room 201'", Timestamp = "5m ago", Icon = "CheckmarkCircle", Type = "Approval" },
            new() { User = "Maria Rodriguez", Action = "created new event 'Science Fair'", Timestamp = "12m ago", Icon = "Calendar", Type = "Event" },
            new() { User = "System", Action = "registered new student 'Kevin Anderson'", Timestamp = "25m ago", Icon = "PersonAdd", Type = "Registration" },
            new() { User = "Jennifer Taylor", Action = "submitted grade reports for Grade 10", Timestamp = "35m ago", Icon = "ChartMultiple", Type = "Academic" },
            new() { User = "Dr. Michael Brown", Action = "sent message to admin group", Timestamp = "1h ago", Icon = "Chat", Type = "Communication" },
            new() { User = "System", Action = "performed scheduled maintenance", Timestamp = "2h ago", Icon = "Wrench", Type = "Maintenance" }
        };
    }

    private void InitializeSystemAlerts()
    {
        SystemAlerts = new ObservableCollection<SystemAlertViewModel>
        {
            new() { Title = "Server Performance", Message = "High CPU usage detected on main server", Severity = "Warning", Timestamp = "5m ago" },
            new() { Title = "Room Maintenance", Message = "Room 305 requires immediate attention", Severity = "Critical", Timestamp = "1h ago" },
            new() { Title = "Backup Status", Message = "Weekly backup completed successfully", Severity = "Info", Timestamp = "2h ago" },
            new() { Title = "User Limit", Message = "Approaching maximum concurrent users", Severity = "Warning", Timestamp = "3h ago" }
        };
    }

    private void InitializePerformanceMetrics()
    {
        PerformanceMetrics = new ObservableCollection<PerformanceMetricViewModel>
        {
            new() { Title = "Student Engagement", Value = 92.3, Change = 2.1, IsPositive = true, Icon = "ArrowTrendingLines" },
            new() { Title = "Class Completion Rate", Value = 96.8, Change = 1.5, IsPositive = true, Icon = "CheckboxChecked" },
            new() { Title = "Resource Utilization", Value = 84.2, Change = -1.2, IsPositive = false, Icon = "ChartMultiple" },
            new() { Title = "Digital Adoption", Value = 89.7, Change = 4.3, IsPositive = true, Icon = "Desktop" }
        };
    }

    private void InitializeGradeDistribution()
    {
        GradeDistribution = new ObservableCollection<GradeDistributionViewModel>
        {
            new() { Grade = "Grade 8", StudentCount = 285, Percentage = 18.9, ColorKey = "InfoBrush" },
            new() { Grade = "Grade 9", StudentCount = 298, Percentage = 19.7, ColorKey = "SuccessBrush" },
            new() { Grade = "Grade 10", StudentCount = 312, Percentage = 20.6, ColorKey = "WarningBrush" },
            new() { Grade = "Grade 11", StudentCount = 305, Percentage = 20.2, ColorKey = "PurpleBrush" },
            new() { Grade = "Grade 12", StudentCount = 312, Percentage = 20.6, ColorKey = "DangerBrush" }
        };
    }

    [RelayCommand] private void RefreshDashboard() { }
    [RelayCommand] private void ViewAllAlerts() { }
    [RelayCommand] private void DismissAlert(SystemAlertViewModel alert) { SystemAlerts.Remove(alert); }
    [RelayCommand] private void ViewDetailedReports() { }
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

    public string Description => string.IsNullOrWhiteSpace(User) && string.IsNullOrWhiteSpace(Action)
        ? string.Empty
        : string.IsNullOrWhiteSpace(Action) ? User : string.IsNullOrWhiteSpace(User) ? Action : $"{User} {Action}";

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

public partial class PerformanceMetricViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private double _value;
    [ObservableProperty] private double _change;
    [ObservableProperty] private bool _isPositive;
    [ObservableProperty] private string _icon = ""; // Fluent icon name

    public string ChangeText => $"{(IsPositive ? "+" : "")}{Change:F1}%";
    public IBrush ChangeBrush => AdminDashboardViewModel.ResolveBrushStatic(IsPositive ? "SuccessBrush" : "DangerBrush", "TextPrimaryBrush");
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