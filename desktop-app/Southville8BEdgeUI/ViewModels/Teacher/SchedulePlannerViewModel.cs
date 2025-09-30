using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using Avalonia.Media; // Added for IBrush usage
using Avalonia; // For Application.Current resource lookup
using Avalonia.Styling; // For ThemeVariant

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class SchedulePlannerViewModel : ViewModelBase
{
    // Week selection
    [ObservableProperty] private string _selectedWeek = string.Empty;
    [ObservableProperty] private ObservableCollection<string> _availableWeeks = new();

    // KPI values
    [ObservableProperty] private int _weeklyClassesCount;
    [ObservableProperty] private int _weeklyHours;
    [ObservableProperty] private int _freePeriodsCount;
    [ObservableProperty] private int _conflictsCount;

    // Data collections
    [ObservableProperty] private ObservableCollection<TimeSlotViewModel> _timeSlots = new();
    [ObservableProperty] private ObservableCollection<UpcomingClassViewModel> _upcomingClasses = new();
    [ObservableProperty] private ObservableCollection<ScheduleConflictViewModel> _conflicts = new();
    [ObservableProperty] private bool _hasConflicts;

    public SchedulePlannerViewModel()
    {
        InitializeData();
    }

    private void InitializeData()
    {
        AvailableWeeks = new ObservableCollection<string> { "Current Week", "Next Week", "Week of Feb 17", "Week of Feb 24" };
        SelectedWeek = AvailableWeeks[0];

        WeeklyClassesCount = 24;
        WeeklyHours = 36;
        FreePeriodsCount = 8;
        ConflictsCount = 2;

        // Build timetable rows (sample data)
        TimeSlots = new ObservableCollection<TimeSlotViewModel>();
        for (int hour = 8; hour < 18; hour++)
        {
            TimeSlots.Add(new TimeSlotViewModel
            {
                TimeRange = $"{hour:D2}:00 - {hour + 1:D2}:00",
                Monday = new ScheduleSlotViewModel { IsOccupied = hour == 8, Subject = "Math", Grade = "8A", Room = "101" },
                Tuesday = new ScheduleSlotViewModel { IsOccupied = hour == 10, Subject = "Science", Grade = "8B", Room = "205" },
                Wednesday = new ScheduleSlotViewModel { IsOccupied = false },
                Thursday = new ScheduleSlotViewModel { IsOccupied = hour == 13, Subject = "Physics", Grade = "9A", Room = "301" },
                Friday = new ScheduleSlotViewModel { IsOccupied = false },
                Saturday = new ScheduleSlotViewModel { IsOccupied = false },
                Sunday = new ScheduleSlotViewModel { IsOccupied = false }
            });
        }

        // Resolve themed brushes (fallback to transparent if not found)
        IBrush infoBrush = Brushes.Transparent;
        IBrush successBrush = Brushes.Transparent;

        if (Application.Current is { } app)
        {
            if (app.Resources.TryGetResource("InfoBrush", app.ActualThemeVariant, out var infoObj) && infoObj is IBrush ib)
                infoBrush = ib;
            if (app.Resources.TryGetResource("SuccessBrush", app.ActualThemeVariant, out var successObj) && successObj is IBrush sb)
                successBrush = sb;
        }

        UpcomingClasses = new ObservableCollection<UpcomingClassViewModel>
        {
            new() { Subject = "Mathematics", Grade = "Grade 8A", Time = "08:00 - 09:30", Room = "Room 101", SubjectColor = infoBrush },
            new() { Subject = "Science", Grade = "Grade 8B", Time = "10:00 - 11:30", Room = "Room 205", SubjectColor = successBrush }
        };

        Conflicts = new ObservableCollection<ScheduleConflictViewModel>
        {
            new() { ConflictDescription = "Double booking in Room 101", Time = "Monday 10:00 AM" },
            new() { ConflictDescription = "Back-to-back classes", Time = "Tuesday 2:00 PM" }
        };

        HasConflicts = Conflicts.Count > 0;
    }

    // Commands (placeholders)
    [RelayCommand] private void RefreshSchedule() { }
    [RelayCommand] private void ManageTemplates() { }
    [RelayCommand] private void EditClass(UpcomingClassViewModel vm) { }
    [RelayCommand] private void AddNotes(UpcomingClassViewModel vm) { }
    [RelayCommand] private void LoadTemplate() { }
    [RelayCommand] private void SaveTemplate() { }
}

public partial class TimeSlotViewModel : ViewModelBase
{
    [ObservableProperty] private string _timeRange = string.Empty;
    [ObservableProperty] private ScheduleSlotViewModel _monday = new();
    [ObservableProperty] private ScheduleSlotViewModel _tuesday = new();
    [ObservableProperty] private ScheduleSlotViewModel _wednesday = new();
    [ObservableProperty] private ScheduleSlotViewModel _thursday = new();
    [ObservableProperty] private ScheduleSlotViewModel _friday = new();
    [ObservableProperty] private ScheduleSlotViewModel _saturday = new();
    [ObservableProperty] private ScheduleSlotViewModel _sunday = new();
}

public partial class ScheduleSlotViewModel : ViewModelBase
{
    [ObservableProperty] private bool _isOccupied;
    [ObservableProperty] private string _subject = string.Empty;
    [ObservableProperty] private string _grade = string.Empty;
    [ObservableProperty] private string _room = string.Empty;
}

public partial class UpcomingClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = string.Empty;
    [ObservableProperty] private string _grade = string.Empty;
    [ObservableProperty] private string _time = string.Empty;
    [ObservableProperty] private string _room = string.Empty;
    [ObservableProperty] private IBrush _subjectColor = Brushes.Transparent; // Changed from string to IBrush
}

public partial class ScheduleConflictViewModel : ViewModelBase
{
    [ObservableProperty] private string _conflictDescription = string.Empty;
    [ObservableProperty] private string _time = string.Empty;

    [RelayCommand] private void Resolve() { }
}
