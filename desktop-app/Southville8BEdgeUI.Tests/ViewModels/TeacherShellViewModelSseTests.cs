using Xunit;
using Moq;
using Southville8BEdgeUI.ViewModels;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System;
using Avalonia.Threading;
using Microsoft.Extensions.DependencyInjection;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherShellViewModelSseTests
{
    private readonly Mock<IApiClient> _mockApiClient;
    private readonly Mock<IDialogService> _mockDialogService;
    private readonly Mock<IToastService> _mockToastService;
    private readonly Mock<ISseService> _mockSseService;
    private readonly Mock<ITokenStorageService> _mockTokenStorage;

    public TeacherShellViewModelSseTests()
    {
        _mockApiClient = new Mock<IApiClient>();
        _mockDialogService = new Mock<IDialogService>();
        _mockToastService = new Mock<IToastService>();
        _mockSseService = new Mock<ISseService>();
        _mockTokenStorage = new Mock<ITokenStorageService>();
    }

    private TeacherShellViewModel CreateViewModel()
    {
        // Set up service locator mocks
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddSingleton(_mockApiClient.Object);
        serviceCollection.AddSingleton(_mockDialogService.Object);
        serviceCollection.AddSingleton(_mockToastService.Object);
        serviceCollection.AddSingleton(_mockSseService.Object);
        serviceCollection.AddSingleton(_mockTokenStorage.Object);
        
        var mockChatService = new Mock<IChatService>();
        serviceCollection.AddSingleton(mockChatService.Object);
        
        ServiceLocator.Services = serviceCollection.BuildServiceProvider();

        return new TeacherShellViewModel(
            _mockSseService.Object,
            _mockApiClient.Object,
            _mockTokenStorage.Object,
            _mockToastService.Object,
            _mockDialogService.Object,
            user: new UserDto { Id = "test-user", Email = "test@test.com" },
            accessToken: "test-token",
            enableRotation: false,
            enableTimeUpdater: false
        );
    }

    [Fact]
    public void OnTeacherMetricsUpdated_ShouldUpdateValues_WhenMetricsAreNotNull()
    {
        // Arrange
        var viewModel = CreateViewModel();
        var metrics = new TeacherSidebarMetrics
        {
            TotalClasses = 10,
            TotalAnnouncements = 5,
            TotalStudents = 100,
            UnreadMessages = 3
        };

        // Act
        viewModel.UpdateMetrics(metrics);

        // Assert
        Assert.Equal(10, viewModel.TotalClasses);
        Assert.Equal(5, viewModel.TotalAnnouncements);
        Assert.Equal(100, viewModel.TotalStudents);
        Assert.Equal(3, viewModel.UnreadMessages);
    }

    [Fact]
    public void OnTeacherMetricsUpdated_ShouldPreserveValues_WhenMetricsAreNull()
    {
        // Arrange
        var viewModel = CreateViewModel();
        
        // Set initial values
        viewModel.TotalClasses = 10;
        viewModel.TotalAnnouncements = 5;
        viewModel.TotalStudents = 100;
        viewModel.UnreadMessages = 3;

        var metrics = new TeacherSidebarMetrics
        {
            TotalClasses = null,
            TotalAnnouncements = null,
            TotalStudents = null,
            UnreadMessages = null
        };

        // Act
        viewModel.UpdateMetrics(metrics);

        // Assert
        Assert.Equal(10, viewModel.TotalClasses);
        Assert.Equal(5, viewModel.TotalAnnouncements);
        Assert.Equal(100, viewModel.TotalStudents);
        Assert.Equal(3, viewModel.UnreadMessages);
    }

    [Fact]
    public void OnTeacherMetricsUpdated_ShouldUpdateOnlyNonNullValues()
    {
        // Arrange
        var viewModel = CreateViewModel();
        
        // Set initial values
        viewModel.TotalClasses = 10;
        viewModel.TotalAnnouncements = 5;
        viewModel.TotalStudents = 100;
        viewModel.UnreadMessages = 3;

        var metrics = new TeacherSidebarMetrics
        {
            TotalClasses = 20, // Changed
            TotalAnnouncements = null, // Should preserve 5
            TotalStudents = 200, // Changed
            UnreadMessages = null // Should preserve 3
        };

        // Act
        viewModel.UpdateMetrics(metrics);

        // Assert
        Assert.Equal(20, viewModel.TotalClasses);
        Assert.Equal(5, viewModel.TotalAnnouncements);
        Assert.Equal(200, viewModel.TotalStudents);
        Assert.Equal(3, viewModel.UnreadMessages);
    }
}
