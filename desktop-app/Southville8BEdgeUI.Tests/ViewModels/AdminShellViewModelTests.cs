using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class AdminShellViewModelTests
{
    // No Avalonia Application needed for pure ViewModel tests
    private static void EnsureApp() { }

    private AdminShellViewModel CreateVm()
    {
        EnsureApp();
        return new AdminShellViewModel(enableRotation: false);
    }

    [Fact]
    public void Constructor_SetsInitialDashboard()
    {
        var vm = CreateVm();
        Assert.Equal("Dashboard", vm.CurrentPage);
        Assert.IsType<AdminDashboardViewModel>(vm.CurrentContent);
        Assert.NotNull(vm.TodayClasses);
        Assert.NotEmpty(vm.FirstWeekDays);
        Assert.True(vm.IsDashboardActive);
    }

    [Fact]
    public void ToggleLeftSidebar_ChangesVisibilityAndColumn()
    {
        var vm = CreateVm();
        var initialWidth = vm.LeftColumnWidth.Value;
        Assert.True(vm.IsLeftSidebarVisible);
        vm.ToggleLeftSidebarCommand.Execute(null);
        Assert.False(vm.IsLeftSidebarVisible);
        Assert.Equal(0, vm.LeftColumnWidth.Value);
        vm.ToggleLeftSidebarCommand.Execute(null);
        Assert.True(vm.IsLeftSidebarVisible);
        Assert.Equal(initialWidth, vm.LeftColumnWidth.Value);
    }

    [Fact]
    public void ToggleRightSidebar_ChangesVisibilityAndColumn()
    {
        var vm = CreateVm();
        var initialWidth = vm.RightColumnWidth.Value;
        Assert.True(vm.IsRightSidebarVisible);
        vm.ToggleRightSidebarCommand.Execute(null);
        Assert.False(vm.IsRightSidebarVisible);
        Assert.Equal(0, vm.RightColumnWidth.Value);
        vm.ToggleRightSidebarCommand.Execute(null);
        Assert.True(vm.IsRightSidebarVisible);
        Assert.Equal(initialWidth, vm.RightColumnWidth.Value);
    }

    [Fact]
    public void UserDropdown_TogglesAndCloses()
    {
        var vm = CreateVm();
        Assert.False(vm.IsUserDropdownVisible);
        vm.ToggleUserDropdownCommand.Execute(null);
        Assert.True(vm.IsUserDropdownVisible);
        vm.CloseUserDropdownCommand.Execute(null);
        Assert.False(vm.IsUserDropdownVisible);
    }

    [Fact]
    public void Navigation_Commands_SetPageAndContent_AndActiveFlags()
    {
        var vm = CreateVm();

        void AssertActive(Func<bool> flag, string expectedPage)
        {
            Assert.Equal(expectedPage, vm.CurrentPage);
            Assert.True(flag());
        }

        vm.NavigateToAlertsCommand.Execute(null);
        AssertActive(() => vm.IsAlertsActive, "Alerts");

        vm.NavigateToDashboardCommand.Execute(null);
        AssertActive(() => vm.IsDashboardActive, "Dashboard");

        vm.NavigateToRoomManagementCommand.Execute(null);
        AssertActive(() => vm.IsRoomManagementActive, "Room Management");

        vm.NavigateToEventsDashboardCommand.Execute(null);
        AssertActive(() => vm.IsEventsDashboardActive, "Events Dashboard");

        vm.NavigateToELibraryCommand.Execute(null);
        AssertActive(() => vm.IsELibraryActive, "E-Library Management");

        vm.NavigateToUserManagementCommand.Execute(null);
        AssertActive(() => vm.IsUserManagementActive, "User Management");

        vm.NavigateToChatCommand.Execute(null);
        AssertActive(() => vm.IsChatActive, "Chat");

        vm.NavigateToProfileCommand.Execute(null);
        AssertActive(() => vm.IsProfileActive, "Profile");

        vm.NavigateToSettingsCommand.Execute(null);
        AssertActive(() => vm.IsSettingsActive, "Settings");

        vm.NavigateToNotificationsCommand.Execute(null);
        AssertActive(() => vm.IsNotificationsActive, "Notifications");

        vm.NavigateToHelpGuideCommand.Execute(null);
        AssertActive(() => vm.IsHelpGuideActive, "Help Guide");
    }

    [Fact]
    public void ToggleDarkMode_SwitchesRequestedThemeVariant()
    {
        var vm = CreateVm();
        var initial = vm.IsDarkMode;
        vm.ToggleDarkModeCommand.Execute(null);
        Assert.Equal(!initial, vm.IsDarkMode);
    }

    [Fact]
    public void Calendar_NavigatePreviousAndNextMonth_WeekWrapping()
    {
        var vm = CreateVm();
        int attempts = 0;
        while (attempts < 7)
        {
            var beforeMonth = vm.FirstWeekDays[0].Date.Month;
            vm.NavigatePreviousMonthCommand.Execute(null);
            if (vm.FirstWeekDays[0].Date.Month != beforeMonth) break;
            attempts++;
        }
        attempts = 0;
        while (attempts < 7)
        {
            var beforeMonth = vm.FirstWeekDays[0].Date.Month;
            vm.NavigateNextMonthCommand.Execute(null);
            if (vm.FirstWeekDays[0].Date.Month != beforeMonth) break;
            attempts++;
        }
        Assert.Equal(7, vm.FirstWeekDays.Count);
    }

    [Fact]
    public void TodayClassRotation_NextTodayClass_AdvancesIndex()
    {
        var vm = CreateVm();
        if (vm.TodayClasses.Count <= 1) return;
        var current = vm.CurrentClassSubject;
        vm.NextTodayClassCommand.Execute(null);
        Assert.NotEqual(current, vm.CurrentClassSubject);
    }

    [Fact]
    public void Logout_InvokesNavigationCallback()
    {
        var vm = CreateVm();
        ViewModelBase? navigated = null;
        vm.NavigateTo = v => navigated = v;
        vm.LogoutCommand.Execute(null);
        Assert.NotNull(navigated);
        Assert.IsType<LoginViewModel>(navigated);
    }

    [Fact]
    public void DismissAlert_RemovesAlert_WhenOnDashboard()
    {
        var vm = CreateVm();
        vm.NavigateToDashboardCommand.Execute(null);
        var dashboard = Assert.IsType<AdminDashboardViewModel>(vm.CurrentContent);
        if (dashboard.SystemAlerts.Count == 0)
        {
            dashboard.SystemAlerts.Add(new SystemAlertViewModel { Title = "Test", Message = "Msg", Severity = "Info", Timestamp = DateTime.Now.ToString() });
        }
        var alert = dashboard.SystemAlerts.First();
        var initialCount = dashboard.SystemAlerts.Count;
        vm.DismissAlertCommand.Execute(alert);
        Assert.Equal(initialCount - 1, dashboard.SystemAlerts.Count);
        Assert.DoesNotContain(alert, dashboard.SystemAlerts);
    }
}
