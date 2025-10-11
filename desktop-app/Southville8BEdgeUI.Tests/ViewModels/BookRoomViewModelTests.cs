using System;
using System.Collections.ObjectModel;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class BookRoomViewModelTests
{
    private (BookRoomViewModel vm, RoomViewModel roomAvailable, RoomViewModel roomMaintenance) CreateVm()
    {
        var rooms = new ObservableCollection<RoomViewModel>
        {
            new() { Name = "Room 101", Status = "Available", Type = "Classroom", Capacity = 30, Floor = 1, CurrentBooking = "None", RoomId = "R101" },
            new() { Name = "Room 102", Status = "Maintenance", Type = "Classroom", Capacity = 30, Floor = 1, CurrentBooking = "None", RoomId = "R102" }
        };
        var vm = new BookRoomViewModel(rooms);
        return (vm, rooms[0], rooms[1]);
    }

    [Fact]
    public void Constructor_Populates_TimeSlots()
    {
        var (vm, _, _) = CreateVm();
        Assert.Equal(10, vm.TimeSlots.Count); // 08-09 through 17-18
        Assert.Equal("08:00 - 09:00", vm.TimeSlots.First());
        Assert.Equal("17:00 - 18:00", vm.TimeSlots.Last());
    }

    [Fact]
    public void CanBook_False_WhenMissingFields()
    {
        var (vm, room, _) = CreateVm();
        vm.SelectedRoom = room; // missing slot & purpose
        Assert.False(vm.CanBook);
        vm.SelectedSlot = vm.TimeSlots.First(); // still missing purpose
        Assert.False(vm.CanBook);
        vm.Purpose = ""; // explicit empty
        Assert.False(vm.CanBook);
    }

    [Fact]
    public void CanBook_True_WhenAllFieldsProvided_ForToday()
    {
        var (vm, room, _) = CreateVm();
        vm.SelectedRoom = room;
        vm.SelectedSlot = vm.TimeSlots.First();
        vm.Purpose = "Review Session";
        Assert.True(vm.CanBook);
    }

    [Fact]
    public void Book_Fails_ForPastDate()
    {
        var (vm, room, _) = CreateVm();
        vm.SelectedRoom = room;
        vm.SelectedSlot = vm.TimeSlots.First();
        vm.Purpose = "Past Meeting";
        vm.SelectedDate = DateTime.Today.AddDays(-1);
        vm.BookCommand.Execute(null);
        Assert.Contains("past date", vm.StatusMessage, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(room.Bookings);
    }

    [Fact]
    public void Book_Succeeds_UpdatesRoomAndAddsBooking()
    {
        var (vm, room, _) = CreateVm();
        vm.SelectedRoom = room;
        vm.SelectedSlot = vm.TimeSlots.First();
        vm.Purpose = "Math Review";
        vm.BookCommand.Execute(null);
        Assert.Single(room.Bookings);
        var booking = room.Bookings.First();
        Assert.Equal(vm.SelectedDate.Date, booking.Date);
        Assert.Equal(vm.SelectedSlot, booking.Slot);
        Assert.Equal("Math Review", booking.Purpose);
        Assert.Equal("Occupied", room.Status);
        Assert.Contains("Math Review", room.CurrentBooking);
        Assert.Equal("Room booked successfully.", vm.StatusMessage);
    }

    [Fact]
    public void Book_Fails_OnConflict()
    {
        var (vm, room, _) = CreateVm();
        // First booking
        vm.SelectedRoom = room;
        vm.SelectedSlot = vm.TimeSlots.First();
        vm.Purpose = "Session 1";
        vm.BookCommand.Execute(null);
        Assert.Single(room.Bookings);

        // Attempt same slot again
        vm.SelectedSlot = vm.TimeSlots.First();
        vm.Purpose = "Session 2";
        vm.BookCommand.Execute(null);
        Assert.Single(room.Bookings); // still one booking expected
        Assert.Equal("Time slot already booked for this room.", vm.StatusMessage);
    }

    [Fact]
    public void Book_Fails_When_Room_Not_Available_Or_Occupied()
    {
        var (vm, _, maintenance) = CreateVm();
        vm.SelectedRoom = maintenance; // Maintenance -> neither Available nor Occupied
        vm.SelectedSlot = vm.TimeSlots.First();
        vm.Purpose = "Maintenance Test";
        vm.BookCommand.Execute(null);
        Assert.Contains("not available", vm.StatusMessage, StringComparison.OrdinalIgnoreCase);
        Assert.Empty(maintenance.Bookings);
    }

    [Fact]
    public void Back_InvokesNavigateBack()
    {
        var (vm, _, _) = CreateVm();
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        vm.BackCommand.Execute(null);
        Assert.True(navigated);
    }
}
