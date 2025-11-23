using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using System.Diagnostics;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class NotificationsViewModel : ViewModelBase
{
    private readonly IApiClient? _apiClient;

    [ObservableProperty]
    private ObservableCollection<NotificationItemViewModel> _notifications = new();

    [ObservableProperty]
    private int _unreadCount = 0;

    [ObservableProperty]
    private bool _isLoading = false;

    [ObservableProperty]
    private string? _errorMessage;

    public bool ShowEmptyState => !IsLoading && Notifications.Count == 0;

    public NotificationsViewModel(IApiClient? apiClient = null)
    {
        _apiClient = apiClient;
        
        // Subscribe to collection changes to update ShowEmptyState
        Notifications.CollectionChanged += (s, e) =>
        {
            OnPropertyChanged(nameof(ShowEmptyState));
        };
        
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
        Notifications.Add(new NotificationItemViewModel
        {
            Id = "1",
            Title = "New student enrolled",
            Message = "A new student has been enrolled in Grade 8-A.",
            Type = NotificationType.Info,
            Timestamp = DateTime.Now.AddHours(-2),
            IsRead = false
        });
        Notifications.Add(new NotificationItemViewModel
        {
            Id = "2",
            Title = "Class schedule updated",
            Message = "Science class moved to Room 203.",
            Type = NotificationType.Warning,
            Timestamp = DateTime.Now.AddHours(-5),
            IsRead = false
        });
        Notifications.Add(new NotificationItemViewModel
        {
            Id = "3",
            Title = "Report submitted",
            Message = "Monthly attendance report has been submitted.",
            Type = NotificationType.System,
            Timestamp = DateTime.Now.AddDays(-1),
            IsRead = true
        });
        UpdateUnreadCount();
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
            Debug.WriteLine("[NotificationsViewModel] Loading notifications from API...");
            var response = await _apiClient.GetMyNotificationsAsync(1, 50);
            Debug.WriteLine($"[NotificationsViewModel] API response: {(response != null ? $"Found {response.Data?.Count ?? 0} notifications" : "null")}");
            
            if (response?.Data != null)
            {
                Debug.WriteLine($"[NotificationsViewModel] Processing {response.Data.Count} notifications");
                Notifications.Clear();
                foreach (var notificationDto in response.Data)
                {
                    var notification = MapNotificationToViewModel(notificationDto);
                    Notifications.Add(notification);
                    Debug.WriteLine($"[NotificationsViewModel] Added notification: {notification.Title} (Read: {notification.IsRead})");
                }
                UpdateUnreadCount();
                Debug.WriteLine($"[NotificationsViewModel] Total notifications: {Notifications.Count}, Unread: {UnreadCount}");
            }
            else
            {
                Debug.WriteLine("[NotificationsViewModel] No notifications found or response is null");
                Notifications.Clear();
                UpdateUnreadCount();
            }
            
            // Notify that ShowEmptyState may have changed
            OnPropertyChanged(nameof(ShowEmptyState));
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading notifications: {ex.Message}");
            ErrorMessage = "Failed to load notifications. Please try again.";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private NotificationItemViewModel MapNotificationToViewModel(NotificationDto notification)
    {
        // Map notification type string to NotificationType enum
        var notificationType = notification.Type.ToLower() switch
        {
            "info" => NotificationType.Info,
            "warning" => NotificationType.Warning,
            "success" => NotificationType.Info, // Success maps to Info
            "error" => NotificationType.Error,
            "system" => NotificationType.System,
            _ => NotificationType.Info
        };

        return new NotificationItemViewModel
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notificationType,
            Timestamp = notification.CreatedAt.DateTime,
            IsRead = notification.IsRead
        };
    }

    private void UpdateUnreadCount()
    {
        UnreadCount = Notifications.Count(n => !n.IsRead);
        OnPropertyChanged(nameof(ShowEmptyState));
    }

    partial void OnIsLoadingChanged(bool value)
    {
        OnPropertyChanged(nameof(ShowEmptyState));
    }

    [RelayCommand]
    private async Task MarkAsRead(NotificationItemViewModel notification)
    {
        if (notification.IsRead || _apiClient == null)
            return;

        try
        {
            Debug.WriteLine($"[NotificationsViewModel] Marking notification as read: {notification.Id}");
            var success = await _apiClient.MarkNotificationAsReadAsync(notification.Id);
            Debug.WriteLine($"[NotificationsViewModel] Mark as read result: {success}");
            if (success)
            {
                notification.IsRead = true;
                UpdateUnreadCount();
            }
            else
            {
                ErrorMessage = "Failed to mark notification as read";
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error marking notification as read: {ex.Message}");
            ErrorMessage = "Failed to mark notification as read";
        }
    }

    [RelayCommand]
    private async Task MarkAllAsRead()
    {
        if (_apiClient == null)
            return;

        try
        {
            Debug.WriteLine("[NotificationsViewModel] Marking all notifications as read...");
            var success = await _apiClient.MarkAllNotificationsAsReadAsync();
            Debug.WriteLine($"[NotificationsViewModel] Mark all read result: {success}");
            if (success)
            {
                await LoadNotificationsAsync();
            }
            else
            {
                ErrorMessage = "Failed to mark all notifications as read";
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error marking all notifications as read: {ex.Message}");
            ErrorMessage = "Failed to mark all notifications as read";
        }
    }

    [RelayCommand]
    private async Task DeleteNotification(NotificationItemViewModel notification)
    {
        if (_apiClient == null)
            return;

        try
        {
            Debug.WriteLine($"[NotificationsViewModel] Deleting notification: {notification.Id}");
            var success = await _apiClient.DeleteNotificationAsync(notification.Id);
            Debug.WriteLine($"[NotificationsViewModel] Delete result: {success}");
            if (success)
            {
                if (!notification.IsRead)
                {
                    UnreadCount--;
                }
                Notifications.Remove(notification);
                OnPropertyChanged(nameof(ShowEmptyState));
            }
            else
            {
                ErrorMessage = "Failed to delete notification";
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error deleting notification: {ex.Message}");
            ErrorMessage = "Failed to delete notification";
        }
    }

    [RelayCommand]
    private async Task ClearAll()
    {
        if (_apiClient == null)
            return;

        try
        {
            // Delete all notifications
            Debug.WriteLine($"[NotificationsViewModel] Clearing all {Notifications.Count} notifications...");
            var tasks = Notifications.Select(n => _apiClient.DeleteNotificationAsync(n.Id));
            var results = await Task.WhenAll(tasks);
            Debug.WriteLine($"[NotificationsViewModel] Deleted {results.Count(r => r)} out of {results.Length} notifications");

            Notifications.Clear();
            UnreadCount = 0;
            OnPropertyChanged(nameof(ShowEmptyState));
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error clearing all notifications: {ex.Message}");
            ErrorMessage = "Failed to clear all notifications";
        }
    }

    [RelayCommand]
    private async Task Refresh()
    {
        await LoadNotificationsAsync();
    }
}

public partial class NotificationItemViewModel : ObservableObject
{
    [ObservableProperty]
    private string _id = string.Empty;

    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string _message = string.Empty;

    [ObservableProperty]
    private NotificationType _type;

    [ObservableProperty]
    private DateTime _timestamp;

    [ObservableProperty]
    private bool _isRead;

    public string TimeAgo
    {
        get
        {
            var diff = DateTime.Now - Timestamp;
            if (diff.TotalMinutes < 60)
                return $"{(int)diff.TotalMinutes} minutes ago";
            if (diff.TotalHours < 24)
                return $"{(int)diff.TotalHours} hours ago";
            return $"{(int)diff.TotalDays} days ago";
        }
    }

    // Add this property to fix the background binding error
    public string BackgroundColor => IsRead ? "#F9FAFB" : "#FFFFFF";
}

public enum NotificationType
{
    System,
    User,
    Warning,
    Info,
    Error
}