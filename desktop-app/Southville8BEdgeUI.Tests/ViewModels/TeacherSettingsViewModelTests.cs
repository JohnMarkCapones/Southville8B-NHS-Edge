using System;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherSettingsViewModelTests
{
    private SettingsViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Sets_Defaults()
    {
        var vm = CreateVm();
        Assert.Equal("Settings", vm.Title);
        Assert.False(vm.ShowProfileToStudents); // default false
        Assert.True(vm.AllowParentMessages);
        Assert.True(vm.RequireReauthentication);
        Assert.True(vm.EmailNotifications);
        Assert.True(vm.InAppAlerts);
        Assert.True(vm.SoundOnNewMessage);
        Assert.True(vm.AssignmentReminders);
        Assert.True(vm.ScheduleChangeAlerts);
    }

    [Fact]
    public void Property_Setters_Update_State()
    {
        var vm = CreateVm();
        vm.Title = "New Title";
        vm.ShowProfileToStudents = true;
        vm.AllowParentMessages = false;
        vm.RequireReauthentication = false;
        vm.EmailNotifications = false;
        vm.InAppAlerts = false;
        vm.SoundOnNewMessage = false;
        vm.AssignmentReminders = false;
        vm.ScheduleChangeAlerts = false;

        Assert.Equal("New Title", vm.Title);
        Assert.True(vm.ShowProfileToStudents);
        Assert.False(vm.AllowParentMessages);
        Assert.False(vm.RequireReauthentication);
        Assert.False(vm.EmailNotifications);
        Assert.False(vm.InAppAlerts);
        Assert.False(vm.SoundOnNewMessage);
        Assert.False(vm.AssignmentReminders);
        Assert.False(vm.ScheduleChangeAlerts);
    }

    [Fact]
    public void Commands_Execute_Without_Exception()
    {
        var vm = CreateVm();
        var ex1 = Record.Exception(() => vm.SaveCommand.Execute(null));
        var ex2 = Record.Exception(() => vm.ResetCommand.Execute(null));
        var ex3 = Record.Exception(() => vm.ClearCacheCommand.Execute(null));
        var ex4 = Record.Exception(() => vm.ExportDataCommand.Execute(null));
        var ex5 = Record.Exception(() => vm.ResetSettingsCommand.Execute(null));
        Assert.Null(ex1);
        Assert.Null(ex2);
        Assert.Null(ex3);
        Assert.Null(ex4);
        Assert.Null(ex5);
    }
}
