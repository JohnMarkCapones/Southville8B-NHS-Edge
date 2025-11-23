using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.Services;
using System;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ChangePasswordViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;

    [ObservableProperty]
    private string _currentPassword = "";

    [ObservableProperty]
    private string _newPassword = "";

    [ObservableProperty]
    private string _confirmPassword = "";

    [ObservableProperty]
    private bool _isLoading = false;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string _errorMessage = "";

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    public Action? NavigateBack { get; set; }

    public ChangePasswordViewModel()
    {
        // For design-time support
        _apiClient = null!;
        _toastService = null!;
    }

    public ChangePasswordViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private async Task ChangePasswordAsync()
    {
        // Clear previous error
        ErrorMessage = "";

        // Validation
        if (string.IsNullOrWhiteSpace(CurrentPassword))
        {
            ErrorMessage = "Current password is required";
            _toastService?.Error("Current password is required", "Validation Error");
            return;
        }

        if (string.IsNullOrWhiteSpace(NewPassword))
        {
            ErrorMessage = "New password is required";
            _toastService?.Error("New password is required", "Validation Error");
            return;
        }

        if (NewPassword.Length < 8)
        {
            ErrorMessage = "New password must be at least 8 characters";
            _toastService?.Error("New password must be at least 8 characters", "Validation Error");
            return;
        }

        if (NewPassword != ConfirmPassword)
        {
            ErrorMessage = "New password and confirm password do not match";
            _toastService?.Error("New password and confirm password do not match", "Validation Error");
            return;
        }

        try
        {
            IsLoading = true;
            ErrorMessage = "";

            var response = await _apiClient.ChangePasswordAsync(CurrentPassword, NewPassword);

            if (response != null)
            {
                _toastService?.Success("Password changed successfully. Please log in again for security.", "Success");
                
                // Clear fields
                CurrentPassword = "";
                NewPassword = "";
                ConfirmPassword = "";
                
                // Navigate back after a short delay to allow user to see success message
                await Task.Delay(500);
                NavigateBack?.Invoke();
            }
            else
            {
                ErrorMessage = "Failed to change password. Please check your current password.";
                _toastService?.Error("Failed to change password. Please check your current password.", "Error");
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
            _toastService?.Error($"An error occurred: {ex.Message}", "Error");
        }
        finally
        {
            IsLoading = false;
        }
    }
}

