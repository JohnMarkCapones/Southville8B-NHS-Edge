using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Media;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class EventDashboardViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private bool _isInitialLoad = true;
    
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; }

    [ObservableProperty]
    private int _totalEvents = 0;

    [ObservableProperty]
    private int _thisWeekEvents = 0;

    [ObservableProperty]
    private int _upcomingEvents = 0;

    [ObservableProperty]
    private int _pastEvents = 0;

    [ObservableProperty]
    private ObservableCollection<EventViewModel> _events = new();

    [ObservableProperty]
    private ObservableCollection<EventViewModel> _filteredEvents = new();

    [ObservableProperty]
    private string _searchText = "";

    [ObservableProperty]
    private string? _selectedStatus;

    [ObservableProperty]
    private string? _selectedType;

    [ObservableProperty]
    private string? _selectedLocation;

    [ObservableProperty]
    private string? _selectedTag;

    // Loading and Error States
    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private bool _isLoadingMore;

    [ObservableProperty]
    private bool _hasError;

    [ObservableProperty]
    private string _errorMessage = "";

    // Pagination
    [ObservableProperty]
    private int _currentPage = 1;

    [ObservableProperty]
    private int _totalPages = 1;

    [ObservableProperty]
    private int _pageSize = 10;

    [ObservableProperty]
    private bool _canLoadMore = true;

    public ObservableCollection<string> StatusOptions { get; } = new() { "All Status", "draft", "published", "cancelled", "completed" };
    public ObservableCollection<string> TypeOptions { get; } = new() { "All Types", "Meeting", "Competition", "Holiday", "Academic", "Sports", "Cultural" };
    public ObservableCollection<string> LocationOptions { get; } = new() { "All Locations", "Main Hall", "Gymnasium", "Auditorium", "Classroom", "Online" };
    public ObservableCollection<TagDto> TagOptions { get; } = new();

    public bool HasFilteredEvents => FilteredEvents?.Any() == true;

    public EventDashboardViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
        Events = new ObservableCollection<EventViewModel>();
        FilteredEvents = new ObservableCollection<EventViewModel>(Events);
        
        // Only load on first creation
        if (_isInitialLoad)
        {
            _ = LoadInitialDataAsync();
            _isInitialLoad = false;
        }
    }

    [RelayCommand]
    public async Task RefreshData()
    {
        await LoadInitialDataAsync();
    }

    partial void OnSearchTextChanged(string value) => _ = LoadEventsAsync();
    partial void OnSelectedStatusChanged(string? value) => _ = LoadEventsAsync();
    partial void OnSelectedTypeChanged(string? value) => _ = LoadEventsAsync();
    partial void OnSelectedLocationChanged(string? value) => _ = LoadEventsAsync();
    partial void OnSelectedTagChanged(string? value) => _ = LoadEventsAsync();

    private async Task LoadInitialDataAsync()
    {
        await Task.WhenAll(
            LoadStatisticsAsync(),
            LoadFilterOptionsAsync(),
            LoadEventsAsync()
        );
    }

    private async Task LoadEventsAsync(bool append = false)
    {
        if (IsLoading) return;

        try
        {
            if (!append)
            {
                IsLoading = true;
                HasError = false;
                CurrentPage = 1;
            }
            else
            {
                IsLoadingMore = true;
            }

            var response = await _apiClient.GetEventsAsync(
                page: CurrentPage,
                limit: PageSize,
                status: SelectedStatus == "All Status" ? null : SelectedStatus,
                search: string.IsNullOrWhiteSpace(SearchText) ? null : SearchText,
                tagId: SelectedTag
            );

            if (response != null)
            {
                var newEvents = response.Data.Select(MapEventDtoToViewModel).ToList();

                if (append)
                {
                    foreach (var eventItem in newEvents)
                    {
                        Events.Add(eventItem);
                        FilteredEvents.Add(eventItem);
                    }
                }
                else
                {
                    Events.Clear();
                    FilteredEvents.Clear();
                    foreach (var eventItem in newEvents)
                    {
                        Events.Add(eventItem);
                        FilteredEvents.Add(eventItem);
                    }
                }

                TotalPages = response.Pagination.Pages;
                CanLoadMore = CurrentPage < TotalPages;
            }
        }
        catch (Exception ex)
        {
            HasError = true;
            ErrorMessage = $"Failed to load events: {ex.Message}";
            System.Diagnostics.Debug.WriteLine($"Error loading events: {ex}");
        }
        finally
        {
            IsLoading = false;
            IsLoadingMore = false;
            OnPropertyChanged(nameof(HasFilteredEvents));
        }
    }

    private async Task LoadStatisticsAsync()
    {
        try
        {
            var statistics = await _apiClient.GetEventStatisticsAsync();
            if (statistics != null)
            {
                TotalEvents = statistics.TotalEvents;
                ThisWeekEvents = statistics.ThisWeekEvents;
                UpcomingEvents = statistics.UpcomingEvents;
                PastEvents = statistics.PastEvents;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading statistics: {ex}");
        }
    }

    private async Task LoadFilterOptionsAsync()
    {
        try
        {
            var tags = await _apiClient.GetEventTagsAsync();
            if (tags != null)
            {
                TagOptions.Clear();
                foreach (var tag in tags)
                {
                    TagOptions.Add(tag);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading filter options: {ex}");
        }
    }

    private EventViewModel MapEventDtoToViewModel(EventDto dto)
    {
        return new EventViewModel
        {
            Id = dto.Id,
            Title = dto.Title,
            Description = dto.Description,
            Date = dto.Date,
            Time = dto.Time,
            Location = dto.Location,
            OrganizerId = dto.OrganizerId,
            EventImage = dto.EventImage,
            Status = dto.Status,
            Visibility = dto.Visibility,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt,
            Organizer = dto.Organizer?.FullName ?? "Unknown",
            Tags = dto.Tags?.Select(t => t.Name).ToList() ?? new List<string>()
        };
    }

    [RelayCommand]
    private async Task LoadMoreEvents()
    {
        if (CanLoadMore && !IsLoadingMore)
        {
            CurrentPage++;
            await LoadEventsAsync(append: true);
        }
    }

    [RelayCommand]
    private async Task RefreshEvents()
    {
        await LoadInitialDataAsync();
    }

    [RelayCommand] 
    private void CreateEvent()
    {
        if (NavigateTo is null) return;
        
        // TODO: Get current user ID from auth context
        var createVm = new CreateEventViewModel(_apiClient, "current-user-id")
        {
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnSaved = async () => { 
                await RefreshEvents(); 
                NavigateTo?.Invoke(this); 
            }
        };
        NavigateTo(createVm);
    }

    [RelayCommand] 
    private async Task ViewEventDetails(EventViewModel eventItem) 
    { 
        if (NavigateTo is null) return;
        
        var detailsVm = new EventDetailsViewModel(_apiClient)
        {
            NavigateBack = () => NavigateTo?.Invoke(this),
            NavigateTo = NavigateTo
        };
        
        NavigateTo(detailsVm);
        await detailsVm.LoadEventDetailsAsync(eventItem.Id);
    }
    
    [RelayCommand] 
    private void EditEvent(EventViewModel eventItem) 
    { 
        // TODO: Implement event edit view
    }
    
    [RelayCommand] 
    private async Task DeleteEvent(EventViewModel eventItem)
    {
        try
        {
            var success = await _apiClient.DeleteEventAsync(eventItem.Id);
            if (success)
    {
        Events.Remove(eventItem);
                FilteredEvents.Remove(eventItem);
                await LoadStatisticsAsync();
                OnPropertyChanged(nameof(HasFilteredEvents));
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting event: {ex}");
        }
    }
}

public partial class EventViewModel : ViewModelBase
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _description = "";
    [ObservableProperty] private string _date = ""; // YYYY-MM-DD
    [ObservableProperty] private string _time = ""; // HH:MM
    [ObservableProperty] private string _location = "";
    [ObservableProperty] private string _organizerId = "";
    [ObservableProperty] private string? _eventImage;
    [ObservableProperty] private string _status = ""; // draft/published/cancelled/completed
    [ObservableProperty] private string _visibility = "";
    [ObservableProperty] private DateTime _createdAt;
    [ObservableProperty] private DateTime _updatedAt;
    [ObservableProperty] private string _organizer = "";
    [ObservableProperty] private List<string> _tags = new();

    public string DisplayStatus => CalculateDisplayStatus();
    
    public bool IsUpcoming => DisplayStatus == "Upcoming";
    public bool IsOngoing => DisplayStatus == "Ongoing";
    public bool IsCompleted => DisplayStatus == "Completed";
    public bool IsCancelled => DisplayStatus == "Cancelled";
    public bool IsDraft => Status == "draft";
    public bool CanEdit => !IsCompleted && !IsCancelled;
    public bool CanCancel => IsUpcoming;

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush StatusBrush => DisplayStatus switch
    {
        "Upcoming" => Resolve("InfoBrush", "AccentBrush"),
        "Ongoing" => Resolve("SuccessBrush", "AccentBrush"),
        "Completed" => Resolve("TextSecondaryBrush", "TextMutedBrush"),
        "Cancelled" => Resolve("DangerBrush", "DangerBrush"),
        "Draft" => Resolve("WarningBrush", "AccentBrush"),
        _ => Resolve("TextSecondaryBrush", "TextMutedBrush")
    };

    private string CalculateDisplayStatus()
    {
        if (Status == "cancelled") return "Cancelled";
        if (Status == "completed") return "Completed";
        if (Status == "draft") return "Draft";
        
        // For published events, calculate based on date/time
        if (Status == "published")
        {
            try
            {
                var eventDateTime = DateTime.Parse($"{Date} {Time}");
                var now = DateTime.Now;
                
                if (eventDateTime > now) return "Upcoming";
                if (eventDateTime.Date == now.Date) return "Ongoing";
                return "Completed";
            }
            catch
            {
                return "Unknown";
            }
        }
        
        return "Unknown";
    }

    public string DateRange => DateTime.TryParse(Date, out var eventDate) 
        ? eventDate.ToString("MMM dd, yyyy")
        : Date;

    public string TimeRange
    {
        get
        {
            if (Time == "00:00")
                return "All Day";
            
            // Parse 24-hour format (HH:MM) and convert to 12-hour with AM/PM
            if (TimeSpan.TryParse(Time, out var timeSpan))
            {
                var dateTime = DateTime.Today.Add(timeSpan);
                return dateTime.ToString("h:mm tt"); // e.g., "2:30 PM"
            }
            
            // Fallback to original if parsing fails
            return Time;
        }
    }

    public string TagList => Tags?.Any() == true 
        ? string.Join(", ", Tags) 
        : "No tags";

    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(DisplayStatus));
        OnPropertyChanged(nameof(IsUpcoming));
        OnPropertyChanged(nameof(IsOngoing));
        OnPropertyChanged(nameof(IsCompleted));
        OnPropertyChanged(nameof(IsCancelled));
        OnPropertyChanged(nameof(IsDraft));
        OnPropertyChanged(nameof(StatusBrush));
        OnPropertyChanged(nameof(CanEdit));
        OnPropertyChanged(nameof(CanCancel));
    }

    partial void OnDateChanged(string value) => OnPropertyChanged(nameof(DateRange));
    partial void OnTimeChanged(string value) => OnPropertyChanged(nameof(TimeRange));
    partial void OnTagsChanged(List<string> value) => OnPropertyChanged(nameof(TagList));
}