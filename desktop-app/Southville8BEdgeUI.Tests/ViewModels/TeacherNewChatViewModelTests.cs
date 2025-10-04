using System;
using System.Linq;
using System.Collections.ObjectModel;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherNewChatViewModelTests
{
    private Southville8BEdgeUI.ViewModels.Teacher.NewChatViewModel CreateVm() => new();

    [Fact]
    public void Initial_State_CannotCreate()
    {
        var vm = CreateVm();
        Assert.False(vm.CreateCommand.CanExecute(null));
        Assert.Equal(string.Empty, vm.ContactName);
        Assert.Equal(string.Empty, vm.ContactRole);
    }

    [Fact]
    public void CanExecute_Requires_ContactName_And_Role()
    {
        var vm = CreateVm();
        vm.ContactName = "Maria"; // missing role
        Assert.False(vm.CreateCommand.CanExecute(null));
        vm.ContactRole = "Parent";
        Assert.True(vm.CreateCommand.CanExecute(null));
        vm.ContactName = "   "; // whitespace invalid
        Assert.False(vm.CreateCommand.CanExecute(null));
        vm.ContactName = "Alex Johnson";
        Assert.True(vm.CreateCommand.CanExecute(null));
    }

    [Fact]
    public void CreateCommand_BuildsConversation_With_Defaults_And_NoFirstMessage()
    {
        var vm = CreateVm();
        vm.ContactName = "Emily Davis";
        vm.ContactRole = "Parent";
        vm.Initials = ""; // force auto generation
        ConversationViewModel? created = null;
        vm.OnConversationCreated = c => created = c;
        vm.CreateCommand.Execute(null);
        Assert.NotNull(created);
        Assert.Equal("Emily Davis", created!.ContactName);
        Assert.Equal("Parent", created.ContactRole);
        // Initials should be derived -> ED
        Assert.Equal("ED", created.ContactInitials);
        Assert.Equal("(No messages yet)", created.LastMessage);
        Assert.Empty(created.Messages); // Updated per xUnit2013
        Assert.Equal("Now", created.LastMessageTime);
    }

    [Fact]
    public void CreateCommand_Uses_Provided_Initials_Uppercased()
    {
        var vm = CreateVm();
        vm.ContactName = "Robert Wilson";
        vm.ContactRole = "Teacher";
        vm.Initials = "rw"; // custom
        ConversationViewModel? created = null;
        vm.OnConversationCreated = c => created = c;
        vm.CreateCommand.Execute(null);
        Assert.NotNull(created);
        Assert.Equal("RW", created!.ContactInitials);
    }

    [Fact]
    public void CreateCommand_Adds_FirstMessage_When_Present()
    {
        var vm = CreateVm();
        vm.ContactName = "Parent One";
        vm.ContactRole = "Parent";
        vm.FirstMessage = "  Hello there  ";
        ConversationViewModel? created = null;
        vm.OnConversationCreated = c => created = c;
        vm.CreateCommand.Execute(null);
        Assert.NotNull(created);
        Assert.Equal("Hello there", created!.LastMessage);
        Assert.Single(created.Messages);
        var msg = created.Messages.First();
        Assert.True(msg.IsSent);
        Assert.Equal("Hello there", msg.Content);
        Assert.Equal("You", msg.SenderName);
        Assert.True(msg.ShowDateSeparator);
        Assert.Equal("Today", msg.DateSeparator);
    }

    [Fact]
    public void CreateCommand_DoesNothing_When_Invalid()
    {
        var vm = CreateVm();
        vm.ContactName = "Only name"; // missing role
        bool invoked = false;
        vm.OnConversationCreated = _ => invoked = true;
        if (vm.CreateCommand.CanExecute(null))
            vm.CreateCommand.Execute(null); // should not happen
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

    [Fact]
    public void GetInitials_Logic_Indirect_Cases()
    {
        // Single word name
        var vm1 = CreateVm();
        vm1.ContactName = "Plato";
        vm1.ContactRole = "Admin";
        ConversationViewModel? c1 = null;
        vm1.OnConversationCreated = c => c1 = c;
        vm1.CreateCommand.Execute(null);
        Assert.Equal("P", c1!.ContactInitials);

        // Multi-part with extra spaces
        var vm2 = CreateVm();
        vm2.ContactName = "  Anna   Marie   Cruz  ";
        vm2.ContactRole = "Parent";
        ConversationViewModel? c2 = null;
        vm2.OnConversationCreated = c => c2 = c;
        vm2.CreateCommand.Execute(null);
        Assert.Equal("AC", c2!.ContactInitials); // first + last
    }
}
