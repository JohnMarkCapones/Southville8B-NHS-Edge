using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateAdminViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    
    // Navigation callbacks
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    // Form properties
    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _middleName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _birthday = string.Empty;
    [ObservableProperty] private int? _age;
    [ObservableProperty] private string _departmentId = string.Empty;
    [ObservableProperty] private string _phoneNumber = string.Empty;

    // UI properties
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);

    // Options
    public ObservableCollection<string> DepartmentOptions { get; } = new()
    {
        "Administration", "Academic Affairs", "Student Services", "IT", "Finance", "Human Resources"
    };

    public CreateAdminViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [RelayCommand]
    private void SaveAdmin()
    {
        // TODO: Implement admin creation
        System.Diagnostics.Debug.WriteLine("Saving admin...");
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }
}