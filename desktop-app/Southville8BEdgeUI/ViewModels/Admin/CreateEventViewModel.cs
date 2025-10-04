using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateEventViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }
    public Action<EventViewModel>? OnSaved { get; set; }

    [ObservableProperty] private string _title = string.Empty;
    [ObservableProperty] private string _status = "Upcoming"; // default
    [ObservableProperty] private string _type = "Meeting";
    [ObservableProperty] private DateTime _startDate = DateTime.Today;
    [ObservableProperty] private DateTime _endDate = DateTime.Today;
    [ObservableProperty] private TimeSpan _startTime = new(9,0,0);
    [ObservableProperty] private TimeSpan _endTime = new(10,0,0);
    [ObservableProperty] private string _location = string.Empty;
    [ObservableProperty] private string _organizer = string.Empty;
    [ObservableProperty] private int _maxAttendees;
    [ObservableProperty] private string _description = string.Empty;

    // Bridge properties for Avalonia DatePicker (SelectedDate is DateTimeOffset?) to avoid InvalidCastException
    [ObservableProperty] private DateTimeOffset? _startDateOffset;
    [ObservableProperty] private DateTimeOffset? _endDateOffset;

    public string[] StatusOptions { get; } = { "Upcoming", "Ongoing", "Completed", "Cancelled" };
    public string[] TypeOptions { get; } = { "Meeting", "Competition", "Holiday", "Academic", "Sports", "Cultural" };
    public string[] LocationOptions { get; } = { "Main Hall", "Gymnasium", "Auditorium", "Classroom", "Online" };

    public CreateEventViewModel()
    {
        StartDateOffset = new DateTimeOffset(StartDate);
        EndDateOffset = new DateTimeOffset(EndDate);
    }

    public bool IsAllDay
    {
        get => StartTime == TimeSpan.Zero && EndTime == TimeSpan.Zero;
        set
        {
            if (value)
            {
                StartTime = TimeSpan.Zero;
                EndTime = TimeSpan.Zero;
            }
        }
    }

    private string? ComputeDateValidationMessage()
    {
        if (StartDate > EndDate) return "End date must be after or equal to start date.";
        if (StartDate == EndDate && EndTime < StartTime) return "End time must be after or equal to start time.";
        return null;
    }

    public string? DateValidationMessage => ComputeDateValidationMessage();
    public bool HasDateValidationError => DateValidationMessage is not null;

    public bool CanSave => !string.IsNullOrWhiteSpace(Title) && DateValidationMessage is null;

    private void RaiseValidationNotifications()
    {
        OnPropertyChanged(nameof(CanSave));
        OnPropertyChanged(nameof(DateValidationMessage));
        OnPropertyChanged(nameof(HasDateValidationError));
    }

    partial void OnTitleChanged(string value) => OnPropertyChanged(nameof(CanSave));
    partial void OnStartDateChanged(DateTime value)
    {
        if (StartDateOffset?.Date != value.Date)
            StartDateOffset = new DateTimeOffset(value.Date);
        RaiseValidationNotifications();
    }
    partial void OnEndDateChanged(DateTime value)
    {
        if (EndDateOffset?.Date != value.Date)
            EndDateOffset = new DateTimeOffset(value.Date);
        RaiseValidationNotifications();
    }

    // Keep IsAllDay binding in sync when times change and validate
    partial void OnStartTimeChanged(TimeSpan value)
    {
        OnPropertyChanged(nameof(IsAllDay));
        RaiseValidationNotifications();
    }
    partial void OnEndTimeChanged(TimeSpan value)
    {
        OnPropertyChanged(nameof(IsAllDay));
        RaiseValidationNotifications();
    }

    partial void OnStartDateOffsetChanged(DateTimeOffset? value)
    {
        if (value.HasValue && StartDate != value.Value.Date)
        {
            StartDate = value.Value.Date; // triggers other partial
        }
    }
    partial void OnEndDateOffsetChanged(DateTimeOffset? value)
    {
        if (value.HasValue && EndDate != value.Value.Date)
        {
            EndDate = value.Value.Date;
        }
    }

    [RelayCommand]
    private void Save()
    {
        if (!CanSave) return;
        var ev = new EventViewModel
        {
            Title = Title,
            Status = Status,
            Type = Type,
            StartDate = StartDate,
            EndDate = EndDate,
            StartTime = StartTime,
            EndTime = EndTime,
            Location = Location,
            Organizer = Organizer,
            MaxAttendees = MaxAttendees,
            CurrentAttendees = 0,
            Description = Description
        };
        OnSaved?.Invoke(ev);
    }

    [RelayCommand]
    private void Cancel() => NavigateBack?.Invoke();
}