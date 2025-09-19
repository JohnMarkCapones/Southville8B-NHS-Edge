using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class SettingsViewModel : ViewModelBase
{
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

    // Commands
    [RelayCommand] private void Save() { /* TODO: persist settings */ }
    [RelayCommand] private void Reset() { /* TODO: reset UI changes */ }
    [RelayCommand] private void ClearCache() { /* TODO: clear local cache */ }
    [RelayCommand] private void ExportData() { /* TODO: export settings/data */ }
    [RelayCommand] private void ResetSettings() { /* TODO: reset to defaults */ }
}
