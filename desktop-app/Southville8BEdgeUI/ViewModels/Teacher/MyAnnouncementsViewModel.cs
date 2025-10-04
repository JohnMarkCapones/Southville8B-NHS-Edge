using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using Avalonia; // For Application.Current
using Avalonia.Media; // For IBrush
using Avalonia.Styling; // For theme variant lookups

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MyAnnouncementsViewModel : ViewModelBase, IDisposable
{
    // Navigation callback set by shell
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private int _totalAnnouncementsCount = 0; // dynamic, computed
    [ObservableProperty] private int _activeAnnouncementsCount = 0; // dynamic, computed
    [ObservableProperty] private int _totalViewsCount = 1247; // keep sample metric
    [ObservableProperty] private double _engagementRate = 78.3; // sample metric
    [ObservableProperty] private string _selectedFilter = "All";
    [ObservableProperty] private ObservableCollection<string> _filterOptions = new() { "All", "Active", "Draft", "Scheduled" };
    [ObservableProperty] private ObservableCollection<AnnouncementItemViewModel> _announcements = new();
    [ObservableProperty] private string _newAnnouncementTitle = "";
    [ObservableProperty] private string _newAnnouncementClass = "";
    [ObservableProperty] private string _newAnnouncementPriority = "";
    [ObservableProperty] private string _newAnnouncementContent = "";
    [ObservableProperty] private bool _postImmediately = true;
    [ObservableProperty] private DateTime? _scheduledDate;
    [ObservableProperty] private ObservableCollection<string> _availableClasses = new() { "Grade 8A", "Grade 8B", "Grade 9A" };
    [ObservableProperty] private ObservableCollection<string> _priorityOptions = new() { "High", "Medium", "Low" };
    [ObservableProperty] private ObservableCollection<AnnouncementActivityViewModel> _recentActivity = new();

    private EventHandler? _themeChangedHandler;
    private bool _disposed;

    public MyAnnouncementsViewModel()
    {
        InitializeData();
        UpdateAnnouncementCounts();
        // Theme change subscription to refresh badge brushes (store handler for later unsubscription)
        if (Application.Current is { } app)
        {
            _themeChangedHandler = (_, __) => RefreshAnnouncementBadgeBrushes();
            app.ActualThemeVariantChanged += _themeChangedHandler;
        }
    }

    private void UpdateAnnouncementCounts()
    {
        TotalAnnouncementsCount = Announcements.Count;
        ActiveAnnouncementsCount = Announcements.Count(a => a.Status == "Active");
    }

    private void RefreshAnnouncementBadgeBrushes()
    {
        foreach (var a in Announcements)
        {
            a.UpdatePriorityBrushes();
            a.UpdateStatusBrushes();
        }
    }

    private void InitializeData()
    {
        Announcements = new ObservableCollection<AnnouncementItemViewModel>
        {
            new() { Title = "Math Quiz Next Week", Priority = "High", Status = "Active", TargetClass = "Grade 8A", ContentPreview = "Quiz on quadratic equations scheduled for next Friday...", ViewCount = 45, CommentCount = 8, PostedDate = "2 days ago", LastModified = "1 hour ago" },
            new() { Title = "Science Project Deadline", Priority = "Medium", Status = "Active", TargetClass = "Grade 8B", ContentPreview = "Remember to submit your science projects by...", ViewCount = 32, CommentCount = 5, PostedDate = "1 day ago", LastModified = "3 hours ago" }
        };

        foreach (var a in Announcements)
        {
            a.UpdatePriorityBrushes();
            a.UpdateStatusBrushes();
        }

        RecentActivity = new ObservableCollection<AnnouncementActivityViewModel>
        {
            new() { Activity = "Created new announcement", AnnouncementTitle = "Math Quiz Next Week", Timestamp = "2 hours ago" },
            new() { Activity = "Updated announcement", AnnouncementTitle = "Science Project", Timestamp = "5 hours ago" }
        };
    }

    [RelayCommand]
    private void CreateAnnouncement()
    {
        if (NavigateTo == null) return;
        var formVm = new NewAnnouncementViewModel
        {
            AvailableClasses = new ObservableCollection<string>(AvailableClasses),
            PriorityOptions = new ObservableCollection<string>(PriorityOptions),
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnCreated = item =>
            {
                item.UpdatePriorityBrushes();
                item.UpdateStatusBrushes();
                Announcements.Insert(0, item);
                RecentActivity.Insert(0, new AnnouncementActivityViewModel
                {
                    Activity = "Created new announcement",
                    AnnouncementTitle = item.Title,
                    Timestamp = "just now"
                });
                UpdateAnnouncementCounts();
                NavigateTo?.Invoke(this);
            }
        };
        var navigate = NavigateTo; // capture delegate to avoid race
        navigate?.Invoke(formVm);
    }

    [RelayCommand] private void ViewAnalytics() { }
    [RelayCommand] private void EditAnnouncement(AnnouncementItemViewModel announcement) { }
    [RelayCommand] private void ViewAnnouncement(AnnouncementItemViewModel announcement) { }
    [RelayCommand] private void DeleteAnnouncement(AnnouncementItemViewModel announcement) { }
    [RelayCommand] private void CreateQuickAnnouncement()
    {
        if (string.IsNullOrWhiteSpace(NewAnnouncementTitle)) return;
        var item = new AnnouncementItemViewModel
        {
            Title = NewAnnouncementTitle,
            Priority = string.IsNullOrWhiteSpace(NewAnnouncementPriority) ? "Low" : NewAnnouncementPriority,
            Status = PostImmediately ? "Active" : "Scheduled",
            TargetClass = NewAnnouncementClass,
            ContentPreview = NewAnnouncementContent,
            ViewCount = 0,
            CommentCount = 0,
            PostedDate = PostImmediately ? "now" : ScheduledDate?.ToString("MMM d") ?? "scheduled",
            LastModified = "now"
        };
        item.UpdatePriorityBrushes();
        item.UpdateStatusBrushes();
        Announcements.Insert(0, item);
        RecentActivity.Insert(0, new AnnouncementActivityViewModel
        {
            Activity = "Quick created announcement",
            AnnouncementTitle = item.Title,
            Timestamp = "just now"
        });
        UpdateAnnouncementCounts();
        // reset minimal fields
        NewAnnouncementTitle = NewAnnouncementContent = string.Empty;
        NewAnnouncementClass = NewAnnouncementPriority = string.Empty;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        if (_themeChangedHandler != null && Application.Current is { } app)
        {
            app.ActualThemeVariantChanged -= _themeChangedHandler;
            _themeChangedHandler = null;
        }
        GC.SuppressFinalize(this);
    }
}

public partial class AnnouncementItemViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _priority = "";
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private string _targetClass = "";
    [ObservableProperty] private string _contentPreview = "";
    [ObservableProperty] private int _viewCount;
    [ObservableProperty] private int _commentCount;
    [ObservableProperty] private string _postedDate = "";
    [ObservableProperty] private string _lastModified = "";

    // Themed badge brushes (background soft + text solid)
    [ObservableProperty] private IBrush _priorityBadgeBackgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _priorityBadgeTextBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _statusBadgeBackgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _statusBadgeTextBrush = Brushes.Transparent;

    partial void OnPriorityChanged(string value) => UpdatePriorityBrushes();
    partial void OnStatusChanged(string value) => UpdateStatusBrushes();

    private static IBrush ResolveBrush(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var obj) && obj is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    public void UpdatePriorityBrushes()
    {
        var success = ResolveBrush("SuccessBrush");
        var warning = ResolveBrush("WarningBrush");
        var danger = ResolveBrush("DangerBrush");
        var successSoft = ResolveBrush("SuccessSoftBrush");
        var warningSoft = ResolveBrush("WarningSoftBrush");
        var dangerSoft = ResolveBrush("DangerSoftBrush");
        var graySoft = ResolveBrush("GraySoftBrush");
        var textPrimary = ResolveBrush("TextPrimaryBrush");

        switch (Priority)
        {
            case "High":
                PriorityBadgeBackgroundBrush = dangerSoft;
                PriorityBadgeTextBrush = danger;
                break;
            case "Medium":
                PriorityBadgeBackgroundBrush = warningSoft;
                PriorityBadgeTextBrush = warning;
                break;
            case "Low":
                PriorityBadgeBackgroundBrush = successSoft;
                PriorityBadgeTextBrush = success;
                break;
            default:
                PriorityBadgeBackgroundBrush = graySoft;
                PriorityBadgeTextBrush = textPrimary;
                break;
        }
    }

    public void UpdateStatusBrushes()
    {
        var success = ResolveBrush("SuccessBrush");
        var info = ResolveBrush("InfoBrush");
        var graySoft = ResolveBrush("GraySoftBrush");
        var successSoft = ResolveBrush("SuccessSoftBrush");
        var infoSoft = ResolveBrush("InfoSoftBrush");
        var textPrimary = ResolveBrush("TextPrimaryBrush");
        var textSecondary = ResolveBrush("TextSecondaryBrush");

        switch (Status)
        {
            case "Active":
                StatusBadgeBackgroundBrush = successSoft;
                StatusBadgeTextBrush = success;
                break;
            case "Scheduled":
                StatusBadgeBackgroundBrush = infoSoft;
                StatusBadgeTextBrush = info;
                break;
            case "Draft":
                StatusBadgeBackgroundBrush = graySoft;
                StatusBadgeTextBrush = textSecondary;
                break;
            default:
                StatusBadgeBackgroundBrush = graySoft;
                StatusBadgeTextBrush = textPrimary;
                break;
        }
    }
}

public partial class AnnouncementActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _activity = "";
    [ObservableProperty] private string _announcementTitle = "";
    [ObservableProperty] private string _timestamp = "";
}