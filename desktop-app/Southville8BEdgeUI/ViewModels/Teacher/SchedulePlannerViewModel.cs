using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class SchedulePlannerViewModel : ViewModelBase
{
    [ObservableProperty] private string _selectedWeek = "";
    [ObservableProperty] private ObservableCollection<string> _availableWeeks = new();
    [ObservableProperty] private int _weeklyClassesCount = 24;
    [ObservableProperty] private int _weeklyHours = 36;
    [ObservableProperty] private int _freePeriodsCount = 8;
    [ObservableProperty] private int _conflictsCount = 2;
    [ObservableProperty] private ObservableCollection<TimeSlotViewModel> _timeSlots = new();
    [ObservableProperty] private ObservableCollection<UpcomingClassViewModel> _upcomingClasses = new();
    [ObservableProperty] private string _newClassSubject = "";
    [ObservableProperty] private string _newClassGrade = "";
    [ObservableProperty] private string _newClassDay = "";
    [ObservableProperty] private TimeSpan? _newClassStartTime;
    [ObservableProperty] private string _newClassDuration = "";
    [ObservableProperty] private string _newClassRoom = "";
    [ObservableProperty] private ObservableCollection<string> _availableSubjects = new() { "Mathematics", "Science", "Physics", "Chemistry" };
    [ObservableProperty] private ObservableCollection<string> _availableGrades = new() { "Grade 8A", "Grade 8B", "Grade 9A", "Grade 9B" };
    [ObservableProperty] private ObservableCollection<string> _availableDays = new() { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
    [ObservableProperty] private ObservableCollection<string> _availableDurations = new() { "1 hour", "1.5 hours", "2 hours" };
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

        UpcomingClasses = new ObservableCollection<UpcomingClassViewModel>
        {
            new() { Subject = "Mathematics", Grade = "Grade 8A", Time = "08:00 - 09:30", Room = "Room 101", SubjectColor = "#3B82F6" },
            new() { Subject = "Science", Grade = "Grade 8B", Time = "10:00 - 11:30", Room = "Room 205", SubjectColor = "#10B981" }
        };

        Conflicts = new ObservableCollection<ScheduleConflictViewModel>
        {
            new() { ConflictDescription = "Double booking in Room 101", Time = "Monday 10:00 AM" },
            new() { ConflictDescription = "Back-to-back classes", Time = "Tuesday 2:00 PM" }
        };

        HasConflicts = Conflicts.Count > 0;
    }

    [RelayCommand] private void AddClass() { }
    [RelayCommand] private void ExportSchedule() { }
    [RelayCommand] private void RefreshSchedule() { }
    [RelayCommand] private void ManageTemplates() { }
    [RelayCommand] private void EditClass(UpcomingClassViewModel classItem) { }
    [RelayCommand] private void AddNotes(UpcomingClassViewModel classItem) { }
    [RelayCommand] private void QuickAddClass() { }
    [RelayCommand] private void LoadTemplate() { }
    [RelayCommand] private void SaveTemplate() { }
}

public partial class TimeSlotViewModel : ViewModelBase
{
    [ObservableProperty] private string _timeRange = "";
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
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _room = "";
}

public partial class UpcomingClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _time = "";
    [ObservableProperty] private string _room = "";
    [ObservableProperty] private string _subjectColor = "";
}

public partial class ScheduleConflictViewModel : ViewModelBase
{
    [ObservableProperty] private string _conflictDescription = "";
    [ObservableProperty] private string _time = "";

    [RelayCommand] private void Resolve() { }
}