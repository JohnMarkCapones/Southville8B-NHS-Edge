using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class NotificationsViewModel : ViewModelBase
{
    [ObservableProperty]
    private ObservableCollection<NotificationItemViewModel> _notifications = new();

    [ObservableProperty]
    private int _unreadCount = 0;

    public NotificationsViewModel()
    {
        InitializeNotifications();
    }

    private void InitializeNotifications()
    {
        Notifications.Add(new NotificationItemViewModel
        {
            Title = "System Maintenance Scheduled",
            Message = "System maintenance is scheduled for tonight at 11:00 PM.",
            Type = NotificationType.System,
            Timestamp = DateTime.Now.AddHours(-1),
            IsRead = false
        });

        Notifications.Add(new NotificationItemViewModel
        {
            Title = "New User Registration",
            Message = "5 new users have registered today.",
            Type = NotificationType.User,
            Timestamp = DateTime.Now.AddHours(-2),
            IsRead = false
        });

        Notifications.Add(new NotificationItemViewModel
        {
            Title = "Storage Usage Alert",
            Message = "Storage usage has reached 85%. Consider upgrading.",
            Type = NotificationType.Warning,
            Timestamp = DateTime.Now.AddHours(-3),
            IsRead = true
        });

        UnreadCount = Notifications.Count(n => !n.IsRead);
    }

    [RelayCommand]
    private void MarkAsRead(NotificationItemViewModel notification)
    {
        if (!notification.IsRead)
        {
            notification.IsRead = true;
            UnreadCount--;
        }
    }

    [RelayCommand]
    private void MarkAllAsRead()
    {
        foreach (var notification in Notifications.Where(n => !n.IsRead))
        {
            notification.IsRead = true;
        }
        UnreadCount = 0;
    }

    [RelayCommand]
    private void DeleteNotification(NotificationItemViewModel notification)
    {
        if (!notification.IsRead)
        {
            UnreadCount--;
        }
        Notifications.Remove(notification);
    }

    [RelayCommand]
    private void ClearAll()
    {
        Notifications.Clear();
        UnreadCount = 0;
    }
}

public partial class NotificationItemViewModel : ObservableObject
{
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