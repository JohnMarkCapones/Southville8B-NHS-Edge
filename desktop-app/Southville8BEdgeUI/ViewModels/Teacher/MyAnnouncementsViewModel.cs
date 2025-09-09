using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MyAnnouncementsViewModel : ViewModelBase
{
    [ObservableProperty] private int _totalAnnouncementsCount = 45;
    [ObservableProperty] private int _activeAnnouncementsCount = 12;
    [ObservableProperty] private int _totalViewsCount = 1247;
    [ObservableProperty] private double _engagementRate = 78.3;
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

    public MyAnnouncementsViewModel()
    {
        InitializeData();
    }

    private void InitializeData()
    {
        Announcements = new ObservableCollection<AnnouncementItemViewModel>
        {
            new() { Title = "Math Quiz Next Week", Priority = "High", Status = "Active", TargetClass = "Grade 8A", ContentPreview = "Quiz on quadratic equations scheduled for next Friday...", ViewCount = 45, CommentCount = 8, PostedDate = "2 days ago", LastModified = "1 hour ago" },
            new() { Title = "Science Project Deadline", Priority = "Medium", Status = "Active", TargetClass = "Grade 8B", ContentPreview = "Remember to submit your science projects by...", ViewCount = 32, CommentCount = 5, PostedDate = "1 day ago", LastModified = "3 hours ago" }
        };

        RecentActivity = new ObservableCollection<AnnouncementActivityViewModel>
        {
            new() { Activity = "Created new announcement", AnnouncementTitle = "Math Quiz Next Week", Timestamp = "2 hours ago" },
            new() { Activity = "Updated announcement", AnnouncementTitle = "Science Project", Timestamp = "5 hours ago" }
        };
    }

    [RelayCommand] private void CreateAnnouncement() { }
    [RelayCommand] private void ViewAnalytics() { }
    [RelayCommand] private void EditAnnouncement(AnnouncementItemViewModel announcement) { }
    [RelayCommand] private void ViewAnnouncement(AnnouncementItemViewModel announcement) { }
    [RelayCommand] private void DeleteAnnouncement(AnnouncementItemViewModel announcement) { }
    [RelayCommand] private void CreateQuickAnnouncement() { }
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

    public string PriorityColor => Priority switch
    {
        "High" => "#EF4444",
        "Medium" => "#F59E0B",
        "Low" => "#10B981",
        _ => "#6B7280"
    };

    public string StatusColor => Status switch
    {
        "Active" => "#10B981",
        "Draft" => "#6B7280",
        "Scheduled" => "#3B82F6",
        _ => "#6B7280"
    };
}

public partial class AnnouncementActivityViewModel : ViewModelBase
{
    [ObservableProperty] private string _activity = "";
    [ObservableProperty] private string _announcementTitle = "";
    [ObservableProperty] private string _timestamp = "";
}