using System;
using System.ComponentModel;
using System.Linq;
using System.Collections.ObjectModel;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherNotificationsViewModelTests
{
    private NotificationsViewModel CreateVm() => new();

    [Fact]
    public void Constructor_SeedsItems_And_HasNew()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.Items);
        Assert.True(vm.HasNew);
        // At least one old item exists (from seed)
        Assert.Contains(vm.Items, i => !i.IsNew);
        // MarkAllRead should be executable initially
        Assert.True(vm.MarkAllReadCommand.CanExecute(null));
    }

    [Fact]
    public void MarkAllReadCommand_Marks_All_Items_Read_And_Disables_Command()
    {
        var vm = CreateVm();
        vm.MarkAllReadCommand.Execute(null);
        Assert.All(vm.Items, i => Assert.False(i.IsNew));
        Assert.False(vm.HasNew);
        Assert.False(vm.MarkAllReadCommand.CanExecute(null));
    }

    [Fact]
    public void MarkReadCommand_Marks_Single_Item_Read()
    {
        var vm = CreateVm();
        var target = vm.Items.First(i => i.IsNew);
        Assert.True(vm.MarkReadCommand.CanExecute(target));
        vm.MarkReadCommand.Execute(target);
        Assert.False(target.IsNew);
    }

    [Fact]
    public void MarkReadCommand_NotExecutable_When_Item_Not_New()
    {
        var vm = CreateVm();
        var oldItem = vm.Items.First(i => !i.IsNew);
        Assert.False(vm.MarkReadCommand.CanExecute(oldItem));
    }

    [Fact]
    public void DeleteCommand_Removes_Item_And_Updates_HasNew()
    {
        var vm = CreateVm();
        // Ensure there is at least one new item
        var newItem = vm.Items.First(i => i.IsNew);
        int before = vm.Items.Count;
        vm.DeleteCommand.Execute(newItem);
        Assert.Equal(before - 1, vm.Items.Count);
        // If no new items remain HasNew should reflect that
        if (!vm.Items.Any(i => i.IsNew))
            Assert.False(vm.HasNew);
    }

    [Fact]
    public void Adding_New_Item_Updates_HasNew_And_CommandStates()
    {
        var vm = CreateVm();
        vm.MarkAllReadCommand.Execute(null); // now all read
        Assert.False(vm.HasNew);
        Assert.False(vm.MarkAllReadCommand.CanExecute(null));
        var added = new NotificationItem
        {
            Title = "Late Submission",
            Description = "A student submitted late work.",
            TimeAgo = "Just now",
            Severity = NotificationSeverity.Warning,
            IsNew = true
        };
        vm.Items.Add(added);
        Assert.True(vm.HasNew);
        Assert.True(vm.MarkAllReadCommand.CanExecute(null));
        Assert.True(vm.MarkReadCommand.CanExecute(added));
    }

    [Fact]
    public void Changing_Item_IsNew_Triggers_HasNew_Update()
    {
        var vm = CreateVm();
        vm.MarkAllReadCommand.Execute(null); // all read
        Assert.False(vm.HasNew);
        var first = vm.Items.First();
        first.IsNew = true; // should trigger refresh
        Assert.True(vm.HasNew);
    }

    [Fact]
    public void Replace_Items_Collection_Rewires_Handlers()
    {
        var vm = CreateVm();
        vm.Items = new ObservableCollection<NotificationItem>
        {
            new() { Title = "A", Description = "Desc", TimeAgo = "1m", Severity = NotificationSeverity.Info, IsNew = false },
            new() { Title = "B", Description = "Desc", TimeAgo = "2m", Severity = NotificationSeverity.Success, IsNew = false }
        };
        Assert.False(vm.HasNew);
        // Add a new item to new collection
        var added = new NotificationItem { Title = "C", Description = "D", TimeAgo = "3m", Severity = NotificationSeverity.Warning, IsNew = true };
        vm.Items.Add(added);
        Assert.True(vm.HasNew);
    }

    [Fact]
    public void DeleteCommand_Ignores_Item_Not_In_List()
    {
        var vm = CreateVm();
        var phantom = new NotificationItem { Title = "X", Description = "Y", IsNew = true, TimeAgo = "1m", Severity = NotificationSeverity.Info };
        int before = vm.Items.Count;
        // Should not throw
        vm.DeleteCommand.Execute(phantom);
        Assert.Equal(before, vm.Items.Count);
    }

    [Fact]
    public void OpenSettingsCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.OpenSettingsCommand.Execute(null);
        Assert.True(true);
    }
}
