using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class NewAnnouncementViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }
    public Action<AnnouncementItemViewModel>? OnCreated { get; set; }

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(CreateCommand))]
    private string _title = string.Empty;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(CreateCommand))]
    private string _content = string.Empty;

    [ObservableProperty] private string _priority = string.Empty;
    [ObservableProperty] private string _targetClass = string.Empty;
    [ObservableProperty] private bool _postImmediately = true;
    [ObservableProperty] private DateTime? _scheduledDate;
    [ObservableProperty] private ObservableCollection<string> _availableClasses = new();
    [ObservableProperty] private ObservableCollection<string> _priorityOptions = new();

    private bool CanCreate() => !string.IsNullOrWhiteSpace(Title) && !string.IsNullOrWhiteSpace(Content);

    [RelayCommand(CanExecute = nameof(CanCreate))]
    private void Create()
    {
        var safeContent = Content ?? string.Empty;
        var preview = safeContent.Length > 120 ? safeContent[..120] + "..." : safeContent;
        var item = new AnnouncementItemViewModel
        {
            Title = Title,
            ContentPreview = preview,
            Priority = string.IsNullOrWhiteSpace(Priority) ? "Low" : Priority,
            Status = PostImmediately ? "Active" : "Scheduled",
            TargetClass = TargetClass,
            ViewCount = 0,
            CommentCount = 0,
            PostedDate = PostImmediately ? "now" : ScheduledDate?.ToString("MMM d") ?? "scheduled",
            LastModified = "now"
        };
        OnCreated?.Invoke(item);
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }
}
