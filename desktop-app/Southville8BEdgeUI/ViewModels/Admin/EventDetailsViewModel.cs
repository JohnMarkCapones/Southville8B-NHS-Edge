using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using System.Diagnostics;
using Avalonia.Media.Imaging;
using System.Net.Http;
using System.IO;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class EventDetailsViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;

    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    // Basic Info Properties
    [ObservableProperty] private string _id = string.Empty;
    [ObservableProperty] private string _title = string.Empty;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private string _date = string.Empty;
    [ObservableProperty] private string _time = string.Empty;
    [ObservableProperty] private string _location = string.Empty;
    [ObservableProperty] private string _status = string.Empty;
    [ObservableProperty] private string _visibility = string.Empty;
    [ObservableProperty] private string? _eventImage;
    [ObservableProperty] private Bitmap? _eventImageBitmap;

    // Timestamps
    [ObservableProperty] private DateTime _createdAt;
    [ObservableProperty] private DateTime _updatedAt;

    // Organizer Info
    [ObservableProperty] private string _organizerId = string.Empty;
    [ObservableProperty] private string _organizerName = string.Empty;
    [ObservableProperty] private string _organizerEmail = string.Empty;
    [ObservableProperty] private OrganizerDto? _organizer;

    // Collections
    public ObservableCollection<TagDto> Tags { get; } = new();
    public ObservableCollection<EventAdditionalInfoDto> AdditionalInfo { get; } = new();
    public ObservableCollection<EventHighlightDto> Highlights { get; } = new();
    public ObservableCollection<EventScheduleDto> Schedule { get; } = new();
    public ObservableCollection<EventFaqDto> Faq { get; } = new();

    // Loading States
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string? _errorMessage;

    public EventDetailsViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    // Computed Properties
    public string FormattedDate
    {
        get
        {
            if (DateTime.TryParse(Date, out var parsedDate))
            {
                return parsedDate.ToString("MMMM dd, yyyy");
            }
            return Date;
        }
    }

    public string FormattedTime
    {
        get
        {
            if (TimeSpan.TryParse(Time, out var parsedTime))
            {
                return parsedTime.ToString(@"hh\:mm");
            }
            return Time;
        }
    }

    public string TagsList
    {
        get
        {
            if (Tags.Count == 0) return "No tags added";
            return string.Join(", ", Tags.Select(t => t.Name));
        }
    }

    public string StatusColor
    {
        get
        {
            return Status.ToLower() switch
            {
                "draft" => "#F59E0B",      // Yellow
                "published" => "#10B981",  // Green
                "cancelled" => "#EF4444",  // Red
                "completed" => "#3B82F6",  // Blue
                _ => "#6B7280"             // Gray
            };
        }
    }

    public string StatusDisplayText
    {
        get
        {
            return Status.ToLower() switch
            {
                "draft" => "Draft",
                "published" => "Published",
                "cancelled" => "Cancelled",
                "completed" => "Completed",
                _ => Status
            };
        }
    }

    public string VisibilityDisplayText
    {
        get
        {
            return Visibility.ToLower() switch
            {
                "public" => "Public",
                "private" => "Private",
                _ => Visibility
            };
        }
    }

    public bool HasAdditionalInfo => AdditionalInfo.Count > 0;
    public bool HasHighlights => Highlights.Count > 0;
    public bool HasSchedule => Schedule.Count > 0;
    public bool HasFaq => Faq.Count > 0;
    public bool HasTags => Tags.Count > 0;

    // Commands
    [RelayCommand]
    private void GoBack()
    {
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void EditEvent()
    {
        if (NavigateTo is null) return;
        
        // Create EventDto from current data
        var eventDto = new EventDto
        {
            Id = Id,
            Title = Title,
            Description = Description,
            Date = Date,
            Time = Time,
            Location = Location,
            OrganizerId = OrganizerId,
            EventImage = EventImage,
            Status = Status,
            Visibility = Visibility,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt,
            Organizer = Organizer,
            Tags = Tags.ToList(),
            Faq = Faq.ToList()
        };
        
        var userId = _apiClient.GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            Debug.WriteLine("User not authenticated");
            return;
        }
        
        // Navigate to CreateEventViewModel in edit mode
        var editVm = new CreateEventViewModel(_apiClient, userId, eventDto)
        {
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnSaved = async () =>
            {
                // Reload event details after save
                await LoadEventDetailsAsync(Id);
            }
        };
        
        NavigateTo(editVm);
    }

    [RelayCommand]
    private async Task DeleteEvent()
    {
        // TODO: Show confirmation dialog and delete event
        Debug.WriteLine($"Delete event: {Id}");
        await Task.CompletedTask;
    }

    private async Task LoadEventImage(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) 
        {
            EventImageBitmap = null;
            return;
        }
        
        try
        {
            Debug.WriteLine($"Loading image from URL: {imageUrl}");
            
            using var httpClient = new HttpClient();
            var imageBytes = await httpClient.GetByteArrayAsync(imageUrl);
            
            Debug.WriteLine($"Image downloaded: {imageBytes.Length} bytes");
            
            using var ms = new MemoryStream(imageBytes);
            EventImageBitmap = new Bitmap(ms);
            
            Debug.WriteLine("Image bitmap created successfully");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Failed to load image: {ex.Message}");
            EventImageBitmap = null;
        }
    }

    // Load event details from API
    public async Task LoadEventDetailsAsync(string eventId)
    {
        IsLoading = true;
        HasError = false;
        ErrorMessage = null;

        try
        {
            Debug.WriteLine($"Loading event details for ID: {eventId}");
            
            var eventDto = await _apiClient.GetEventByIdAsync(eventId);
            
            if (eventDto == null)
            {
                HasError = true;
                ErrorMessage = "Event not found";
                return;
            }

            // Map basic properties
            Id = eventDto.Id;
            Title = eventDto.Title;
            Description = eventDto.Description;
            Date = eventDto.Date;
            Time = eventDto.Time;
            Location = eventDto.Location;
            Status = eventDto.Status;
            Visibility = eventDto.Visibility;
            EventImage = eventDto.EventImage;
            CreatedAt = eventDto.CreatedAt;
            UpdatedAt = eventDto.UpdatedAt;

            // Load image bitmap
            await LoadEventImage(eventDto.EventImage);

            // Debug logging for basic properties
            Debug.WriteLine($"API Response - Description: '{eventDto.Description}'");
            Debug.WriteLine($"API Response - Title: '{eventDto.Title}'");
            Debug.WriteLine($"API Response - Location: '{eventDto.Location}'");
            Debug.WriteLine($"API Response - EventImage: '{eventDto.EventImage}'");

            // Map organizer info
            if (eventDto.Organizer != null)
            {
                OrganizerId = eventDto.OrganizerId;
                Organizer = eventDto.Organizer;
                OrganizerName = eventDto.Organizer.FullName;
                OrganizerEmail = eventDto.Organizer.Email;
                
                // Debug logging
                Debug.WriteLine($"API Response - Organizer Name: '{eventDto.Organizer.FullName}'");
                Debug.WriteLine($"API Response - Organizer Email: '{eventDto.Organizer.Email}'");
            }
            else
            {
                Debug.WriteLine("API Response - Organizer is null");
            }

            // Clear and populate collections
            Tags.Clear();
            if (eventDto.Tags != null)
            {
                foreach (var tag in eventDto.Tags)
                {
                    Tags.Add(tag);
                }
            }

            AdditionalInfo.Clear();
            if (eventDto.AdditionalInfo != null)
            {
                foreach (var info in eventDto.AdditionalInfo.OrderBy(x => x.OrderIndex))
                {
                    AdditionalInfo.Add(info);
                }
            }

            Highlights.Clear();
            if (eventDto.Highlights != null)
            {
                foreach (var highlight in eventDto.Highlights.OrderBy(x => x.OrderIndex))
                {
                    Highlights.Add(highlight);
                }
            }

            Schedule.Clear();
            if (eventDto.Schedule != null)
            {
                foreach (var scheduleItem in eventDto.Schedule.OrderBy(x => x.OrderIndex))
                {
                    Schedule.Add(scheduleItem);
                }
            }

            Faq.Clear();
            if (eventDto.Faq != null)
            {
                foreach (var faq in eventDto.Faq)
                {
                    Faq.Add(faq);
                }
            }

            // Update computed properties after loading data
            UpdateComputedProperties();
            
            Debug.WriteLine($"Successfully loaded event: {Title}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading event details: {ex.Message}");
            HasError = true;
            ErrorMessage = $"Failed to load event details: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    // Update computed properties when collections change
    private void UpdateComputedProperties()
    {
        OnPropertyChanged(nameof(TagsList));
        OnPropertyChanged(nameof(HasTags));
        OnPropertyChanged(nameof(HasAdditionalInfo));
        OnPropertyChanged(nameof(HasHighlights));
        OnPropertyChanged(nameof(HasSchedule));
        OnPropertyChanged(nameof(HasFaq));
    }

    partial void OnDateChanged(string value)
    {
        OnPropertyChanged(nameof(FormattedDate));
    }

    partial void OnTimeChanged(string value)
    {
        OnPropertyChanged(nameof(FormattedTime));
    }

    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(StatusColor));
        OnPropertyChanged(nameof(StatusDisplayText));
    }

    partial void OnVisibilityChanged(string value)
    {
        OnPropertyChanged(nameof(VisibilityDisplayText));
    }
}
