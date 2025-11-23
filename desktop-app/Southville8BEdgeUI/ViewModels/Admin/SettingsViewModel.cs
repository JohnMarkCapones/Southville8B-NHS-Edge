using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class SettingsViewModel : ViewModelBase
{
    // School Information
    [ObservableProperty] private string _schoolName = "Southville 8B National High School";
    [ObservableProperty] private string _currentSchoolYear = "2024-2025";
    [ObservableProperty] private string _currentSemester = "1st";
    [ObservableProperty] private string _schoolTheme = "Blue";

    // Display Preferences
    [ObservableProperty] private int _studentsPerPage = 25;
    [ObservableProperty] private bool _showStudentPhotos = true;
    [ObservableProperty] private bool _showDetailedInfo = true;
    [ObservableProperty] private string _dateFormat = "MM/dd/yyyy";

    // Notifications & Alerts
    [ObservableProperty] private bool _emailNewStudents = true;
    [ObservableProperty] private bool _emailGradeSubmissions = true;
    [ObservableProperty] private bool _showPopupAlerts = true;
    [ObservableProperty] private bool _notificationSound = true;

    // Data Management
    [ObservableProperty] private bool _autoSaveRecords = true;
    [ObservableProperty] private bool _confirmDeleteStudents = true;
    [ObservableProperty] private bool _confirmDeleteTeachers = true;
    [ObservableProperty] private bool _showConfirmationMessages = true;
    [ObservableProperty] private bool _rememberLastPage = true;

    // Security & Access
    [ObservableProperty] private int _sessionTimeoutMinutes = 30;
    [ObservableProperty] private bool _requirePasswordForSensitiveActions = true;
    [ObservableProperty] private bool _logUserActivities = true;
    [ObservableProperty] private bool _autoBackupData = true;

    // Reports & Export
    [ObservableProperty] private string _defaultReportFormat = "PDF";
    [ObservableProperty] private bool _includeSchoolLogoInReports = true;
    [ObservableProperty] private bool _autoGenerateMonthlyReports = false;
    [ObservableProperty] private string _exportDataLocation = "Documents";

    // Collections for dropdowns
    public ObservableCollection<int> StudentsPerPageOptions { get; } = new() { 10, 25, 50, 100 };
    public ObservableCollection<string> SchoolYears { get; } = new() { "2023-2024", "2024-2025", "2025-2026" };
    public ObservableCollection<string> Semesters { get; } = new() { "1st", "2nd" };
    public ObservableCollection<string> SchoolThemes { get; } = new() { "Blue", "Green", "Red", "Purple" };
    public ObservableCollection<string> DateFormats { get; } = new() { "MM/dd/yyyy", "dd/MM/yyyy", "yyyy-MM-dd" };
    public ObservableCollection<string> ReportFormats { get; } = new() { "PDF", "Excel", "Word" };
    public ObservableCollection<string> ExportLocations { get; } = new() { "Documents", "Desktop", "Downloads" };

    [RelayCommand]
    private void SaveSettings()
    {
        // TODO: Implement save settings logic
    }

    [RelayCommand]
    private void ResetToDefaults()
    {
        // School Information
        SchoolName = "Southville 8B National High School";
        CurrentSchoolYear = "2024-2025";
        CurrentSemester = "1st";
        SchoolTheme = "Blue";

        // Display Preferences
        StudentsPerPage = 25;
        ShowStudentPhotos = true;
        ShowDetailedInfo = true;
        DateFormat = "MM/dd/yyyy";

        // Notifications & Alerts
        EmailNewStudents = true;
        EmailGradeSubmissions = true;
        ShowPopupAlerts = true;
        NotificationSound = true;

        // Data Management
        AutoSaveRecords = true;
        ConfirmDeleteStudents = true;
        ConfirmDeleteTeachers = true;
        ShowConfirmationMessages = true;
        RememberLastPage = true;

        // Security & Access
        SessionTimeoutMinutes = 30;
        RequirePasswordForSensitiveActions = true;
        LogUserActivities = true;
        AutoBackupData = true;

        // Reports & Export
        DefaultReportFormat = "PDF";
        IncludeSchoolLogoInReports = true;
        AutoGenerateMonthlyReports = false;
        ExportDataLocation = "Documents";
    }

    [RelayCommand]
    private void ExportSettings()
    {
        // TODO: Implement export settings logic
    }

    [RelayCommand]
    private void ImportSettings()
    {
        // TODO: Implement import settings logic
    }
}