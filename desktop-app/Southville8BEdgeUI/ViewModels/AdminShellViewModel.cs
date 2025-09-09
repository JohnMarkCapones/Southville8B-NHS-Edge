using Avalonia.Controls;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.ViewModels.Admin;
using System;

namespace Southville8BEdgeUI.ViewModels;

public partial class AdminShellViewModel : ViewModelBase
{
    [ObservableProperty]
    private ViewModelBase _currentContent;

    [ObservableProperty]
    private string _currentPage = "Dashboard";

    [ObservableProperty]
    private bool _isLeftSidebarVisible = true;

    [ObservableProperty]
    private bool _isRightSidebarVisible = true;

    [ObservableProperty]
    private bool _isUserDropdownVisible = false;

    [ObservableProperty]
    private bool _isDarkMode = false;

    [ObservableProperty] private string _userName = "Richard Ramos Jr";
    [ObservableProperty] private string _userRole = "Administrator";
    [ObservableProperty] private string _userInitials = "RR";
    [ObservableProperty] private string _userEmail = "richard.ramos@southville.edu.ph";
    [ObservableProperty] private string _currentDate = DateTime.Now.ToString("MMMM dd, yyyy");
    [ObservableProperty] private string _currentTime = DateTime.Now.ToString("hh:mm tt");
    [ObservableProperty] private string _currentVersion = "1.0.0";

    [ObservableProperty] private GridLength _leftColumnWidth = new(260);
    [ObservableProperty] private GridLength _rightColumnWidth = new(260);

    public bool ShowLeftSidebarToggle => !IsLeftSidebarVisible;
    public bool ShowRightSidebarToggle => !IsRightSidebarVisible;

    public Action<ViewModelBase>? NavigateTo { get; set; }

    public AdminShellViewModel()
    {
        _currentContent = CreateDashboardViewModel();
        UpdateColumnWidths();
    }

    private AdminDashboardViewModel CreateDashboardViewModel()
    {
        return new AdminDashboardViewModel
        {
            NavigateToRoomManagementCommand = NavigateToRoomManagementCommand,
            NavigateToEventsDashboardCommand = NavigateToEventsDashboardCommand,
            NavigateToUserManagementCommand = NavigateToUserManagementCommand,
            NavigateToChatCommand = NavigateToChatCommand,
            NavigateToELibraryCommand = NavigateToELibraryCommand
        };
    }

    private void UpdateColumnWidths()
    {
        LeftColumnWidth = IsLeftSidebarVisible ? new GridLength(260) : new GridLength(0);
        RightColumnWidth = IsRightSidebarVisible ? new GridLength(260) : new GridLength(0);
    }

    [RelayCommand] private void ToggleLeftSidebar() { IsLeftSidebarVisible = !IsLeftSidebarVisible; UpdateColumnWidths(); }
    [RelayCommand] private void ToggleRightSidebar() { IsRightSidebarVisible = !IsRightSidebarVisible; UpdateColumnWidths(); }
    [RelayCommand] private void ToggleUserDropdown() => IsUserDropdownVisible = !IsUserDropdownVisible;
    [RelayCommand] private void CloseUserDropdown() => IsUserDropdownVisible = false;

    // New Alerts navigation
    [RelayCommand]
    private void NavigateToAlerts()
    {
        CurrentContent = new AlertsViewModel();
        CurrentPage = "Alerts";
        CloseUserDropdown();
    }

    [RelayCommand] private void NavigateToDashboard() { CurrentContent = CreateDashboardViewModel(); CurrentPage = "Dashboard"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToRoomManagement() { CurrentContent = new RoomManagementViewModel(); CurrentPage = "Room Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToEventsDashboard() { CurrentContent = new EventDashboardViewModel(); CurrentPage = "Events Dashboard"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToELibrary() { CurrentContent = new ELibraryManagementViewModel(); CurrentPage = "E-Library Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToUserManagement() { CurrentContent = new UserManagementViewModel(); CurrentPage = "User Management"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToChat() { CurrentContent = new ChatViewModel(); CurrentPage = "Chat"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToProfile() { CurrentContent = new ProfileViewModel(); CurrentPage = "Profile"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToSettings() { CurrentContent = new SettingsViewModel(); CurrentPage = "Settings"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToNotifications() { CurrentContent = new NotificationsViewModel(); CurrentPage = "Notifications"; CloseUserDropdown(); }
    [RelayCommand] private void NavigateToHelpGuide() { CurrentContent = new HelpGuideViewModel(); CurrentPage = "Help Guide"; CloseUserDropdown(); }
    [RelayCommand] private void ToggleDarkMode() { IsDarkMode = !IsDarkMode; CloseUserDropdown(); }
    [RelayCommand] private void Logout() { CloseUserDropdown(); NavigateTo?.Invoke(new LoginViewModel()); }

    [RelayCommand]
    private void DismissAlert(SystemAlertViewModel alert)
    {
        if (CurrentContent is AdminDashboardViewModel dashboard)
            dashboard.SystemAlerts.Remove(alert);
    }

    public bool IsDashboardActive => CurrentPage == "Dashboard";
    public bool IsRoomManagementActive => CurrentPage == "Room Management";
    public bool IsEventsDashboardActive => CurrentPage == "Events Dashboard";
    public bool IsELibraryActive => CurrentPage == "E-Library Management";
    public bool IsUserManagementActive => CurrentPage == "User Management";
    public bool IsChatActive => CurrentPage == "Chat";
    public bool IsProfileActive => CurrentPage == "Profile";
    public bool IsSettingsActive => CurrentPage == "Settings";
    public bool IsNotificationsActive => CurrentPage == "Notifications";
    public bool IsHelpGuideActive => CurrentPage == "Help Guide";
    public bool IsAlertsActive => CurrentPage == "Alerts";

    partial void OnCurrentPageChanged(string value)
    {
        OnPropertyChanged(nameof(IsDashboardActive));
        OnPropertyChanged(nameof(IsRoomManagementActive));
        OnPropertyChanged(nameof(IsEventsDashboardActive));
        OnPropertyChanged(nameof(IsELibraryActive));
        OnPropertyChanged(nameof(IsUserManagementActive));
        OnPropertyChanged(nameof(IsChatActive));
        OnPropertyChanged(nameof(IsProfileActive));
        OnPropertyChanged(nameof(IsSettingsActive));
        OnPropertyChanged(nameof(IsNotificationsActive));
        OnPropertyChanged(nameof(IsHelpGuideActive));
        OnPropertyChanged(nameof(IsAlertsActive));
    }

    partial void OnIsLeftSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowLeftSidebarToggle));
    partial void OnIsRightSidebarVisibleChanged(bool value) => OnPropertyChanged(nameof(ShowRightSidebarToggle));
}