using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ProfileViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;

    [ObservableProperty]
    private string _fullName = "John Mark Capones";

    [ObservableProperty]
    private string _email = "john.capones@southville.edu.ph";

    [ObservableProperty]
    private string _phone = "+63 912 345 6789";

    [ObservableProperty]
    private string _position = "Administrator";

    [ObservableProperty]
    private string _department = "IT Department";

    [ObservableProperty]
    private DateTime _joinDate = new DateTime(2020, 8, 15);

    [ObservableProperty]
    private string _employeeId = "ADM-2020-001";

    [ObservableProperty]
    private string _address = "123 Main Street, Southville City";

    [ObservableProperty]
    private bool _isEditing = false;

    public Action<ViewModelBase>? NavigateTo { get; set; }

    public ProfileViewModel()
    {
        // For design-time support
        _apiClient = null!;
        _toastService = null!;
    }

    public ProfileViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
    }

    [RelayCommand]
    private void EditProfile()
    {
        IsEditing = true;
    }

    [RelayCommand]
    private void SaveProfile()
    {
        // TODO: Implement save logic
        IsEditing = false;
    }

    [RelayCommand]
    private void CancelEdit()
    {
        // TODO: Reset to original values
        IsEditing = false;
    }

    [RelayCommand]
    private void ChangePassword()
    {
        if (NavigateTo == null) return;

        var changePasswordVm = new ChangePasswordViewModel(_apiClient, _toastService)
        {
            NavigateBack = () => NavigateTo?.Invoke(this)
        };
        NavigateTo?.Invoke(changePasswordVm);
    }

    [RelayCommand]
    private void UploadPhoto()
    {
        // TODO: Implement photo upload logic
    }
}