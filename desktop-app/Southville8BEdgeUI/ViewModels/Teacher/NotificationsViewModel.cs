using CommunityToolkit.Mvvm.ComponentModel;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class NotificationsViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "Notifications";
    [ObservableProperty] private ObservableCollection<NotificationItem> _items = new()
    {
        new NotificationItem { Title = "New message from Parent", Description = "Maria Garcia's guardian sent you a message.", TimeAgo = "5m", Severity = NotificationSeverity.Info },
        new NotificationItem { Title = "Assignment Due", Description = "Grade 8-A Mathematics assignment due tomorrow.", TimeAgo = "1h", Severity = NotificationSeverity.Warning },
        new NotificationItem { Title = "System Update", Description = "App updated to v1.2.3.", TimeAgo = "2h", Severity = NotificationSeverity.Success }
    };
}

public class NotificationItem
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TimeAgo { get; set; } = string.Empty;
    public NotificationSeverity Severity { get; set; } = NotificationSeverity.Info;
}

public enum NotificationSeverity
{
    Info,
    Warning,
    Success
}
