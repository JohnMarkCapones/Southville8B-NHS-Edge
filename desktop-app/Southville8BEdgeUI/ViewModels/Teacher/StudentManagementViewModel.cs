using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Globalization;
using Avalonia; // For Application.Current
using Avalonia.Media; // For IBrush
using Avalonia.Styling; // For theme variant

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class StudentManagementViewModel : ViewModelBase
{
    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private int _totalStudentsCount = 180;
    [ObservableProperty] private int _presentTodayCount = 172;
    [ObservableProperty] private int _absentTodayCount = 8;
    [ObservableProperty] private double _averagePerformance = 87.5;
    [ObservableProperty] private double _attendanceRate = 95.6;
    [ObservableProperty] private string _selectedClass = "";
    [ObservableProperty] private ObservableCollection<string> _classes = new();
    [ObservableProperty] private ObservableCollection<StudentInfoViewModel> _students = new();
    [ObservableProperty] private ObservableCollection<StudentInfoViewModel> _filteredStudents = new();
    [ObservableProperty] private StudentInfoViewModel? _selectedStudent;

    public StudentManagementViewModel()
    {
        InitializeData();
        FilteredStudents = new ObservableCollection<StudentInfoViewModel>(Students);
    }

    partial void OnSearchTextChanged(string value)
    {
        FilterStudents();
    }

    private void FilterStudents()
    {
        var filtered = string.IsNullOrEmpty(SearchText)
            ? Students
            : Students.Where(s => s.FullName.Contains(SearchText, StringComparison.OrdinalIgnoreCase));

        FilteredStudents.Clear();
        foreach (var student in filtered)
        {
            FilteredStudents.Add(student);
        }
    }

    private void InitializeData()
    {
        Classes = new ObservableCollection<string> { "All Classes", "Grade 8A", "Grade 8B", "Grade 9A" };
        SelectedClass = Classes[0];

        Students = new ObservableCollection<StudentInfoViewModel>
        {
            new() { FullName = "John Smith", StudentId = "2024001", AttendanceStatus = "Present", CurrentGrade = 88.5, AttendanceRate = 96.7, AssignmentsCompleted = 8, TotalAssignments = 10 },
            new() { FullName = "Maria Garcia", StudentId = "2024002", AttendanceStatus = "Present", CurrentGrade = 92.1, AttendanceRate = 98.2, AssignmentsCompleted = 10, TotalAssignments = 10 },
            new() { FullName = "Robert Wilson", StudentId = "2024003", AttendanceStatus = "Absent", CurrentGrade = 75.3, AttendanceRate = 89.1, AssignmentsCompleted = 6, TotalAssignments = 10 }
        };
    }

    [RelayCommand] private void GenerateReport() { }
    [RelayCommand] private void ViewStudentDetails(StudentInfoViewModel student) { SelectedStudent = student; }
    [RelayCommand] private void EditStudent(StudentInfoViewModel student) { }
    [RelayCommand] private void ContactParent(StudentInfoViewModel student) { }
    [RelayCommand] private void SendMessage() { }
    [RelayCommand] private void AddNote() { }
}

public partial class StudentInfoViewModel : ViewModelBase
{
    [ObservableProperty] private string _fullName = "";
    [ObservableProperty] private string _studentId = "";
    [ObservableProperty] private string _attendanceStatus = "";
    [ObservableProperty] private double _currentGrade;
    [ObservableProperty] private double _attendanceRate;
    [ObservableProperty] private int _assignmentsCompleted;
    [ObservableProperty] private int _totalAssignments;
    [ObservableProperty] private string _lastLogin = "2 hours ago";
    [ObservableProperty] private ObservableCollection<StudentActivityViewModel> _recentActivities = new();

    [ObservableProperty] private IBrush _attendanceStatusBackgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _attendanceStatusTextBrush = Brushes.Transparent;

    public string Initials => string.Concat(FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                                .Where(p => p.Length > 0)
                                                .Select(p => char.ToUpperInvariant(p[0])));

    public StudentInfoViewModel()
    {
        RecentActivities = new ObservableCollection<StudentActivityViewModel>
        {
            new() { Activity = "Submitted Assignment #3", Timestamp = "1 hour ago" },
            new() { Activity = "Completed Quiz #2", Timestamp = "3 hours ago" }
        };
        UpdateAttendanceBrushes();
        // React to theme changes so badge updates appropriately
        if (Application.Current is { } app)
            app.ActualThemeVariantChanged += (_, __) => UpdateAttendanceBrushes();
    }

    partial void OnFullNameChanged(string value) => OnPropertyChanged(nameof(Initials));
    partial void OnAttendanceStatusChanged(string value) => UpdateAttendanceBrushes();

    private static IBrush ResolveBrush(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var val) && val is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    private void UpdateAttendanceBrushes()
    {
        var success = ResolveBrush("SuccessBrush");
        var danger = ResolveBrush("DangerBrush");
        var successSoft = ResolveBrush("SuccessSoftBrush");
        var dangerSoft = ResolveBrush("DangerSoftBrush");
        var textPrimary = ResolveBrush("TextPrimaryBrush");

        if (string.Equals(AttendanceStatus, "Present", StringComparison.OrdinalIgnoreCase))
        {
            AttendanceStatusBackgroundBrush = successSoft;
            AttendanceStatusTextBrush = success;
        }
        else if (string.Equals(AttendanceStatus, "Absent", StringComparison.OrdinalIgnoreCase))
        {
            AttendanceStatusBackgroundBrush = dangerSoft;
            AttendanceStatusTextBrush = danger;
        }
        else
        {
            AttendanceStatusBackgroundBrush = ResolveBrush("AccentSoftBrush");
            AttendanceStatusTextBrush = textPrimary;
        }
    }
}

public partial class StudentActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _activity = "";
    [ObservableProperty] private string _timestamp = "";
}