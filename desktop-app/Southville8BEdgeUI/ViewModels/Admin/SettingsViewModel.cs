using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class SettingsViewModel : ViewModelBase
{
    [ObservableProperty]
    private bool _darkMode = false;

    [ObservableProperty]
    private bool _notifications = true;

    [ObservableProperty]
    private bool _emailNotifications = true;

    [ObservableProperty]
    private bool _smsNotifications = false;

    [ObservableProperty]
    private string _selectedLanguage = "English";

    [ObservableProperty]
    private string _selectedTimeZone = "GMT+8 (Philippine Time)";

    [ObservableProperty]
    private bool _autoSave = true;

    [ObservableProperty]
    private int _sessionTimeout = 30;

    public ObservableCollection<string> AvailableLanguages { get; } = new()
    {
        "English",
        "Filipino",
        "Spanish"
    };

    public ObservableCollection<string> AvailableTimeZones { get; } = new()
    {
        "GMT+8 (Philippine Time)",
        "GMT+0 (UTC)",
        "GMT-5 (EST)",
        "GMT+9 (JST)"
    };

    [RelayCommand]
    private void SaveSettings()
    {
        // TODO: Implement save settings logic
    }

    [RelayCommand]
    private void ResetToDefaults()
    {
        DarkMode = false;
        Notifications = true;
        EmailNotifications = true;
        SmsNotifications = false;
        SelectedLanguage = "English";
        SelectedTimeZone = "GMT+8 (Philippine Time)";
        AutoSave = true;
        SessionTimeout = 30;
    }

    [RelayCommand]
    private void ExportSettings()
    {
        // TODO: Implement export settings logic
    }

    [RelayCommand]
    private void ImportSettings()
    {
        // TODO: Implement import settings logic
    }
}