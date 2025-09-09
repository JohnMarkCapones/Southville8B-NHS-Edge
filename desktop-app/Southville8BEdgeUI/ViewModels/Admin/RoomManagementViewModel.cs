using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class RoomManagementViewModel : ViewModelBase
{
    [ObservableProperty]
    private int _availableRooms = 6;

    [ObservableProperty]
    private int _occupiedRooms = 18;

    [ObservableProperty]
    private int _maintenanceRooms = 2;

    [ObservableProperty]
    private double _utilizationPercentage = 75.0;

    [ObservableProperty]
    private ObservableCollection<RoomViewModel> _rooms;

    [ObservableProperty]
    private ObservableCollection<RoomViewModel> _filteredRooms;

    [ObservableProperty]
    private string _searchText = "";

    [ObservableProperty]
    private string? _selectedFloor;

    [ObservableProperty]
    private string? _selectedStatus;

    [ObservableProperty]
    private string? _selectedType;

    public ObservableCollection<string> FloorOptions { get; } = new() { "All Floors", "Floor 1", "Floor 2", "Floor 3" };
    public ObservableCollection<string> StatusOptions { get; } = new() { "All Status", "Available", "Occupied", "Maintenance" };
    public ObservableCollection<string> TypeOptions { get; } = new() { "All Types", "Classroom", "Laboratory", "Computer Lab", "Auditorium", "Lounge" };

    public double AvailablePercentage => TotalRooms > 0 ? (double)AvailableRooms / TotalRooms * 100 : 0;
    public double OccupiedPercentage => TotalRooms > 0 ? (double)OccupiedRooms / TotalRooms * 100 : 0;
    public double MaintenancePercentage => TotalRooms > 0 ? (double)MaintenanceRooms / TotalRooms * 100 : 0;
    public int TotalRooms => Rooms?.Count ?? 0;
    public bool HasFilteredRooms => FilteredRooms?.Any() == true;

    public RoomManagementViewModel()
    {
        // Sample Data for Demonstration
        Rooms = new ObservableCollection<RoomViewModel>
        {
            new RoomViewModel { Name = "Room 101", Status = "Available", Type = "Classroom", Capacity = 30, Floor = 1, CurrentBooking = "None", RoomId = "R101" },
            new RoomViewModel { Name = "Science Lab A", Status = "Occupied", Type = "Laboratory", Capacity = 24, Floor = 1, CurrentBooking = "G8-Chemistry", RoomId = "SLA1" },
            new RoomViewModel { Name = "Room 102", Status = "Available", Type = "Classroom", Capacity = 30, Floor = 1, CurrentBooking = "None", RoomId = "R102" },
            new RoomViewModel { Name = "Computer Lab 1", Status = "Maintenance", Type = "Computer Lab", Capacity = 25, Floor = 1, CurrentBooking = "PC Upgrades", RoomId = "CL01" },
            new RoomViewModel { Name = "Room 201", Status = "Occupied", Type = "Classroom", Capacity = 35, Floor = 2, CurrentBooking = "G9-Mathematics", RoomId = "R201" },
            new RoomViewModel { Name = "Library Hall", Status = "Occupied", Type = "Auditorium", Capacity = 100, Floor = 2, CurrentBooking = "Guest Speaker Event", RoomId = "LH01" },
            new RoomViewModel { Name = "Room 202", Status = "Available", Type = "Classroom", Capacity = 35, Floor = 2, CurrentBooking = "None", RoomId = "R202" },
            new RoomViewModel { Name = "Faculty Lounge", Status = "Available", Type = "Lounge", Capacity = 15, Floor = 2, CurrentBooking = "None", RoomId = "FL01" },
            new RoomViewModel { Name = "Room 301", Status = "Available", Type = "Classroom", Capacity = 32, Floor = 3, CurrentBooking = "None", RoomId = "R301" },
            new RoomViewModel { Name = "Physics Lab", Status = "Occupied", Type = "Laboratory", Capacity = 20, Floor = 3, CurrentBooking = "G10-Physics", RoomId = "PL01" },
        };

        FilteredRooms = new ObservableCollection<RoomViewModel>(Rooms);
        UpdateStatistics();
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();
    partial void OnSelectedFloorChanged(string? value) => ApplyFilters();
    partial void OnSelectedStatusChanged(string? value) => ApplyFilters();
    partial void OnSelectedTypeChanged(string? value) => ApplyFilters();

    private void ApplyFilters()
    {
        var filtered = Rooms.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(SearchText))
        {
            filtered = filtered.Where(r => r.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         r.Type.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         r.RoomId.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(SelectedFloor) && SelectedFloor != "All Floors")
        {
            var floorNumber = int.Parse(SelectedFloor.Replace("Floor ", ""));
            filtered = filtered.Where(r => r.Floor == floorNumber);
        }

        if (!string.IsNullOrWhiteSpace(SelectedStatus) && SelectedStatus != "All Status")
        {
            filtered = filtered.Where(r => r.Status == SelectedStatus);
        }

        if (!string.IsNullOrWhiteSpace(SelectedType) && SelectedType != "All Types")
        {
            filtered = filtered.Where(r => r.Type == SelectedType);
        }

        FilteredRooms.Clear();
        foreach (var room in filtered)
        {
            FilteredRooms.Add(room);
        }
        OnPropertyChanged(nameof(HasFilteredRooms));
    }

    private void UpdateStatistics()
    {
        AvailableRooms = Rooms.Count(r => r.Status == "Available");
        OccupiedRooms = Rooms.Count(r => r.Status == "Occupied");
        MaintenanceRooms = Rooms.Count(r => r.Status == "Maintenance");
        UtilizationPercentage = TotalRooms > 0 ? (double)OccupiedRooms / TotalRooms * 100 : 0;

        OnPropertyChanged(nameof(AvailablePercentage));
        OnPropertyChanged(nameof(OccupiedPercentage));
        OnPropertyChanged(nameof(MaintenancePercentage));
        OnPropertyChanged(nameof(TotalRooms));
    }

    [RelayCommand]
    private void ViewCalendar()
    {
        // TODO: Navigate to calendar view
    }

    [RelayCommand]
    private void BookRoom()
    {
        // TODO: Open room booking dialog
    }

    [RelayCommand]
    private void ViewRoomDetails(RoomViewModel room)
    {
        // TODO: Show room details dialog
    }

    [RelayCommand]
    private void RoomAction(RoomViewModel room)
    {
        if (room.IsAvailable)
        {
            // Book the room
            room.Status = "Occupied";
            room.CurrentBooking = "New Booking";
        }
        else if (room.IsOccupied)
        {
            // End booking
            room.Status = "Available";
            room.CurrentBooking = "None";
        }

        UpdateStatistics();
        ApplyFilters();
    }
}

public partial class RoomViewModel : ViewModelBase
{
    [ObservableProperty] private string _name = "";
    [ObservableProperty] private string _status = ""; // "Available", "Occupied", "Maintenance"
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private int _capacity;
    [ObservableProperty] private int _floor;
    [ObservableProperty] private string _currentBooking = "";
    [ObservableProperty] private string _roomId = "";

    public bool IsAvailable => Status == "Available";
    public bool IsOccupied => Status == "Occupied";
    public bool IsInMaintenance => Status == "Maintenance";
    public bool CanPerformAction => !IsInMaintenance;

    public string StatusColor => Status switch
    {
        "Available" => "#10B981",
        "Occupied" => "#EF4444",
        "Maintenance" => "#F59E0B",
        _ => "#6B7280"
    };

    public string CurrentBookingColor => IsAvailable ? "#6B7280" : "#111827";

    public string ActionButtonText => Status switch
    {
        "Available" => "Book",
        "Occupied" => "End",
        "Maintenance" => "Unavailable",
        _ => "Action"
    };

    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(IsAvailable));
        OnPropertyChanged(nameof(IsOccupied));
        OnPropertyChanged(nameof(IsInMaintenance));
        OnPropertyChanged(nameof(StatusColor));
        OnPropertyChanged(nameof(ActionButtonText));
        OnPropertyChanged(nameof(CanPerformAction));
    }

    partial void OnCurrentBookingChanged(string value)
    {
        OnPropertyChanged(nameof(CurrentBookingColor));
    }
}