using System;
using System.Linq;
using System.Reflection;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class EventDashboardViewModelTests
{
    private EventDashboardViewModel CreateVm() => new();

    [Fact]
    public void Constructor_PopulatesEvents_AndStatistics()
    {
        var vm = CreateVm();
        Assert.Equal(8, vm.Events.Count); // seeded
        Assert.Equal(vm.Events.Count, vm.FilteredEvents.Count);
        Assert.Equal(8, vm.TotalEvents);
        Assert.Equal(5, vm.UpcomingEvents); // number of "Upcoming" in seed
        Assert.Equal(2, vm.PastEvents);     // number of "Completed" in seed
        Assert.InRange(vm.ThisWeekEvents, 1, vm.TotalEvents); // at least the ongoing one today
        Assert.True(vm.HasFilteredEvents);
    }

    [Fact]
    public void Search_Filter_ReducesResults()
    {
        var vm = CreateVm();
        vm.SearchText = "Science"; // triggers ApplyFilters via partial
        Assert.All(vm.FilteredEvents, e => Assert.Contains("Science", e.Title, StringComparison.OrdinalIgnoreCase));
        vm.SearchText = "NonExistingTerm";
        Assert.Empty(vm.FilteredEvents);
        Assert.False(vm.HasFilteredEvents);
    }

    [Fact]
    public void Status_Type_Location_Filters_Combine()
    {
        var vm = CreateVm();
        vm.SelectedStatus = "Upcoming";
        Assert.All(vm.FilteredEvents, e => Assert.Equal("Upcoming", e.Status));

        vm.SelectedType = "Competition";
        Assert.All(vm.FilteredEvents, e => Assert.Equal("Competition", e.Type));

        vm.SelectedLocation = "Gymnasium";
        Assert.All(vm.FilteredEvents, e => Assert.Equal("Gymnasium", e.Location));
    }

    [Fact]
    public void AddEvent_Via_OnSaved_In_CreateEvent_IncreasesCountsAndFilters()
    {
        var vm = CreateVm();
        object? navVm = null;
        vm.NavigateTo = inner => navVm = inner;
        vm.CreateEventCommand.Execute(null);
        Assert.NotNull(navVm);
        Assert.Contains("CreateEventViewModel", navVm!.GetType().Name);

        int beforeTotal = vm.TotalEvents;
        int beforeUpcoming = vm.UpcomingEvents;

        // Simulate save from the create VM
        var newEvent = new EventViewModel
        {
            Title = "New Workshop",
            Status = "Upcoming",
            Type = "Academic",
            StartDate = DateTime.Today.AddDays(1),
            EndDate = DateTime.Today.AddDays(1),
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(11, 0, 0),
            Location = "Online",
            Organizer = "IT",
            MaxAttendees = 40,
            CurrentAttendees = 5
        };

        // Call private AddEvent via reflection (alternative to invoking OnSaved chain directly)
        var addEventMethod = typeof(EventDashboardViewModel).GetMethod("AddEvent", BindingFlags.Instance | BindingFlags.NonPublic);
        addEventMethod!.Invoke(vm, new object[] { newEvent });

        Assert.Equal(beforeTotal + 1, vm.TotalEvents);
        Assert.Equal(beforeUpcoming + 1, vm.UpcomingEvents);
        Assert.Contains(vm.Events, e => e.Title == "New Workshop");
    }

    [Fact]
    public void DeleteEvent_RemovesAndUpdatesStats()
    {
        var vm = CreateVm();
        var target = vm.Events.First(e => e.Status == "Upcoming");
        int beforeTotal = vm.TotalEvents;
        int beforeUpcoming = vm.UpcomingEvents;
        vm.DeleteEventCommand.Execute(target);
        Assert.Equal(beforeTotal - 1, vm.TotalEvents);
        Assert.Equal(beforeUpcoming - 1, vm.UpcomingEvents);
        Assert.DoesNotContain(target, vm.Events);
    }

    [Fact]
    public void Filter_NoMatches_SetsHasFilteredEventsFalse()
    {
        var vm = CreateVm();
        vm.SearchText = "zzzzzz not found";
        Assert.Empty(vm.FilteredEvents);
        Assert.False(vm.HasFilteredEvents);
    }

    // Tests for EventViewModel computed & state changes
    [Fact]
    public void EventViewModel_StatusFlags_And_EditCancelPermissions()
    {
        var ev = new EventViewModel { Status = "Upcoming" };
        Assert.True(ev.IsUpcoming);
        Assert.True(ev.CanEdit);
        Assert.True(ev.CanCancel);
        ev.Status = "Completed";
        Assert.True(ev.IsCompleted);
        Assert.False(ev.CanEdit);
        Assert.False(ev.CanCancel);
        ev.Status = "Cancelled";
        Assert.True(ev.IsCancelled);
        Assert.False(ev.CanEdit);
        Assert.False(ev.CanCancel);
    }

    [Fact]
    public void EventViewModel_DateRange_SingleAndMultiDay()
    {
        var ev = new EventViewModel
        {
            StartDate = new DateTime(2024, 3, 10),
            EndDate = new DateTime(2024, 3, 10)
        };
        Assert.Contains("Mar 10", ev.DateRange);
        Assert.DoesNotContain("-", ev.DateRange);
        ev.EndDate = new DateTime(2024, 3, 12);
        Assert.Contains("-", ev.DateRange);
    }

    [Fact]
    public void EventViewModel_TimeRange_AllDay_And_Ranged()
    {
        var ev = new EventViewModel
        {
            StartTime = TimeSpan.Zero,
            EndTime = TimeSpan.Zero
        };
        Assert.Equal("All Day", ev.TimeRange);
        ev.StartTime = new TimeSpan(9, 0, 0);
        ev.EndTime = new TimeSpan(11, 30, 0);
        Assert.Contains("09:00", ev.TimeRange);
        Assert.Contains("11:30", ev.TimeRange);
    }

    [Fact]
    public void EventViewModel_Attendees_Info_And_Percentage()
    {
        var ev = new EventViewModel { MaxAttendees = 0, CurrentAttendees = 0 };
        Assert.Equal("No limit", ev.AttendeeInfo);
        ev.MaxAttendees = 100;
        ev.CurrentAttendees = 25;
        Assert.Equal("25/100 attendees", ev.AttendeeInfo);
        Assert.Equal(25, Math.Round(ev.AttendancePercentage));
        ev.CurrentAttendees = 50;
        Assert.Equal(50, Math.Round(ev.AttendancePercentage));
    }
}
