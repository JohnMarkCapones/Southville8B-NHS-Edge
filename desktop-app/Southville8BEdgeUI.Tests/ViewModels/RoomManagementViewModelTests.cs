using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class RoomManagementViewModelTests
{
    private RoomManagementViewModel CreateVm() => new();

    [Fact]
    public void Constructor_SeedsRooms_And_ComputesStatistics()
    {
        var vm = CreateVm();
        Assert.Equal(10, vm.Rooms.Count);
        Assert.Equal(vm.Rooms.Count, vm.FilteredRooms.Count);
        Assert.True(vm.HasFilteredRooms);
        Assert.Equal(vm.Rooms.Count(r => r.Status == "Available"), vm.AvailableRooms);
        Assert.Equal(vm.Rooms.Count(r => r.Status == "Occupied"), vm.OccupiedRooms);
        Assert.Equal(vm.Rooms.Count(r => r.Status == "Maintenance"), vm.MaintenanceRooms);
        var expectedUtil = vm.Rooms.Count(r => r.Status == "Occupied") * 100.0 / vm.Rooms.Count;
        Assert.Equal(Math.Round(expectedUtil,2), Math.Round(vm.UtilizationPercentage,2));
    }

    [Fact]
    public void SearchText_Filters_By_Name_Type_Or_Id()
    {
        var vm = CreateVm();
        vm.SearchText = "Lab"; // should match Science Lab A, Computer Lab 1, Physics Lab
        Assert.All(vm.FilteredRooms, r => Assert.Contains("Lab", r.Name, StringComparison.OrdinalIgnoreCase));
        Assert.True(vm.HasFilteredRooms);
        vm.SearchText = "ZZZ_NOT_FOUND";
        Assert.Empty(vm.FilteredRooms);
        Assert.False(vm.HasFilteredRooms);
    }

    [Fact]
    public void Floor_Status_Type_Filters_Combine()
    {
        var vm = CreateVm();
        vm.SelectedFloor = "Floor 2"; // restrict floor
        Assert.All(vm.FilteredRooms, r => Assert.Equal(2, r.Floor));
        vm.SelectedStatus = "Available";
        Assert.All(vm.FilteredRooms, r =>
        {
            Assert.Equal(2, r.Floor);
            Assert.Equal("Available", r.Status);
        });
        vm.SelectedType = "Classroom";
        Assert.All(vm.FilteredRooms, r =>
        {
            Assert.Equal(2, r.Floor);
            Assert.Equal("Available", r.Status);
            Assert.Equal("Classroom", r.Type);
        });
    }

    [Fact]
    public void ClearingFilters_RestoresAll()
    {
        var vm = CreateVm();
        vm.SearchText = "Lab";
        Assert.NotEqual(vm.Rooms.Count, vm.FilteredRooms.Count);
        vm.SearchText = string.Empty;
        vm.SelectedFloor = "All Floors";
        vm.SelectedStatus = "All Status";
        vm.SelectedType = "All Types";
        // Trigger re-filter
        vm.SearchText = "";
        Assert.Equal(vm.Rooms.Count, vm.FilteredRooms.Count);
    }

    [Fact]
    public void ViewCalendarCommand_Navigates_To_RoomCalendarViewModel()
    {
        var vm = CreateVm();
        object? nav = null;
        vm.NavigateTo = child => nav = child;
        vm.ViewCalendarCommand.Execute(null);
        Assert.NotNull(nav);
        Assert.Contains("RoomCalendarViewModel", nav!.GetType().Name);
    }

    [Fact]
    public void BookRoomCommand_Navigates_To_BookRoomViewModel_WithSameRoomsReference()
    {
        var vm = CreateVm();
        object? nav = null;
        vm.NavigateTo = child => nav = child;
        vm.BookRoomCommand.Execute(null);
        Assert.NotNull(nav);
        Assert.Contains("BookRoomViewModel", nav!.GetType().Name);
        var roomsProp = nav.GetType().GetProperty("Rooms")!.GetValue(nav);
        Assert.Same(vm.Rooms, roomsProp);
    }

    [Fact]
    public void RoomAction_Ignores_Maintenance_Room()
    {
        var vm = CreateVm();
        var maintenance = vm.Rooms.First(r => r.Status == "Maintenance");
        var beforeStatus = maintenance.Status;
        var beforeCounts = (vm.AvailableRooms, vm.OccupiedRooms, vm.MaintenanceRooms);
        vm.RoomActionCommand.Execute(maintenance);
        Assert.Equal(beforeStatus, maintenance.Status);
        Assert.Equal(beforeCounts.AvailableRooms, vm.AvailableRooms);
        Assert.Equal(beforeCounts.OccupiedRooms, vm.OccupiedRooms);
        Assert.Equal(beforeCounts.MaintenanceRooms, vm.MaintenanceRooms);
    }

    [Fact]
    public void RoomAction_Toggles_Available_To_Occupied_And_UpdatesStatistics()
    {
        var vm = CreateVm();
        var room = vm.Rooms.First(r => r.Status == "Available");
        int beforeAvail = vm.AvailableRooms;
        int beforeOcc = vm.OccupiedRooms;
        vm.RoomActionCommand.Execute(room);
        Assert.Equal("Occupied", room.Status);
        Assert.Equal("New Booking", room.CurrentBooking);
        Assert.Equal(beforeAvail - 1, vm.AvailableRooms);
        Assert.Equal(beforeOcc + 1, vm.OccupiedRooms);
    }

    [Fact]
    public void RoomAction_Toggles_Occupied_To_Available_And_UpdatesStatistics()
    {
        var vm = CreateVm();
        var room = vm.Rooms.First(r => r.Status == "Occupied");
        int beforeAvail = vm.AvailableRooms;
        int beforeOcc = vm.OccupiedRooms;
        vm.RoomActionCommand.Execute(room);
        Assert.Equal("Available", room.Status);
        Assert.Equal("None", room.CurrentBooking);
        Assert.Equal(beforeAvail + 1, vm.AvailableRooms);
        Assert.Equal(beforeOcc - 1, vm.OccupiedRooms);
    }

    [Fact]
    public void Statistics_Percentages_Update_After_RoomAction()
    {
        var vm = CreateVm();
        var room = vm.Rooms.First(r => r.Status == "Available");
        double beforeUtil = vm.UtilizationPercentage;
        vm.RoomActionCommand.Execute(room); // becomes occupied
        double afterUtil = vm.UtilizationPercentage;
        Assert.True(afterUtil > beforeUtil);
    }
}
