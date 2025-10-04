using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class NewAnnouncementViewModelTests
{
    private NewAnnouncementViewModel CreateVm() => new();

    [Fact]
    public void Initial_State_CannotCreate()
    {
        var vm = CreateVm();
        Assert.False(vm.CreateCommand.CanExecute(null));
        Assert.Equal(string.Empty, vm.Title);
        Assert.Equal(string.Empty, vm.Content);
    }

    [Fact]
    public void CanExecute_Updates_When_Title_And_Content_Set()
    {
        var vm = CreateVm();
        vm.Title = "Test"; // missing content
        Assert.False(vm.CreateCommand.CanExecute(null));
        vm.Content = "Body";
        Assert.True(vm.CreateCommand.CanExecute(null));
        vm.Content = "   "; // whitespace -> invalid
        Assert.False(vm.CreateCommand.CanExecute(null));
        vm.Content = "Valid again";
        Assert.True(vm.CreateCommand.CanExecute(null));
    }

    [Fact]
    public void CreateCommand_Invokes_OnCreated_With_DefaultPriority_And_ActiveStatus()
    {
        var vm = CreateVm();
        vm.Title = "Quiz";
        vm.Content = "Short content";
        vm.Priority = string.Empty; // will default to Low
        vm.PostImmediately = true;
        AnnouncementItemViewModel? created = null;
        vm.OnCreated = a => created = a;
        vm.CreateCommand.Execute(null);
        Assert.NotNull(created);
        Assert.Equal("Quiz", created!.Title);
        Assert.Equal("Short content", created.ContentPreview);
        Assert.Equal("Low", created.Priority); // default
        Assert.Equal("Active", created.Status);
        Assert.Equal("now", created.PostedDate);
    }

    [Fact]
    public void CreateCommand_Scheduled_Sets_Status_And_Date()
    {
        var vm = CreateVm();
        vm.Title = "Announcement";
        vm.Content = "Schedule this";
        vm.PostImmediately = false;
        var targetDate = new DateTime(2025, 5, 12);
        vm.ScheduledDate = targetDate;
        AnnouncementItemViewModel? created = null;
        vm.OnCreated = a => created = a;
        vm.CreateCommand.Execute(null);
        Assert.NotNull(created);
        Assert.Equal("Scheduled", created!.Status);
        Assert.Contains("May 12", created.PostedDate, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void CreateCommand_Truncates_Content_To_120_Chars()
    {
        var vm = CreateVm();
        vm.Title = "Long";
        vm.Content = new string('x', 130);
        AnnouncementItemViewModel? created = null;
        vm.OnCreated = a => created = a;
        vm.CreateCommand.Execute(null);
        Assert.NotNull(created);
        // preview length should be 120 + 3 (ellipsis) = 123
        Assert.Equal(123, created!.ContentPreview.Length);
        Assert.EndsWith("...", created.ContentPreview);
    }

    [Fact]
    public void CreateCommand_DoesNothing_When_Invalid()
    {
        var vm = CreateVm();
        vm.Title = "Only title"; // missing valid content -> invalid
        vm.Content = "   ";
        bool invoked = false;
        vm.OnCreated = _ => invoked = true;
        // Force direct execute attempt to validate internal guard
        vm.CreateCommand.Execute(null);
        Assert.False(invoked);
    }

    [Fact]
    public void CancelCommand_Invokes_NavigateBack()
    {
        var vm = CreateVm();
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        vm.CancelCommand.Execute(null);
        Assert.True(navigated);
    }
}
