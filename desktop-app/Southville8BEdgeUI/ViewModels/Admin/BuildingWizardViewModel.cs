using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class BuildingWizardViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    
    // Navigation callbacks
    public Action? NavigateBack { get; set; }
    public Action? OnBuildingCreated { get; set; }

    // Step management
    [ObservableProperty] private int _currentStep = 1;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;
    [ObservableProperty] private string _creationProgress = string.Empty;
    [ObservableProperty] private int _creationProgressPercent = 0;

    // Step 1: Building details
    [ObservableProperty] private string _buildingName = string.Empty;
    [ObservableProperty] private string _buildingCode = string.Empty;
    [ObservableProperty] private int? _buildingCapacity;

    // Step 2: Floors
    [ObservableProperty] private ObservableCollection<FloorWizardItem> _floors = new();

    // Step 3: Rooms
    [ObservableProperty] private ObservableCollection<RoomWizardItem> _rooms = new();

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);
    public bool CanGoNext => ValidateCurrentStep();
    public bool CanGoPrevious => CurrentStep > 1;
    public bool CanFinish => CurrentStep == 4 && ValidateCurrentStep();

    public BuildingWizardViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    partial void OnBuildingNameChanged(string value)
    {
        OnPropertyChanged(nameof(CanGoNext));
    }

    partial void OnBuildingCodeChanged(string value)
    {
        OnPropertyChanged(nameof(CanGoNext));
    }

    partial void OnBuildingCapacityChanged(int? value)
    {
        OnPropertyChanged(nameof(CanGoNext));
    }

    [RelayCommand]
    private void Next()
    {
        if (CanGoNext)
        {
            CurrentStep++;
            ClearMessages();
        }
    }

    [RelayCommand]
    private void Previous()
    {
        if (CanGoPrevious)
        {
            CurrentStep--;
            ClearMessages();
        }
    }

    [RelayCommand]
    private async Task Finish()
    {
        if (!CanFinish) return;

        try
        {
            IsLoading = true;
            ClearMessages();
            CreationProgress = "Creating building...";
            CreationProgressPercent = 0;

            // Step 1: Create building
            var buildingDto = new CreateBuildingDto
            {
                BuildingName = BuildingName,
                Code = BuildingCode,
                Capacity = BuildingCapacity
            };

            var building = await _apiClient.CreateBuildingAsync(buildingDto);
            if (building == null)
            {
                ErrorMessage = "Failed to create building";
                return;
            }

            CreationProgressPercent = 33;
            CreationProgress = "Creating floors...";

            // Step 2: Create floors (sequential - each floor needs its ID)
            foreach (var floor in Floors)
            {
                var floorDto = new CreateFloorDto
                {
                    BuildingId = building.Id,
                    Name = floor.Name,
                    Number = floor.Number
                };

                var createdFloor = await _apiClient.CreateFloorAsync(floorDto);
                if (createdFloor != null)
                {
                    floor.Id = createdFloor.Id;
                }
            }

            CreationProgressPercent = 66;
            CreationProgress = "Creating rooms...";

            // Step 3: Create rooms using BULK operation per floor
            foreach (var floor in Floors.Where(f => !string.IsNullOrEmpty(f.Id)))
            {
                var roomsForFloor = Rooms
                    .Where(r => r.FloorId == floor.Id)
                    .Select(r => new CreateRoomDto
                    {
                        FloorId = floor.Id,
                        RoomNumber = r.RoomNumber,
                        Name = r.Name,
                        Capacity = r.Capacity,
                        Status = r.Status,
                        DisplayOrder = r.DisplayOrder
                    })
                    .ToList();

                if (roomsForFloor.Any())
                {
                    await _apiClient.CreateRoomsBulkAsync(floor.Id, roomsForFloor);
                }
            }

            CreationProgressPercent = 100;
            SuccessMessage = $"Building '{BuildingName}' created successfully with {Floors.Count} floors and {Rooms.Count} rooms!";
            OnBuildingCreated?.Invoke();

            await Task.Delay(2000);
            NavigateBack?.Invoke();
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Error creating building: {ex.Message}";
            CreationProgress = string.Empty;
            CreationProgressPercent = 0;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void AddFloor()
    {
        var floorNumber = Floors.Count + 1;
        Floors.Add(new FloorWizardItem
        {
            Name = $"Floor {floorNumber}",
            Number = floorNumber
        });
        OnPropertyChanged(nameof(CanGoNext));
    }

    [RelayCommand]
    private void RemoveFloor(FloorWizardItem floor)
    {
        Floors.Remove(floor);
        
        // Update room floor references
        var roomsToRemove = Rooms.Where(r => r.FloorId == floor.Id).ToList();
        foreach (var room in roomsToRemove)
        {
            Rooms.Remove(room);
        }
        
        OnPropertyChanged(nameof(CanGoNext));
    }

    [RelayCommand]
    private void AddRoom(FloorWizardItem floor)
    {
        var roomCount = Rooms.Count(r => r.FloorId == floor.Id) + 1;
        Rooms.Add(new RoomWizardItem
        {
            FloorId = floor.Id,
            RoomNumber = $"{floor.Number}{roomCount:D2}",  // e.g., "101", "102"
            Name = $"Room {floor.Number}{roomCount:D2}",
            Capacity = 30,
            Status = "Available",
            DisplayOrder = roomCount
        });
    }

    [RelayCommand]
    private void RemoveRoom(RoomWizardItem room)
    {
        Rooms.Remove(room);
    }

    private bool ValidateCurrentStep()
    {
        return CurrentStep switch
        {
            1 => !string.IsNullOrWhiteSpace(BuildingName) && !string.IsNullOrWhiteSpace(BuildingCode),
            2 => Floors.Count > 0 && Floors.All(f => !string.IsNullOrWhiteSpace(f.Name) && f.Number > 0),
            3 => true, // Rooms are optional
            4 => true, // Review step
            _ => false
        };
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

    partial void OnCurrentStepChanged(int value)
    {
        OnPropertyChanged(nameof(CanGoNext));
        OnPropertyChanged(nameof(CanGoPrevious));
        OnPropertyChanged(nameof(CanFinish));
    }
}

public class FloorWizardItem
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
}

public class RoomWizardItem
{
    public string FloorId { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public string Status { get; set; } = "Available";
    public int? DisplayOrder { get; set; }
}
