using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class RoomCalendarViewModelTests
{
    private RoomCalendarViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Builds_42_Days_And_Sets_MonthTitle()
    {
        var vm = CreateVm();
        Assert.Equal(42, vm.Days.Count);
        Assert.Equal(vm.DisplayMonth.ToString("MMMM yyyy"), vm.MonthTitle);
        // At least one day should be today or IsToday flagged false for all if month different
        Assert.Contains(vm.Days, d => d.Date.Date == DateTime.Today.Date);
    }

    [Fact]
    public void Days_Contain_OutsideCurrentMonth_Flags()
    {
        var vm = CreateVm();
        // In a 6x7 grid there should always be some outside-month days (unless extremely rare scenario)
        Assert.Contains(vm.Days, d => d.IsOutsideCurrentMonth);
        Assert.Contains(vm.Days, d => d.IsCurrentMonth);
    }

    [Fact]
    public void CleaningDays_Have_GeneralCleaning_Event_And_IsCleaningDay()
    {
        var vm = CreateVm();
        var cleaningDays = vm.Days.Where(d => d.IsCleaningDay).ToList();
        Assert.NotEmpty(cleaningDays); // pattern ensures some
        foreach (var day in cleaningDays)
        {
            Assert.Contains(day.Events, e => e.Title == "General Cleaning" && e.Category == "Maintenance" && e.IsHighlight);
        }
    }

    [Fact]
    public void DayViewModel_Overflow_Computation_Works()
    {
        var day = new DayViewModel(DateTime.Today) { IsCurrentMonth = true };
        // Add 5 booking events
        for (int i = 0; i < 5; i++)
        {
            day.Events.Add(new CalendarEventViewModel { Title = $"Event {i}", Category = "Booking" });
        }
        Assert.True(day.HasEvents);
        Assert.Equal(5 - DayViewModel.MaxVisibleEvents, day.OverflowCount);
        Assert.True(day.HasOverflow);
        Assert.Equal(DayViewModel.MaxVisibleEvents, day.VisibleEvents.Count());
    }

    [Fact]
    public void NextMonthCommand_Advances_Month_And_RebuildsDays()
    {
        var vm = CreateVm();
        var originalMonth = vm.DisplayMonth;
        vm.NextMonthCommand.Execute(null);
        Assert.Equal(originalMonth.AddMonths(1), vm.DisplayMonth);
        Assert.Equal(42, vm.Days.Count); // rebuilt
        Assert.Equal(vm.DisplayMonth.ToString("MMMM yyyy"), vm.MonthTitle);
    }

    [Fact]
    public void PrevMonthCommand_GoesBack_Month_And_RebuildsDays()
    {
        var vm = CreateVm();
        var originalMonth = vm.DisplayMonth;
        vm.PrevMonthCommand.Execute(null);
        Assert.Equal(originalMonth.AddMonths(-1), vm.DisplayMonth);
        Assert.Equal(42, vm.Days.Count);
    }

    [Fact]
    public void TodayCommand_Sets_CurrentMonth_FirstDay()
    {
        var vm = CreateVm();
        vm.DisplayMonth = vm.DisplayMonth.AddMonths(-3); // move away
        vm.TodayCommand.Execute(null);
        var expected = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        Assert.Equal(expected, vm.DisplayMonth);
    }

    [Fact]
    public void BackCommand_Invokes_NavigateBack()
    {
        var vm = CreateVm();
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        vm.BackCommand.Execute(null);
        Assert.True(navigated);
    }

    [Fact]
    public void DisplayMonth_Property_Change_Triggers_Rebuild()
    {
        var vm = CreateVm();
        var firstHash = string.Join(',', vm.Days.Select(d => d.Date.Day)).GetHashCode();
        vm.DisplayMonth = vm.DisplayMonth.AddMonths(1);
        var secondHash = string.Join(',', vm.Days.Select(d => d.Date.Day)).GetHashCode();
        Assert.NotEqual(firstHash, secondHash); // layout changed
    }
}
