using System;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class CreateEventViewModelTests
{
    private CreateEventViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Defaults_AndOffsets()
    {
        var today = DateTime.Today;
        var vm = CreateVm();
        Assert.Equal(today, vm.StartDate);
        Assert.Equal(today, vm.EndDate);
        Assert.Equal(today, vm.StartDateOffset!.Value.Date); // offsets set
        Assert.Equal(today, vm.EndDateOffset!.Value.Date);
        Assert.False(vm.CanSave); // title empty
        Assert.Null(vm.DateValidationMessage); // default dates valid
    }

    [Fact]
    public void CanSave_True_WhenTitleProvided_AndDatesValid()
    {
        var vm = CreateVm();
        vm.Title = "Planning Meeting";
        Assert.True(vm.CanSave);
        Assert.False(vm.HasDateValidationError);
    }

    [Fact]
    public void Validation_Error_When_StartDate_After_EndDate()
    {
        var vm = CreateVm();
        vm.Title = "Event";
        vm.StartDate = DateTime.Today.AddDays(2);
        vm.EndDate = DateTime.Today.AddDays(1);
        Assert.True(vm.HasDateValidationError);
        Assert.Contains("End date", vm.DateValidationMessage!);
        Assert.False(vm.CanSave);
    }

    [Fact]
    public void Validation_Error_When_EndTime_Before_StartTime_SameDay()
    {
        var vm = CreateVm();
        vm.Title = "Event";
        vm.StartDate = DateTime.Today;
        vm.EndDate = DateTime.Today;
        vm.StartTime = new TimeSpan(14, 0, 0);
        vm.EndTime = new TimeSpan(13, 0, 0);
        Assert.True(vm.HasDateValidationError);
        Assert.Contains("End time", vm.DateValidationMessage!);
        Assert.False(vm.CanSave);
    }

    [Fact]
    public void IsAllDay_Set_ZeroesTimes()
    {
        var vm = CreateVm();
        vm.Title = "All Day";
        vm.StartTime = new TimeSpan(9, 0, 0);
        vm.EndTime = new TimeSpan(10, 0, 0);
        vm.IsAllDay = true; // setter should zero times
        Assert.Equal(TimeSpan.Zero, vm.StartTime);
        Assert.Equal(TimeSpan.Zero, vm.EndTime);
        Assert.True(vm.IsAllDay);
        Assert.True(vm.CanSave);
    }

    [Fact]
    public void StartDateOffset_Update_Synchronizes_StartDate()
    {
        var vm = CreateVm();
        var newDate = DateTimeOffset.Now.Date.AddDays(5);
        vm.StartDateOffset = newDate; // triggers sync
        Assert.Equal(newDate.Date, vm.StartDate);
    }

    [Fact]
    public void EndDateOffset_Update_Synchronizes_EndDate()
    {
        var vm = CreateVm();
        var newDate = DateTimeOffset.Now.Date.AddDays(3);
        vm.EndDateOffset = newDate; // triggers sync
        Assert.Equal(newDate.Date, vm.EndDate);
    }

    [Fact]
    public void SaveCommand_DoesNotInvoke_OnSaved_WhenInvalid()
    {
        var vm = CreateVm();
        bool invoked = false;
        vm.OnSaved = _ => invoked = true;
        // Missing title -> invalid
        vm.SaveCommand.Execute(null);
        Assert.False(invoked);
    }

    [Fact]
    public void SaveCommand_Invokes_OnSaved_WithCorrectData_WhenValid()
    {
        var vm = CreateVm();
        vm.Title = "Budget Meeting";
        vm.Status = "Upcoming";
        vm.Type = "Meeting";
        vm.StartDate = DateTime.Today;
        vm.EndDate = DateTime.Today.AddDays(1);
        vm.StartTime = new TimeSpan(9, 30, 0);
        vm.EndTime = new TimeSpan(11, 0, 0);
        vm.Location = "Main Hall";
        vm.Organizer = "Admin";
        vm.MaxAttendees = 50;
        vm.Description = "Discuss budget allocations";

        EventViewModel? saved = null;
        vm.OnSaved = ev => saved = ev;
        vm.SaveCommand.Execute(null);

        Assert.NotNull(saved);
        Assert.Equal(vm.Title, saved!.Title);
        Assert.Equal(vm.Status, saved.Status);
        Assert.Equal(vm.Type, saved.Type);
        Assert.Equal(vm.StartDate, saved.StartDate);
        Assert.Equal(vm.EndDate, saved.EndDate);
        Assert.Equal(vm.StartTime, saved.StartTime);
        Assert.Equal(vm.EndTime, saved.EndTime);
        Assert.Equal(vm.Location, saved.Location);
        Assert.Equal(vm.Organizer, saved.Organizer);
        Assert.Equal(vm.MaxAttendees, saved.MaxAttendees);
        Assert.Equal(vm.Description, saved.Description);
    }

    [Fact]
    public void CancelCommand_Invokes_NavigateBack()
    {
        var vm = CreateVm();
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        vm.CancelCommand.Execute(null);
        Assert.True(navigated);
    }
}
