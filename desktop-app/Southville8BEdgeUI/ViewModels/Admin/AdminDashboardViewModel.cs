using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

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

    // Upcoming Events List
    [ObservableProperty] private ObservableCollection<DashboardEventViewModel> _upcomingEvents = default!;

    // Recent Activity List
    [ObservableProperty] private ObservableCollection<DashboardActivityViewModel> _recentActivities = default!;

    // System Alerts
    [ObservableProperty] private ObservableCollection<SystemAlertViewModel> _systemAlerts = default!;

    // Top Performing Metrics
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
    public string SystemStatusColor => SystemUptime > 99.5 ? "#10B981" : SystemUptime > 95 ? "#F59E0B" : "#EF4444";

    public AdminDashboardViewModel()
    {
        InitializeWeeklyStats();
        InitializeUpcomingEvents();
        InitializeRecentActivities();
        InitializeSystemAlerts();
        InitializePerformanceMetrics();
        InitializeGradeDistribution();
    }

    private void InitializeWeeklyStats()
    {
        WeeklyStats = new ObservableCollection<WeeklyStatViewModel>
        {
            new() { Day = "Mon", StudentCount = 1480, EventCount = 3, RoomBookings = 28 },
            new() { Day = "Tue", StudentCount = 1495, EventCount = 2, RoomBookings = 32 },
            new() { Day = "Wed", StudentCount = 1502, EventCount = 4, RoomBookings = 35 },
            new() { Day = "Thu", StudentCount = 1489, EventCount = 1, RoomBookings = 29 },
            new() { Day = "Fri", StudentCount = 1512, EventCount = 5, RoomBookings = 31 },
            new() { Day = "Sat", StudentCount = 892, EventCount = 2, RoomBookings = 15 },
            new() { Day = "Sun", StudentCount = 654, EventCount = 1, RoomBookings = 8 }
        };
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
            new() { User = "System", Action = "automated backup completed successfully", Timestamp = "2m ago", Icon = "💾", Type = "System" },
            new() { User = "Robert Wilson", Action = "approved room booking for 'Room 201'", Timestamp = "5m ago", Icon = "🚪", Type = "Approval" },
            new() { User = "Maria Rodriguez", Action = "created new event 'Science Fair'", Timestamp = "12m ago", Icon = "📅", Type = "Event" },
            new() { User = "System", Action = "registered new student 'Kevin Anderson'", Timestamp = "25m ago", Icon = "👥", Type = "Registration" },
            new() { User = "Jennifer Taylor", Action = "submitted grade reports for Grade 10", Timestamp = "35m ago", Icon = "📊", Type = "Academic" },
            new() { User = "Dr. Michael Brown", Action = "sent message to admin group", Timestamp = "1h ago", Icon = "💬", Type = "Communication" },
            new() { User = "System", Action = "performed scheduled maintenance", Timestamp = "2h ago", Icon = "🔧", Type = "Maintenance" }
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
            new() { Title = "Student Engagement", Value = 92.3, Change = 2.1, IsPositive = true, Icon = "📈" },
            new() { Title = "Class Completion Rate", Value = 96.8, Change = 1.5, IsPositive = true, Icon = "✅" },
            new() { Title = "Resource Utilization", Value = 84.2, Change = -1.2, IsPositive = false, Icon = "📊" },
            new() { Title = "Digital Adoption", Value = 89.7, Change = 4.3, IsPositive = true, Icon = "💻" }
        };
    }

    private void InitializeGradeDistribution()
    {
        GradeDistribution = new ObservableCollection<GradeDistributionViewModel>
        {
            new() { Grade = "Grade 8", StudentCount = 285, Percentage = 18.9, Color = "#3B82F6" },
            new() { Grade = "Grade 9", StudentCount = 298, Percentage = 19.7, Color = "#10B981" },
            new() { Grade = "Grade 10", StudentCount = 312, Percentage = 20.6, Color = "#F59E0B" },
            new() { Grade = "Grade 11", StudentCount = 305, Percentage = 20.2, Color = "#8B5CF6" },
            new() { Grade = "Grade 12", StudentCount = 312, Percentage = 20.6, Color = "#EF4444" }
        };
    }

    [RelayCommand]
    private void RefreshDashboard()
    {
        // TODO: Implement dashboard refresh logic
    }

    [RelayCommand]
    private void ViewAllAlerts()
    {
        // TODO: Navigate to alerts page
    }

    [RelayCommand]
    private void DismissAlert(SystemAlertViewModel alert)
    {
        SystemAlerts.Remove(alert);
    }

    [RelayCommand]
    private void ViewDetailedReports()
    {
        // TODO: Navigate to detailed reports
    }
}

public partial class WeeklyStatViewModel : ViewModelBase
{
    [ObservableProperty] private string _day = "";
    [ObservableProperty] private int _studentCount;
    [ObservableProperty] private int _eventCount;
    [ObservableProperty] private int _roomBookings;
}

public partial class DashboardEventViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _time = "";
    [ObservableProperty] private string _location = "";
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private string _priority = "";

    public string TypeColor => Type switch
    {
        "Competition" => "#8B5CF6",
        "Academic" => "#3B82F6",
        "Holiday" => "#F59E0B",
        "Sports" => "#10B981",
        "Meeting" => "#6B7280",
        _ => "#6B7280"
    };

    public string PriorityColor => Priority switch
    {
        "High" => "#EF4444",
        "Medium" => "#F59E0B",
        "Low" => "#10B981",
        _ => "#6B7280"
    };
}

public partial class DashboardActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _user = "";
    [ObservableProperty] private string _action = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private string _icon = "";
    [ObservableProperty] private string _type = "";

    public string TypeColor => Type switch
    {
        "System" => "#6B7280",
        "Approval" => "#10B981",
        "Event" => "#3B82F6",
        "Registration" => "#8B5CF6",
        "Academic" => "#F59E0B",
        "Communication" => "#EC4899",
        "Maintenance" => "#EF4444",
        _ => "#6B7280"
    };

    // New combined description used in XAML instead of Runs (avoids potential theme re-template issues with inline Runs disappearing)
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

    public string SeverityColor => Severity switch
    {
        "Critical" => "#EF4444",
        "Warning" => "#F59E0B",
        "Info" => "#3B82F6",
        _ => "#6B7280"
    };

    public string SeverityIcon => Severity switch
    {
        "Critical" => "🚨",
        "Warning" => "⚠️",
        "Info" => "ℹ️",
        _ => "📋"
    };
}

public partial class PerformanceMetricViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private double _value;
    [ObservableProperty] private double _change;
    [ObservableProperty] private bool _isPositive;
    [ObservableProperty] private string _icon = "";

    public string ChangeText => $"{(IsPositive ? "+" : "")}{Change:F1}%";
    public string ChangeColor => IsPositive ? "#10B981" : "#EF4444";
}

public partial class GradeDistributionViewModel : ViewModelBase
{
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private int _studentCount;
    [ObservableProperty] private double _percentage;
    [ObservableProperty] private string _color = "";
}