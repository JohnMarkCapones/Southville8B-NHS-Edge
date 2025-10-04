using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using System;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public interface IToastService
{
    void Initialize(Window host);
    void Show(string title, string message, NotificationType type = NotificationType.Information, TimeSpan? expiration = null);
    void Success(string message, string? title = null, TimeSpan? expiration = null);
    void Info(string message, string? title = null, TimeSpan? expiration = null);
    void Warning(string message, string? title = null, TimeSpan? expiration = null);
    void Error(string message, string? title = null, TimeSpan? expiration = null);
}
