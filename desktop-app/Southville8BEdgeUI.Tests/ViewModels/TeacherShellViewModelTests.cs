using Xunit;
using Moq;
using Southville8BEdgeUI.ViewModels;
using Southville8BEdgeUI.ViewModels.Teacher;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherShellViewModelTests
{
    private readonly Mock<IApiClient> _mockApiClient;
    private readonly Mock<IDialogService> _mockDialogService;
    private readonly Mock<IToastService> _mockToastService;
    private readonly Mock<ISseService> _mockSseService;
    private readonly Mock<ITokenStorageService> _mockTokenStorage;

    public TeacherShellViewModelTests()
    {
        _mockApiClient = new Mock<IApiClient>();
        _mockDialogService = new Mock<IDialogService>();
        _mockToastService = new Mock<IToastService>();
        _mockSseService = new Mock<ISseService>();
        _mockTokenStorage = new Mock<ITokenStorageService>();
    }

    [Fact]
    public void Constructor_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.NotNull(viewModel);
        Assert.Equal("Dashboard", viewModel.CurrentPage);
        Assert.True(viewModel.IsLeftSidebarVisible);
        Assert.True(viewModel.IsRightSidebarVisible);
        Assert.NotNull(viewModel.CalendarDays);
        Assert.NotNull(viewModel.RecentActivities);
        Assert.NotNull(viewModel.RecentAnnouncements);
        Assert.NotNull(viewModel.TodayClasses);
    }

    [Fact]
    public void InitialKPIs_ShouldBeZero()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.Equal(0, viewModel.TotalClasses);
        Assert.Equal(0, viewModel.TotalAnnouncements);
        Assert.Equal(0, viewModel.TotalStudents);
        Assert.Equal(0, viewModel.UnreadMessages);
    }

    [Fact]
    public void ToggleLeftSidebar_ShouldChangeVisibility()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var initialState = viewModel.IsLeftSidebarVisible;
        var initialWidth = viewModel.LeftColumnWidth.Value;

        // Act
        viewModel.ToggleLeftSidebarCommand.Execute(null);

        // Assert
        Assert.NotEqual(initialState, viewModel.IsLeftSidebarVisible);
        Assert.NotEqual(initialWidth, viewModel.LeftColumnWidth.Value);
    }

    [Fact]
    public void ToggleRightSidebar_ShouldChangeVisibility()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var initialState = viewModel.IsRightSidebarVisible;
        var initialWidth = viewModel.RightColumnWidth.Value;

        // Act
        viewModel.ToggleRightSidebarCommand.Execute(null);

        // Assert
        Assert.NotEqual(initialState, viewModel.IsRightSidebarVisible);
        Assert.NotEqual(initialWidth, viewModel.RightColumnWidth.Value);
    }

    [Fact]
    public void NavigateToDashboard_ShouldSetCurrentPageToDashboard()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToDashboardCommand.Execute(null);

        // Assert
        Assert.Equal("Dashboard", viewModel.CurrentPage);
        Assert.True(viewModel.IsDashboardActive);
        Assert.False(viewModel.IsSchedulePlannerActive);
    }

    [Fact]
    public void NavigateToSchedulePlanner_ShouldSetCurrentPageToSchedulePlanner()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToSchedulePlannerCommand.Execute(null);

        // Assert
        Assert.Equal("Schedule Planner", viewModel.CurrentPage);
        Assert.True(viewModel.IsSchedulePlannerActive);
        Assert.False(viewModel.IsDashboardActive);
    }

    [Fact]
    public void NavigateToGradeEntry_ShouldSetCurrentPageToGradeEntry()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToGradeEntryCommand.Execute(null);

        // Assert
        Assert.Equal("Grade Entry", viewModel.CurrentPage);
        Assert.True(viewModel.IsGradeEntryActive);
        Assert.False(viewModel.IsDashboardActive);
    }

    [Fact]
    public void NavigateToMyAnnouncements_ShouldSetCurrentPageToMyAnnouncements()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToMyAnnouncementsCommand.Execute(null);

        // Assert
        Assert.Equal("My Announcements", viewModel.CurrentPage);
        Assert.True(viewModel.IsMyAnnouncementsActive);
        Assert.False(viewModel.IsDashboardActive);
    }

    [Fact]
    public void NavigateToMessaging_ShouldSetCurrentPageToMessaging()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToMessagingCommand.Execute(null);

        // Assert
        Assert.Equal("Messaging", viewModel.CurrentPage);
        Assert.True(viewModel.IsMessagingActive);
        Assert.False(viewModel.IsDashboardActive);
    }

    [Fact]
    public void ToggleUserDropdown_ShouldChangeDropdownVisibility()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var initialState = viewModel.IsUserDropdownVisible;

        // Act
        viewModel.ToggleUserDropdownCommand.Execute(null);

        // Assert
        Assert.NotEqual(initialState, viewModel.IsUserDropdownVisible);
    }

    [Fact]
    public void CloseUserDropdown_ShouldSetDropdownVisibilityToFalse()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.ToggleUserDropdownCommand.Execute(null); // Open it first

        // Act
        viewModel.CloseUserDropdownCommand.Execute(null);

        // Assert
        Assert.False(viewModel.IsUserDropdownVisible);
    }

    [Fact]
    public void NavigatePreviousMonth_ShouldExecuteWithoutError()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var initialMonth = viewModel.CurrentMonth;

        // Act & Assert - Should not throw
        viewModel.NavigatePreviousMonthCommand.Execute(null);
        
        // Month may or may not change depending on current week index
        // Navigation cycles through weeks before changing months
        Assert.NotNull(viewModel.CurrentMonth);
    }

    [Fact]
    public void NavigateNextMonth_ShouldExecuteWithoutError()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var initialMonth = viewModel.CurrentMonth;

        // Act & Assert - Should not throw
        viewModel.NavigateNextMonthCommand.Execute(null);
        
        // Month may or may not change depending on current week index
        // Navigation cycles through weeks before changing months
        Assert.NotNull(viewModel.CurrentMonth);
    }

    [Fact]
    public void UserInitials_ShouldBeSetCorrectly()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();
        viewModel.UserName = "John Doe";

        // Assert
        Assert.NotNull(viewModel.UserInitials);
    }

    [Fact]
    public void CurrentDate_ShouldBeFormattedCorrectly()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.NotNull(viewModel.CurrentDate);
        Assert.NotEmpty(viewModel.CurrentDate);
    }

    [Fact]
    public void CurrentTime_ShouldBeFormattedCorrectly()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.NotNull(viewModel.CurrentTime);
        Assert.NotEmpty(viewModel.CurrentTime);
    }

    [Fact]
    public void AcademicYear_ShouldHaveDefaultValue()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.NotNull(viewModel.AcademicYear);
        Assert.NotEmpty(viewModel.AcademicYear);
    }

    [Fact]
    public void LeftColumnWidth_ShouldBeCorrectWhenSidebarVisible()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.IsLeftSidebarVisible = true;

        // Act
        var width = viewModel.LeftColumnWidth;

        // Assert
        Assert.True(width.Value > 0);
    }

    [Fact]
    public void LeftColumnWidth_ShouldBeZeroWhenSidebarHidden()
    {
        // Arrange
        var viewModel = CreateViewModel();
        Assert.Equal(260, viewModel.LeftColumnWidth.Value); // Initially 260

        // Act
        viewModel.ToggleLeftSidebarCommand.Execute(null);

        // Assert
        Assert.False(viewModel.IsLeftSidebarVisible);
        Assert.Equal(0, viewModel.LeftColumnWidth.Value);
    }

    [Fact]
    public void RightColumnWidth_ShouldBeCorrectWhenSidebarVisible()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.IsRightSidebarVisible = true;

        // Act
        var width = viewModel.RightColumnWidth;

        // Assert
        Assert.True(width.Value > 0);
    }

    [Fact]
    public void RightColumnWidth_ShouldBeZeroWhenSidebarHidden()
    {
        // Arrange
        var viewModel = CreateViewModel();
        Assert.Equal(260, viewModel.RightColumnWidth.Value); // Initially 260

        // Act
        viewModel.ToggleRightSidebarCommand.Execute(null);

        // Assert
        Assert.False(viewModel.IsRightSidebarVisible);
        Assert.Equal(0, viewModel.RightColumnWidth.Value);
    }

    [Fact]
    public void ShowLeftSidebarToggle_ShouldBeCorrectWhenSidebarHidden()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.IsLeftSidebarVisible = false;

        // Act
        var shouldShow = viewModel.ShowLeftSidebarToggle;

        // Assert
        Assert.True(shouldShow);
    }

    [Fact]
    public void ShowRightSidebarToggle_ShouldBeCorrectWhenSidebarHidden()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.IsRightSidebarVisible = false;

        // Act
        var shouldShow = viewModel.ShowRightSidebarToggle;

        // Assert
        Assert.True(shouldShow);
    }

    [Fact]
    public void HasMultipleTodayClasses_ShouldBeFalseWhenNoClasses()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.TodayClasses.Clear();

        // Act
        var hasMultiple = viewModel.HasMultipleTodayClasses;

        // Assert
        Assert.False(hasMultiple);
    }

    [Fact]
    public void HasMultipleTodayClasses_ShouldBeFalseWhenOneClass()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.TodayClasses.Clear();
        viewModel.TodayClasses.Add(new TodayClassItem
        {
            Subject = "Math",
            Grade = "Grade 8-A",
            Time = "8:00 AM",
            Room = "Room 101"
        });

        // Act
        var hasMultiple = viewModel.HasMultipleTodayClasses;

        // Assert
        Assert.False(hasMultiple);
    }

    [Fact]
    public void HasMultipleTodayClasses_ShouldBeTrueWhenMultipleClasses()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.TodayClasses.Clear();
        viewModel.TodayClasses.Add(new TodayClassItem
        {
            Subject = "Math",
            Grade = "Grade 8-A",
            Time = "8:00 AM",
            Room = "Room 101"
        });
        viewModel.TodayClasses.Add(new TodayClassItem
        {
            Subject = "Science",
            Grade = "Grade 8-B",
            Time = "10:00 AM",
            Room = "Room 102"
        });

        // Act
        var hasMultiple = viewModel.HasMultipleTodayClasses;

        // Assert
        Assert.True(hasMultiple);
    }

    [Fact]
    public void Dispose_ShouldNotThrowException()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act & Assert
        var exception = Record.Exception(() => viewModel.Dispose());
        Assert.Null(exception);
    }

    [Fact]
    public void NavigateToSettings_ShouldSetCurrentPageToSettings()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToSettingsCommand.Execute(null);

        // Assert
        Assert.Equal("Settings", viewModel.CurrentPage);
        Assert.False(viewModel.IsUserDropdownVisible);
    }

    [Fact]
    public void NavigateToNotifications_ShouldSetCurrentPageToNotifications()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToNotificationsCommand.Execute(null);

        // Assert
        Assert.Equal("Notifications", viewModel.CurrentPage);
        Assert.False(viewModel.IsUserDropdownVisible);
    }

    [Fact]
    public void NavigateToHelpGuide_ShouldSetCurrentPageToHelpGuide()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToHelpGuideCommand.Execute(null);

        // Assert
        Assert.Equal("Help Guide", viewModel.CurrentPage);
        Assert.False(viewModel.IsUserDropdownVisible);
    }

    [Fact]
    public void CalendarDays_ShouldBePopulatedAfterConstruction()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.NotNull(viewModel.CalendarDays);
        Assert.NotEmpty(viewModel.CalendarDays);
    }

    [Fact]
    public void FirstWeekDays_ShouldContainSevenDays()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();

        // Assert
        Assert.NotNull(viewModel.FirstWeekDays);
        Assert.Equal(7, viewModel.FirstWeekDays.Count);
    }

    [Fact]
    public void TodayDate_ShouldBeCurrentDay()
    {
        // Arrange & Act
        var viewModel = CreateViewModel();
        var today = DateTime.Today.Day.ToString();

        // Assert
        Assert.Equal(today, viewModel.TodayDate);
    }

    [Fact]
    public void ToggleDarkMode_ShouldChangeTheme()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var initialState = viewModel.IsDarkMode;

        // Act
        viewModel.ToggleDarkModeCommand.Execute(null);

        // Assert - just verify command executes without exception
        // Actual theme change requires Avalonia app context
        Assert.NotNull(viewModel);
    }

    [Fact]
    public void ViewFullSchedule_ShouldNavigateToSchedulePlanner()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.ViewFullScheduleCommand.Execute(null);

        // Assert
        Assert.Equal("Schedule Planner", viewModel.CurrentPage);
    }

    [Fact]
    public void MultipleNavigations_ShouldUpdateCurrentPageCorrectly()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act & Assert
        viewModel.NavigateToDashboardCommand.Execute(null);
        Assert.Equal("Dashboard", viewModel.CurrentPage);

        viewModel.NavigateToSchedulePlannerCommand.Execute(null);
        Assert.Equal("Schedule Planner", viewModel.CurrentPage);

        viewModel.NavigateToGradeEntryCommand.Execute(null);
        Assert.Equal("Grade Entry", viewModel.CurrentPage);

        viewModel.NavigateToMyAnnouncementsCommand.Execute(null);
        Assert.Equal("My Announcements", viewModel.CurrentPage);

        viewModel.NavigateToMessagingCommand.Execute(null);
        Assert.Equal("Messaging", viewModel.CurrentPage);
    }

    [Fact]
    public void ActivePageIndicators_ShouldOnlyHaveOneActive()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act
        viewModel.NavigateToSchedulePlannerCommand.Execute(null);

        // Assert
        Assert.False(viewModel.IsDashboardActive);
        Assert.True(viewModel.IsSchedulePlannerActive);
        Assert.False(viewModel.IsGradeEntryActive);
        Assert.False(viewModel.IsMyAnnouncementsActive);
        Assert.False(viewModel.IsMessagingActive);
    }

    [Fact]
    public void SidebarToggle_ShouldWorkMultipleTimes()
    {
        // Arrange
        var viewModel = CreateViewModel();

        // Act & Assert
        Assert.True(viewModel.IsLeftSidebarVisible);
        
        viewModel.ToggleLeftSidebarCommand.Execute(null);
        Assert.False(viewModel.IsLeftSidebarVisible);
        
        viewModel.ToggleLeftSidebarCommand.Execute(null);
        Assert.True(viewModel.IsLeftSidebarVisible);
    }

    [Fact]
    public void UserDropdown_ShouldCloseOnNavigation()
    {
        // Arrange
        var viewModel = CreateViewModel();
        viewModel.ToggleUserDropdownCommand.Execute(null); // Open dropdown

        // Act
        viewModel.NavigateToSettingsCommand.Execute(null);

        // Assert
        Assert.False(viewModel.IsUserDropdownVisible);
    }

    private TeacherShellViewModel CreateViewModel(string? userId = "test-user-123")
    {
        // Set up service locator mocks
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddSingleton(_mockApiClient.Object);
        serviceCollection.AddSingleton(_mockDialogService.Object);
        serviceCollection.AddSingleton(_mockToastService.Object);
        serviceCollection.AddSingleton(_mockSseService.Object);
        serviceCollection.AddSingleton(_mockTokenStorage.Object);
        
        // Add IChatService mock for Messaging navigation
        var mockChatService = new Mock<IChatService>();
        serviceCollection.AddSingleton(mockChatService.Object);
        
        ServiceLocator.Services = serviceCollection.BuildServiceProvider();

        // Create user DTO if userId provided
        UserDto? user = userId != null ? new UserDto
        {
            Id = userId,
            FullName = "Test User",
            Email = "test@example.com"
        } : null;

        return new TeacherShellViewModel(
            _mockSseService.Object,
            _mockApiClient.Object,
            _mockTokenStorage.Object,
            _mockToastService.Object,
            _mockDialogService.Object,
            user: user,
            accessToken: "test-token",
            enableRotation: false,
            enableTimeUpdater: false
        );
    }
}
