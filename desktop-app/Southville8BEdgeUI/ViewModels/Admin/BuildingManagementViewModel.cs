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

    public bool HasBuildings => FilteredBuildings?.Any() == true;
    public bool HasFilteredRooms => FilteredBuildings?.Any(b => b.Floors?.Any(f => f.Rooms?.Any() == true) == true) == true;

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
                        OnBuildingChanged = () => _ = LoadBuildingsAsync()
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
    private void CreateBuildingWizard()
    {
        if (NavigateTo is null) return;
        var vm = new BuildingWizardViewModel(_apiClient) 
        { 
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnBuildingCreated = () => _ = LoadBuildingsAsync()
        };
        NavigateTo?.Invoke(vm);
    }
}