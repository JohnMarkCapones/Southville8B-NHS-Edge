using System;
using System.Globalization;
using Avalonia.Media;
using CommunityToolkit.Mvvm.ComponentModel;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ScheduleViewModel : ViewModelBase
{
    public ScheduleDto Schedule { get; set; }

    public ScheduleViewModel(ScheduleDto schedule)
    {
        Schedule = schedule;
    }

    // UI properties
    public string SubjectName => Schedule.Subject?.SubjectName ?? "Unknown";
    public string TeacherName => Schedule.Teacher != null ? $"{Schedule.Teacher.FirstName} {Schedule.Teacher.LastName}" : "Unknown";
    public string SectionName => Schedule.Section?.Name ?? "Unknown";
    public string RoomNumber => Schedule.Room?.RoomNumber ?? "N/A";
    public string BuildingName => Schedule.Building?.BuildingName ?? "N/A";
    public string TimeRange => $"{FormatTime(Schedule.StartTime)} - {FormatTime(Schedule.EndTime)}";
    public string DisplayDay => Schedule.DayOfWeek;
    public IBrush? SubjectColor => Schedule.Subject?.ColorHex != null ? new SolidColorBrush(Color.Parse(Schedule.Subject.ColorHex)) : null;
    
    [ObservableProperty] private bool _hasConflict;
    [ObservableProperty] private string? _conflictMessage;
    
    private string FormatTime(string time)
    {
        if (TimeSpan.TryParse(time, out var ts))
        {
            var dateTime = DateTime.Today.Add(ts);
            return dateTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
        }
        return time;
    }

    // Helper methods for UI
    public string GetConflictIcon()
    {
        return HasConflict ? "⚠️" : "✅";
    }

    public string GetConflictTooltip()
    {
        return HasConflict ? ConflictMessage ?? "Schedule conflict detected" : "No conflicts";
    }

    public void UpdateConflictStatus(bool hasConflict, string? message = null)
    {
        HasConflict = hasConflict;
        ConflictMessage = message;
        OnPropertyChanged(nameof(GetConflictIcon));
        OnPropertyChanged(nameof(GetConflictTooltip));
    }
}
