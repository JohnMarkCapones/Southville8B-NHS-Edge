using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class BuildingManagementViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    
    // Navigation callbacks
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; }

    // Stats properties
    [ObservableProperty] private int _totalBuildings;
    [ObservableProperty] private int _totalFloors;
    [ObservableProperty] private int _totalRooms;
    [ObservableProperty] private int _totalCapacity;

    // Collections
    [ObservableProperty] private ObservableCollection<BuildingCardViewModel> _buildings = new();
    [ObservableProperty] private ObservableCollection<BuildingCardViewModel> _filteredBuildings = new();

    // Search and filter
    [ObservableProperty] private string _searchText = string.Empty;
    [ObservableProperty] private bool _isLoading;

    // Dialog states
    [ObservableProperty] private bool _isCreateBuildingDialogOpen;
    [ObservableProperty] private bool _isEditBuildingDialogOpen;
    [ObservableProperty] private bool _isCreateFloorDialogOpen;
    [ObservableProperty] private bool _isCreateRoomDialogOpen;
    [ObservableProperty] private bool _isEditRoomDialogOpen;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;

    // Editing models
    [ObservableProperty] private CreateBuildingDto? _editingBuilding;
    [ObservableProperty] private CreateFloorDto? _editingFloor;
    [ObservableProperty] private CreateRoomDto? _editingRoom;
    [ObservableProperty] private BuildingCardViewModel? _selectedBuildingForFloor;
    [ObservableProperty] private FloorCardViewModel? _selectedFloorForRoom;
    [ObservableProperty] private BuildingCardViewModel? _editingBuildingCard;
    [ObservableProperty] private UpdateBuildingDto? _editingBuildingData;
    [ObservableProperty] private UpdateRoomDto? _editingRoomData;
    [ObservableProperty] private string? _editingRoomId;
    [ObservableProperty] private string? _editingRoomFloorName;

    public bool HasBuildings => FilteredBuildings?.Any() == true;
    public bool HasFilteredRooms => FilteredBuildings?.Any(b => b.Floors?.Any(f => f.Rooms?.Any() == true) == true) == true;
    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);

    public BuildingManagementViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
        _ = LoadBuildingsAsync();
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();

    private void ApplyFilters()
    {
        var filtered = Buildings.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(SearchText))
        {
            filtered = filtered.Where(b => 
                b.BuildingName.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                b.Code.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        }

        FilteredBuildings.Clear();
        foreach (var building in filtered)
            FilteredBuildings.Add(building);

        OnPropertyChanged(nameof(HasBuildings));
        OnPropertyChanged(nameof(HasFilteredRooms));
    }

    private async Task LoadBuildingsAsync()
    {
        try
        {
            IsLoading = true;
            var response = await _apiClient.GetBuildingsAsync(100);
            if (response?.Data != null)
            {
                Buildings.Clear();
                foreach (var building in response.Data)
                {
                    var buildingCard = new BuildingCardViewModel(_apiClient)
                    {
                        NavigateTo = NavigateTo,
                        OnBuildingChanged = () => _ = LoadBuildingsAsync(),
                        OnAddFloorRequested = OpenCreateFloorDialog,
                        OnAddRoomRequested = OpenCreateRoomDialog,
                        OnEditBuildingRequested = OpenEditBuildingDialog,
                        OnEditRoomRequested = OpenEditRoomDialog,
                        OnEditFloorRequested = OpenEditFloorDialog
                    };
                    buildingCard.LoadFromDto(building);
                    Buildings.Add(buildingCard);
                }

                FilteredBuildings.Clear();
                foreach (var building in Buildings)
                    FilteredBuildings.Add(building);

                OnPropertyChanged(nameof(HasBuildings));
                OnPropertyChanged(nameof(HasFilteredRooms));
                UpdateStatistics();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading buildings: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void UpdateStatistics()
    {
        TotalBuildings = Buildings.Count;
        TotalFloors = Buildings.Sum(b => b.TotalFloors);
        TotalRooms = Buildings.Sum(b => b.TotalRooms);
        TotalCapacity = Buildings.Sum(b => b.TotalCapacity);
    }

    [RelayCommand]
    private async Task Refresh()
    {
        await LoadBuildingsAsync();
    }

    [RelayCommand]
    private void OpenCreateBuildingDialog()
    {
        EditingBuilding = new CreateBuildingDto();
        ClearMessages();
        IsCreateBuildingDialogOpen = true;
    }

    [RelayCommand]
    private void OpenCreateFloorDialog(BuildingCardViewModel building)
    {
        SelectedBuildingForFloor = building;
        EditingFloor = new CreateFloorDto
        {
            BuildingId = building.Id,
            Number = (building.Floors?.Count ?? 0) + 1,
            Name = $"Floor {(building.Floors?.Count ?? 0) + 1}"
        };
        ClearMessages();
        IsCreateFloorDialogOpen = true;
    }

    [RelayCommand]
    private void OpenCreateRoomDialog(FloorCardViewModel floor)
    {
        SelectedFloorForRoom = floor;
        EditingRoom = new CreateRoomDto
        {
            FloorId = floor.Id,
            Name = $"Room {floor.Number}{(floor.Rooms?.Count ?? 0) + 1:D2}",
            Status = "Available"
        };
        ClearMessages();
        IsCreateRoomDialogOpen = true;
    }

    [RelayCommand]
    private async Task SaveBuilding()
    {
        if (EditingBuilding == null) return;

        try
        {
            var building = await _apiClient.CreateBuildingAsync(EditingBuilding);
            if (building != null)
            {
                SuccessMessage = $"Building '{EditingBuilding.BuildingName}' created successfully!";
                await LoadBuildingsAsync();
                CloseCreateBuildingDialog();
                
                // Auto-dismiss success message after 3 seconds
                _ = Task.Delay(3000).ContinueWith(_ => SuccessMessage = string.Empty);
            }
            else
            {
                ErrorMessage = "Failed to create building";
            }
        }
        catch (ApiException apiEx)
        {
            ErrorMessage = apiEx.Message;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unexpected error: {ex.Message}";
        }
    }

    [RelayCommand]
    private async Task SaveFloor()
    {
        if (EditingFloor == null) return;
        
        // Manually trigger binding update to get current TextBox values
        OnPropertyChanged(nameof(EditingFloor));
        
        // Validate that Number has a value
        if (!EditingFloor.Number.HasValue || EditingFloor.Number.Value <= 0)
        {
            ErrorMessage = "Please enter a valid floor number";
            return;
        }

        try
        {
            var floor = await _apiClient.CreateFloorAsync(EditingFloor);
            if (floor != null)
            {
                SuccessMessage = $"Floor '{EditingFloor.Name}' created successfully!";
                await LoadBuildingsAsync();
                CloseCreateFloorDialog();
                
                // Auto-dismiss success message after 3 seconds
                _ = Task.Delay(3000).ContinueWith(_ => SuccessMessage = string.Empty);
            }
            else
            {
                ErrorMessage = "Failed to create floor";
            }
        }
        catch (ApiException apiEx)
        {
            ErrorMessage = apiEx.Message;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unexpected error: {ex.Message}";
        }
    }

    [RelayCommand]
    private async Task SaveRoom()
    {
        if (EditingRoom == null) return;
        
        // Manually trigger binding update to get current TextBox values
        OnPropertyChanged(nameof(EditingRoom));
        
        // Validate that Capacity has a value if provided
        if (EditingRoom.Capacity.HasValue && EditingRoom.Capacity.Value <= 0)
        {
            ErrorMessage = "Please enter a valid room capacity (greater than 0)";
            return;
        }

        try
        {
            var room = await _apiClient.CreateRoomAsync(EditingRoom);
            if (room != null)
            {
                SuccessMessage = $"Room '{EditingRoom.Name}' created successfully!";
                await LoadBuildingsAsync();
                CloseCreateRoomDialog();
                
                // Auto-dismiss success message after 3 seconds
                _ = Task.Delay(3000).ContinueWith(_ => SuccessMessage = string.Empty);
            }
            else
            {
                ErrorMessage = "Failed to create room";
            }
        }
        catch (ApiException apiEx)
        {
            ErrorMessage = apiEx.Message;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unexpected error: {ex.Message}";
        }
    }

    [RelayCommand]
    private void CloseCreateBuildingDialog()
    {
        IsCreateBuildingDialogOpen = false;
        EditingBuilding = null;
        ClearMessages();
    }

    [RelayCommand]
    private void CloseCreateFloorDialog()
    {
        IsCreateFloorDialogOpen = false;
        EditingFloor = null;
        SelectedBuildingForFloor = null;
        ClearMessages();
    }

    [RelayCommand]
    private void CloseCreateRoomDialog()
    {
        IsCreateRoomDialogOpen = false;
        EditingRoom = null;
        SelectedFloorForRoom = null;
        ClearMessages();
    }

    [RelayCommand]
    private void OpenEditRoomDialog(RoomCardViewModel room)
    {
        EditingRoomId = room.Id;
        EditingRoomFloorName = room.FloorName; // For display context
        EditingRoomData = new UpdateRoomDto
        {
            Name = room.Name,
            Capacity = room.Capacity,
            Status = room.Status
        };
        ClearMessages();
        IsEditRoomDialogOpen = true;
    }

    [RelayCommand]
    private async Task SaveEditedRoom()
    {
        if (EditingRoomData == null || string.IsNullOrEmpty(EditingRoomId))
            return;

        try
        {
            var updatedRoom = await _apiClient.UpdateRoomAsync(EditingRoomId, EditingRoomData);
            if (updatedRoom != null)
            {
                SuccessMessage = $"Room '{EditingRoomData.Name}' updated successfully!";
                await LoadBuildingsAsync();
                CloseEditRoomDialog();
                
                _ = Task.Delay(3000).ContinueWith(_ => SuccessMessage = string.Empty);
            }
        }
        catch (ApiException ex)
        {
            ErrorMessage = ex.Message;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to update room: {ex.Message}";
        }
    }

    [RelayCommand]
    private void CloseEditRoomDialog()
    {
        IsEditRoomDialogOpen = false;
        EditingRoomData = null;
        EditingRoomId = null;
        EditingRoomFloorName = null;
        ClearMessages();
    }

    [RelayCommand]
    private void OpenEditFloorDialog(FloorCardViewModel floor)
    {
        // For now, just show a message - you can implement floor editing later
        SuccessMessage = $"Edit floor functionality for '{floor.Name}' - Coming soon!";
        _ = Task.Delay(3000).ContinueWith(_ => SuccessMessage = string.Empty);
    }

    [RelayCommand]
    private void OpenEditBuildingDialog(BuildingCardViewModel building)
    {
        EditingBuildingCard = building;
        EditingBuildingData = new UpdateBuildingDto
        {
            BuildingName = building.BuildingName,
            Code = building.Code,
            Capacity = building.Capacity
        };
        ClearMessages();
        IsEditBuildingDialogOpen = true;
    }

    [RelayCommand]
    private async Task SaveEditedBuilding()
    {
        if (EditingBuildingData == null || EditingBuildingCard == null) return;
        
        try
        {
            var updated = await _apiClient.UpdateBuildingAsync(EditingBuildingCard.Id, EditingBuildingData);
            if (updated != null)
            {
                SuccessMessage = $"Building '{EditingBuildingData.BuildingName}' updated successfully!";
                await LoadBuildingsAsync();
                CloseEditBuildingDialog();
                
                _ = Task.Delay(3000).ContinueWith(_ => SuccessMessage = string.Empty);
            }
        }
        catch (ApiException apiEx)
        {
            ErrorMessage = apiEx.Message;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Unexpected error: {ex.Message}";
        }
    }

    [RelayCommand]
    private void CloseEditBuildingDialog()
    {
        IsEditBuildingDialogOpen = false;
        EditingBuildingCard = null;
        EditingBuildingData = null;
    }

    private void ClearMessages()
    {
        ErrorMessage = string.Empty;
        SuccessMessage = string.Empty;
    }

    partial void OnErrorMessageChanged(string value)
    {
        OnPropertyChanged(nameof(HasError));
    }

    partial void OnSuccessMessageChanged(string value)
    {
        OnPropertyChanged(nameof(HasSuccess));
    }
}