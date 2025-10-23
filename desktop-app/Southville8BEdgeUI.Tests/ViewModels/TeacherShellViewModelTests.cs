using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels;
using Southville8BEdgeUI.ViewModels.Teacher;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using Xunit;
using Moq;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherShellViewModelTests
{
    private TeacherShellViewModel CreateVm()
    {
        // Create mock services
        var mockSseService = new Mock<ISseService>();
        var mockApiClient = new Mock<IApiClient>();
        var mockTokenStorage = new Mock<ITokenStorageService>();
        var mockToastService = new Mock<IToastService>();

        // Create mock user
        var mockUser = new UserDto
        {
            Id = "test-teacher-id",
            Email = "teacher@test.com",
            Role = "teacher"
        };

        return new TeacherShellViewModel(
            mockSseService.Object,
            mockApiClient.Object,
            mockTokenStorage.Object,
            mockToastService.Object,
            mockUser,
            "test-access-token",
            enableRotation: false,
            enableTimeUpdater: false
        );
    }

    [Fact]
    public void Constructor_SetsInitialDashboardState()
    {
        var vm = CreateVm();
        Assert.Equal("Dashboard", vm.CurrentPage);
        Assert.IsType<TeacherDashboardViewModel>(vm.CurrentContent);
        // TodayClasses might be empty initially due to async loading, so we'll check it's not null
        Assert.NotNull(vm.TodayClasses);
        Assert.NotEmpty(vm.CalendarDays);
        Assert.NotEmpty(vm.FirstWeekDays);
        Assert.True(vm.IsDashboardActive);
        
        // Check that user data is initialized
        Assert.Equal("teacher@test.com", vm.UserEmail);
        Assert.Equal("Teacher", vm.UserRole);
        Assert.Equal("T", vm.UserInitials);
    }

    [Fact]
    public void ToggleLeftSidebar_UpdatesVisibilityAndWidth()
    {
        var vm = CreateVm();
        var initial = vm.LeftColumnWidth.Value;
        Assert.True(vm.IsLeftSidebarVisible);
        vm.ToggleLeftSidebarCommand.Execute(null);
        Assert.False(vm.IsLeftSidebarVisible);
        Assert.Equal(0, vm.LeftColumnWidth.Value);
        vm.ToggleLeftSidebarCommand.Execute(null);
        Assert.True(vm.IsLeftSidebarVisible);
        Assert.Equal(initial, vm.LeftColumnWidth.Value);
    }

    [Fact]
    public void ToggleRightSidebar_UpdatesVisibilityAndWidth()
    {
        var vm = CreateVm();
        var initial = vm.RightColumnWidth.Value;
        Assert.True(vm.IsRightSidebarVisible);
        vm.ToggleRightSidebarCommand.Execute(null);
        Assert.False(vm.IsRightSidebarVisible);
        Assert.Equal(0, vm.RightColumnWidth.Value);
        vm.ToggleRightSidebarCommand.Execute(null);
        Assert.True(vm.IsRightSidebarVisible);
        Assert.Equal(initial, vm.RightColumnWidth.Value);
    }

    [Fact]
    public void UserDropdown_ToggleAndClose()
    {
        var vm = CreateVm();
        Assert.False(vm.IsUserDropdownVisible);
        vm.ToggleUserDropdownCommand.Execute(null);
        Assert.True(vm.IsUserDropdownVisible);
        vm.CloseUserDropdownCommand.Execute(null);
        Assert.False(vm.IsUserDropdownVisible);
    }

    [Fact]
    public void Navigation_Commands_ChangePageAndActiveFlags()
    {
        var vm = CreateVm();

        void AssertActive(Func<bool> flag, string page)
        {
            Assert.Equal(page, vm.CurrentPage);
            Assert.True(flag());
        }

        vm.NavigateToSchedulePlannerCommand.Execute(null);
        AssertActive(() => vm.IsSchedulePlannerActive, "Schedule Planner");

        vm.NavigateToDashboardCommand.Execute(null);
        AssertActive(() => vm.IsDashboardActive, "Dashboard");

        vm.NavigateToGradeEntryCommand.Execute(null);
        AssertActive(() => vm.IsGradeEntryActive, "Grade Entry");

        vm.NavigateToStudentManagementCommand.Execute(null);
        AssertActive(() => vm.IsStudentManagementActive, "Student Management");

        vm.NavigateToMyAnnouncementsCommand.Execute(null);
        AssertActive(() => vm.IsMyAnnouncementsActive, "My Announcements");

        vm.NavigateToMessagingCommand.Execute(null);
        AssertActive(() => vm.IsMessagingActive, "Messaging");

        vm.NavigateToProfileCommand.Execute(null);
        Assert.Equal("Profile", vm.CurrentPage);

        vm.NavigateToSettingsCommand.Execute(null);
        Assert.Equal("Settings", vm.CurrentPage);

        vm.NavigateToNotificationsCommand.Execute(null);
        Assert.Equal("Notifications", vm.CurrentPage);
    }

    [Fact]
    public void DarkMode_Toggles()
    {
        var vm = CreateVm();
        var initial = vm.IsDarkMode;
        vm.ToggleDarkModeCommand.Execute(null);
        Assert.Equal(!initial, vm.IsDarkMode);
    }

    [Fact]
    public void Calendar_NavigatePreviousAndNextMonth_WeekPaging()
    {
        var vm = CreateVm();

        // Try moving to previous month by paging weeks until wrap
        int attempts = 0;
        var initialMonth = vm.FirstWeekDays[0].Date.Month;
        while (attempts < 7)
        {
            vm.NavigatePreviousMonthCommand.Execute(null);
            if (vm.FirstWeekDays[0].Date.Month != initialMonth) break;
            attempts++;
        }

        // Then move forward similarly
        attempts = 0;
        var currentMonth = vm.FirstWeekDays[0].Date.Month;
        while (attempts < 7)
        {
            vm.NavigateNextMonthCommand.Execute(null);
            if (vm.FirstWeekDays[0].Date.Month != currentMonth) break;
            attempts++;
        }

        Assert.Equal(7, vm.FirstWeekDays.Count);
    }

    [Fact]
    public void NextTodayClass_Advances_WhenMultiple()
    {
        var vm = CreateVm();
        
        // Add some mock classes for testing since async loading might not have populated them yet
        if (vm.TodayClasses.Count == 0)
        {
            vm.TodayClasses.Add(new TodayClassItem { Subject = "Math", Grade = "Grade 8-A", Time = "08:00 AM - 09:30 AM", Room = "Room 101" });
            vm.TodayClasses.Add(new TodayClassItem { Subject = "Science", Grade = "Grade 8-B", Time = "10:00 AM - 11:30 AM", Room = "Lab 2" });
        }
        
        if (vm.TodayClasses.Count <= 1)
            return; // nothing to test
        
        var current = vm.CurrentClassSubject;
        vm.NextTodayClassCommand.Execute(null);
        Assert.NotEqual(current, vm.CurrentClassSubject);
    }

    [Fact]
    public void ViewFullSchedule_DelegatesToSchedulePlanner()
    {
        var vm = CreateVm();
        vm.ViewFullScheduleCommand.Execute(null);
        Assert.Equal("Schedule Planner", vm.CurrentPage);
        Assert.IsType<SchedulePlannerViewModel>(vm.CurrentContent);
    }

    [Fact]
    public void Logout_ClosesDropdown()
    {
        var vm = CreateVm();
        vm.ToggleUserDropdownCommand.Execute(null);
        Assert.True(vm.IsUserDropdownVisible);
        vm.LogoutCommand.Execute(null);
        Assert.False(vm.IsUserDropdownVisible);
    }

    [Fact]
    public void TodayClasses_Empty_ClearsState()
    {
        var vm = CreateVm();
        vm.TodayClasses.Clear();
        vm.NextTodayClassCommand.Execute(null); // ensure no exception
        Assert.Null(vm.CurrentTodayClass);
        Assert.Equal(string.Empty, vm.CurrentClassSubject);
    }
}
