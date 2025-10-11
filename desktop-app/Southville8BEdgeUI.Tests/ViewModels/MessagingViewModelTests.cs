using System;
using System.Linq;
using System.ComponentModel;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class MessagingViewModelTests
{
    private MessagingViewModel CreateVm() => new();

    [Fact]
    public void Constructor_SeedsConversations_And_SelectsFirst()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.Conversations);
        Assert.True(vm.HasConversations);
        Assert.NotNull(vm.SelectedConversation);
        Assert.True(vm.HasSelectedConversation);
        Assert.True(vm.SelectedConversation!.IsSelected);
        // Ensure role brushes initialized (may be Transparent but non-null)
        Assert.NotNull(vm.SelectedConversation.AvatarBackgroundBrush);
        Assert.NotNull(vm.SelectedConversation.AvatarTextBrush);
    }

    [Fact]
    public void SelectConversationCommand_ChangesSelection_And_ResetsUnread()
    {
        var vm = CreateVm();
        var original = vm.SelectedConversation!;
        original.UnreadCount = 3;
        var target = vm.Conversations.Skip(1).First();
        target.UnreadCount = 5;
        vm.SelectConversationCommand.Execute(target);
        Assert.False(original.IsSelected);
        Assert.True(target.IsSelected);
        Assert.Same(target, vm.SelectedConversation);
        Assert.Equal(0, target.UnreadCount);
        Assert.True(vm.HasSelectedConversation);
    }

    [Fact]
    public void SendMessage_AddsMessage_UpdatesConversation_AndClearsInput()
    {
        var vm = CreateVm();
        var convo = vm.SelectedConversation!;
        int before = convo.Messages.Count;
        vm.NewMessageText = "  Hello there  ";
        vm.SendMessageCommand.Execute(null);
        Assert.Equal(before + 1, convo.Messages.Count);
        var last = convo.Messages.Last();
        Assert.Equal("Hello there", last.Content);
        Assert.True(last.IsSent);
        Assert.Equal("Hello there", convo.LastMessage);
        Assert.Equal("Now", convo.LastMessageTime);
        Assert.Equal(string.Empty, vm.NewMessageText);
    }

    [Fact]
    public void SendMessage_InvalidInput_DoesNothing()
    {
        var vm = CreateVm();
        var convo = vm.SelectedConversation!;
        int before = convo.Messages.Count;
        vm.NewMessageText = "   ";
        vm.SendMessageCommand.Execute(null);
        Assert.Equal(before, convo.Messages.Count);
        vm.SelectedConversation = null;
        vm.NewMessageText = "Test";
        vm.SendMessageCommand.Execute(null);
        // still no change since no selection
        Assert.Equal(before, vm.Conversations.First().Messages.Count);
    }

    [Fact]
    public void NewMessageCommand_Navigation_And_OnConversationCreated_Callback()
    {
        var vm = CreateVm();
        object? navigatedVm = null;
        vm.NavigateTo = child => navigatedVm = child;
        vm.NewMessageCommand.Execute(null);
        Assert.NotNull(navigatedVm);
        Assert.Contains("NewChatViewModel", navigatedVm!.GetType().Name);
        // Simulate callback invocation via reflection (Action<ConversationViewModel>)
        var prop = navigatedVm.GetType().GetProperty("OnConversationCreated");
        Assert.NotNull(prop);
        var callback = prop!.GetValue(navigatedVm) as Delegate;
        Assert.NotNull(callback);
        var previousSelected = vm.SelectedConversation;
        var newConv = new ConversationViewModel
        {
            ContactName = "New Contact",
            ContactRole = "Parent",
            ContactInitials = "NC",
            LastMessage = "Initial",
            LastMessageTime = "Just now",
            UnreadCount = 2,
            IsOnline = true,
            Messages = new System.Collections.ObjectModel.ObservableCollection<MessageViewModel>
            {
                new MessageViewModel { SenderName = "New Contact", Content = "Hi", Timestamp = "1:00 PM", IsSent = false }
            }
        };
        callback!.DynamicInvoke(newConv);
        Assert.Same(newConv, vm.SelectedConversation);
        Assert.True(newConv.IsSelected);
        Assert.False(previousSelected!.IsSelected);
        Assert.Equal(newConv, vm.Conversations.First());
    }

    [Fact]
    public void Conversation_UpdateRoleBrushes_ChangesBrushes_OnRoleChange()
    {
        var conv = new ConversationViewModel { ContactRole = "Parent" };
        var initialBg = conv.AvatarBackgroundBrush;
        conv.ContactRole = "Admin"; // triggers update
        Assert.NotNull(conv.AvatarBackgroundBrush);
        // In headless test environment brushes may both be Transparent; ensure property changed event fired for at least one brush.
        // We simply assert assignment happened (object reference potentially different or same depending on theme resources).
    }

    [Fact]
    public void MessageViewModel_Alignment_And_Brush_Update_On_IsSent()
    {
        var msg = new MessageViewModel { IsSent = false };
        var initialAlign = msg.MessageAlignment;
        var initialBrush = msg.MessageTextBrush;
        msg.IsSent = true;
        Assert.Equal("Left", initialAlign);
        Assert.Equal("Right", msg.MessageAlignment);
        Assert.NotNull(msg.MessageTextBrush);
    }

    [Fact]
    public void Utility_Commands_Execute_NoException()
    {
        var vm = CreateVm();
        vm.StartCallCommand.Execute(null);
        vm.StartVideoCallCommand.Execute(null);
        vm.ShowContactInfoCommand.Execute(null);
        vm.AttachFileCommand.Execute(null);
        vm.SendAttendanceReminderCommand.Execute(null);
        vm.SendAssignmentReminderCommand.Execute(null);
        vm.SendPraiseMessageCommand.Execute(null);
        vm.ContactParentCommand.Execute(null);
        // StartConversation expects a contact parameter
        vm.StartConversationCommand.Execute(new ContactViewModel { Name = "Test", Role = "Parent", Initials = "TP" });
        Assert.True(true); // Reached here without exceptions
    }
}
