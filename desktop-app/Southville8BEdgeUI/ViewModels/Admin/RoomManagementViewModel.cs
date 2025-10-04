using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using Avalonia;
using Avalonia.Media;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class RoomManagementViewModel : ViewModelBase
{
    // Navigation callbacks (set by shell)
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; }

    [ObservableProperty] private int _availableRooms = 6;
    [ObservableProperty] private int _occupiedRooms = 18;
    [ObservableProperty] private int _maintenanceRooms = 2;
    [ObservableProperty] private double _utilizationPercentage = 75.0;
    [ObservableProperty] private ObservableCollection<RoomViewModel> _rooms = new();
    [ObservableProperty] private ObservableCollection<RoomViewModel> _filteredRooms = new();
    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string? _selectedFloor;
    [ObservableProperty] private string? _selectedStatus;
    [ObservableProperty] private string? _selectedType;

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
        Rooms = new ObservableCollection<RoomViewModel>
        {
            new() { Name = "Room 101", Status = "Available", Type = "Classroom", Capacity = 30, Floor = 1, CurrentBooking = "None", RoomId = "R101" },
            new() { Name = "Science Lab A", Status = "Occupied", Type = "Laboratory", Capacity = 24, Floor = 1, CurrentBooking = "G8-Chemistry", RoomId = "SLA1" },
            new() { Name = "Room 102", Status = "Available", Type = "Classroom", Capacity = 30, Floor = 1, CurrentBooking = "None", RoomId = "R102" },
            new() { Name = "Computer Lab 1", Status = "Maintenance", Type = "Computer Lab", Capacity = 25, Floor = 1, CurrentBooking = "PC Upgrades", RoomId = "CL01" },
            new() { Name = "Room 201", Status = "Occupied", Type = "Classroom", Capacity = 35, Floor = 2, CurrentBooking = "G9-Mathematics", RoomId = "R201" },
            new() { Name = "Library Hall", Status = "Occupied", Type = "Auditorium", Capacity = 100, Floor = 2, CurrentBooking = "Guest Speaker Event", RoomId = "LH01" },
            new() { Name = "Room 202", Status = "Available", Type = "Classroom", Capacity = 35, Floor = 2, CurrentBooking = "None", RoomId = "R202" },
            new() { Name = "Faculty Lounge", Status = "Available", Type = "Lounge", Capacity = 15, Floor = 2, CurrentBooking = "None", RoomId = "FL01" },
            new() { Name = "Room 301", Status = "Available", Type = "Classroom", Capacity = 32, Floor = 3, CurrentBooking = "None", RoomId = "R301" },
            new() { Name = "Physics Lab", Status = "Occupied", Type = "Laboratory", Capacity = 20, Floor = 3, CurrentBooking = "G10-Physics", RoomId = "PL01" },
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
            filtered = filtered.Where(r => r.Status == SelectedStatus);

        if (!string.IsNullOrWhiteSpace(SelectedType) && SelectedType != "All Types")
            filtered = filtered.Where(r => r.Type == SelectedType);

        FilteredRooms.Clear();
        foreach (var room in filtered)
            FilteredRooms.Add(room);

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
        if (NavigateTo is null) return;
        var vm = new RoomCalendarViewModel { NavigateBack = () => NavigateTo?.Invoke(this) };
        NavigateTo?.Invoke(vm);
    }

    [RelayCommand]
    private void BookRoom()
    {
        if (NavigateTo is null) return;
        var vm = new BookRoomViewModel(Rooms) { NavigateBack = () => NavigateTo?.Invoke(this) };
        NavigateTo?.Invoke(vm);
    }

    [RelayCommand] private void ViewRoomDetails(RoomViewModel room) { }

    [RelayCommand]
    private void RoomAction(RoomViewModel room)
    {
        // Do not allow state changes if room is under maintenance
        if (room.IsInMaintenance)
            return;

        if (room.IsAvailable)
        {
            room.Status = "Occupied";
            room.CurrentBooking = "New Booking";
        }
        else if (room.IsOccupied)
        {
            room.Status = "Available";
            room.CurrentBooking = "None";
        }
        UpdateStatistics();
        ApplyFilters();
    }
}

public class RoomBookingEntry
{
    public DateTime Date { get; set; }
    public string Slot { get; set; } = string.Empty; // e.g. "08:00 - 09:00"
    public string Purpose { get; set; } = string.Empty;
}

public partial class RoomViewModel : ViewModelBase
{
    [ObservableProperty] private string _name = "";
    [ObservableProperty] private string _status = ""; // Available, Occupied, Maintenance
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private int _capacity;
    [ObservableProperty] private int _floor;
    [ObservableProperty] private string _currentBooking = "";
    [ObservableProperty] private string _roomId = "";

    // Track individual bookings for conflict detection
    public ObservableCollection<RoomBookingEntry> Bookings { get; } = new();

    public bool HasConflict(DateTime date, string slot)
        => Bookings.Any(b => b.Date.Date == date.Date && string.Equals(b.Slot, slot, StringComparison.OrdinalIgnoreCase));

    public bool IsAvailable => Status == "Available";
    public bool IsOccupied => Status == "Occupied";
    public bool IsInMaintenance => Status == "Maintenance";
    public bool CanPerformAction => !IsInMaintenance;

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush StatusBrush => Status switch
    {
        "Available" => Resolve("SuccessBrush", "TextSecondaryBrush"),
        "Occupied" => Resolve("DangerBrush", "TextSecondaryBrush"),
        "Maintenance" => Resolve("WarningBrush", "TextSecondaryBrush"),
        _ => Resolve("TextSecondaryBrush", "TextMutedBrush")
    };

    public IBrush CurrentBookingBrush => IsAvailable
        ? Resolve("TextMutedBrush", "TextSecondaryBrush")
        : Resolve("TextPrimaryBrush", "TextPrimaryBrush");

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
        OnPropertyChanged(nameof(StatusBrush));
        OnPropertyChanged(nameof(ActionButtonText));
        OnPropertyChanged(nameof(CanPerformAction));
        OnPropertyChanged(nameof(CurrentBookingBrush));
    }

    partial void OnCurrentBookingChanged(string value) => OnPropertyChanged(nameof(CurrentBookingBrush));
}