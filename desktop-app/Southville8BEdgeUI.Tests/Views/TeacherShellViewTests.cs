using Avalonia.Headless.XUnit;
using Avalonia.Controls;
using Moq;
using Southville8BEdgeUI.Views;
using Southville8BEdgeUI.ViewModels;
using Southville8BEdgeUI.Services;
using Xunit;
using Avalonia.Headless;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace Southville8BEdgeUI.Tests.Views;

public class TeacherShellViewTests
{
    private readonly Mock<IApiClient> _mockApiClient;
    private readonly Mock<IDialogService> _mockDialogService;
    private readonly Mock<IToastService> _mockToastService;
    private readonly Mock<ISseService> _mockSseService;
    private readonly Mock<ITokenStorageService> _mockTokenStorage;

    public TeacherShellViewTests()
    {
        _mockApiClient = new Mock<IApiClient>();
        _mockDialogService = new Mock<IDialogService>();
        _mockToastService = new Mock<IToastService>();
        _mockSseService = new Mock<ISseService>();
        _mockTokenStorage = new Mock<ITokenStorageService>();
    }

    [AvaloniaFact]
    public void View_ShouldInitializeWithoutErrors()
    {
        // Arrange & Act
        var exception = Record.Exception(() =>
        {
            var view = new TeacherShellView();
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHaveDataContextAfterInitialization()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();

        // Act
        view.DataContext = viewModel;

        // Assert
        Assert.NotNull(view.DataContext);
        Assert.IsType<TeacherShellViewModel>(view.DataContext);
    }

    [AvaloniaFact]
    public void View_ShouldContainMainGrid()
    {
        // Arrange
        var view = new TeacherShellView();

        // Act
        var grid = view.FindControl<Grid>("MainGrid") ?? 
                   view.Content as Grid;

        // Assert
        Assert.NotNull(grid);
    }

    [AvaloniaFact]
    public void View_ShouldHaveThreeColumns()
    {
        // Arrange
        var view = new TeacherShellView();
        var grid = view.Content as Grid;

        // Assert
        Assert.NotNull(grid);
        Assert.Equal(3, grid.ColumnDefinitions.Count);
    }

    [AvaloniaFact]
    public void View_LeftSidebar_ShouldBeVisible()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        viewModel.IsLeftSidebarVisible = true;
        view.DataContext = viewModel;

        // Act
        var leftSidebar = FindBorderByGridColumn(view, 0);

        // Assert
        Assert.NotNull(leftSidebar);
    }

    [AvaloniaFact]
    public void View_RightSidebar_ShouldBeVisible()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        viewModel.IsRightSidebarVisible = true;
        view.DataContext = viewModel;

        // Act
        var rightSidebar = FindBorderByGridColumn(view, 2);

        // Assert
        Assert.NotNull(rightSidebar);
    }

    [AvaloniaFact]
    public void View_ContentArea_ShouldBeInMiddleColumn()
    {
        // Arrange
        var view = new TeacherShellView();

        // Act
        var contentGrid = FindGridByColumn(view, 1);

        // Assert
        Assert.NotNull(contentGrid);
    }

    [AvaloniaFact]
    public void View_ShouldHandleDataContextChange()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel1 = CreateViewModel();
        var viewModel2 = CreateViewModel();

        // Act
        view.DataContext = viewModel1;
        view.DataContext = viewModel2;

        // Assert
        Assert.Equal(viewModel2, view.DataContext);
    }

    [AvaloniaFact]
    public void View_ShouldNotThrowOnNullDataContext()
    {
        // Arrange
        var view = new TeacherShellView();

        // Act
        var exception = Record.Exception(() =>
        {
            view.DataContext = null;
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldLoadResourcesCorrectly()
    {
        // Arrange & Act
        var exception = Record.Exception(() =>
        {
            var view = new TeacherShellView();
            var resources = view.Resources;
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHaveConvertersInResources()
    {
        // Arrange
        var view = new TeacherShellView();

        // Act
        var hasConverters = view.Resources.Count > 0;

        // Assert
        Assert.True(hasConverters);
    }

    [AvaloniaFact]
    public void View_ShouldApplyStylesToNavButtons()
    {
        // Arrange
        var view = new TeacherShellView();

        // Act
        var styles = view.Styles;

        // Assert
        Assert.NotNull(styles);
        Assert.NotEmpty(styles);
    }

    [AvaloniaFact]
    public void View_ShouldHandleMultipleRenders()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            // Simulate property changes that trigger re-renders
            viewModel.IsLeftSidebarVisible = false;
            viewModel.IsLeftSidebarVisible = true;
            viewModel.IsRightSidebarVisible = false;
            viewModel.IsRightSidebarVisible = true;
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandleNavigationChanges()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            viewModel.NavigateToDashboardCommand.Execute(null);
            viewModel.NavigateToSchedulePlannerCommand.Execute(null);
            viewModel.NavigateToGradeEntryCommand.Execute(null);
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldNotThrowOnDispose()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            viewModel.Dispose();
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandleThemeChanges()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            viewModel.ToggleDarkModeCommand.Execute(null);
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandleDropdownToggle()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            viewModel.ToggleUserDropdownCommand.Execute(null);
            viewModel.CloseUserDropdownCommand.Execute(null);
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandleCalendarNavigation()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            viewModel.NavigatePreviousMonthCommand.Execute(null);
            viewModel.NavigateNextMonthCommand.Execute(null);
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandleEmptyCollections()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        viewModel.TodayClasses.Clear();
        viewModel.RecentActivities.Clear();
        viewModel.RecentAnnouncements.Clear();
        view.DataContext = viewModel;

        // Act - no exception should be thrown
        var exception = Record.Exception(() =>
        {
            // Collections are already cleared, just verify no crash
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandlePopulatedCollections()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        
        viewModel.TodayClasses.Add(new TodayClassItem 
        { 
            Subject = "Math", 
            Grade = "Grade 8-A", 
            Time = "8:00 AM", 
            Room = "Room 101" 
        });
        
        viewModel.RecentActivities.Add(new TeacherActivityItem 
        { 
            StudentName = "John Doe", 
            Activity = "Submitted assignment", 
            TimeAgo = "5 min ago",
            StudentInitials = "JD"
        });

        viewModel.RecentAnnouncements.Add(new AnnouncementSummaryItem
        {
            Title = "Test Announcement",
            TimeAgo = "1 hour ago",
            Status = "Published"
        });

        view.DataContext = viewModel;

        // Act - no exception should be thrown
        var exception = Record.Exception(() =>
        {
            // Collections are populated, just verify no crash
        });

        // Assert
        Assert.Null(exception);
    }

    [AvaloniaFact]
    public void View_ShouldHandleKPIUpdates()
    {
        // Arrange
        var view = new TeacherShellView();
        var viewModel = CreateViewModel();
        view.DataContext = viewModel;

        // Act
        var exception = Record.Exception(() =>
        {
            viewModel.TotalClasses = 5;
            viewModel.TotalStudents = 150;
            viewModel.TotalAnnouncements = 10;
            viewModel.UnreadMessages = 3;
        });

        // Assert
        Assert.Null(exception);
    }

    private TeacherShellViewModel CreateViewModel()
    {
        // Set up service locator
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddSingleton(_mockApiClient.Object);
        serviceCollection.AddSingleton(_mockDialogService.Object);
        serviceCollection.AddSingleton(_mockToastService.Object);
        serviceCollection.AddSingleton(_mockSseService.Object);
        serviceCollection.AddSingleton(_mockTokenStorage.Object);
        
        ServiceLocator.Services = serviceCollection.BuildServiceProvider();

        return new TeacherShellViewModel(
            _mockSseService.Object,
            _mockApiClient.Object,
            _mockTokenStorage.Object,
            _mockToastService.Object,
            _mockDialogService.Object,
            user: null,
            accessToken: null,
            enableRotation: false,
            enableTimeUpdater: false
        );
    }

    private Border? FindBorderByGridColumn(UserControl view, int column)
    {
        var grid = view.Content as Grid;
        if (grid == null) return null;

        foreach (var child in grid.Children)
        {
            if (child is Border border && Grid.GetColumn(border) == column)
            {
                return border;
            }
        }
        return null;
    }

    private Grid? FindGridByColumn(UserControl view, int column)
    {
        var grid = view.Content as Grid;
        if (grid == null) return null;

        foreach (var child in grid.Children)
        {
            if (child is Grid childGrid && Grid.GetColumn(childGrid) == column)
            {
                return childGrid;
            }
        }
        return null;
    }
}
