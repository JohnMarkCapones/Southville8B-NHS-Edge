using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using System;
using System.Diagnostics;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class NotificationsViewModel : ViewModelBase
{
    private readonly IApiClient? _apiClient;

    [ObservableProperty] private string _title = "Notifications";
    [ObservableProperty] private ObservableCollection<NotificationItem> _items = new();
    [ObservableProperty] private bool _isLoading = false;
    [ObservableProperty] private string? _errorMessage;

    public bool ShowEmptyState => !IsLoading && Items.Count == 0;
    public bool ShowNotifications => !IsLoading && Items.Count > 0;

    public NotificationsViewModel(IApiClient? apiClient = null)
    {
        _apiClient = apiClient;
        
        // Subscribe to collection changes
        Items.CollectionChanged += OnItemsCollectionChanged;
        
        // If no API client, seed with mock data for unit tests
        if (_apiClient == null)
        {
            SeedMockNotifications();
        }
        else
        {
            _ = LoadNotificationsAsync();
        }
    }

    private void SeedMockNotifications()
    {
        var items = new[]
        {
            new NotificationItem
            {
                Title = "Grade Submission Reminder",
                Description = "Please submit grades for Math 8-A by Friday.",
                TimeAgo = "1 hour ago",
                Severity = NotificationSeverity.Warning,
                IsNew = true
            },
            new NotificationItem
            {
                Title = "New Assignment Posted",
                Description = "Students in Science 8-B have submitted new assignments.",
                TimeAgo = "3 hours ago",
                Severity = NotificationSeverity.Info,
                IsNew = true
            },
            new NotificationItem
            {
                Title = "Meeting Scheduled",
                Description = "Department meeting tomorrow at 2 PM in Faculty Room.",
                TimeAgo = "1 day ago",
                Severity = NotificationSeverity.Info,
                IsNew = false
            }
        };
        
        foreach (var item in items)
        {
            item.PropertyChanged += OnNotificationItemPropertyChanged;
            Items.Add(item);
        }
        RefreshState();
    }

    public bool HasNew => Items.Any(i => i.IsNew);

    partial void OnItemsChanged(ObservableCollection<NotificationItem> value)
    {
        // Unsubscribe old collection events (auto-handled only if we had reference; since we don't store previous, rely on GC)
        // Subscribe new collection
        value.CollectionChanged += OnItemsCollectionChanged;
        foreach (var item in value)
            item.PropertyChanged += OnNotificationItemPropertyChanged;
        RefreshState();
    }

    private void OnItemsCollectionChanged(object? sender, NotifyCollectionChangedEventArgs e)
    {
        if (e.OldItems is not null)
        {
            foreach (var old in e.OldItems.OfType<NotificationItem>())
                old.PropertyChanged -= OnNotificationItemPropertyChanged;
        }
        if (e.NewItems is not null)
        {
            foreach (var added in e.NewItems.OfType<NotificationItem>())
                added.PropertyChanged += OnNotificationItemPropertyChanged;
        }
        RefreshState();
        // Notify UI of collection changes
        OnPropertyChanged(nameof(ShowEmptyState));
        OnPropertyChanged(nameof(ShowNotifications));
    }

    private void OnNotificationItemPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName == nameof(NotificationItem.IsNew))
        {
            RefreshState();
        }
    }

    private async Task LoadNotificationsAsync()
    {
        if (_apiClient == null)
        {
            ErrorMessage = "API client not available";
            return;
        }

        IsLoading = true;
        ErrorMessage = null;

        try
        {
            Debug.WriteLine("[Teacher NotificationsViewModel] Loading notifications from API...");
            var response = await _apiClient.GetMyNotificationsAsync(1, 50);
            Debug.WriteLine($"[Teacher NotificationsViewModel] API response: {(response != null ? $"Found {response.Data?.Count ?? 0} notifications" : "null")}");
            
            if (response?.Data != null)
            {
                Debug.WriteLine($"[Teacher NotificationsViewModel] Processing {response.Data.Count} notifications");
                Items.Clear();
                foreach (var notificationDto in response.Data)
                {
                    var notification = MapNotificationToViewModel(notificationDto);
                    Items.Add(notification);
                    Debug.WriteLine($"[Teacher NotificationsViewModel] Added notification: {notification.Title} (Read: {!notification.IsNew})");
                }
                Debug.WriteLine($"[Teacher NotificationsViewModel] Total notifications: {Items.Count}, Unread: {Items.Count(i => i.IsNew)}");
            }
            else
            {
                Debug.WriteLine("[Teacher NotificationsViewModel] No notifications found or response is null");
                Items.Clear();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading notifications: {ex.Message}");
            ErrorMessage = "Failed to load notifications. Please try again.";
        }
        finally
        {
            IsLoading = false;
            // Notify UI of state changes
            OnPropertyChanged(nameof(Items));
            OnPropertyChanged(nameof(ShowEmptyState));
            OnPropertyChanged(nameof(ShowNotifications));
        }
    }

    private NotificationItem MapNotificationToViewModel(NotificationDto notification)
    {
        // Map notification type string to NotificationSeverity enum
        var severity = notification.Type.ToLower() switch
        {
            "info" => NotificationSeverity.Info,
            "warning" => NotificationSeverity.Warning,
            "success" => NotificationSeverity.Success,
            "error" => NotificationSeverity.Warning, // Error maps to Warning for UI
            "system" => NotificationSeverity.Info,
            _ => NotificationSeverity.Info
        };

        // Convert DateTimeOffset to DateTime
        DateTime timestamp = notification.CreatedAt.DateTime;

        return new NotificationItem
        {
            Id = notification.Id,
            Title = notification.Title,
            Description = notification.Message,
            TimeAgo = GetTimeAgo(timestamp),
            Severity = severity,
            IsNew = !notification.IsRead,
            Timestamp = timestamp
        };
    }

    private string GetTimeAgo(DateTime timestamp)
    {
        var diff = DateTime.Now - timestamp;
        if (diff.TotalMinutes < 1)
            return "Just now";
        if (diff.TotalMinutes < 60)
            return $"{(int)diff.TotalMinutes}m";
        if (diff.TotalHours < 24)
            return $"{(int)diff.TotalHours}h";
        if (diff.TotalDays < 7)
            return $"{(int)diff.TotalDays}d";
        return timestamp.ToString("MMM d");
    }

    private void RefreshState()
    {
        OnPropertyChanged(nameof(HasNew));
        OnPropertyChanged(nameof(ShowEmptyState));
        OnPropertyChanged(nameof(ShowNotifications));
        MarkAllReadCommand.NotifyCanExecuteChanged();
        MarkReadCommand.NotifyCanExecuteChanged();
    }

    private bool CanMarkAllRead() => Items.Any(i => i.IsNew);

    [RelayCommand(CanExecute = nameof(CanMarkAllRead))]
    private async Task MarkAllRead()
    {
        if (_apiClient == null) return;

        try
        {
            var success = await _apiClient.MarkAllNotificationsAsReadAsync();
            if (success)
            {
                // Reload notifications to get updated read status
                await LoadNotificationsAsync();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error marking all as read: {ex.Message}");
        }
    }

    [RelayCommand]
    private void OpenSettings()
    {
        // TODO: navigate to settings (hook into navigation service if available)
    }

    private bool CanMarkRead(NotificationItem? item) => item is not null && item.IsNew;

    [RelayCommand(CanExecute = nameof(CanMarkRead))]
    private async Task MarkRead(NotificationItem item)
    {
        if (_apiClient == null || string.IsNullOrEmpty(item.Id)) return;

        try
        {
            var success = await _apiClient.MarkNotificationAsReadAsync(item.Id);
            if (success)
            {
                item.IsNew = false; // triggers property handler
                RefreshState();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error marking notification as read: {ex.Message}");
        }
    }

    private bool CanDelete(NotificationItem? item) => item is not null;

    [RelayCommand(CanExecute = nameof(CanDelete))]
    private async Task Delete(NotificationItem item)
    {
        if (_apiClient == null || string.IsNullOrEmpty(item.Id)) return;

        try
        {
            var success = await _apiClient.DeleteNotificationAsync(item.Id);
            if (success && Items.Contains(item))
            {
                item.PropertyChanged -= OnNotificationItemPropertyChanged;
                Items.Remove(item);
                RefreshState();
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting notification: {ex.Message}");
        }
    }

    [RelayCommand]
    private async Task Refresh()
    {
        await LoadNotificationsAsync();
    }
}

public class NotificationItem : ObservableObject
{
    private string _id = string.Empty;
    public string Id { get => _id; set => SetProperty(ref _id, value); }

    private string _title = string.Empty;
    public string Title { get => _title; set => SetProperty(ref _title, value); }

    private string _description = string.Empty;
    public string Description { get => _description; set => SetProperty(ref _description, value); }

    private string _timeAgo = string.Empty;
    public string TimeAgo { get => _timeAgo; set => SetProperty(ref _timeAgo, value); }

    private NotificationSeverity _severity = NotificationSeverity.Info;
    public NotificationSeverity Severity { get => _severity; set => SetProperty(ref _severity, value); }

    private bool _isNew = false;
    public bool IsNew { get => _isNew; set => SetProperty(ref _isNew, value); }

    private DateTime _timestamp = DateTime.Now;
    public DateTime Timestamp { get => _timestamp; set => SetProperty(ref _timestamp, value); }
}

public enum NotificationSeverity
{
    Info,
    Warning,
    Success
}
