using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Globalization;

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

    public string Initials => string.Join("", FullName.Split(' ').Select(n => n.FirstOrDefault()));

    public string AttendanceStatusColor => AttendanceStatus == "Present" ? "#10B981" : "#EF4444";

    // Foreground chosen for contrast; for bright backgrounds use dark text, else white.
    public string AttendanceStatusForeground => GetContrastColor(AttendanceStatusColor);

    partial void OnAttendanceStatusChanged(string value)
    {
        OnPropertyChanged(nameof(AttendanceStatusColor));
        OnPropertyChanged(nameof(AttendanceStatusForeground));
    }

    private static string GetContrastColor(string hex)
    {
        if (string.IsNullOrWhiteSpace(hex)) return "#FFFFFF";
        var c = hex.TrimStart('#');
        if (c.Length == 3) c = string.Concat(c.Select(ch => new string(ch, 2)));
        if (c.Length != 6) return "#FFFFFF";
        if (!int.TryParse(c.Substring(0,2), NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var r) ||
            !int.TryParse(c.Substring(2,2), NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var g) ||
            !int.TryParse(c.Substring(4,2), NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var b))
            return "#FFFFFF";
        // Relative luminance
        double l = (0.2126*r + 0.7152*g + 0.0722*b)/255.0;
        return l > 0.6 ? "#1F2937" : "#FFFFFF"; // dark text on light colors, white on dark
    }

    public StudentInfoViewModel()
    {
        RecentActivities = new ObservableCollection<StudentActivityViewModel>
        {
            new() { Activity = "Submitted Assignment #3", Timestamp = "1 hour ago" },
            new() { Activity = "Completed Quiz #2", Timestamp = "3 hours ago" }
        };
    }
}

public partial class StudentActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _activity = "";
    [ObservableProperty] private string _timestamp = "";
}