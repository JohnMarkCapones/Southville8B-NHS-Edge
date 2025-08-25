using System;
using System.Collections.ObjectModel;
using System.Linq;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class EventDashboardViewModel : ViewModelBase
{
    [ObservableProperty]
    private int _totalEvents = 24;

    [ObservableProperty]
    private int _thisWeekEvents = 8;

    [ObservableProperty]
    private int _upcomingEvents = 12;

    [ObservableProperty]
    private int _pastEvents = 156;

    [ObservableProperty]
    private ObservableCollection<EventViewModel> _events;

    [ObservableProperty]
    private ObservableCollection<EventViewModel> _filteredEvents;

    [ObservableProperty]
    private string _searchText = "";

    [ObservableProperty]
    private string? _selectedStatus;

    [ObservableProperty]
    private string? _selectedType;

    [ObservableProperty]
    private string? _selectedLocation;

    public ObservableCollection<string> StatusOptions { get; } = new() { "All Status", "Upcoming", "Ongoing", "Completed", "Cancelled" };
    public ObservableCollection<string> TypeOptions { get; } = new() { "All Types", "Meeting", "Competition", "Holiday", "Academic", "Sports", "Cultural" };
    public ObservableCollection<string> LocationOptions { get; } = new() { "All Locations", "Main Hall", "Gymnasium", "Auditorium", "Classroom", "Online" };

    public bool HasFilteredEvents => FilteredEvents?.Any() == true;

    public EventDashboardViewModel()
    {
        // Sample Data for Demonstration
        Events = new ObservableCollection<EventViewModel>
        {
            new EventViewModel 
            { 
                Title = "Parent-Teacher Conference", 
                Status = "Upcoming", 
                Type = "Meeting", 
                StartDate = new DateTime(2024, 3, 15), 
                EndDate = new DateTime(2024, 3, 15),
                StartTime = new TimeSpan(15, 0, 0), // 3:00 PM
                EndTime = new TimeSpan(18, 0, 0), // 6:00 PM
                Location = "Main Hall",
                Description = "Annual parent-teacher conference for all grade levels",
                Organizer = "Academic Department",
                MaxAttendees = 200,
                CurrentAttendees = 85
            },
            new EventViewModel 
            { 
                Title = "Science Fair", 
                Status = "Upcoming", 
                Type = "Competition", 
                StartDate = new DateTime(2024, 3, 22), 
                EndDate = new DateTime(2024, 3, 22),
                StartTime = new TimeSpan(9, 0, 0), // 9:00 AM
                EndTime = new TimeSpan(16, 0, 0), // 4:00 PM
                Location = "Gymnasium",
                Description = "Annual science fair competition for grades 8-12",
                Organizer = "Science Department",
                MaxAttendees = 150,
                CurrentAttendees = 67
            },
            new EventViewModel 
            { 
                Title = "Spring Break", 
                Status = "Upcoming", 
                Type = "Holiday", 
                StartDate = new DateTime(2024, 4, 1), 
                EndDate = new DateTime(2024, 4, 5),
                StartTime = TimeSpan.Zero,
                EndTime = TimeSpan.Zero,
                Location = "School Closed",
                Description = "Spring break holiday - no classes",
                Organizer = "Administration",
                MaxAttendees = 0,
                CurrentAttendees = 0
            },
            new EventViewModel 
            { 
                Title = "Mathematics Olympiad", 
                Status = "Ongoing", 
                Type = "Competition", 
                StartDate = DateTime.Today, 
                EndDate = DateTime.Today,
                StartTime = new TimeSpan(10, 0, 0), // 10:00 AM
                EndTime = new TimeSpan(15, 0, 0), // 3:00 PM
                Location = "Auditorium",
                Description = "Regional mathematics competition",
                Organizer = "Math Department",
                MaxAttendees = 100,
                CurrentAttendees = 45
            },
            new EventViewModel 
            { 
                Title = "Cultural Festival", 
                Status = "Completed", 
                Type = "Cultural", 
                StartDate = new DateTime(2024, 2, 14), 
                EndDate = new DateTime(2024, 2, 14),
                StartTime = new TimeSpan(9, 0, 0), // 9:00 AM
                EndTime = new TimeSpan(17, 0, 0), // 5:00 PM
                Location = "Main Hall",
                Description = "Annual cultural festival showcasing student talents",
                Organizer = "Cultural Committee",
                MaxAttendees = 300,
                CurrentAttendees = 285
            },
            new EventViewModel 
            { 
                Title = "Basketball Championship", 
                Status = "Completed", 
                Type = "Sports", 
                StartDate = new DateTime(2024, 2, 20), 
                EndDate = new DateTime(2024, 2, 22),
                StartTime = new TimeSpan(14, 0, 0), // 2:00 PM
                EndTime = new TimeSpan(18, 0, 0), // 6:00 PM
                Location = "Gymnasium",
                Description = "Inter-school basketball championship",
                Organizer = "Sports Department",
                MaxAttendees = 200,
                CurrentAttendees = 180
            },
            new EventViewModel 
            { 
                Title = "Online Workshop: Digital Literacy", 
                Status = "Upcoming", 
                Type = "Academic", 
                StartDate = new DateTime(2024, 3, 25), 
                EndDate = new DateTime(2024, 3, 25),
                StartTime = new TimeSpan(13, 0, 0), // 1:00 PM
                EndTime = new TimeSpan(16, 0, 0), // 4:00 PM
                Location = "Online",
                Description = "Digital literacy workshop for students and faculty",
                Organizer = "IT Department",
                MaxAttendees = 50,
                CurrentAttendees = 32
            },
            new EventViewModel 
            { 
                Title = "Grade 12 Graduation", 
                Status = "Upcoming", 
                Type = "Academic", 
                StartDate = new DateTime(2024, 5, 15), 
                EndDate = new DateTime(2024, 5, 15),
                StartTime = new TimeSpan(10, 0, 0), // 10:00 AM
                EndTime = new TimeSpan(12, 0, 0), // 12:00 PM
                Location = "Auditorium",
                Description = "Graduation ceremony for Grade 12 students",
                Organizer = "Administration",
                MaxAttendees = 250,
                CurrentAttendees = 78
            }
        };

        FilteredEvents = new ObservableCollection<EventViewModel>(Events);
        UpdateStatistics();
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();
    partial void OnSelectedStatusChanged(string? value) => ApplyFilters();
    partial void OnSelectedTypeChanged(string? value) => ApplyFilters();
    partial void OnSelectedLocationChanged(string? value) => ApplyFilters();

    private void ApplyFilters()
    {
        var filtered = Events.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(SearchText))
        {
            filtered = filtered.Where(e => e.Title.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         e.Type.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         e.Organizer.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         e.Location.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(SelectedStatus) && SelectedStatus != "All Status")
        {
            filtered = filtered.Where(e => e.Status == SelectedStatus);
        }

        if (!string.IsNullOrWhiteSpace(SelectedType) && SelectedType != "All Types")
        {
            filtered = filtered.Where(e => e.Type == SelectedType);
        }

        if (!string.IsNullOrWhiteSpace(SelectedLocation) && SelectedLocation != "All Locations")
        {
            filtered = filtered.Where(e => e.Location == SelectedLocation);
        }

        FilteredEvents.Clear();
        foreach (var eventItem in filtered)
        {
            FilteredEvents.Add(eventItem);
        }
        OnPropertyChanged(nameof(HasFilteredEvents));
    }

    private void UpdateStatistics()
    {
        TotalEvents = Events.Count;
        UpcomingEvents = Events.Count(e => e.Status == "Upcoming");
        var thisWeekStart = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
        var thisWeekEnd = thisWeekStart.AddDays(7);
        ThisWeekEvents = Events.Count(e => e.StartDate >= thisWeekStart && e.StartDate < thisWeekEnd);
        PastEvents = Events.Count(e => e.Status == "Completed");
    }

    [RelayCommand]
    private void CreateEvent()
    {
        // TODO: Open create event dialog
    }

    [RelayCommand]
    private void FilterEvents()
    {
        // TODO: Open advanced filter dialog
    }

    [RelayCommand]
    private void ViewEventDetails(EventViewModel eventItem)
    {
        // TODO: Show event details dialog
    }

    [RelayCommand]
    private void EditEvent(EventViewModel eventItem)
    {
        // TODO: Open edit event dialog
    }

    [RelayCommand]
    private void DeleteEvent(EventViewModel eventItem)
    {
        Events.Remove(eventItem);
        UpdateStatistics();
        ApplyFilters();
    }
}

public partial class EventViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _status = ""; // "Upcoming", "Ongoing", "Completed", "Cancelled"
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private DateTime _startDate;
    [ObservableProperty] private DateTime _endDate;
    [ObservableProperty] private TimeSpan _startTime;
    [ObservableProperty] private TimeSpan _endTime;
    [ObservableProperty] private string _location = "";
    [ObservableProperty] private string _description = "";
    [ObservableProperty] private string _organizer = "";
    [ObservableProperty] private int _maxAttendees;
    [ObservableProperty] private int _currentAttendees;

    public bool IsUpcoming => Status == "Upcoming";
    public bool IsOngoing => Status == "Ongoing";
    public bool IsCompleted => Status == "Completed";
    public bool IsCancelled => Status == "Cancelled";
    public bool CanEdit => !IsCompleted && !IsCancelled;
    public bool CanCancel => IsUpcoming;

    public string StatusColor => Status switch
    {
        "Upcoming" => "#3B82F6",
        "Ongoing" => "#10B981",
        "Completed" => "#6B7280",
        "Cancelled" => "#EF4444",
        _ => "#6B7280"
    };

    public string DateRange => StartDate.Date == EndDate.Date 
        ? StartDate.ToString("MMM dd, yyyy")
        : $"{StartDate:MMM dd} - {EndDate:MMM dd, yyyy}";

    public string TimeRange => StartTime == TimeSpan.Zero && EndTime == TimeSpan.Zero 
        ? "All Day"
        : $"{StartTime:hh\\:mm} - {EndTime:hh\\:mm}";

    public string AttendeeInfo => MaxAttendees > 0 
        ? $"{CurrentAttendees}/{MaxAttendees} attendees"
        : "No limit";

    public double AttendancePercentage => MaxAttendees > 0 
        ? (double)CurrentAttendees / MaxAttendees * 100 
        : 0;

    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(IsUpcoming));
        OnPropertyChanged(nameof(IsOngoing));
        OnPropertyChanged(nameof(IsCompleted));
        OnPropertyChanged(nameof(IsCancelled));
        OnPropertyChanged(nameof(StatusColor));
        OnPropertyChanged(nameof(CanEdit));
        OnPropertyChanged(nameof(CanCancel));
    }

    partial void OnStartDateChanged(DateTime value)
    {
        OnPropertyChanged(nameof(DateRange));
    }

    partial void OnEndDateChanged(DateTime value)
    {
        OnPropertyChanged(nameof(DateRange));
    }

    partial void OnStartTimeChanged(TimeSpan value)
    {
        OnPropertyChanged(nameof(TimeRange));
    }

    partial void OnEndTimeChanged(TimeSpan value)
    {
        OnPropertyChanged(nameof(TimeRange));
    }

    partial void OnCurrentAttendeesChanged(int value)
    {
        OnPropertyChanged(nameof(AttendeeInfo));
        OnPropertyChanged(nameof(AttendancePercentage));
    }

    partial void OnMaxAttendeesChanged(int value)
    {
        OnPropertyChanged(nameof(AttendeeInfo));
        OnPropertyChanged(nameof(AttendancePercentage));
    }
}