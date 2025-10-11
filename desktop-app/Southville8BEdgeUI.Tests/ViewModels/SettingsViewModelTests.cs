using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class SettingsViewModelTests
{
    private SettingsViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Sets_Defaults_And_Collections()
    {
        var vm = CreateVm();
        Assert.False(vm.DarkMode);
        Assert.True(vm.Notifications);
        Assert.True(vm.EmailNotifications);
        Assert.False(vm.SmsNotifications);
        Assert.Equal("English", vm.SelectedLanguage);
        Assert.Equal("GMT+8 (Philippine Time)", vm.SelectedTimeZone);
        Assert.True(vm.AutoSave);
        Assert.Equal(30, vm.SessionTimeout);
        Assert.Contains("English", vm.AvailableLanguages);
        Assert.Contains("GMT+8 (Philippine Time)", vm.AvailableTimeZones);
    }

    [Fact]
    public void ResetToDefaultsCommand_Restores_Defaults()
    {
        var vm = CreateVm();
        // Mutate values
        vm.DarkMode = true;
        vm.Notifications = false;
        vm.EmailNotifications = false;
        vm.SmsNotifications = true;
        vm.SelectedLanguage = "Spanish";
        vm.SelectedTimeZone = "GMT+0 (UTC)";
        vm.AutoSave = false;
        vm.SessionTimeout = 5;

        vm.ResetToDefaultsCommand.Execute(null);

        Assert.False(vm.DarkMode);
        Assert.True(vm.Notifications);
        Assert.True(vm.EmailNotifications);
        Assert.False(vm.SmsNotifications);
        Assert.Equal("English", vm.SelectedLanguage);
        Assert.Equal("GMT+8 (Philippine Time)", vm.SelectedTimeZone);
        Assert.True(vm.AutoSave);
        Assert.Equal(30, vm.SessionTimeout);
    }

    [Fact]
    public void SaveSettingsCommand_DoesNotThrow()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.SaveSettingsCommand.Execute(null));
        Assert.Null(ex);
    }

    [Fact]
    public void ExportSettingsCommand_DoesNotThrow()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.ExportSettingsCommand.Execute(null));
        Assert.Null(ex);
    }

    [Fact]
    public void ImportSettingsCommand_DoesNotThrow()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.ImportSettingsCommand.Execute(null));
        Assert.Null(ex);
    }
}
