using System;
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class TeacherDashboardViewModel : ViewModelBase
{
    // Main Statistics
    [ObservableProperty] private int _myStudents = 180;
    [ObservableProperty] private int _activeClasses = 6;
    [ObservableProperty] private int _pendingAssignments = 24;
    [ObservableProperty] private int _upcomingLessons = 8;
    [ObservableProperty] private int _unreadMessages = 12;
    [ObservableProperty] private int _completedGrading = 156;

    // Performance Metrics
    [ObservableProperty] private double _classAttendanceRate = 96.8;
    [ObservableProperty] private double _assignmentSubmissionRate = 89.3;
    [ObservableProperty] private double _averageGrade = 87.5;
    [ObservableProperty] private double _studentEngagement = 92.1;

    // Schedule Overview
    [ObservableProperty] private int _todayClasses = 4;
    [ObservableProperty] private int _tomorrowClasses = 5;
    [ObservableProperty] private string _nextClass = "Mathematics - Grade 8A";
    [ObservableProperty] private string _nextClassTime = "10:00 AM - 11:30 AM";

    // Weekly Statistics
    [ObservableProperty] private ObservableCollection<WeeklyClassViewModel> _weeklySchedule = default!;

    // Today's Schedule
    [ObservableProperty] private ObservableCollection<DashboardClassViewModel> _todaySchedule = default!;

    // Recent Activity List
    [ObservableProperty] private ObservableCollection<TeacherActivityViewModel> _recentActivities = default!;

    // Student Performance
    [ObservableProperty] private ObservableCollection<StudentPerformanceViewModel> _studentPerformance = default!;

    // Class Statistics
    [ObservableProperty] private ObservableCollection<ClassStatViewModel> _classStatistics = default!;

    // Subject Distribution
    [ObservableProperty] private ObservableCollection<SubjectDistributionViewModel> _subjectDistribution = default!;

    // Quick Action Commands
    public IRelayCommand? NavigateToSchedulePlannerCommand { get; set; }
    public IRelayCommand? NavigateToGradeEntryCommand { get; set; }
    public IRelayCommand? NavigateToStudentManagementCommand { get; set; }
    public IRelayCommand? NavigateToMyAnnouncementsCommand { get; set; } = default!;
    public IRelayCommand? NavigateToMessagingCommand { get; set; }

    // Computed Properties
    public double GradingProgress => PendingAssignments > 0 ? (double)CompletedGrading / (CompletedGrading + PendingAssignments) * 100 : 100;
    public string WelcomeMessage => $"Good {GetTimeOfDay()}, ready to inspire minds today?";

    public TeacherDashboardViewModel()
    {
        InitializeWeeklySchedule();
        InitializeTodaySchedule();
        InitializeRecentActivities();
        InitializeStudentPerformance();
        InitializeClassStatistics();
        InitializeSubjectDistribution();
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

    private void InitializeWeeklySchedule()
    {
        WeeklySchedule = new ObservableCollection<WeeklyClassViewModel>
        {
            new() { Day = "Mon", ClassCount = 4, Students = 120, Hours = "8:00-16:00" },
            new() { Day = "Tue", ClassCount = 5, Students = 150, Hours = "8:00-17:00" },
            new() { Day = "Wed", ClassCount = 4, Students = 120, Hours = "9:00-16:00" },
            new() { Day = "Thu", ClassCount = 6, Students = 180, Hours = "8:00-18:00" },
            new() { Day = "Fri", ClassCount = 4, Students = 120, Hours = "8:00-15:00" },
            new() { Day = "Sat", ClassCount = 2, Students = 60, Hours = "9:00-12:00" },
            new() { Day = "Sun", ClassCount = 0, Students = 0, Hours = "Rest Day" }
        };
    }

    private void InitializeTodaySchedule()
    {
        TodaySchedule = new ObservableCollection<DashboardClassViewModel>
        {
            new() { Subject = "Mathematics", Grade = "Grade 8A", Time = "08:00 - 09:30", Room = "Room 101", StudentsCount = 30, Status = "Completed" },
            new() { Subject = "Science", Grade = "Grade 8B", Time = "10:00 - 11:30", Room = "Room 205", StudentsCount = 28, Status = "Next" },
            new() { Subject = "Mathematics", Grade = "Grade 9A", Time = "13:00 - 14:30", Room = "Room 101", StudentsCount = 32, Status = "Upcoming" },
            new() { Subject = "Science", Grade = "Grade 9B", Time = "15:00 - 16:30", Room = "Room 205", StudentsCount = 29, Status = "Upcoming" }
        };
    }

    private void InitializeRecentActivities()
    {
        RecentActivities = new ObservableCollection<TeacherActivityViewModel>
        {
            new() { Student = "John Smith", Action = "submitted Assignment #3", Subject = "Mathematics", Timestamp = "1hr ago", Icon = "📝", Type = "Submission" },
            new() { Student = "Maria Garcia", Action = "asked question about quadratic equations", Subject = "Mathematics", Timestamp = "2hrs ago", Icon = "❓", Type = "Question" },
            new() { Student = "Anna Lee", Action = "completed Quiz #2 with 95%", Subject = "Science", Timestamp = "3hrs ago", Icon = "✅", Type = "Achievement" },
            new() { Student = "Robert Wilson", Action = "requested grade review", Subject = "Mathematics", Timestamp = "4hrs ago", Icon = "📊", Type = "Review" },
            new() { Student = "Sarah Johnson", Action = "submitted late assignment", Subject = "Science", Timestamp = "5hrs ago", Icon = "⏰", Type = "Late" },
            new() { Student = "David Brown", Action = "joined virtual study group", Subject = "Mathematics", Timestamp = "6hrs ago", Icon = "👥", Type = "Collaboration" }
        };
    }

    private void InitializeStudentPerformance()
    {
        StudentPerformance = new ObservableCollection<StudentPerformanceViewModel>
        {
            new() { Subject = "Mathematics", AverageGrade = 87.5, Improvement = 2.3, IsImproving = true, StudentsCount = 92 },
            new() { Subject = "Science", AverageGrade = 91.2, Improvement = 1.8, IsImproving = true, StudentsCount = 88 },
            new() { Subject = "Physics", AverageGrade = 84.7, Improvement = -0.5, IsImproving = false, StudentsCount = 45 },
            new() { Subject = "Chemistry", AverageGrade = 89.1, Improvement = 3.2, IsImproving = true, StudentsCount = 43 }
        };
    }

    private void InitializeClassStatistics()
    {
        ClassStatistics = new ObservableCollection<ClassStatViewModel>
        {
            new() { ClassName = "Grade 8A - Math", StudentsCount = 30, AttendanceRate = 96.7, AverageGrade = 88.5 },
            new() { ClassName = "Grade 8B - Science", StudentsCount = 28, AttendanceRate = 94.3, AverageGrade = 91.2 },
            new() { ClassName = "Grade 9A - Math", StudentsCount = 32, AttendanceRate = 97.8, AverageGrade = 86.3 },
            new() { ClassName = "Grade 9B - Science", StudentsCount = 29, AttendanceRate = 95.5, AverageGrade = 89.7 },
            new() { ClassName = "Grade 10A - Physics", StudentsCount = 25, AttendanceRate = 92.1, AverageGrade = 84.2 },
            new() { ClassName = "Grade 10B - Chemistry", StudentsCount = 27, AttendanceRate = 96.3, AverageGrade = 90.1 }
        };
    }

    private void InitializeSubjectDistribution()
    {
        SubjectDistribution = new ObservableCollection<SubjectDistributionViewModel>
        {
            new() { Subject = "Mathematics", StudentsCount = 62, Percentage = 34.4, Color = "#3B82F6" },
            new() { Subject = "Science", StudentsCount = 57, Percentage = 31.7, Color = "#10B981" },
            new() { Subject = "Physics", StudentsCount = 25, Percentage = 13.9, Color = "#F59E0B" },
            new() { Subject = "Chemistry", StudentsCount = 27, Percentage = 15.0, Color = "#8B5CF6" },
            new() { Subject = "Advanced Math", StudentsCount = 9, Percentage = 5.0, Color = "#EF4444" }
        };
    }

    [RelayCommand]
    private void RefreshDashboard()
    {
        // TODO: Implement dashboard refresh logic
    }

    [RelayCommand]
    private void ViewAllActivities()
    {
        // TODO: Navigate to activities page
    }

    [RelayCommand]
    private void ViewDetailedReports()
    {
        // TODO: Navigate to detailed reports
    }

    [RelayCommand]
    private void StartClass(DashboardClassViewModel classItem)
    {
        // TODO: Start class session
    }
}

// Supporting ViewModels
public partial class WeeklyClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _day = "";
    [ObservableProperty] private int _classCount;
    [ObservableProperty] private int _students;
    [ObservableProperty] private string _hours = "";
}

public partial class DashboardClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _time = "";
    [ObservableProperty] private string _room = "";
    [ObservableProperty] private int _studentsCount;
    [ObservableProperty] private string _status = "";

    public string StatusColor => Status switch
    {
        "Completed" => "#10B981",
        "Next" => "#F59E0B",
        "Upcoming" => "#6B7280",
        "In Progress" => "#3B82F6",
        _ => "#6B7280"
    };
}

public partial class TeacherActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _student = "";
    [ObservableProperty] private string _action = "";
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private string _icon = "";
    [ObservableProperty] private string _type = "";

    public string TypeColor => Type switch
    {
        "Submission" => "#10B981",
        "Question" => "#3B82F6",
        "Achievement" => "#F59E0B",
        "Review" => "#8B5CF6",
        "Late" => "#EF4444",
        "Collaboration" => "#EC4899",
        _ => "#6B7280"
    };
}

public partial class StudentPerformanceViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private double _averageGrade;
    [ObservableProperty] private double _improvement;
    [ObservableProperty] private bool _isImproving;
    [ObservableProperty] private int _studentsCount;

    public string ImprovementText => $"{(IsImproving ? "+" : "")}{Improvement:F1}%";
    public string ImprovementColor => IsImproving ? "#10B981" : "#EF4444";
}

public partial class ClassStatViewModel : ViewModelBase
{
    [ObservableProperty] private string _className = "";
    [ObservableProperty] private int _studentsCount;
    [ObservableProperty] private double _attendanceRate;
    [ObservableProperty] private double _averageGrade;
}

public partial class SubjectDistributionViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private int _studentsCount;
    [ObservableProperty] private double _percentage;
    [ObservableProperty] private string _color = "";
}