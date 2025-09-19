using CommunityToolkit.Mvvm.ComponentModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class SettingsViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "Settings";

    // Privacy and Security toggles
    [ObservableProperty] private bool _showProfileToStudents;
    [ObservableProperty] private bool _allowParentMessages = true;
    [ObservableProperty] private bool _requireReauthentication = true;
}
