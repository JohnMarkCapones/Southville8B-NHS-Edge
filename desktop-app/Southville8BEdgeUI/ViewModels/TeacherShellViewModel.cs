using System;
using Avalonia.Controls;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.ViewModels;

public partial class TeacherShellViewModel : ViewModelBase
{
    [ObservableProperty]
    private ViewModelBase _currentContent;

    [ObservableProperty]
    private string _currentPage = "Dashboard";

    // Sidebar visibility properties
    [ObservableProperty]
    private bool _isLeftSidebarVisible = true;

    [ObservableProperty]
    private bool _isRightSidebarVisible = true;

    // Properties for the right sidebar
    [ObservableProperty] private string _userName = "Jane Doe";
    [ObservableProperty] private string _userRole = "Teacher";
    [ObservableProperty] private string _userInitials = "JD";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");

    // Grid column properties for flexible layout - using GridLength instead of string
    [ObservableProperty] private GridLength _leftColumnWidth = new(260);
    [ObservableProperty] private GridLength _rightColumnWidth = new(260);

    // Computed properties for sidebar button visibility
    public bool ShowLeftSidebarToggle => !IsLeftSidebarVisible;
    public bool ShowRightSidebarToggle => !IsRightSidebarVisible;

    public TeacherShellViewModel()
    {
        // Set the default page to the dashboard
        _currentContent = CreateDashboardViewModel();
        UpdateColumnWidths();
    }

    private TeacherDashboardViewModel CreateDashboardViewModel()
    {
        return new TeacherDashboardViewModel
        {
            NavigateToSchedulePlannerCommand = NavigateToSchedulePlannerCommand,
            NavigateToGradeEntryCommand = NavigateToGradeEntryCommand,
            NavigateToStudentManagementCommand = NavigateToStudentManagementCommand,
            NavigateToMyAnnouncementsCommand = NavigateToMyAnnouncementsCommand,
            NavigateToMessagingCommand = NavigateToMessagingCommand
        };
    }

    private void UpdateColumnWidths()
    {
        LeftColumnWidth = IsLeftSidebarVisible ? new GridLength(260) : new GridLength(0);
        RightColumnWidth = IsRightSidebarVisible ? new GridLength(260) : new GridLength(0);
    }

    // Sidebar toggle commands
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

    // Navigation commands
    [RelayCommand]
    private void NavigateToDashboard()
    {
        CurrentContent = CreateDashboardViewModel();
        CurrentPage = "Dashboard";
    }

    [RelayCommand]
    private void NavigateToSchedulePlanner()
    {
        CurrentContent = new SchedulePlannerViewModel();
        CurrentPage = "Schedule Planner";
    }

    [RelayCommand]
    private void NavigateToGradeEntry()
    {
        CurrentContent = new GradeEntryViewModel();
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
        CurrentContent = new MyAnnouncementsViewModel();
        CurrentPage = "My Announcements";
    }

    [RelayCommand]
    private void NavigateToMessaging()
    {
        CurrentContent = new MessagingViewModel();
        CurrentPage = "Messaging";
    }

    // Helper methods to check current page
    public bool IsDashboardActive => CurrentPage == "Dashboard";
    public bool IsSchedulePlannerActive => CurrentPage == "Schedule Planner";
    public bool IsGradeEntryActive => CurrentPage == "Grade Entry";
    public bool IsStudentManagementActive => CurrentPage == "Student Management";
    public bool IsMyAnnouncementsActive => CurrentPage == "My Announcements";
    public bool IsMessagingActive => CurrentPage == "Messaging";

    partial void OnCurrentPageChanged(string value)
    {
        OnPropertyChanged(nameof(IsDashboardActive));
        OnPropertyChanged(nameof(IsSchedulePlannerActive));
        OnPropertyChanged(nameof(IsGradeEntryActive));
        OnPropertyChanged(nameof(IsStudentManagementActive));
        OnPropertyChanged(nameof(IsMyAnnouncementsActive));
        OnPropertyChanged(nameof(IsMessagingActive));
    }

    partial void OnIsLeftSidebarVisibleChanged(bool value)
    {
        OnPropertyChanged(nameof(ShowLeftSidebarToggle));
    }

    partial void OnIsRightSidebarVisibleChanged(bool value)
    {
        OnPropertyChanged(nameof(ShowRightSidebarToggle));
    }
}