using CommunityToolkit.Mvvm.ComponentModel;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class NotificationsViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "Notifications";
    [ObservableProperty] private ObservableCollection<NotificationItem> _items = new()
    {
        new NotificationItem { Title = "New message from Parent", Description = "Maria Garcia's guardian sent you a message.", TimeAgo = "5m", Severity = NotificationSeverity.Info, IsNew = true },
        new NotificationItem { Title = "Assignment Due", Description = "Grade 8-A Mathematics assignment due tomorrow.", TimeAgo = "1h", Severity = NotificationSeverity.Warning, IsNew = true },
        new NotificationItem { Title = "System Update", Description = "App updated to v1.2.3.", TimeAgo = "2h", Severity = NotificationSeverity.Success, IsNew = false }
    };
}

public class NotificationItem : ObservableObject
{
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
}

public enum NotificationSeverity
{
    Info,
    Warning,
    Success
}
