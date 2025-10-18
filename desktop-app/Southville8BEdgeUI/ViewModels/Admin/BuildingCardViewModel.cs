using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class BuildingCardViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    
    // Navigation callbacks
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? OnBuildingChanged { get; set; }

    [ObservableProperty] private string _id = string.Empty;
    [ObservableProperty] private string _buildingName = string.Empty;
    [ObservableProperty] private string _code = string.Empty;
    [ObservableProperty] private int? _capacity;
    [ObservableProperty] private bool _isExpanded;
    [ObservableProperty] private bool _isLoading;

    public ObservableCollection<FloorCardViewModel> Floors { get; } = new();

    public int TotalFloors => Floors.Count;
    public int TotalRooms => Floors.Sum(f => f.TotalRooms);
    public int TotalCapacity => Floors.Sum(f => f.TotalCapacity);

    public BuildingCardViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public void LoadFromDto(BuildingDto dto)
    {
        Id = dto.Id;
        BuildingName = dto.BuildingName;
        Code = dto.Code;
        Capacity = dto.Capacity;
        
        // Load floors if provided
        if (dto.Floors != null)
        {
            Floors.Clear();
            foreach (var floor in dto.Floors)
            {
                var floorCard = new FloorCardViewModel(_apiClient)
                {
                    NavigateTo = NavigateTo,
                    OnFloorChanged = OnBuildingChanged
                };
                floorCard.LoadFromDto(floor);
                Floors.Add(floorCard);
            }
        }
        
        OnPropertyChanged(nameof(TotalFloors));
        OnPropertyChanged(nameof(TotalRooms));
        OnPropertyChanged(nameof(TotalCapacity));
    }

    [RelayCommand]
    private void ToggleExpand()
    {
        IsExpanded = !IsExpanded;
        
        if (IsExpanded && Floors.Count == 0)
        {
            _ = LoadFloorsAsync();
        }
    }

    private async Task LoadFloorsAsync()
    {
        try
        {
            IsLoading = true;
            var response = await _apiClient.GetFloorsAsync(Id, 100);
            if (response?.Data != null)
            {
                Floors.Clear();
                foreach (var floor in response.Data)
                {
                    var floorCard = new FloorCardViewModel(_apiClient)
                    {
                        NavigateTo = NavigateTo,
                        OnFloorChanged = OnBuildingChanged
                    };
                    floorCard.LoadFromDto(floor);
                    Floors.Add(floorCard);
                }
                
                OnPropertyChanged(nameof(TotalFloors));
                OnPropertyChanged(nameof(TotalRooms));
                OnPropertyChanged(nameof(TotalCapacity));
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading floors: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void EditBuilding()
    {
        // TODO: Navigate to edit building dialog
        System.Diagnostics.Debug.WriteLine($"Edit building: {BuildingName}");
    }

    [RelayCommand]
    private async Task DeleteBuilding()
    {
        try
        {
            var success = await _apiClient.DeleteBuildingAsync(Id);
            if (success)
            {
                OnBuildingChanged?.Invoke();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting building: {ex.Message}");
        }
    }

    [RelayCommand]
    private void AddFloor()
    {
        // TODO: Navigate to add floor dialog
        System.Diagnostics.Debug.WriteLine($"Add floor to building: {BuildingName}");
    }
}
