using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Media; // Added for IBrush usage
using Avalonia; // For Application.Current resource lookup
using Avalonia.Styling; // For ThemeVariant
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using System.Diagnostics;
using System.Text.Json;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class SchedulePlannerViewModel : ViewModelBase
{
    private readonly IApiClient? _apiClient;
    private readonly IDialogService? _dialogService;
    private readonly string? _teacherId;

    // Week selection
    [ObservableProperty] private string _selectedWeek = string.Empty;
    [ObservableProperty] private ObservableCollection<string> _availableWeeks = new();
    [ObservableProperty] private string _weekDateRange = string.Empty;

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

    public SchedulePlannerViewModel(IApiClient? apiClient = null, string? teacherId = null, IDialogService? dialogService = null)
    {
        _apiClient = apiClient;
        _teacherId = teacherId;
        _dialogService = dialogService;
        
        AvailableWeeks = new ObservableCollection<string> { "Current Week", "Next Week", "Week of Feb 17", "Week of Feb 24" };
        SelectedWeek = AvailableWeeks[0];

        // Subscribe to theme changes so class colors update dynamically
        if (Application.Current is { } app)
            app.ActualThemeVariantChanged += (_, __) => RefreshThemeColors();

        // Load real data if API client and teacher ID are available
        if (_apiClient != null && !string.IsNullOrEmpty(_teacherId))
        {
            _ = LoadSchedulesAsync();
        }
        else
        {
            // Fallback to mock data if no API access
            InitializeData();
        }
    }

    private static IBrush ResolveBrush(string key, IBrush fallback)
    {
        var app = Application.Current;
        if (app != null && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var obj) && obj is IBrush b)
            return b;
        return fallback;
    }

    private void RefreshThemeColors()
    {
        var info = ResolveBrush("InfoBrush", Brushes.Transparent);
        var success = ResolveBrush("SuccessBrush", Brushes.Transparent);
        // Simple mapping: first upcoming class -> info, second -> success, rest alternate
        for (int i = 0; i < UpcomingClasses.Count; i++)
        {
            UpcomingClasses[i].SubjectColor = i % 2 == 0 ? info : success;
        }
    }

    private async Task LoadSchedulesAsync()
    {
        if (_apiClient == null || string.IsNullOrEmpty(_teacherId))
            return;

        try
        {
            Debug.WriteLine($"Loading schedules for teacher: {_teacherId}");
            
            // Calculate and set current week date range
            var today = DateTime.Today;
            var dayOfWeek = (int)today.DayOfWeek;
            var startOfWeek = today.AddDays(-dayOfWeek); // Gets Sunday of current week
            var endOfWeek = startOfWeek.AddDays(6); // Gets Saturday of current week
            WeekDateRange = $"{startOfWeek:MMM dd} - {endOfWeek:MMM dd, yyyy}";
            
            var response = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                teacherId: _teacherId,
                schoolYear: "2024-2025",
                semester: "1st"
            );

            if (response?.Data == null || !response.Data.Any())
            {
                Debug.WriteLine("No schedules found");
                TimeSlots = new ObservableCollection<TimeSlotViewModel>();
                return;
            }

            Debug.WriteLine($"Found {response.Data.Count} schedules");
            
            // Transform API data to UI ViewModels
            TransformSchedulesToTimeSlots(response.Data);
            TransformSchedulesToUpcomingClasses(response.Data);
            CalculateKpiValues(response.Data);
            DetectConflicts(response.Data);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading schedules: {ex.Message}");
            // Fallback to mock data on error
            InitializeData();
        }
    }

    // Helper Methods
    private TimeSpan ParseTime(string timeString)
    {
        if (string.IsNullOrEmpty(timeString))
            return TimeSpan.Zero;

        // Parse "HH:mm:ss" format
        if (timeString.Length >= 5 && TimeSpan.TryParse(timeString.Substring(0, 5), out var time))
            return time;

        return TimeSpan.Zero;
    }

    private string FormatTimeRange(string startTime, string endTime)
    {
        var start = ParseTime(startTime);
        var end = ParseTime(endTime);
        return $"{start.Hours:D2}:{start.Minutes:D2} - {end.Hours:D2}:{end.Minutes:D2}";
    }

    private string FormatTimeRange12Hour(string startTime, string endTime)
    {
        var start = ParseTime(startTime);
        var end = ParseTime(endTime);
        
        var startHour = start.Hours == 0 ? 12 : (start.Hours > 12 ? start.Hours - 12 : start.Hours);
        var endHour = end.Hours == 0 ? 12 : (end.Hours > 12 ? end.Hours - 12 : end.Hours);
        
        var startPeriod = start.Hours < 12 ? "AM" : "PM";
        var endPeriod = end.Hours < 12 ? "AM" : "PM";
        
        return $"{startHour}:{start.Minutes:D2} {startPeriod} - {endHour}:{end.Minutes:D2} {endPeriod}";
    }

    private double CalculateDuration(string startTime, string endTime)
    {
        var start = ParseTime(startTime);
        var end = ParseTime(endTime);
        return (end - start).TotalHours;
    }

    private string GetCurrentDayOfWeek()
    {
        return DateTime.Now.DayOfWeek switch
        {
            DayOfWeek.Monday => "Monday",
            DayOfWeek.Tuesday => "Tuesday",
            DayOfWeek.Wednesday => "Wednesday",
            DayOfWeek.Thursday => "Thursday",
            DayOfWeek.Friday => "Friday",
            DayOfWeek.Saturday => "Saturday",
            DayOfWeek.Sunday => "Sunday",
            _ => "Monday"
        };
    }

    private int GetDayOfWeekNumber(string dayName)
    {
        return dayName switch
        {
            "Sunday" => 0,
            "Monday" => 1,
            "Tuesday" => 2,
            "Wednesday" => 3,
            "Thursday" => 4,
            "Friday" => 5,
            "Saturday" => 6,
            _ => 0
        };
    }

    private ScheduleSlotViewModel GetDaySlot(TimeSlotViewModel timeSlot, string dayOfWeek)
    {
        return dayOfWeek switch
        {
            "Monday" => timeSlot.Monday,
            "Tuesday" => timeSlot.Tuesday,
            "Wednesday" => timeSlot.Wednesday,
            "Thursday" => timeSlot.Thursday,
            "Friday" => timeSlot.Friday,
            "Saturday" => timeSlot.Saturday,
            "Sunday" => timeSlot.Sunday,
            _ => timeSlot.Monday
        };
    }

    private ScheduleSlotViewModel GetDayProperty(TimeSlotViewModel timeSlot, string dayOfWeek)
    {
        return dayOfWeek switch
        {
            "Monday" => timeSlot.Monday,
            "Tuesday" => timeSlot.Tuesday,
            "Wednesday" => timeSlot.Wednesday,
            "Thursday" => timeSlot.Thursday,
            "Friday" => timeSlot.Friday,
            "Saturday" => timeSlot.Saturday,
            "Sunday" => timeSlot.Sunday,
            _ => timeSlot.Monday
        };
    }

    private void TransformSchedulesToTimeSlots(List<ScheduleDto> schedules)
    {
        // Initialize time slots from 07:00 to 18:00
        var timeSlots = new ObservableCollection<TimeSlotViewModel>();
        
        for (int hour = 7; hour < 18; hour++)
        {
            timeSlots.Add(new TimeSlotViewModel
            {
                TimeRange = $"{hour:D2}:00 - {hour + 1:D2}:00"
            });
        }

        // Populate with schedule data
        foreach (var schedule in schedules)
        {
            var scheduleStart = ParseTime(schedule.StartTime);
            var scheduleEnd = ParseTime(schedule.EndTime);
            
            // Find the slot where the class STARTS (not all overlapping slots)
            for (int hour = 7; hour < 18; hour++)
            {
                var slotStart = new TimeSpan(hour, 0, 0);
                var slotEnd = new TimeSpan(hour + 1, 0, 0);
                
                // Only mark the slot where the class starts
                if (scheduleStart >= slotStart && scheduleStart < slotEnd)
                {
                    var slot = timeSlots[hour - 7]; // Array index (7-17 -> 0-10)
                    var daySlot = GetDayProperty(slot, schedule.DayOfWeek);
                    
                    // Only set if not already occupied (to avoid overwriting)
                    if (!daySlot.IsOccupied)
                    {
                        daySlot.IsOccupied = true;
                        daySlot.Subject = schedule.Subject?.SubjectName ?? "N/A";
                        daySlot.Grade = schedule.Section?.Name ?? "N/A";
                        daySlot.Room = FormatRoomLocation(schedule.Room?.RoomNumber, schedule.Building?.BuildingName);
                        daySlot.TimeRange = FormatTimeRange(schedule.StartTime, schedule.EndTime);
                        
                        // Populate full data for modal
                        daySlot.FullSubject = schedule.Subject?.SubjectName ?? "N/A";
                        daySlot.FullSection = schedule.Section?.Name ?? "N/A";
                        daySlot.FullRoom = schedule.Room?.RoomNumber ?? "N/A";
                        daySlot.FullBuilding = schedule.Building?.BuildingName ?? "N/A";
                        daySlot.DayOfWeek = schedule.DayOfWeek;
                        daySlot.TeacherName = $"{schedule.Teacher?.FirstName} {schedule.Teacher?.LastName}".Trim();
                    }
                    break; // Found the starting slot, no need to continue
                }
            }
        }

        TimeSlots = timeSlots;
    }

    private void TransformSchedulesToUpcomingClasses(List<ScheduleDto> schedules)
    {
        var now = DateTime.Now;
        var currentDayOfWeek = (int)now.DayOfWeek; // 0=Sunday, 6=Saturday
        var currentTime = now.TimeOfDay;

        // Assign priority to each schedule based on when it occurs
        var schedulesWithPriority = schedules.Select(s =>
        {
            var scheduleDayOfWeek = GetDayOfWeekNumber(s.DayOfWeek);
            var scheduleTime = ParseTime(s.StartTime);

            // Calculate days until this schedule
            int daysUntil = scheduleDayOfWeek - currentDayOfWeek;
            if (daysUntil < 0) daysUntil += 7; // Next week

            // If same day, check if time has passed
            if (daysUntil == 0 && scheduleTime <= currentTime)
                daysUntil = 7; // Next week's occurrence

            return new { Schedule = s, DaysUntil = daysUntil, Time = scheduleTime };
        })
        .OrderBy(x => x.DaysUntil)
        .ThenBy(x => x.Time)
        .Take(5)
        .Select(x => x.Schedule)
        .ToList();

        var upcomingClasses = new ObservableCollection<UpcomingClassViewModel>();

        for (int i = 0; i < schedulesWithPriority.Count; i++)
        {
            var schedule = schedulesWithPriority[i];
            var infoBrush = ResolveBrush("InfoBrush", Brushes.Transparent);
            var successBrush = ResolveBrush("SuccessBrush", Brushes.Transparent);
            var color = i % 2 == 0 ? infoBrush : successBrush;

            upcomingClasses.Add(new UpcomingClassViewModel
            {
                Subject = schedule.Subject?.SubjectName ?? "N/A",
                Grade = schedule.Section?.Name ?? "N/A",
                Time = FormatTimeRange12Hour(schedule.StartTime, schedule.EndTime),
                Room = FormatRoomLocation(schedule.Room?.RoomNumber, schedule.Building?.BuildingName),
                SubjectColor = color
            });
        }

        UpcomingClasses = upcomingClasses;
    }

    private bool IsUpcoming(string startTime)
    {
        var now = DateTime.Now;
        var scheduleTime = ParseTime(startTime);
        var scheduleDateTime = new DateTime(now.Year, now.Month, now.Day, scheduleTime.Hours, scheduleTime.Minutes, 0);
        return scheduleDateTime > now;
    }

    private string FormatRoomLocation(string? roomNumber, string? buildingName)
    {
        var hasRoom = !string.IsNullOrEmpty(roomNumber);
        var hasBuilding = !string.IsNullOrEmpty(buildingName);
        
        if (hasRoom && hasBuilding)
            return $"Room {roomNumber}, {buildingName}";
        
        if (hasRoom)
            return $"Room {roomNumber}";
        
        if (hasBuilding)
            return buildingName ?? "N/A";
        
        return "N/A";
    }

    private void CalculateKpiValues(List<ScheduleDto> schedules)
    {
        WeeklyClassesCount = schedules.Count;
        
        WeeklyHours = (int)schedules.Sum(s => CalculateDuration(s.StartTime, s.EndTime));
        
        var totalSlots = TimeSlots.Count * 7; // 7 days per time slot
        var occupiedSlots = TimeSlots.Sum(ts => 
            (ts.Monday.IsOccupied ? 1 : 0) + 
            (ts.Tuesday.IsOccupied ? 1 : 0) + 
            (ts.Wednesday.IsOccupied ? 1 : 0) + 
            (ts.Thursday.IsOccupied ? 1 : 0) + 
            (ts.Friday.IsOccupied ? 1 : 0) + 
            (ts.Saturday.IsOccupied ? 1 : 0) + 
            (ts.Sunday.IsOccupied ? 1 : 0)
        );
        FreePeriodsCount = totalSlots - occupiedSlots;
    }

    private void DetectConflicts(List<ScheduleDto> schedules)
    {
        var conflicts = new ObservableCollection<ScheduleConflictViewModel>();
        
        // Group by day of week
        var schedulesByDay = schedules.GroupBy(s => s.DayOfWeek);
        
        foreach (var dayGroup in schedulesByDay)
        {
            var daySchedules = dayGroup.ToList();
            
            // Check for overlaps
            for (int i = 0; i < daySchedules.Count; i++)
            {
                for (int j = i + 1; j < daySchedules.Count; j++)
                {
                    var schedule1 = daySchedules[i];
                    var schedule2 = daySchedules[j];
                    
                    if (TimesOverlap(schedule1.StartTime, schedule1.EndTime, schedule2.StartTime, schedule2.EndTime))
                    {
                        conflicts.Add(new ScheduleConflictViewModel
                        {
                            ConflictDescription = $"Double booking: {schedule1.Subject?.SubjectName ?? "N/A"} and {schedule2.Subject?.SubjectName ?? "N/A"}",
                            Time = $"{dayGroup.Key} {FormatTimeRange(schedule1.StartTime, schedule1.EndTime)}"
                        });
                    }
                }
            }
        }
        
        Conflicts = conflicts;
        ConflictsCount = conflicts.Count;
        HasConflicts = conflicts.Count > 0;
    }

    private bool TimesOverlap(string start1, string end1, string start2, string end2)
    {
        var start1Time = ParseTime(start1);
        var end1Time = ParseTime(end1);
        var start2Time = ParseTime(start2);
        var end2Time = ParseTime(end2);
        
        return start1Time < end2Time && start2Time < end1Time;
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

        var infoBrush = ResolveBrush("InfoBrush", Brushes.Transparent);
        var successBrush = ResolveBrush("SuccessBrush", Brushes.Transparent);

        UpcomingClasses = new ObservableCollection<UpcomingClassViewModel>
        {
            new() { Subject = "Mathematics", Grade = "Grade 8A", Time = "8:00 AM - 9:30 AM", Room = "Room 101", SubjectColor = infoBrush },
            new() { Subject = "Science", Grade = "Grade 8B", Time = "10:00 AM - 11:30 AM", Room = "Room 205", SubjectColor = successBrush }
        };

        Conflicts = new ObservableCollection<ScheduleConflictViewModel>
        {
            new() { ConflictDescription = "Double booking in Room 101", Time = "Monday 10:00 AM" },
            new() { ConflictDescription = "Back-to-back classes", Time = "Tuesday 2:00 PM" }
        };

        HasConflicts = Conflicts.Count > 0;
    }

    // Commands
    [RelayCommand]
    private async Task RefreshSchedule()
    {
        Debug.WriteLine("RefreshSchedule command triggered");
        await LoadSchedulesAsync();
    }

    [RelayCommand]
    private async Task ShowScheduleDetails(ScheduleSlotViewModel? slot)
    {
        if (slot == null || !slot.IsOccupied || _dialogService == null) return;
        
        Debug.WriteLine($"Showing details for: {slot.FullSubject}");
        
        var details = new Dictionary<string, string>
        {
            { "Subject", slot.FullSubject },
            { "Section", slot.FullSection },
            { "Day", slot.DayOfWeek },
            { "Time", slot.TimeRange },
            { "Room", slot.FullRoom },
            { "Building", slot.FullBuilding },
            { "Teacher", slot.TeacherName }
        };
        
        await _dialogService.ShowInfoAsync("Class Details", details);
    }

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
    [ObservableProperty] private string _timeRange = string.Empty;
    
    // Full data for modal display
    [ObservableProperty] private string _fullSubject = string.Empty;
    [ObservableProperty] private string _fullSection = string.Empty;
    [ObservableProperty] private string _fullRoom = string.Empty;
    [ObservableProperty] private string _fullBuilding = string.Empty;
    [ObservableProperty] private string _dayOfWeek = string.Empty;
    [ObservableProperty] private string _teacherName = string.Empty;
}

public partial class UpcomingClassViewModel : ViewModelBase
{
    [ObservableProperty] private string _subject = string.Empty;
    [ObservableProperty] private string _grade = string.Empty;
    [ObservableProperty] private string _time = string.Empty;
    [ObservableProperty] private string _room = string.Empty;
    [ObservableProperty] private IBrush _subjectColor = Brushes.Transparent; // Themed brush
}

public partial class ScheduleConflictViewModel : ViewModelBase
{
    [ObservableProperty] private string _conflictDescription = string.Empty;
    [ObservableProperty] private string _time = string.Empty;

    [RelayCommand] private void Resolve() { }
}
