using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;

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

    public bool HasNew => Items.Any(i => i.IsNew);

    partial void OnItemsChanged(ObservableCollection<NotificationItem> value)
    {
        MarkAllReadCommand.NotifyCanExecuteChanged();
    }

    private bool CanMarkAllRead() => Items.Any(i => i.IsNew);

    [RelayCommand(CanExecute = nameof(CanMarkAllRead))]
    private void MarkAllRead()
    {
        foreach (var item in Items)
        {
            item.IsNew = false;
        }
        MarkAllReadCommand.NotifyCanExecuteChanged();
    }

    [RelayCommand]
    private void OpenSettings()
    {
        // TODO: navigate to settings (hook into navigation service if available)
    }

    private bool CanMarkRead(NotificationItem? item) => item is not null && item.IsNew;

    [RelayCommand(CanExecute = nameof(CanMarkRead))]
    private void MarkRead(NotificationItem item)
    {
        item.IsNew = false;
        MarkAllReadCommand.NotifyCanExecuteChanged();
        MarkReadCommand.NotifyCanExecuteChanged();
    }

    private bool CanDelete(NotificationItem? item) => item is not null;

    [RelayCommand(CanExecute = nameof(CanDelete))]
    private void Delete(NotificationItem item)
    {
        if (Items.Contains(item))
        {
            Items.Remove(item);
            MarkAllReadCommand.NotifyCanExecuteChanged();
        }
    }
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
