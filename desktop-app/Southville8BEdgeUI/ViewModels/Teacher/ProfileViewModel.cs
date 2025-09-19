using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class ProfileViewModel : ViewModelBase
{
    // Minimal placeholder properties for profile page
    [ObservableProperty] private string _title = "My Profile";

    [RelayCommand] private void UploadPhoto() { /* TODO */ }
    [RelayCommand] private void EditProfile() { /* TODO */ }
    [RelayCommand] private void ChangePassword() { /* TODO */ }
    [RelayCommand] private void ToggleTwoFactor() { /* TODO */ }
    [RelayCommand] private void ShowLoginHistory() { /* TODO */ }
    [RelayCommand] private void SaveChanges() { /* TODO */ }
    [RelayCommand] private void ResetToDefault() { /* TODO */ }
}
