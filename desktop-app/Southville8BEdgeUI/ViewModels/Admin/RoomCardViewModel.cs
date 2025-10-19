using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using Avalonia;
using Avalonia.Media;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class RoomCardViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    
    // Navigation callbacks
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? OnRoomChanged { get; set; }
    public Action<RoomCardViewModel>? OnEditRoomRequested { get; set; }

    [ObservableProperty] private string _id = string.Empty;
    [ObservableProperty] private string _floorId = string.Empty;
    [ObservableProperty] private string? _name;
    [ObservableProperty] private string _roomNumber = string.Empty;
    [ObservableProperty] private int? _capacity;
    [ObservableProperty] private string _status = "Available";
    [ObservableProperty] private int? _displayOrder;
    [ObservableProperty] private int? _floor;
    [ObservableProperty] private string _floorName = string.Empty;

    // Computed property for XAML binding compatibility
    public string RoomId => Id;

    public IBrush StatusBrush => Status switch
    {
        "Available" => Resolve("SuccessBrush", "TextSecondaryBrush"),
        "Occupied" => Resolve("DangerBrush", "TextSecondaryBrush"),
        "Maintenance" => Resolve("WarningBrush", "TextSecondaryBrush"),
        _ => Resolve("TextSecondaryBrush", "TextMutedBrush")
    };

    public IBrush CurrentBookingBrush => CurrentBooking switch
    {
        null => Resolve("TextMutedBrush", "TextSecondaryBrush"),  // No booking - muted
        _ when Status == "Occupied" => Resolve("DangerBrush", "TextSecondaryBrush"),  // Currently occupied - danger
        _ => Resolve("InfoBrush", "TextSecondaryBrush")  // Future booking - info
    };

    public string ActionButtonText => Status switch
    {
        "Available" => "Book Room",
        "Occupied" => "View Details", 
        "Maintenance" => "Request Access",
        _ => "View Details"
    };

    public bool CanPerformAction => Status switch
    {
        "Available" => true,  // Can book when available
        "Occupied" => true,   // Can view details when occupied
        "Maintenance" => true, // Can request access during maintenance
        _ => false  // Disabled for unknown statuses
    };
    
    // Properties for booking functionality
    public bool IsAvailable => Status == "Available";
    public bool IsOccupied => Status == "Occupied";
    public bool IsMaintenance => Status == "Maintenance";
    
    // Mock properties for booking system (these would normally come from a booking service)
    public ObservableCollection<RoomBookingEntry> Bookings { get; } = new();
    public RoomBookingEntry? CurrentBooking => Bookings.FirstOrDefault();

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public RoomCardViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public void LoadFromDto(RoomDto dto)
    {
        Id = dto.Id;
        FloorId = dto.FloorId;
        Name = dto.Name;
        RoomNumber = dto.RoomNumber;
        Capacity = dto.Capacity;
        Status = dto.Status;
        DisplayOrder = dto.DisplayOrder;
        Floor = dto.Floor?.Number;
        FloorName = dto.Floor?.Name ?? $"Floor {dto.Floor?.Number}";
    }

    public void LoadFromRoomInfo(RoomInfo roomInfo)
    {
        Id = roomInfo.Id;
        RoomNumber = roomInfo.RoomNumber;
        Name = roomInfo.Name;
        Capacity = roomInfo.Capacity;
        Status = roomInfo.Status;
    }

    [RelayCommand]
    private void EditRoom()
    {
        OnEditRoomRequested?.Invoke(this);
    }

    [RelayCommand]
    private async Task DeleteRoom()
    {
        try
        {
            var success = await _apiClient.DeleteRoomAsync(Id);
            if (success)
            {
                OnRoomChanged?.Invoke();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting room: {ex.Message}");
        }
    }

    public bool HasConflict(DateTime date, string timeSlot)
    {
        // Simple conflict detection - check if any booking exists for the same date and time slot
        return Bookings.Any(b => b.Date.Date == date.Date && b.TimeSlot == timeSlot);
    }

    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(StatusBrush));
        OnPropertyChanged(nameof(IsAvailable));
        OnPropertyChanged(nameof(IsOccupied));
        OnPropertyChanged(nameof(IsMaintenance));
        OnPropertyChanged(nameof(CurrentBookingBrush));
        OnPropertyChanged(nameof(ActionButtonText));
        OnPropertyChanged(nameof(CanPerformAction));
    }
}

public class RoomBookingEntry
{
    public string Id { get; set; } = string.Empty;
    public string RoomId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string BookedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
