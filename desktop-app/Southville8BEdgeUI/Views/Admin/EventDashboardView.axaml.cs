using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.VisualTree;
using Southville8BEdgeUI.Utils;
using Southville8BEdgeUI.ViewModels.Admin;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System; // added for Exception

namespace Southville8BEdgeUI.Views.Admin;

public partial class EventDashboardView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;
    
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveInputElements = new();

    public EventDashboardView()
    {
        InitializeComponent();
        // Do NOT override DataContext at runtime; shell provides the VM with navigation callbacks.
        if (Design.IsDesignMode)
        {
            // For design mode, we need to provide a mock IApiClient
            var mockApiClient = new MockApiClient();
            DataContext = new EventDashboardViewModel(mockApiClient);
        }

        InitializeResponsiveElements();
        this.SizeChanged += OnSizeChanged;
    }

    // Confirmation + toast on delete via services from AdminShellView
    private async void OnDeleteClicked(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        var eventItem = btn.DataContext as EventViewModel;
        if (eventItem is null) return;

        var shell = this.GetVisualAncestors().OfType<AdminShellView>().FirstOrDefault();
        if (shell is null) return;

        var confirmed = await shell.Dialogs.ConfirmDeleteAsync(
            $"Delete \"{eventItem.Title}\"?",
            "This action cannot be undone. Do you want to continue?");

        if (!confirmed) return;

        if (DataContext is EventDashboardViewModel vm && vm.DeleteEventCommand.CanExecute(eventItem))
        {
            try
            {
                vm.DeleteEventCommand.Execute(eventItem);
                shell.Toasts.Success($"\"{eventItem.Title}\" was deleted.", title: "Event deleted");
            }
            catch (Exception ex)
            {
                shell.Toasts.Error($"Failed to delete event: {ex.Message}", title: "Delete Failed");
            }
        }
    }

    private void InitializeResponsiveElements()
    {
        _responsiveTextElements.AddRange(new Control[]
        {
            MainHeaderText,
            SubtitleText,
            TotalEventsValue,
            ThisWeekEventsValue,
            UpcomingEventsValue,
            PastEventsValue,
            EmptyTitleText,
            EmptySubtitleText
        });

        _responsiveCardElements.AddRange(new Control[]
        {
            StatsCard1, StatsCard2, StatsCard3, StatsCard4, FilterCard, EmptyStateCard
    });

        _responsiveButtonElements.AddRange(new Control[]
        {
            RefreshButton,
            CreateButton
        });

        _responsiveInputElements.AddRange(new Control[]
        {
            SearchInput,
            StatusFilter,
            TypeFilter,
            TagFilter
        });
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateResponsiveClasses(e.NewSize.Width);
    }

    private void UpdateResponsiveClasses(double width)
    {
        string sizeClass = GetSizeClass(width);

        UpdateMainContainerClasses(sizeClass);
        UpdateElementClasses(_responsiveTextElements, sizeClass);
        UpdateElementClasses(_responsiveCardElements, sizeClass);
        UpdateElementClasses(_responsiveButtonElements, sizeClass);
        UpdateElementClasses(_responsiveInputElements, sizeClass);

        UpdateLayoutClasses(sizeClass, width);
        UpdateEventCardElements(sizeClass);
    }

    private string GetSizeClass(double width)
    {
        if (width < MobileBreakpoint) return "mobile";
        else if (width < TabletBreakpoint) return "tablet";
        else return "desktop";
    }

    private void UpdateMainContainerClasses(string sizeClass)
    {
        // Only manipulate the Classes collection; do not assign to it.
        MainStackPanel.Classes.Remove("main-content");
        MainStackPanel.Classes.Remove("main-content-tablet");
        MainStackPanel.Classes.Remove("main-content-mobile");

        switch (sizeClass)
        {
            case "mobile":
                MainStackPanel.Classes.Add("main-content-mobile");
                break;
            case "tablet":
                MainStackPanel.Classes.Add("main-content-tablet");
                break;
            default:
                MainStackPanel.Classes.Add("main-content");
                break;
        }
    }

    private void UpdateElementClasses(List<Control> elements, string sizeClass)
    {
        foreach (var element in elements)
        {
            // Do not assign to element.Classes; only Add/Remove.
            element.Classes.Remove("mobile");
            element.Classes.Remove("tablet");

            if (sizeClass != "desktop")
                element.Classes.Add(sizeClass);
        }
    }

    private void UpdateLayoutClasses(string sizeClass, double width)
    {
        switch (sizeClass)
        {
            case "mobile":
                SetupMobileStatsGrid();
                SetupMobileFilterGrid();
                SetupMobileHeaderLayout();
                break;

            case "tablet":
                SetupTabletStatsGrid();
                SetupTabletFilterGrid();
                SetupTabletHeaderLayout();
                break;

            default:
                SetupDesktopStatsGrid();
                SetupDesktopFilterGrid();
                SetupDesktopHeaderLayout();
                break;
        }
    }

    private void UpdateEventCardElements(string sizeClass)
    {
        var itemsControl = EventsGrid;
        if (itemsControl != null)
        {
            UpdateEventCardsRecursively(itemsControl, sizeClass);
        }
    }

    private void UpdateEventCardsRecursively(Control control, string sizeClass)
    {
        if (control.Name == "EventCard" && control is Border eventCard)
        {
            eventCard.Classes.Remove("mobile");
            eventCard.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                eventCard.Classes.Add(sizeClass);
        }

        if (control.Name?.EndsWith("Text") == true && control is TextBlock textBlock)
        {
            textBlock.Classes.Remove("mobile");
            textBlock.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                textBlock.Classes.Add(sizeClass);
        }

        if (control.Name?.EndsWith("Button") == true && control is Button button)
        {
            button.Classes.Remove("mobile");
            button.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                button.Classes.Add(sizeClass);
        }

        if (control.Name == "StatusIndicator" && control is Border border)
        {
            border.Classes.Remove("mobile");
            border.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                border.Classes.Add(sizeClass);
        }

        if (control is Panel panel)
        {
            foreach (Control child in panel.Children)
                UpdateEventCardsRecursively(child, sizeClass);
        }
        else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
        {
            UpdateEventCardsRecursively(contentChild, sizeClass);
        }
        // ItemsControl children are created by template; handled via recursion on visual tree above.
    }

    private void SetupMobileHeaderLayout()
    {
        HeaderGrid.ColumnDefinitions.Clear();
        HeaderGrid.RowDefinitions.Clear();

        HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(HeaderButtons, 0);
        Grid.SetRow(HeaderButtons, 1);
        Grid.SetColumnSpan(HeaderButtons, 1);

        HeaderButtons.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch;
        HeaderButtons.Margin = new Thickness(0, 12, 0, 0);
    }

    private void SetupTabletHeaderLayout() => SetupDesktopHeaderLayout();

    private void SetupDesktopHeaderLayout()
    {
        HeaderGrid.ColumnDefinitions.Clear();
        HeaderGrid.RowDefinitions.Clear();

        HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(HeaderButtons, 1);
        Grid.SetRow(HeaderButtons, 0);
        Grid.SetColumnSpan(HeaderButtons, 1);

        HeaderButtons.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right;
        HeaderButtons.Margin = new Thickness(0);
    }

    private void SetupMobileStatsGrid()
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();

        StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (int i = 0; i < 4; i++)
            StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(StatsCard1, 0); Grid.SetRow(StatsCard1, 0);
        Grid.SetColumn(StatsCard2, 0); Grid.SetRow(StatsCard2, 1);
        Grid.SetColumn(StatsCard3, 0); Grid.SetRow(StatsCard3, 2);
        Grid.SetColumn(StatsCard4, 0); Grid.SetRow(StatsCard4, 3);

        StatsCard1.Margin = new Thickness(0, 0, 0, 8);
        StatsCard2.Margin = new Thickness(0, 8, 0, 8);
        StatsCard3.Margin = new Thickness(0, 8, 0, 8);
        StatsCard4.Margin = new Thickness(0, 8, 0, 0);
    }

    private void SetupTabletStatsGrid()
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();

        StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(StatsCard1, 0); Grid.SetRow(StatsCard1, 0);
        Grid.SetColumn(StatsCard2, 1); Grid.SetRow(StatsCard2, 0);
        Grid.SetColumn(StatsCard3, 0); Grid.SetRow(StatsCard3, 1);
        Grid.SetColumn(StatsCard4, 1); Grid.SetRow(StatsCard4, 1);

        StatsCard1.Margin = new Thickness(0, 0, 8, 8);
        StatsCard2.Margin = new Thickness(8, 0, 0, 8);
        StatsCard3.Margin = new Thickness(0, 8, 8, 0);
        StatsCard4.Margin = new Thickness(8, 8, 0, 0);
    }

    private void SetupDesktopStatsGrid()
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();

        for (int i = 0; i < 4; i++)
            StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(StatsCard1, 0); Grid.SetRow(StatsCard1, 0);
        Grid.SetColumn(StatsCard2, 1); Grid.SetRow(StatsCard2, 0);
        Grid.SetColumn(StatsCard3, 2); Grid.SetRow(StatsCard3, 0);
        Grid.SetColumn(StatsCard4, 3); Grid.SetRow(StatsCard4, 0);

        StatsCard1.Margin = new Thickness(0, 0, 12, 0);
        StatsCard2.Margin = new Thickness(12, 0);
        StatsCard3.Margin = new Thickness(12, 0);
        StatsCard4.Margin = new Thickness(12, 0, 0, 0);
    }

    private void SetupMobileFilterGrid()
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();

        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (int i = 0; i < 5; i++)
            FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(SearchInput, 0); Grid.SetRow(SearchInput, 0);
        Grid.SetColumn(StatusFilter, 0); Grid.SetRow(StatusFilter, 2);
        Grid.SetColumn(TypeFilter, 0); Grid.SetRow(TypeFilter, 3);
        Grid.SetColumn(TagFilter, 0); Grid.SetRow(TagFilter, 4);

        if (FilterGrid.Children.OfType<Border>().FirstOrDefault() is Border separator)
        {
            Grid.SetColumn(separator, 0);
            Grid.SetRow(separator, 1);
            separator.IsVisible = false;
        }

        SearchInput.Margin = new Thickness(0, 0, 0, 8);
        StatusFilter.Margin = new Thickness(0, 8, 0, 8);
        TypeFilter.Margin = new Thickness(0, 8, 0, 8);
        TagFilter.Margin = new Thickness(0, 8, 0, 0);
    }

    private void SetupTabletFilterGrid()
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();

        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(SearchInput, 0); Grid.SetRow(SearchInput, 0); Grid.SetColumnSpan(SearchInput, 3);
        Grid.SetColumn(StatusFilter, 0); Grid.SetRow(StatusFilter, 1);
        Grid.SetColumn(TypeFilter, 1); Grid.SetRow(TypeFilter, 1);
        Grid.SetColumn(TagFilter, 2); Grid.SetRow(TagFilter, 1);

        if (FilterGrid.Children.OfType<Border>().FirstOrDefault() is Border separator)
            separator.IsVisible = false;

        SearchInput.Margin = new Thickness(0, 0, 0, 8);
        StatusFilter.Margin = new Thickness(0, 8, 8, 0);
        TypeFilter.Margin = new Thickness(8, 8);
        TagFilter.Margin = new Thickness(8, 8, 0, 0);
    }

    private void SetupDesktopFilterGrid()
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();

        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));

        FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(SearchInput, 0); Grid.SetRow(SearchInput, 0);
        Grid.SetColumn(StatusFilter, 2); Grid.SetRow(StatusFilter, 0);
        Grid.SetColumn(TypeFilter, 3); Grid.SetRow(TypeFilter, 0);
        Grid.SetColumn(TagFilter, 4); Grid.SetRow(TagFilter, 0);

        if (FilterGrid.Children.OfType<Border>().FirstOrDefault() is Border separator)
        {
            Grid.SetColumn(separator, 1);
            Grid.SetRow(separator, 0);
            separator.IsVisible = true;
        }

        SearchInput.Margin = new Thickness(0);
        StatusFilter.Margin = new Thickness(12, 0);
        TypeFilter.Margin = new Thickness(12, 0);
        TagFilter.Margin = new Thickness(12, 0);
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);

        if (Bounds.Width > 0)
        {
            UpdateResponsiveClasses(Bounds.Width);
        }
    }
}

// Mock API client for design mode
public class MockApiClient : IApiClient
{
    public Task<T?> GetAsync<T>(string endpoint) where T : class => Task.FromResult<T?>(null);
    public Task<T?> PostAsync<T>(string endpoint, object? data = null) where T : class => Task.FromResult<T?>(null);
    public Task<T?> PutAsync<T>(string endpoint, object? data = null) where T : class => Task.FromResult<T?>(null);
    public Task<T?> PatchAsync<T>(string endpoint, object? data = null) where T : class => Task.FromResult<T?>(null);
    public Task<T?> DeleteAsync<T>(string endpoint) where T : class => Task.FromResult<T?>(null);
    public Task<bool> PostAsync(string endpoint, object? data = null) => Task.FromResult(false);
    public Task<bool> PutAsync(string endpoint, object? data = null) => Task.FromResult(false);
    public Task<bool> PatchAsync(string endpoint, object? data = null) => Task.FromResult(false);
    public Task<bool> DeleteAsync(string endpoint) => Task.FromResult(false);
    public Task<UserProfile?> GetUserProfileAsync(string userId) => Task.FromResult<UserProfile?>(null);
    public Task<UserProfile?> GetUserProfileAsync(string userId, string accessToken) => Task.FromResult<UserProfile?>(null);
    public Task<AdminDashboardMetrics?> GetAdminDashboardMetricsAsync() => Task.FromResult<AdminDashboardMetrics?>(null);
    public Task<UserListResponse?> GetUsersAsync(string? role = null, string? status = null, string? search = null, int page = 1, int limit = 25) => Task.FromResult<UserListResponse?>(null);
    public Task<CreateUserResponse?> CreateStudentAsync(CreateStudentDto dto) => Task.FromResult<CreateUserResponse?>(null);
    public Task<CreateUserResponse?> CreateTeacherAsync(CreateTeacherDto dto) => Task.FromResult<CreateUserResponse?>(null);
    public Task<CreateUserResponse?> CreateAdminAsync(CreateAdminDto dto) => Task.FromResult<CreateUserResponse?>(null);
    public Task<bool> UpdateUserStatusAsync(string userId, string status) => Task.FromResult(false);
    public Task<bool> DeleteUserAsync(string userId) => Task.FromResult(false);
    public Task<BulkImportResultDto?> ImportStudentsCsvAsync(ImportStudentsCsvDto dto) => Task.FromResult<BulkImportResultDto?>(null);
    public Task<BulkImportResultDto?> ImportTeachersCsvAsync(ImportTeachersCsvDto dto) => Task.FromResult<BulkImportResultDto?>(null);
    public Task<ResetPasswordResponseDto?> ResetPasswordAsync(string userId) => Task.FromResult<ResetPasswordResponseDto?>(null);
    public Task<ChangePasswordResponseDto?> ChangePasswordAsync(string currentPassword, string newPassword) => Task.FromResult<ChangePasswordResponseDto?>(null);
    public Task<AdminChangePasswordResponseDto?> AdminChangePasswordAsync(string userId, string newPassword) => Task.FromResult<AdminChangePasswordResponseDto?>(null);
    public Task<ForgotPasswordResponseDto?> SendPasswordResetEmailAsync(string email) => Task.FromResult<ForgotPasswordResponseDto?>(null);
    public Task<SectionListResponse?> GetSectionsAsync(int limit = 100) => Task.FromResult<SectionListResponse?>(null);
    public Task<BuildingListResponse?> GetBuildingsAsync(int limit = 100) => Task.FromResult<BuildingListResponse?>(null);
    public Task<BuildingDto?> GetBuildingByIdAsync(string id) => Task.FromResult<BuildingDto?>(null);
    public Task<BuildingDto?> CreateBuildingAsync(CreateBuildingDto dto) => Task.FromResult<BuildingDto?>(null);
    public Task<BuildingDto?> UpdateBuildingAsync(string id, UpdateBuildingDto dto) => Task.FromResult<BuildingDto?>(null);
    public Task<bool> DeleteBuildingAsync(string id) => Task.FromResult(false);
    public Task<FloorListResponse?> GetFloorsAsync(string? buildingId = null, int limit = 100) => Task.FromResult<FloorListResponse?>(null);
    public Task<FloorDto?> GetFloorByIdAsync(string id) => Task.FromResult<FloorDto?>(null);
    public Task<FloorDto?> CreateFloorAsync(CreateFloorDto dto) => Task.FromResult<FloorDto?>(null);
    public Task<FloorDto?> UpdateFloorAsync(string id, UpdateFloorDto dto) => Task.FromResult<FloorDto?>(null);
    public Task<bool> DeleteFloorAsync(string id) => Task.FromResult(false);
    public Task<RoomListResponse?> GetRoomsAsync(string? floorId = null, string? buildingId = null, string? status = null, int limit = 100) => Task.FromResult<RoomListResponse?>(null);
    public Task<RoomDto?> GetRoomByIdAsync(string id) => Task.FromResult<RoomDto?>(null);
    public Task<RoomDto?> CreateRoomAsync(CreateRoomDto dto) => Task.FromResult<RoomDto?>(null);
    public Task<List<RoomDto>?> CreateRoomsBulkAsync(List<CreateRoomDto> rooms) => Task.FromResult<List<RoomDto>?>(null);
    public Task<RoomDto?> UpdateRoomAsync(string id, UpdateRoomDto dto) => Task.FromResult<RoomDto?>(null);
    public Task<bool> DeleteRoomAsync(string id) => Task.FromResult(false);
    public Task<DepartmentsResponse?> GetDepartmentsAsync(int page = 1, int limit = 100) => Task.FromResult<DepartmentsResponse?>(null);
    public Task<SubjectsResponse?> GetSubjectsByDepartmentAsync(string departmentId, int page = 1, int limit = 100) => Task.FromResult<SubjectsResponse?>(null);
    public Task<EventListResponse?> GetEventsAsync(int page = 1, int limit = 10, string? status = null, string? search = null, string? tagId = null) => Task.FromResult<EventListResponse?>(null);
    public Task<EventStatisticsDto?> GetEventStatisticsAsync() => Task.FromResult<EventStatisticsDto?>(null);
    public Task<List<TagDto>?> GetEventTagsAsync() => Task.FromResult<List<TagDto>?>(null);
    public Task<EventDto?> GetEventByIdAsync(string id) => Task.FromResult<EventDto?>(null);
    public Task<EventDto?> CreateEventAsync(CreateEventDto dto) => Task.FromResult<EventDto?>(null);
    public Task<EventDto?> UpdateEventAsync(string id, UpdateEventDto dto) => Task.FromResult<EventDto?>(null);
    public Task<bool> DeleteEventAsync(string id) => Task.FromResult(false);
    
    // Event FAQ Management Methods
    public Task<EventFaqDto?> AddEventFaqAsync(string eventId, CreateEventFaqDto dto) => Task.FromResult<EventFaqDto?>(null);
    public Task<EventFaqDto?> UpdateEventFaqAsync(string eventId, string faqId, UpdateEventFaqDto dto) => Task.FromResult<EventFaqDto?>(null);
    public Task DeleteEventFaqAsync(string eventId, string faqId) => Task.CompletedTask;
    
    // Event Image Upload
    public Task<string?> UploadEventImageAsync(string filePath) => Task.FromResult<string?>(null);
    
    public void SetAccessToken(string accessToken) { }
    public string? GetCurrentUserId() => "mock-user-id";
    public string? GetCachedToken() => "mock-token";
     public void InvalidateCachePrefix(string prefix) { }

    // Alerts API (stubs for design-time)
    public Task<AlertListResponse?> GetAlertsAsync(int page = 1, int limit = 50) => Task.FromResult<AlertListResponse?>(new AlertListResponse { Data = new List<AlertDto>() });
    public Task<AlertDto?> CreateAlertAsync(CreateAlertDto dto) => Task.FromResult<AlertDto?>(new AlertDto { Id = Guid.NewGuid().ToString(), Type = dto.Type, Title = dto.Title, Message = dto.Message, ExpiresAt = DateTimeOffset.Now.AddDays(1), CreatedAt = DateTimeOffset.Now, UpdatedAt = DateTimeOffset.Now });
    public Task<AlertDto?> UpdateAlertAsync(string id, UpdateAlertDto dto) => Task.FromResult<AlertDto?>(null);
    public Task<bool> DeleteAlertAsync(string id) => Task.FromResult(true);
    
    // Teacher-specific API methods (stubs for design-time)
    public Task<TeacherSidebarMetrics?> GetTeacherMetricsAsync(string teacherId) => Task.FromResult<TeacherSidebarMetrics?>(null);
    public Task<List<ScheduleDto>?> GetTeacherTodaySchedulesAsync(string teacherId) => Task.FromResult<List<ScheduleDto>?>(null);
    public Task<List<TeacherActivityDto>?> GetTeacherRecentActivitiesAsync(string teacherId) => Task.FromResult<List<TeacherActivityDto>?>(null);
    
    // GWA Management Methods (stubs for design-time)
    public Task<StudentGwaListResponse?> GetAdvisoryStudentsWithGwaAsync(string gradingPeriod, string schoolYear) => Task.FromResult<StudentGwaListResponse?>(null);
    public Task<StudentGwaDto?> CreateGwaEntryAsync(CreateGwaDto dto) => Task.FromResult<StudentGwaDto?>(null);
    public Task<StudentGwaDto?> UpdateGwaEntryAsync(string id, UpdateGwaDto dto) => Task.FromResult<StudentGwaDto?>(null);
    public Task<bool> DeleteGwaEntryAsync(string id) => Task.FromResult(false);
    
    // Schedule Management Methods (stubs for design-time)
    public Task<ScheduleListResponse?> GetSchedulesAsync(int page = 1, int limit = 20, string? sectionId = null, string? teacherId = null, string? dayOfWeek = null, string? schoolYear = null, string? semester = null) => Task.FromResult<ScheduleListResponse?>(null);
    public Task<ScheduleDto?> GetScheduleByIdAsync(string scheduleId) => Task.FromResult<ScheduleDto?>(null);
    public Task<ScheduleDto?> CreateScheduleAsync(CreateScheduleDto dto) => Task.FromResult<ScheduleDto?>(null);
    public Task<ScheduleDto?> UpdateScheduleAsync(string scheduleId, UpdateScheduleDto dto) => Task.FromResult<ScheduleDto?>(null);
    public Task<bool> DeleteScheduleAsync(string scheduleId) => Task.FromResult(false);
    public Task<List<ScheduleDto>?> BulkCreateSchedulesAsync(List<CreateScheduleDto> schedules) => Task.FromResult<List<ScheduleDto>?>(null);
    public Task<bool> AssignStudentsToScheduleAsync(string scheduleId, AssignStudentsDto dto) => Task.FromResult(false);
    public Task<bool> RemoveStudentsFromScheduleAsync(string scheduleId, List<string> studentIds) => Task.FromResult(false);
    public Task<ConflictCheckResult?> CheckScheduleConflictsAsync(CreateScheduleDto dto) => Task.FromResult<ConflictCheckResult?>(null);
    public Task<List<Subject>?> GetSubjectsAsync() => Task.FromResult<List<Subject>?>(null);
    public Task<List<SectionDto>?> GetSectionsAsync() => Task.FromResult<List<SectionDto>?>(null);
    public Task<List<UserDto>?> GetTeachersAsync() => Task.FromResult<List<UserDto>?>(null);
    public Task<List<RoomDto>?> GetRoomsAsync() => Task.FromResult<List<RoomDto>?>(null);
    public Task<List<BuildingDto>?> GetBuildingsAsync() => Task.FromResult<List<BuildingDto>?>(null);
    
    // Announcement Management Methods (stubs for design-time)
    public Task<AnnouncementListResponse?> GetAnnouncementsAsync(string? teacherId = null, string? sectionId = null, string? visibility = null, string? type = null, bool? includeExpired = null, int page = 1, int limit = 100) => Task.FromResult<AnnouncementListResponse?>(null);
    public Task<AnnouncementDto?> GetAnnouncementByIdAsync(string id) => Task.FromResult<AnnouncementDto?>(null);
    public Task<AnnouncementDto?> CreateAnnouncementAsync(CreateAnnouncementDto dto) => Task.FromResult<AnnouncementDto?>(null);
    public Task<AnnouncementDto?> UpdateAnnouncementAsync(string id, UpdateAnnouncementDto dto) => Task.FromResult<AnnouncementDto?>(null);
    public Task DeleteAnnouncementAsync(string id) => Task.CompletedTask;
    public Task<AnnouncementStatsDto?> GetAnnouncementStatsAsync(string teacherId) => Task.FromResult<AnnouncementStatsDto?>(null);
    public Task<List<SectionDto>?> GetMySectionsAsync() => Task.FromResult<List<SectionDto>?>(null);
    public Task<DepartmentDto?> GetDepartmentAsync(string departmentId) => Task.FromResult<DepartmentDto?>(null);
    public Task<SubjectDto?> GetSubjectAsync(string subjectId) => Task.FromResult<SubjectDto?>(null);
    public Task<SectionDto?> GetSectionAsync(string sectionId) => Task.FromResult<SectionDto?>(null);
    public Task<AcademicYearDto?> GetActiveAcademicYearAsync() => Task.FromResult<AcademicYearDto?>(null);
    public Task<StudentDistributionDto?> GetStudentDistributionAsync() => Task.FromResult<StudentDistributionDto?>(new StudentDistributionDto
    {
        Total = 0,
        Grades = new List<StudentDistributionGradeDto>
        {
            new StudentDistributionGradeDto{ Grade = "Grade 7", Count = 0 },
            new StudentDistributionGradeDto{ Grade = "Grade 8", Count = 0 },
            new StudentDistributionGradeDto{ Grade = "Grade 9", Count = 0 },
            new StudentDistributionGradeDto{ Grade = "Grade 10", Count = 0 },
        }
    });
}

public class MockDialogService : IDialogService
{
    public Task<bool> ConfirmDeleteAsync(string title, string message)
    {
        return Task.FromResult(false);
    }

    public Task ShowInfoAsync(string title, System.Collections.Generic.Dictionary<string, string> details)
    {
        return Task.CompletedTask;
    }

    public Task<bool> ShowConfirmAsync(string title, string message, string confirmText = "OK", string cancelText = "Cancel")
    {
        return Task.FromResult(false);
    }

    public Task<string?> ShowInputDialogAsync(string title, string message, string placeholder = "", string initialValue = "")
    {
        return Task.FromResult<string?>(null);
    }

    public Task<string?> ShowChoiceDialogAsync(string title, string message, string option1Text, string option2Text)
    {
        return Task.FromResult<string?>(null);
    }
}