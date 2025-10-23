using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using System.Diagnostics;
using Avalonia.Platform.Storage;
using Avalonia.Controls;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateEventViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly string _currentUserId;
    private string? _eventId; // null for create, set for edit
    private TopLevel? _topLevel;

    public Action? NavigateBack { get; set; }
    public Action? OnSaved { get; set; }

    public void SetTopLevel(TopLevel topLevel)
    {
        _topLevel = topLevel;
    }

    // Edit mode properties
    public bool IsEditMode => !string.IsNullOrEmpty(_eventId);
    public string DialogTitle => IsEditMode ? "Edit Event" : "Create Event";
    public string SaveButtonText => IsEditMode ? "Update Event" : "Create Event";

    [ObservableProperty] private string _title = string.Empty;
    [ObservableProperty] private string _status = "draft"; // default
    [ObservableProperty] private DateTime _startDate = DateTime.Today;
    [ObservableProperty] private TimeSpan _startTime = new(9,0,0);
    [ObservableProperty] private string _location = string.Empty;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private string _visibility = "public";
    [ObservableProperty] private string? _eventImagePath;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _errorMessage;

    // Validation properties
    [ObservableProperty] private string? _titleValidationMessage;
    [ObservableProperty] private string? _descriptionValidationMessage;
    [ObservableProperty] private string? _locationValidationMessage;
    [ObservableProperty] private string? _dateValidationMessage;

    // Bridge properties for Avalonia DatePicker (SelectedDate is DateTimeOffset?) to avoid InvalidCastException
    [ObservableProperty] private DateTimeOffset? _startDateOffset;

    public ObservableCollection<TagDto> AvailableTags { get; } = new();
    public ObservableCollection<TagDto> SelectedTags { get; } = new();

    // FAQ Management Properties
    public ObservableCollection<EventFaqDto> Faq { get; } = new();

    [ObservableProperty] private string _newFaqQuestion = string.Empty;
    [ObservableProperty] private string _newFaqAnswer = string.Empty;
    [ObservableProperty] private EventFaqDto? _editingFaq;
    [ObservableProperty] private string _editFaqQuestion = string.Empty;
    [ObservableProperty] private string _editFaqAnswer = string.Empty;

    // Property change handlers for debugging
    partial void OnNewFaqQuestionChanged(string value)
    {
        Debug.WriteLine($"NewFaqQuestion changed to: '{value}'");
    }

    partial void OnNewFaqAnswerChanged(string value)
    {
        Debug.WriteLine($"NewFaqAnswer changed to: '{value}'");
    }

    public string[] StatusOptions { get; } = { "draft", "published", "cancelled", "completed" };
    public string[] VisibilityOptions { get; } = { "public", "private" };
    public string[] LocationOptions { get; } = { "Main Hall", "Gymnasium", "Auditorium", "Classroom", "Online" };

    public CreateEventViewModel(IApiClient apiClient, string currentUserId)
    {
        _apiClient = apiClient;
        _currentUserId = currentUserId;
        StartDateOffset = new DateTimeOffset(StartDate);
        _ = LoadTagsAsync();
    }

    // Constructor overload for edit mode
    public CreateEventViewModel(IApiClient apiClient, string currentUserId, EventDto? existingEvent) : this(apiClient, currentUserId)
    {
        if (existingEvent != null)
        {
            LoadExistingEvent(existingEvent);
        }
    }

    public bool CanSave =>
        !IsLoading &&
        !string.IsNullOrWhiteSpace(Title) && Title.Length >= 3 && Title.Length <= 200 &&
        !string.IsNullOrWhiteSpace(Description) && Description.Length >= 20 && Description.Length <= 5000 &&
        !string.IsNullOrWhiteSpace(Location) && Location.Length >= 3 && Location.Length <= 200 &&
        StartDate >= DateTime.Now.Date.AddYears(-1) &&
        !string.IsNullOrWhiteSpace(Status);

    public bool HasValidationErrors =>
        !string.IsNullOrWhiteSpace(TitleValidationMessage) ||
        !string.IsNullOrWhiteSpace(DescriptionValidationMessage) ||
        !string.IsNullOrWhiteSpace(LocationValidationMessage) ||
        !string.IsNullOrWhiteSpace(DateValidationMessage);

    partial void OnTitleChanged(string value) 
    {
        Debug.WriteLine($"Title changed to: '{value}'");
        
        // Validate title
        if (string.IsNullOrWhiteSpace(value))
        {
            TitleValidationMessage = "Title is required";
        }
        else if (value.Length < 3)
        {
            TitleValidationMessage = "Title must be at least 3 characters";
        }
        else if (value.Length > 200)
        {
            TitleValidationMessage = "Title must be no more than 200 characters";
        }
        else
        {
            TitleValidationMessage = null;
        }
        
        OnPropertyChanged(nameof(CanSave));
        OnPropertyChanged(nameof(HasValidationErrors));
    }
    
    partial void OnIsLoadingChanged(bool value) => OnPropertyChanged(nameof(CanSave));

    partial void OnDescriptionChanged(string value)
    {
        Debug.WriteLine($"Description changed to: '{value}'");
        
        // Validate description
        if (string.IsNullOrWhiteSpace(value))
        {
            DescriptionValidationMessage = "Description is required";
        }
        else if (value.Length < 20)
        {
            DescriptionValidationMessage = "Description must be at least 20 characters";
        }
        else if (value.Length > 5000)
        {
            DescriptionValidationMessage = "Description must be no more than 5000 characters";
        }
        else
        {
            DescriptionValidationMessage = null;
        }
        
        OnPropertyChanged(nameof(CanSave));
        OnPropertyChanged(nameof(HasValidationErrors));
    }

    partial void OnLocationChanged(string value)
    {
        Debug.WriteLine($"Location changed to: '{value}'");
        
        // Validate location
        if (string.IsNullOrWhiteSpace(value))
        {
            LocationValidationMessage = "Location is required";
        }
        else if (value.Length < 3)
        {
            LocationValidationMessage = "Location must be at least 3 characters";
        }
        else if (value.Length > 200)
        {
            LocationValidationMessage = "Location must be no more than 200 characters";
        }
        else
        {
            LocationValidationMessage = null;
        }
        
        OnPropertyChanged(nameof(CanSave));
        OnPropertyChanged(nameof(HasValidationErrors));
    }

    partial void OnStartDateChanged(DateTime value)
    {
        Debug.WriteLine($"StartDate changed to: {value}");
        
        // Validate date
        var oneYearAgo = DateTime.Now.Date.AddYears(-1);
        if (value < oneYearAgo)
        {
            DateValidationMessage = "Event date must be within the last year or in the future";
        }
        else
        {
            DateValidationMessage = null;
        }
        
        if (StartDateOffset?.Date != value.Date)
            StartDateOffset = new DateTimeOffset(value.Date);
            
        OnPropertyChanged(nameof(CanSave));
        OnPropertyChanged(nameof(HasValidationErrors));
    }

    partial void OnStartTimeChanged(TimeSpan value)
    {
        Debug.WriteLine($"StartTime changed to: {value}");
    }

    partial void OnStartDateOffsetChanged(DateTimeOffset? value)
    {
        Debug.WriteLine($"StartDateOffset changed to: {value}");
        if (value.HasValue && StartDate != value.Value.Date)
        {
            StartDate = value.Value.Date;
        }
    }

    private async Task LoadTagsAsync()
    {
        try
        {
            var tags = await _apiClient.GetEventTagsAsync();
            if (tags != null)
            {
                AvailableTags.Clear();
                foreach (var tag in tags) 
                {
                    AvailableTags.Add(tag);
                }
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to load tags: {ex.Message}";
        }
    }

    private void LoadExistingEvent(EventDto eventDto)
    {
        _eventId = eventDto.Id;
        Title = eventDto.Title;
        Description = eventDto.Description;
        StartDate = DateTime.Parse(eventDto.Date);
        StartTime = TimeSpan.Parse(eventDto.Time);
        Location = eventDto.Location;
        Status = eventDto.Status;
        Visibility = eventDto.Visibility;
        EventImagePath = eventDto.EventImage ?? "No image selected";
        
        // Update date offset
        StartDateOffset = new DateTimeOffset(StartDate);
        
        // Pre-select tags after they are loaded
        if (eventDto.Tags != null)
        {
            foreach (var tag in eventDto.Tags)
            {
                var availableTag = AvailableTags.FirstOrDefault(t => t.Id == tag.Id);
                if (availableTag != null)
                {
                    SelectedTags.Add(availableTag);
                }
            }
        }
        
        // Load FAQs
        Faq.Clear();
        if (eventDto.Faq != null)
        {
            foreach (var faq in eventDto.Faq)
            {
                Faq.Add(faq);
            }
        }
        
        Debug.WriteLine($"Loaded existing event for edit: {Title}");
        Debug.WriteLine($"FAQs loaded: {Faq.Count}");
    }

    [RelayCommand]
    private async Task SelectImage()
    {
        Debug.WriteLine("=== SELECT IMAGE DEBUG ===");
        
        try
        {
            // Get the TopLevel (Window) from the current view
            if (_topLevel == null)
            {
                Debug.WriteLine("TopLevel not set - cannot open file picker");
                EventImagePath = "No image selected";
                return;
            }

            var storageProvider = _topLevel.StorageProvider;
            
            var filePickerOptions = new FilePickerOpenOptions
            {
                Title = "Select Event Image",
                AllowMultiple = false,
                FileTypeFilter = new[]
                {
                    new FilePickerFileType("Image Files")
                    {
                        Patterns = new[] { "*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp" }
                    }
                }
            };

            var result = await storageProvider.OpenFilePickerAsync(filePickerOptions);

            if (result.Count > 0)
            {
                var file = result[0];
                EventImagePath = file.Path.LocalPath;
                Debug.WriteLine($"Image selected: {EventImagePath}");
            }
            else
            {
                Debug.WriteLine("No image selected");
                EventImagePath = "No image selected";
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error selecting image: {ex.Message}");
            EventImagePath = "No image selected";
        }
        
        Debug.WriteLine("=== END SELECT IMAGE DEBUG ===");
    }

    [RelayCommand]
    private void ToggleTag(TagDto tag)
    {
        if (SelectedTags.Contains(tag))
        {
            SelectedTags.Remove(tag);
        }
        else
        {
            SelectedTags.Add(tag);
        }
    }

    [RelayCommand]
    private async Task Save()
    {
        if (!CanSave || IsLoading) return;
        
        IsLoading = true;
        ErrorMessage = null;
        
        try
        {
            if (IsEditMode)
            {
                await UpdateEvent();
            }
            else
            {
                await CreateEvent();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Exception in Save: {ex.GetType().Name}: {ex.Message}");
            Debug.WriteLine($"Stack Trace: {ex.StackTrace}");
            ErrorMessage = $"Failed to {(IsEditMode ? "update" : "create")} event: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task CreateEvent()
    {
        // Debug logging - log all property values
        Debug.WriteLine("=== CREATE EVENT DEBUG ===");
        Debug.WriteLine($"Title: '{Title}'");
        Debug.WriteLine($"Description: '{Description}'");
        Debug.WriteLine($"StartDate: {StartDate} (Type: {StartDate.GetType()})");
        Debug.WriteLine($"StartTime: {StartTime} (Type: {StartTime.GetType()})");
        Debug.WriteLine($"Location: '{Location}'");
        Debug.WriteLine($"OrganizerId: '{_currentUserId}'");
        Debug.WriteLine($"EventImagePath: '{EventImagePath}'");
        Debug.WriteLine($"Status: '{Status}'");
        Debug.WriteLine($"Visibility: '{Visibility}'");
        Debug.WriteLine($"SelectedTags Count: {SelectedTags.Count}");
        Debug.WriteLine($"FAQ Count: {Faq.Count}");
        
        // Log FAQ details
        for (int i = 0; i < Faq.Count; i++)
        {
            var faq = Faq[i];
            Debug.WriteLine($"FAQ[{i}]: ID='{faq.Id}', Question='{faq.Question}', Answer='{faq.Answer}'");
        }
        
        // Convert date/time to strings
        string dateString = StartDate.ToString("yyyy-MM-dd");
        string timeString = $"{StartTime.Hours:D2}:{StartTime.Minutes:D2}";
        Debug.WriteLine($"Date String: '{dateString}'");
        Debug.WriteLine($"Time String: '{timeString}'");
        
        // Convert FAQs to CreateEventFaqDto
        var faqDtos = Faq.Select(faq => new CreateEventFaqDto
        {
            Question = faq.Question,
            Answer = faq.Answer
        }).ToList();

        // Upload image to R2 if file selected
        string? uploadedImageKey = null;
        if (!string.IsNullOrWhiteSpace(EventImagePath) && 
            EventImagePath != "No image selected" && 
            File.Exists(EventImagePath))
        {
            Debug.WriteLine($"Uploading image to R2: {EventImagePath}");
            uploadedImageKey = await _apiClient.UploadEventImageAsync(EventImagePath);
            
            if (uploadedImageKey != null)
            {
                Debug.WriteLine($"Image uploaded successfully, key: {uploadedImageKey}");
            }
            else
            {
                Debug.WriteLine("Image upload failed");
                ErrorMessage = "Failed to upload image. Please try again.";
                return;
            }
        }

        var createDto = new CreateEventDto
        {
            Title = Title,
            Description = Description,
            Date = dateString,
            Time = timeString,
            Location = Location,
            OrganizerId = _apiClient.GetCurrentUserId() ?? throw new InvalidOperationException("User not authenticated"),
            EventImage = uploadedImageKey, // Use uploaded file key instead of local path
            Status = Status,
            Visibility = Visibility,
            TagIds = SelectedTags.Select(t => t.Id).ToList(),
            Faq = faqDtos.Count > 0 ? faqDtos : null
        };
        
        Debug.WriteLine("CreateEventDto created successfully");
        Debug.WriteLine($"CreateEventDto.Date: '{createDto.Date}'");
        Debug.WriteLine($"CreateEventDto.Time: '{createDto.Time}'");
        Debug.WriteLine($"CreateEventDto.Faq Count: {createDto.Faq?.Count ?? 0}");
        
        if (createDto.Faq != null && createDto.Faq.Count > 0)
        {
            for (int i = 0; i < createDto.Faq.Count; i++)
            {
                var faq = createDto.Faq[i];
                Debug.WriteLine($"CreateEventDto.Faq[{i}]: Question='{faq.Question}', Answer='{faq.Answer}'");
            }
        }
        
        Debug.WriteLine("Sending CreateEventDto to backend...");
        
        var result = await _apiClient.CreateEventAsync(createDto);
        
        if (result != null)
        {
            Debug.WriteLine("Event created successfully");
            NavigateBack?.Invoke();
            OnSaved?.Invoke(); // Signal success, parent will refresh from API
        }
        else
        {
            Debug.WriteLine("Event creation returned null");
            ErrorMessage = "Failed to create event. Please try again.";
        }
        
        Debug.WriteLine("=== END CREATE EVENT DEBUG ===");
    }

    private async Task UpdateEvent()
    {
        Debug.WriteLine("=== UPDATE EVENT DEBUG ===");
        Debug.WriteLine($"EventId: '{_eventId}'");
        Debug.WriteLine($"Title: '{Title}'");
        Debug.WriteLine($"Description: '{Description}'");
        Debug.WriteLine($"StartDate: {StartDate}");
        Debug.WriteLine($"StartTime: {StartTime}");
        Debug.WriteLine($"Location: '{Location}'");
        Debug.WriteLine($"EventImagePath: '{EventImagePath}'");
        Debug.WriteLine($"Status: '{Status}'");
        Debug.WriteLine($"Visibility: '{Visibility}'");
        Debug.WriteLine($"SelectedTags Count: {SelectedTags.Count}");
        
        // Convert date/time to strings
        string dateString = StartDate.ToString("yyyy-MM-dd");
        string timeString = $"{StartTime.Hours:D2}:{StartTime.Minutes:D2}";
        
        var updateDto = new UpdateEventDto
        {
            Title = Title,
            Description = Description,
            Date = dateString,
            Time = timeString,
            Location = Location,
            EventImage = string.IsNullOrWhiteSpace(EventImagePath) || EventImagePath == "No image selected" ? null : EventImagePath,
            Status = Status,
            Visibility = Visibility,
            TagIds = SelectedTags.Select(t => t.Id).ToList()
        };
        
        Debug.WriteLine($"UpdateDto: {System.Text.Json.JsonSerializer.Serialize(updateDto)}");
        
        var updatedEvent = await _apiClient.UpdateEventAsync(_eventId!, updateDto);
        
        if (updatedEvent != null)
        {
            Debug.WriteLine($"Event updated successfully: {updatedEvent.Title}");
            NavigateBack?.Invoke();
            OnSaved?.Invoke(); // Signal success, parent will refresh from API
        }
        else
        {
            Debug.WriteLine("Event update returned null");
            ErrorMessage = "Failed to update event. Please try again.";
        }
        
        Debug.WriteLine("=== END UPDATE EVENT DEBUG ===");
    }

    [RelayCommand]
    private void Cancel() => NavigateBack?.Invoke();

    // FAQ Management Commands
    [RelayCommand]
    private async Task AddFaq()
    {
        Debug.WriteLine($"=== ADD FAQ DEBUG ===");
        Debug.WriteLine($"AddFaq command triggered!");
        Debug.WriteLine($"IsEditMode: {IsEditMode}");
        Debug.WriteLine($"NewFaqQuestion: '{NewFaqQuestion}' (Length: {NewFaqQuestion?.Length ?? 0})");
        Debug.WriteLine($"NewFaqAnswer: '{NewFaqAnswer}' (Length: {NewFaqAnswer?.Length ?? 0})");
        
        // Validate
        if (string.IsNullOrWhiteSpace(NewFaqQuestion) || NewFaqQuestion.Length < 5) 
        {
            Debug.WriteLine("Validation failed: Question too short");
            return;
        }
        if (string.IsNullOrWhiteSpace(NewFaqAnswer) || NewFaqAnswer.Length < 10) 
        {
            Debug.WriteLine("Validation failed: Answer too short");
            return;
        }
        
        if (IsEditMode)
        {
            Debug.WriteLine("Edit Mode: Saving FAQ to backend immediately");
            // For existing events, save to backend immediately
            var dto = new CreateEventFaqDto { Question = NewFaqQuestion, Answer = NewFaqAnswer };
            Debug.WriteLine($"Sending FAQ to backend: Question='{dto.Question}', Answer='{dto.Answer}'");
            
            var result = await _apiClient.AddEventFaqAsync(_eventId!, dto);
            
            if (result != null)
            {
                Debug.WriteLine($"FAQ saved successfully: ID={result.Id}");
                Faq.Add(result);
                NewFaqQuestion = string.Empty;
                NewFaqAnswer = string.Empty;
                Debug.WriteLine($"FAQ added to collection. Total FAQs: {Faq.Count}");
            }
            else
            {
                Debug.WriteLine("Failed to save FAQ to backend");
            }
        }
        else
        {
            Debug.WriteLine("Create Mode: Adding FAQ to local collection");
            // For new events, add to local collection (will be saved when event is created)
            var tempFaq = new EventFaqDto
            {
                Id = Guid.NewGuid().ToString(), // Temporary ID
                Question = NewFaqQuestion,
                Answer = NewFaqAnswer
            };
            
            Debug.WriteLine($"Created temp FAQ: ID={tempFaq.Id}, Question='{tempFaq.Question}', Answer='{tempFaq.Answer}'");
            
            Faq.Add(tempFaq);
            NewFaqQuestion = string.Empty;
            NewFaqAnswer = string.Empty;
            Debug.WriteLine($"FAQ added to local collection. Total FAQs: {Faq.Count}");
        }
        Debug.WriteLine($"=== END ADD FAQ DEBUG ===");
    }

    [RelayCommand]
    private void StartEditFaq(EventFaqDto faq)
    {
        Debug.WriteLine($"=== START EDIT FAQ DEBUG ===");
        Debug.WriteLine($"Starting edit for FAQ: ID={faq.Id}, Question='{faq.Question}'");
        
        EditingFaq = faq;
        EditFaqQuestion = faq.Question;
        EditFaqAnswer = faq.Answer;
        
        Debug.WriteLine($"EditingFaq set to: {EditingFaq?.Id}");
        Debug.WriteLine($"EditFaqQuestion: '{EditFaqQuestion}'");
        Debug.WriteLine($"EditFaqAnswer: '{EditFaqAnswer}'");
        Debug.WriteLine($"=== END START EDIT FAQ DEBUG ===");
    }

    [RelayCommand]
    private void CancelEditFaq()
    {
        Debug.WriteLine($"=== CANCEL EDIT FAQ DEBUG ===");
        Debug.WriteLine($"Cancelling edit for FAQ: {EditingFaq?.Id}");
        
        EditingFaq = null;
        EditFaqQuestion = string.Empty;
        EditFaqAnswer = string.Empty;
        
        Debug.WriteLine($"EditingFaq cleared: {EditingFaq == null}");
        Debug.WriteLine($"=== END CANCEL EDIT FAQ DEBUG ===");
    }

    [RelayCommand]
    private async Task SaveEditFaq()
    {
        if (EditingFaq == null) return;
        
        if (IsEditMode)
        {
            // For existing events, update in backend
            var dto = new UpdateEventFaqDto { Question = EditFaqQuestion, Answer = EditFaqAnswer };
            var result = await _apiClient.UpdateEventFaqAsync(_eventId!, EditingFaq.Id, dto);
            
            if (result != null)
            {
                var index = Faq.IndexOf(EditingFaq);
                Faq[index] = result;
                CancelEditFaq();
            }
        }
        else
        {
            // For new events, update in local collection
            var index = Faq.IndexOf(EditingFaq);
            if (index >= 0)
            {
                Faq[index] = new EventFaqDto
                {
                    Id = EditingFaq.Id,
                    Question = EditFaqQuestion,
                    Answer = EditFaqAnswer
                };
                CancelEditFaq();
            }
        }
    }

    [RelayCommand]
    private async Task DeleteFaq(EventFaqDto faq)
    {
        if (IsEditMode)
        {
            // For existing events, delete from backend
            await _apiClient.DeleteEventFaqAsync(_eventId!, faq.Id);
        }
        
        // Remove from local collection (works for both create and edit modes)
        Faq.Remove(faq);
        
        if (EditingFaq == faq) CancelEditFaq();
    }
}