using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.Services;
using System;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class SettingsViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;

    [ObservableProperty] private string _title = "Settings";

    // Privacy and Security toggles
    [ObservableProperty] private bool _showProfileToStudents;
    [ObservableProperty] private bool _allowParentMessages = true;
    [ObservableProperty] private bool _requireReauthentication = true;

    // Notification toggles
    [ObservableProperty] private bool _emailNotifications = true;
    [ObservableProperty] private bool _inAppAlerts = true;
    [ObservableProperty] private bool _soundOnNewMessage = true;
    [ObservableProperty] private bool _assignmentReminders = true;
    [ObservableProperty] private bool _scheduleChangeAlerts = true;

    // Password change fields
    [ObservableProperty] private string _currentPassword = "";
    [ObservableProperty] private string _newPassword = "";
    [ObservableProperty] private string _confirmPassword = "";
    [ObservableProperty] private bool _isChangingPassword = false;
    [ObservableProperty] private string _changePasswordButtonText = "Change Password";

    public SettingsViewModel()
    {
        // For design-time support
        _apiClient = null!;
        _toastService = null!;
    }

    public SettingsViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
    }

    // Commands
    [RelayCommand] private void Save() { /* TODO: persist settings */ }
    [RelayCommand] private void Reset() { /* TODO: reset UI changes */ }
    [RelayCommand] private void ClearCache() { /* TODO: clear local cache */ }
    [RelayCommand] private void ExportData() { /* TODO: export settings/data */ }
    [RelayCommand] private void ResetSettings() { /* TODO: reset to defaults */ }

    [RelayCommand]
    private async Task ChangePasswordAsync()
    {
        if (string.IsNullOrWhiteSpace(CurrentPassword))
        {
            _toastService?.Error("Current password is required", "Validation Error");
            return;
        }

        if (string.IsNullOrWhiteSpace(NewPassword))
        {
            _toastService?.Error("New password is required", "Validation Error");
            return;
        }

        if (NewPassword.Length < 8)
        {
            _toastService?.Error("New password must be at least 8 characters", "Validation Error");
            return;
        }

        if (NewPassword != ConfirmPassword)
        {
            _toastService?.Error("New password and confirm password do not match", "Validation Error");
            return;
        }

        try
        {
            IsChangingPassword = true;
            ChangePasswordButtonText = "Changing...";

            var response = await _apiClient.ChangePasswordAsync(CurrentPassword, NewPassword);

            if (response != null)
            {
                _toastService.Success("Password changed successfully", "Success");
                // Clear fields
                CurrentPassword = "";
                NewPassword = "";
                ConfirmPassword = "";
            }
            else
            {
                _toastService.Error("Failed to change password. Please check your current password.", "Error");
            }
        }
        catch (Exception ex)
        {
            _toastService?.Error($"An error occurred: {ex.Message}", "Error");
        }
        finally
        {
            IsChangingPassword = false;
            ChangePasswordButtonText = "Change Password";
        }
    }
}
