using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ProfileViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    private readonly string _userId;

    [ObservableProperty]
    private string _fullName = string.Empty;

    [ObservableProperty]
    private string _email = string.Empty;

    [ObservableProperty]
    private string _phone = string.Empty;

    [ObservableProperty]
    private string _position = string.Empty;

    [ObservableProperty]
    private string _department = string.Empty;

    [ObservableProperty]
    private DateTime _joinDate = DateTime.Now;

    [ObservableProperty]
    private string _employeeId = string.Empty;

    [ObservableProperty]
    private string _address = string.Empty;

    [ObservableProperty]
    private bool _isEditing = false;

    public Action<ViewModelBase>? NavigateTo { get; set; }

    public ProfileViewModel()
    {
        // For design-time support
        _apiClient = null!;
        _toastService = null!;
        _userId = string.Empty;
    }

    public ProfileViewModel(IApiClient apiClient, IToastService toastService, string userId)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _userId = userId;
        
        _ = LoadProfileAsync();
    }

    private async Task LoadProfileAsync()
    {
        try
        {
            var profile = await _apiClient.GetUserProfileAsync(_userId);
            if (profile != null)
            {
                FullName = profile.FullName ?? string.Empty;
                Email = profile.Email ?? string.Empty;
                EmployeeId = profile.Id; // Using ID as EmployeeID for now
                
                if (profile.Role != null)
                {
                    Position = profile.Role.Name;
                }

                // If there's specific profile data, map it here
                // Note: The API response structure might need to be checked for Phone/Address
                // For now, we'll leave them empty or map if available in ProfileData
                
                if (profile.Profile != null)
                {
                     Address = profile.Profile.Address ?? string.Empty;
                     Phone = profile.Profile.PhoneNumber ?? string.Empty;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading profile: {ex.Message}");
            _toastService.Error("Error loading profile");
        }
    }

    [RelayCommand]
    private void EditProfile()
    {
        IsEditing = true;
    }

    [RelayCommand]
    private async Task SaveProfile()
    {
        try
        {
            var dto = new UpdateUserDto
            {
                FullName = FullName,
                Email = Email
            };

            var success = await _apiClient.UpdateUserAsync(_userId, dto);
            if (success)
            {
                _toastService.Success("Profile updated successfully");
                IsEditing = false;
            }
            else
            {
                _toastService.Error("Failed to update profile");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error saving profile: {ex.Message}");
            _toastService.Error("Error saving profile");
        }
    }

    [RelayCommand]
    private async Task CancelEdit()
    {
        IsEditing = false;
        await LoadProfileAsync();
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
        _toastService.Info("Photo upload not implemented yet");
    }
}