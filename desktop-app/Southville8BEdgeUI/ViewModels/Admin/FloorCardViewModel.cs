using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class FloorCardViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    
    // Navigation callbacks
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? OnFloorChanged { get; set; }

    [ObservableProperty] private string _id = string.Empty;
    [ObservableProperty] private string _buildingId = string.Empty;
    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private int _number;
    [ObservableProperty] private bool _isExpanded;
    [ObservableProperty] private bool _isLoading;

    public ObservableCollection<RoomCardViewModel> Rooms { get; } = new();

    public int TotalRooms => Rooms.Count;
    public int TotalCapacity => Rooms.Sum(r => r.Capacity ?? 0);

    public FloorCardViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public void LoadFromDto(FloorDto dto)
    {
        Id = dto.Id;
        BuildingId = dto.BuildingId;
        Name = dto.Name;
        Number = dto.Number;
        
        // Load rooms if provided
        if (dto.Rooms != null)
        {
            Rooms.Clear();
            foreach (var room in dto.Rooms)
            {
                var roomCard = new RoomCardViewModel(_apiClient)
                {
                    NavigateTo = NavigateTo,
                    OnRoomChanged = OnFloorChanged
                };
                roomCard.LoadFromDto(room);
                Rooms.Add(roomCard);
            }
        }
        
        OnPropertyChanged(nameof(TotalRooms));
        OnPropertyChanged(nameof(TotalCapacity));
    }

    public void LoadFromFloorInfo(FloorInfo floorInfo)
    {
        Id = floorInfo.Id;
        Name = floorInfo.Name;
        Number = floorInfo.Number;
    }

    [RelayCommand]
    private void ToggleExpand()
    {
        IsExpanded = !IsExpanded;
        
        if (IsExpanded && Rooms.Count == 0)
        {
            _ = LoadRoomsAsync();
        }
    }

    private async Task LoadRoomsAsync()
    {
        try
        {
            IsLoading = true;
            var response = await _apiClient.GetRoomsAsync(Id, null, null, 100);
            if (response?.Data != null)
            {
                Rooms.Clear();
                foreach (var room in response.Data)
                {
                    var roomCard = new RoomCardViewModel(_apiClient)
                    {
                        NavigateTo = NavigateTo,
                        OnRoomChanged = OnFloorChanged
                    };
                    roomCard.LoadFromDto(room);
                    Rooms.Add(roomCard);
                }
                
                OnPropertyChanged(nameof(TotalRooms));
                OnPropertyChanged(nameof(TotalCapacity));
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading rooms: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void EditFloor()
    {
        // TODO: Navigate to edit floor dialog
        System.Diagnostics.Debug.WriteLine($"Edit floor: {Name}");
    }

    [RelayCommand]
    private async Task DeleteFloor()
    {
        try
        {
            var success = await _apiClient.DeleteFloorAsync(Id);
            if (success)
            {
                OnFloorChanged?.Invoke();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting floor: {ex.Message}");
        }
    }

    [RelayCommand]
    private void AddRoom()
    {
        // TODO: Navigate to add room dialog
        System.Diagnostics.Debug.WriteLine($"Add room to floor: {Name}");
    }
}
