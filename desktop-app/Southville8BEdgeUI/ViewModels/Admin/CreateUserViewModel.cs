using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateUserViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    
    // Navigation callbacks
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private string _selectedRole = "Student";

    public bool IsRoleSelected(string roleValue) => SelectedRole == roleValue;

    public ObservableCollection<RoleOption> RoleOptions { get; } = new()
    {
        new() { Value = "Student", Title = "Student", Description = "Create a new student account", Icon = "PeopleTeam" },
        new() { Value = "Teacher", Title = "Teacher", Description = "Create a new teacher account", Icon = "Person" },
        new() { Value = "Admin", Title = "Administrator", Description = "Create a new admin account", Icon = "Shield" }
    };

    public CreateUserViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
    }

    [RelayCommand]
    private void CreateUser()
    {
        ViewModelBase? viewModel = SelectedRole switch
        {
            "Student" => new CreateStudentViewModel(_apiClient, _toastService) { NavigateBack = () => NavigateTo?.Invoke(this) },
            "Teacher" => new CreateTeacherViewModel(_apiClient, _toastService) { NavigateBack = () => NavigateTo?.Invoke(this) },
            "Admin" => new CreateAdminViewModel(_apiClient) { NavigateBack = () => NavigateTo?.Invoke(this) },
            _ => null
        };

        if (viewModel != null)
        {
            NavigateTo?.Invoke(viewModel);
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }
}

public class RoleOption
{
    public string Value { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}
