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
        
        System.Diagnostics.Debug.WriteLine($"=== TOAST SERVICE INITIALIZED ===");
        System.Diagnostics.Debug.WriteLine($"Window: {host?.GetType().Name ?? "NULL"}");
        System.Diagnostics.Debug.WriteLine($"Manager: {_manager != null}");
    }

    public void Show(string title, string message, NotificationType type = NotificationType.Information, TimeSpan? expiration = null)
    {
        System.Diagnostics.Debug.WriteLine($"=== TOAST SHOW CALLED ===");
        System.Diagnostics.Debug.WriteLine($"Manager is null: {_manager == null}");
        System.Diagnostics.Debug.WriteLine($"Title: '{title}', Message: '{message}'");
        
        if (_manager == null)
        {
            System.Diagnostics.Debug.WriteLine("ERROR: WindowNotificationManager is NULL!");
            return;
        }
        
        _manager.Show(new Notification(title, message, type, expiration ?? TimeSpan.FromSeconds(3)));
        System.Diagnostics.Debug.WriteLine("=== NOTIFICATION SENT TO MANAGER ===");
    }

    public void Success(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Success", message, NotificationType.Success, expiration);

    public void Info(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Info", message, NotificationType.Information, expiration);

    public void Warning(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Warning", message, NotificationType.Warning, expiration);

    public void Error(string message, string? title = null, TimeSpan? expiration = null)
        => Show(title ?? "Error", message, NotificationType.Error, expiration);
}
