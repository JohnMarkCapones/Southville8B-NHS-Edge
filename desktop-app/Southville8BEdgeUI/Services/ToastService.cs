using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using System;

namespace Southville8BEdgeUI.Services;

public sealed class ToastService : IToastService
{
    private WindowNotificationManager? _manager;

    public void Initialize(Window host)
    {
        _manager = new WindowNotificationManager(host)
        {
            Position = NotificationPosition.TopRight,
            MaxItems = 3,
            Margin = new Thickness(16)
        };
    }

    public void Show(string title, string message, NotificationType type = NotificationType.Information, TimeSpan? expiration = null)
        => _manager?.Show(new Notification(title, message, type, expiration ?? TimeSpan.FromSeconds(3)));

    public void Success(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Success", message, NotificationType.Success, expiration);

    public void Info(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Info", message, NotificationType.Information, expiration);

    public void Warning(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Warning", message, NotificationType.Warning, expiration);

    public void Error(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Error", message, NotificationType.Error, expiration);
}
