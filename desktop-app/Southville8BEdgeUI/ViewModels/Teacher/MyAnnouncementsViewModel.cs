using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia; // For Application.Current
using Avalonia.Media; // For IBrush
using Avalonia.Styling; // For theme variant lookups
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System.Diagnostics;
using ReactiveUI;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MyAnnouncementsViewModel : ViewModelBase, IDisposable
{
    private readonly IApiClient _apiClient;
    private readonly IDialogService _dialogService;
    private readonly string _userId;
    
    // Navigation callback set by shell
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private int _totalAnnouncementsCount = 0; // dynamic, computed
    [ObservableProperty] private int _activeAnnouncementsCount = 0; // dynamic, computed
    [ObservableProperty] private int _totalViewsCount = 1247; // keep sample metric
    [ObservableProperty] private double _engagementRate = 78.3; // sample metric
    [ObservableProperty] private string _selectedFilter = "All";
    [ObservableProperty] private ObservableCollection<string> _filterOptions = new() { "All", "Active", "Draft", "Scheduled" };
    [ObservableProperty] private ObservableCollection<AnnouncementItemViewModel> _announcements = new();
    [ObservableProperty] private ObservableCollection<AnnouncementItemViewModel> _filteredAnnouncements = new();
    private bool _isUpdatingAnnouncements = false;
    [ObservableProperty] private string _newAnnouncementTitle = "";
    [ObservableProperty] private string _newAnnouncementClass = ""; // Keep for backward compatibility
    [ObservableProperty] private string _newAnnouncementPriority = "";
    [ObservableProperty] private string _newAnnouncementContent = "";
    [ObservableProperty] private bool _postImmediately = true;
    [ObservableProperty] private DateTime? _scheduledDate;
    [ObservableProperty] private ObservableCollection<string> _availableClasses = new() { "Grade 8A", "Grade 8B", "Grade 9A" };
    [ObservableProperty] private ObservableCollection<SelectableSection> _availableClassesWithSelection = new();
    [ObservableProperty] private ObservableCollection<string> _priorityOptions = new() { "High", "Medium", "Low" };
    [ObservableProperty] private string _selectedSectionsDisplay = "No sections selected";
    [ObservableProperty] private ObservableCollection<AnnouncementActivityViewModel> _recentActivity = new();
    [ObservableProperty] private bool _isEditMode = false;
    [ObservableProperty] private string _editingAnnouncementId = "";

    private EventHandler? _themeChangedHandler;
    private bool _disposed;
    
    // Rate limiting for refresh
    private DateTime _lastRefreshTime = DateTime.MinValue;
    private const int RefreshCooldownSeconds = 5; // 5 second cooldown
    
    [ObservableProperty] private bool _isRefreshing = false;

    public MyAnnouncementsViewModel(IApiClient apiClient, IDialogService dialogService, string userId)
    {
        _apiClient = apiClient;
        _dialogService = dialogService;
        _userId = userId;
        
        _ = LoadAnnouncementsAsync();
        _ = LoadAvailableClassesAsync();
        _ = LoadStatsAsync();
        
        // Theme change subscription to refresh badge brushes (store handler for later unsubscription)
        if (Application.Current is { } app)
        {
            _themeChangedHandler = (_, __) => RefreshAnnouncementBadgeBrushes();
            app.ActualThemeVariantChanged += _themeChangedHandler;
        }
    }

    private async Task LoadAnnouncementsAsync()
    {
        try
        {
            Debug.WriteLine($"Loading announcements for user: {_userId}");
            var response = await _apiClient.GetAnnouncementsAsync(
                teacherId: _userId,
                visibility: null,
                includeExpired: false,
                limit: 100
            );

            if (response?.Data != null)
            {
                var tempList = new List<AnnouncementItemViewModel>();
                foreach (var dto in response.Data)
                {
                    var vm = MapToAnnouncementItem(dto);
                    tempList.Add(vm);
                }
                
                // Batch update to avoid triggering filter on each Add
                _isUpdatingAnnouncements = true;
                Announcements.Clear();
                foreach (var item in tempList)
                {
                    Announcements.Add(item);
                }
                _isUpdatingAnnouncements = false;
                UpdateAnnouncementCounts();
                
                // Apply filter after batch update
                ApplyFilter();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading announcements: {ex.Message}");
        }
    }

    private async Task LoadAvailableClassesAsync()
    {
        try
        {
            var sections = await _apiClient.GetMySectionsAsync();
            if (sections != null)
            {
                AvailableClasses.Clear();
                AvailableClassesWithSelection.Clear();
                foreach (var section in sections)
                {
                    AvailableClasses.Add(section.Name);
                    var selectableSection = new SelectableSection
                    {
                        Id = section.Id,
                        Name = section.Name,
                        IsSelected = false
                    };
                    selectableSection.PropertyChanged += (s, e) =>
                    {
                        if (e.PropertyName == nameof(SelectableSection.IsSelected))
                        {
                            UpdateSelectedSectionsDisplay();
                        }
                    };
                    AvailableClassesWithSelection.Add(selectableSection);
                }
                UpdateSelectedSectionsDisplay();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading sections: {ex.Message}");
        }
    }

    private void UpdateSelectedSectionsDisplay()
    {
        var selected = AvailableClassesWithSelection.Where(s => s.IsSelected).ToList();
        if (selected.Count == 0)
        {
            SelectedSectionsDisplay = "No sections selected";
        }
        else if (selected.Count == 1)
        {
            SelectedSectionsDisplay = selected[0].Name;
        }
        else
        {
            SelectedSectionsDisplay = $"{selected.Count} sections selected";
        }
    }

    private async Task LoadStatsAsync()
    {
        try
        {
            var stats = await _apiClient.GetAnnouncementStatsAsync(_userId);
            if (stats != null)
            {
                TotalAnnouncementsCount = stats.TotalCount;
                ActiveAnnouncementsCount = stats.ActiveCount;
                TotalViewsCount = stats.TotalViews;
                EngagementRate = stats.EngagementRate;
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading stats: {ex.Message}");
        }
    }

    private AnnouncementItemViewModel MapToAnnouncementItem(AnnouncementDto dto)
    {
        var priority = MapTypeToPriority(dto.Type);
        var status = DetermineStatus(dto.Visibility, dto.ExpiresAt);
        var targetClass = string.Join(", ", dto.Sections.Select(s => s.Name));
        var contentPreview = dto.Content.Length > 100 ? dto.Content.Substring(0, 100) + "..." : dto.Content;
        
        return new AnnouncementItemViewModel
        {
            Id = dto.Id,
            Title = dto.Title,
            FullContent = dto.Content,
            Type = dto.Type ?? "",
            Visibility = dto.Visibility,
            ExpiresAt = dto.ExpiresAt,
            Sections = dto.Sections,
            Priority = priority,
            Status = status,
            TargetClass = targetClass,
            ContentPreview = contentPreview,
            ViewCount = 0,
            CommentCount = 0,
            PostedDate = FormatRelativeTime(dto.CreatedAt),
            LastModified = FormatRelativeTime(dto.UpdatedAt)
        };
    }

    private string MapTypeToPriority(string? type) => type switch
    {
        "urgent" => "High",
        "info" => "Medium",
        "general" => "Low",
        _ => "Medium"
    };

    private string DetermineStatus(string visibility, string? expiresAt)
    {
        // Check if scheduled for future (has expiresAt date in the future)
        if (!string.IsNullOrEmpty(expiresAt) && DateTime.TryParse(expiresAt, out var expires))
        {
            if (expires > DateTime.UtcNow) return "Scheduled";
            if (expires < DateTime.UtcNow) return "Expired";
        }
        
        // If no future expiration, it's active (even if private visibility)
        return "Active";
    }

    private string FormatRelativeTime(string timestamp)
    {
        if (string.IsNullOrEmpty(timestamp)) return "Unknown";
        if (DateTime.TryParse(timestamp, out var date))
        {
            var timeSpan = DateTime.UtcNow - date;
            if (timeSpan.TotalDays >= 1) return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalHours >= 1) return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalMinutes >= 1) return $"{(int)timeSpan.TotalMinutes} minutes ago";
            return "just now";
        }
        return timestamp;
    }

    private void UpdateAnnouncementCounts()
    {
        TotalAnnouncementsCount = Announcements.Count;
        ActiveAnnouncementsCount = Announcements.Count(a => a.Status == "Active");
    }

    private void RefreshAnnouncementBadgeBrushes()
    {
        foreach (var a in Announcements)
        {
            a.UpdatePriorityBrushes();
            a.UpdateStatusBrushes();
        }
    }


    [RelayCommand]
    private void CreateAnnouncement()
    {
        if (NavigateTo == null) return;
        var formVm = new NewAnnouncementViewModel
        {
            AvailableClasses = new ObservableCollection<string>(AvailableClasses),
            PriorityOptions = new ObservableCollection<string>(PriorityOptions),
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnCreated = item =>
            {
                item.UpdatePriorityBrushes();
                item.UpdateStatusBrushes();
                Announcements.Insert(0, item);
                RecentActivity.Insert(0, new AnnouncementActivityViewModel
                {
                    Activity = "Created new announcement",
                    AnnouncementTitle = item.Title,
                    Timestamp = "just now"
                });
                UpdateAnnouncementCounts();
                NavigateTo?.Invoke(this);
            }
        };
        var navigate = NavigateTo; // capture delegate to avoid race
        navigate?.Invoke(formVm);
    }

    [RelayCommand] private void ViewAnalytics() { }
    
    [RelayCommand]
    private async Task RefreshAnnouncements()
    {
        // Check rate limit
        var timeSinceLastRefresh = DateTime.Now - _lastRefreshTime;
        if (timeSinceLastRefresh.TotalSeconds < RefreshCooldownSeconds)
        {
            var remainingSeconds = RefreshCooldownSeconds - (int)timeSinceLastRefresh.TotalSeconds;
            System.Diagnostics.Debug.WriteLine($"Refresh rate limited. Please wait {remainingSeconds} seconds.");
            return;
        }

        IsRefreshing = true;
        _lastRefreshTime = DateTime.Now;

        try
        {
            // Reload all data
            await Task.WhenAll(
                LoadAnnouncementsAsync(),
                LoadAvailableClassesAsync(),
                LoadStatsAsync()
            );
            
            System.Diagnostics.Debug.WriteLine("Announcements refreshed successfully");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error refreshing announcements: {ex.Message}");
        }
        finally
        {
            IsRefreshing = false;
        }
    }
    
    [RelayCommand]
    private void EditAnnouncement(AnnouncementItemViewModel announcement)
    {
        if (announcement == null) return;

        // Populate form with existing data
        NewAnnouncementTitle = announcement.Title;
        NewAnnouncementContent = announcement.FullContent;
        NewAnnouncementPriority = announcement.Priority;
        NewAnnouncementClass = announcement.TargetClass;
        
        // Select the sections that this announcement was posted to
        foreach (var selectableSection in AvailableClassesWithSelection)
        {
            selectableSection.IsSelected = announcement.Sections.Any(s => s.Id == selectableSection.Id);
        }
        
        // Set edit mode
        IsEditMode = true;
        EditingAnnouncementId = announcement.Id;
    }
    
    [RelayCommand]
    private async Task ViewAnnouncement(AnnouncementItemViewModel announcement)
    {
        if (announcement == null) return;

        var details = new Dictionary<string, string>
        {
            { "Title", announcement.Title },
            { "Content", announcement.FullContent },
            { "Priority", announcement.Priority },
            { "Status", announcement.Status },
            { "Visibility", announcement.Visibility },
            { "Target Sections", announcement.TargetClass },
            { "Type", announcement.Type },
            { "Posted", announcement.PostedDate },
            { "Last Modified", announcement.LastModified }
        };

        if (!string.IsNullOrEmpty(announcement.ExpiresAt))
        {
            details.Add("Expires", announcement.ExpiresAt);
        }

        await _dialogService.ShowInfoAsync("Announcement Details", details);
    }
    
    [RelayCommand]
    private async Task DeleteAnnouncement(AnnouncementItemViewModel announcement)
    {
        if (announcement == null || string.IsNullOrEmpty(announcement.Id)) return;

        // Show confirmation dialog
        var confirmed = await _dialogService.ShowConfirmAsync(
            "Delete Announcement",
            $"Are you sure you want to delete '{announcement.Title}'? This action cannot be undone.",
            "Delete",
            "Cancel"
        );

        if (!confirmed) return;

        try
        {
            var deletedTitle = announcement.Title;
            var deletedId = announcement.Id;
            
            // Delete via API
            await _apiClient.DeleteAnnouncementAsync(announcement.Id);

            // Remove from collection
            Announcements.Remove(announcement);

            // Update stats
            await LoadStatsAsync();

            // Add to recent activity
            RecentActivity.Insert(0, new AnnouncementActivityViewModel
            {
                Activity = "Deleted announcement",
                AnnouncementTitle = deletedTitle,
                Timestamp = "just now"
            });
            
            // Log activity
            await LogActivityAsync(
                "announcement_deleted",
                $"Deleted announcement '{deletedTitle}'",
                "announcement",
                deletedId
            );
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting announcement: {ex.Message}");
        }
    }
    [RelayCommand]
    private async Task CreateQuickAnnouncement()
    {
        if (string.IsNullOrWhiteSpace(NewAnnouncementTitle)) return;

        try
        {
            // Get all selected section IDs
            var selectedSectionIds = AvailableClassesWithSelection
                .Where(s => s.IsSelected)
                .Select(s => s.Id)
                .ToList();
            
            if (selectedSectionIds.Count == 0)
            {
                await _dialogService.ShowConfirmAsync("No Sections Selected", "Please select at least one section to post the announcement to.", "OK");
                return;
            }

            var type = MapPriorityToType(NewAnnouncementPriority);
            var expiresAt = PostImmediately ? null : ScheduledDate?.ToString("yyyy-MM-ddTHH:mm:ssZ");

            if (IsEditMode && !string.IsNullOrEmpty(EditingAnnouncementId))
            {
                // UPDATE existing announcement
                var updateDto = new UpdateAnnouncementDto
                {
                    Title = NewAnnouncementTitle,
                    Content = NewAnnouncementContent,
                    Type = type,
                    Visibility = "private",
                    ExpiresAt = expiresAt,
                    TargetRoleIds = null,
                    SectionIds = selectedSectionIds.Count > 0 ? selectedSectionIds : null
                };

                var updated = await _apiClient.UpdateAnnouncementAsync(EditingAnnouncementId, updateDto);

                if (updated != null)
                {
                    // Find and update in collection
                    var existing = Announcements.FirstOrDefault(a => a.Id == EditingAnnouncementId);
                    if (existing != null)
                    {
                        var index = Announcements.IndexOf(existing);
                        Announcements.RemoveAt(index);
                        var item = MapToAnnouncementItem(updated);
                        item.UpdatePriorityBrushes();
                        item.UpdateStatusBrushes();
                        Announcements.Insert(index, item);
                    }

                    RecentActivity.Insert(0, new AnnouncementActivityViewModel
                    {
                        Activity = "Updated announcement",
                        AnnouncementTitle = NewAnnouncementTitle,
                        Timestamp = "just now"
                    });
                    
                    // Log activity
                    await LogActivityAsync(
                        "announcement_updated",
                        $"Updated announcement '{NewAnnouncementTitle}'",
                        "announcement",
                        EditingAnnouncementId
                    );
                }

                // Reset edit mode
                IsEditMode = false;
                EditingAnnouncementId = "";
            }
            else
            {
                // CREATE new announcement
                var dto = new CreateAnnouncementDto
                {
                    Title = NewAnnouncementTitle,
                    Content = NewAnnouncementContent,
                    Type = type,
                    Visibility = "private",
                    ExpiresAt = expiresAt,
                    TargetRoleIds = null,
                    SectionIds = selectedSectionIds.Count > 0 ? selectedSectionIds : null
                };

                var created = await _apiClient.CreateAnnouncementAsync(dto);
                
                if (created != null)
                {
                    var item = MapToAnnouncementItem(created);
                    item.UpdatePriorityBrushes();
                    item.UpdateStatusBrushes();
                    Announcements.Insert(0, item);
                    
                    RecentActivity.Insert(0, new AnnouncementActivityViewModel
                    {
                        Activity = "Created new announcement",
                        AnnouncementTitle = item.Title,
                        Timestamp = "just now"
                    });
                    
                    UpdateAnnouncementCounts();
                    
                    // Log activity
                    await LogActivityAsync(
                        "announcement_posted",
                        $"Posted announcement '{NewAnnouncementTitle}' to {NewAnnouncementClass}",
                        "announcement",
                        created.Id
                    );
                }
            }

            // Reset form
            NewAnnouncementTitle = NewAnnouncementContent = string.Empty;
            NewAnnouncementClass = NewAnnouncementPriority = string.Empty;
            
            // Clear all section selections
            foreach (var section in AvailableClassesWithSelection)
            {
                section.IsSelected = false;
            }
            
            // Reset edit mode if it was active
            IsEditMode = false;
            EditingAnnouncementId = string.Empty;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error creating announcement: {ex.Message}");
        }
    }

    private string MapPriorityToType(string priority) => priority switch
    {
        "High" => "urgent",
        "Medium" => "info",
        "Low" => "general",
        _ => "info"
    };

    partial void OnSelectedFilterChanged(string value)
    {
        ApplyFilter();
    }

    partial void OnAnnouncementsChanged(ObservableCollection<AnnouncementItemViewModel> value)
    {
        if (!_isUpdatingAnnouncements)
        {
            ApplyFilter();
        }
    }

    private void ApplyFilter()
    {
        if (Announcements == null || Announcements.Count == 0)
        {
            FilteredAnnouncements.Clear();
            return;
        }

        if (string.IsNullOrWhiteSpace(SelectedFilter) || SelectedFilter == "All")
        {
            FilteredAnnouncements.Clear();
            foreach (var item in Announcements)
            {
                FilteredAnnouncements.Add(item);
            }
            return;
        }

        // Filter based on status
        var filtered = Announcements.Where(a => a.Status == SelectedFilter).ToList();
        FilteredAnnouncements.Clear();
        foreach (var item in filtered)
        {
            FilteredAnnouncements.Add(item);
        }
    }

    private async Task LogActivityAsync(string actionType, string description, string? entityType = null, string? entityId = null)
    {
        try
        {
            // Get current user ID
            var currentUserId = _apiClient.GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
                return;
            
            // Map action types to icons and colors
            var (icon, color) = actionType switch
            {
                "announcement_posted" => ("Megaphone", "blue"),
                "announcement_updated" => ("Edit", "orange"),
                "announcement_deleted" => ("Delete", "red"),
                _ => ("Info", "gray")
            };
            
            // Create activity data
            var activityData = new
            {
                user_id = currentUserId,
                action_type = actionType,
                description = description,
                entity_type = entityType,
                entity_id = entityId,
                icon = icon,
                color = color,
                metadata = new { source = "desktop_app", module = "my_announcements" }
            };
            
            // POST to teacher activity API
            await _apiClient.PostAsync("teacher-activity/activities", activityData);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the main operation
            System.Diagnostics.Debug.WriteLine($"Error logging teacher activity: {ex.Message}");
        }
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        if (_themeChangedHandler != null && Application.Current is { } app)
        {
            app.ActualThemeVariantChanged -= _themeChangedHandler;
            _themeChangedHandler = null;
        }
        GC.SuppressFinalize(this);
    }
}

public partial class AnnouncementItemViewModel : ViewModelBase
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _priority = "";
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private string _targetClass = "";
    [ObservableProperty] private string _contentPreview = "";
    [ObservableProperty] private string _fullContent = "";
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private string _visibility = "";
    [ObservableProperty] private string? _expiresAt;
    [ObservableProperty] private List<SectionDto> _sections = new();
    [ObservableProperty] private int _viewCount;
    [ObservableProperty] private int _commentCount;
    [ObservableProperty] private string _postedDate = "";
    [ObservableProperty] private string _lastModified = "";

    // Themed badge brushes (background soft + text solid)
    [ObservableProperty] private IBrush _priorityBadgeBackgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _priorityBadgeTextBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _statusBadgeBackgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _statusBadgeTextBrush = Brushes.Transparent;

    partial void OnPriorityChanged(string value) => UpdatePriorityBrushes();
    partial void OnStatusChanged(string value) => UpdateStatusBrushes();

    private static IBrush ResolveBrush(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var obj) && obj is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    public void UpdatePriorityBrushes()
    {
        var success = ResolveBrush("SuccessBrush");
        var warning = ResolveBrush("WarningBrush");
        var danger = ResolveBrush("DangerBrush");
        var successSoft = ResolveBrush("SuccessSoftBrush");
        var warningSoft = ResolveBrush("WarningSoftBrush");
        var dangerSoft = ResolveBrush("DangerSoftBrush");
        var graySoft = ResolveBrush("GraySoftBrush");
        var textPrimary = ResolveBrush("TextPrimaryBrush");

        switch (Priority)
        {
            case "High":
                PriorityBadgeBackgroundBrush = dangerSoft;
                PriorityBadgeTextBrush = danger;
                break;
            case "Medium":
                PriorityBadgeBackgroundBrush = warningSoft;
                PriorityBadgeTextBrush = warning;
                break;
            case "Low":
                PriorityBadgeBackgroundBrush = successSoft;
                PriorityBadgeTextBrush = success;
                break;
            default:
                PriorityBadgeBackgroundBrush = graySoft;
                PriorityBadgeTextBrush = textPrimary;
                break;
        }
    }

    public void UpdateStatusBrushes()
    {
        var success = ResolveBrush("SuccessBrush");
        var info = ResolveBrush("InfoBrush");
        var graySoft = ResolveBrush("GraySoftBrush");
        var successSoft = ResolveBrush("SuccessSoftBrush");
        var infoSoft = ResolveBrush("InfoSoftBrush");
        var textPrimary = ResolveBrush("TextPrimaryBrush");
        var textSecondary = ResolveBrush("TextSecondaryBrush");

        switch (Status)
        {
            case "Active":
                StatusBadgeBackgroundBrush = successSoft;
                StatusBadgeTextBrush = success;
                break;
            case "Scheduled":
                StatusBadgeBackgroundBrush = infoSoft;
                StatusBadgeTextBrush = info;
                break;
            case "Draft":
                StatusBadgeBackgroundBrush = graySoft;
                StatusBadgeTextBrush = textSecondary;
                break;
            default:
                StatusBadgeBackgroundBrush = graySoft;
                StatusBadgeTextBrush = textPrimary;
                break;
        }
    }
}

public partial class SelectableSection : ObservableObject
{
    [ObservableProperty] private string _id = string.Empty;
    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private bool _isSelected = false;
}

public partial class AnnouncementActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _activity = "";
    [ObservableProperty] private string _announcementTitle = "";
    [ObservableProperty] private string _timestamp = "";
}