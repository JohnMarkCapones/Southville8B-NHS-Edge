using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class RoomCalendarViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }

    [ObservableProperty] private DateTime _displayMonth = new(DateTime.Today.Year, DateTime.Today.Month, 1);
    public ObservableCollection<DayViewModel> Days { get; } = new();

    public string MonthTitle => DisplayMonth.ToString("MMMM yyyy");

    private static readonly string[] SampleSubjects =
    [
        "Section A English", "Section B Math", "G9 Chemistry", "ICT Lab Session", "Faculty Meeting", "Student Council", "Robotics Club"
    ];

    public RoomCalendarViewModel() => BuildMonth();

    partial void OnDisplayMonthChanged(DateTime value)
    {
        BuildMonth();
        OnPropertyChanged(nameof(MonthTitle));
    }

    private void BuildMonth()
    {
        Days.Clear();
        var first = DisplayMonth;
        var start = first.AddDays(-((int)first.DayOfWeek));
        var rand = new Random(first.Year * 100 + first.Month);

        for (int i = 0; i < 42; i++)
        {
            var date = start.AddDays(i);
            bool isCleaning = date.Day % 7 == 0; // demo pattern
            int randomEvents = rand.Next(0, 4); // 0..3 random events besides cleaning

            var dayVm = new DayViewModel(date)
            {
                IsCurrentMonth = date.Month == DisplayMonth.Month,
                IsCleaningDay = isCleaning,
                IsToday = date.Date == DateTime.Today
            };

            if (isCleaning)
            {
                dayVm.Events.Add(new CalendarEventViewModel
                {
                    Title = "General Cleaning",
                    Category = "Maintenance",
                    IsHighlight = true
                });
            }

            for (int e = 0; e < randomEvents; e++)
            {
                var title = SampleSubjects[(date.Day + e + rand.Next(0, SampleSubjects.Length)) % SampleSubjects.Length];
                dayVm.Events.Add(new CalendarEventViewModel
                {
                    Title = title,
                    Category = "Booking",
                    IsHighlight = false
                });
            }

            Days.Add(dayVm);
        }
    }

    [RelayCommand] private void PrevMonth() => DisplayMonth = DisplayMonth.AddMonths(-1);
    [RelayCommand] private void NextMonth() => DisplayMonth = DisplayMonth.AddMonths(1);
    [RelayCommand] private void Today() => DisplayMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
    [RelayCommand] private void Back() => NavigateBack?.Invoke();
}

public partial class DayViewModel : ObservableObject
{
    public const int MaxVisibleEvents = 3;
    public DayViewModel(DateTime date)
    {
        _date = date;
        Events.CollectionChanged += (_, __) => RaiseDerived();
    }

    [ObservableProperty] private DateTime _date;
    [ObservableProperty] private bool _isCurrentMonth;
    [ObservableProperty] private bool _isToday;
    [ObservableProperty] private bool _isCleaningDay;

    public ObservableCollection<CalendarEventViewModel> Events { get; } = new();

    public bool HasEvents => Events.Count > 0;
    public int OverflowCount => Events.Count > MaxVisibleEvents ? Events.Count - MaxVisibleEvents : 0;
    public bool HasOverflow => OverflowCount > 0;
    public System.Collections.Generic.IEnumerable<CalendarEventViewModel> VisibleEvents => Events.Take(MaxVisibleEvents);

    public string DayText => Date.Day.ToString();

    private void RaiseDerived()
    {
        OnPropertyChanged(nameof(HasEvents));
        OnPropertyChanged(nameof(OverflowCount));
        OnPropertyChanged(nameof(HasOverflow));
        OnPropertyChanged(nameof(VisibleEvents));
    }

    partial void OnIsCleaningDayChanged(bool value) => RaiseDerived();
}

public partial class CalendarEventViewModel : ObservableObject
{
    [ObservableProperty] private string _title = string.Empty;
    [ObservableProperty] private string _category = string.Empty; // Booking / Maintenance
    [ObservableProperty] private bool _isHighlight;
}