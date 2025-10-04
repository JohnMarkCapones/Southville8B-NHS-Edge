using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class ChatViewModelTests
{
    private ChatViewModel CreateVm() => new();

    [Fact]
    public void Constructor_PopulatesConversations_AndSetsDefaults()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.Conversations);
        Assert.Equal(vm.Conversations.Count, vm.FilteredConversations.Count);
        Assert.NotNull(vm.SelectedConversation);
        Assert.True(vm.HasConversations);
        Assert.True(vm.HasSelectedConversation);
    }

    [Fact]
    public void ApplyFilters_BySearchText_FiltersConversations()
    {
        var vm = CreateVm();
        vm.SearchText = "Maria"; // triggers filter
        Assert.All(vm.FilteredConversations, c => Assert.Contains("Maria", c.ContactName, StringComparison.OrdinalIgnoreCase));
        vm.SearchText = "nonexistent";
        Assert.Empty(vm.FilteredConversations);
        Assert.False(vm.HasConversations);
    }

    [Fact]
    public void ApplyFilters_ByUserType_FiltersRole()
    {
        var vm = CreateVm();
        vm.SelectedUserType = "Admins";
        Assert.All(vm.FilteredConversations, c => Assert.Equal("Admin", c.ContactRole));
        vm.SelectedUserType = "Teachers";
        Assert.All(vm.FilteredConversations, c => Assert.Equal("Teacher", c.ContactRole));
        vm.SelectedUserType = "All Users";
        Assert.Equal(vm.Conversations.Count, vm.FilteredConversations.Count);
    }

    [Fact]
    public void SelectConversation_SetsSelected_ResetsUnread_RaisesEvent()
    {
        var vm = CreateVm();
        // Use FirstOrDefault so fallback works when no unread conversations are present
        var target = vm.Conversations.FirstOrDefault(c => c.UnreadCount > 0) ?? vm.Conversations.First();
        bool eventRaised = false;
        vm.ConversationNavigationRequested += (_, e) =>
        {
            if (e.Conversation == target && e.NavigationType == ConversationNavigationType.OpenChat)
                eventRaised = true;
        };
        vm.SelectConversationCommand.Execute(target);
        Assert.Same(target, vm.SelectedConversation);
        Assert.Equal(0, target.UnreadCount);
        Assert.True(eventRaised);
        Assert.True(vm.HasSelectedConversation);
    }

    [Fact]
    public void SendMessage_AppendsMessage_UpdatesConversation()
    {
        var vm = CreateVm();
        var convo = vm.SelectedConversation ?? vm.Conversations.First();
        int beforeCount = convo.Messages.Count;
        vm.NewMessage = "Test message";
        vm.SendMessageCommand.Execute(null);
        Assert.Equal(beforeCount + 1, convo.Messages.Count);
        var last = convo.Messages.Last();
        Assert.Equal("Test message", last.Content);
        Assert.True(last.IsFromCurrentUser);
        Assert.Equal("Test message", convo.LastMessage);
        Assert.Equal(string.Empty, vm.NewMessage); // cleared
    }

    [Fact]
    public void SendMessage_DoesNothing_WhenInvalid()
    {
        var vm = CreateVm();
        var convo = vm.SelectedConversation!;
        int before = convo.Messages.Count;
        vm.NewMessage = "   ";
        vm.SendMessageCommand.Execute(null);
        Assert.Equal(before, convo.Messages.Count);
        vm.SelectedConversation = null; // no selection
        vm.NewMessage = "Hi";
        vm.SendMessageCommand.Execute(null);
        Assert.Equal(before, convo.Messages.Count);
    }

    private class CaptureNav
    {
        public object? NavigatedVm;        
    }

    [Fact]
    public void StartNewChat_Navigates_To_NewChatViewModel()
    {
        var vm = CreateVm();
        var cap = new CaptureNav();
        vm.NavigateTo = newVm => cap.NavigatedVm = newVm;
        vm.StartNewChatCommand.Execute(null);
        Assert.NotNull(cap.NavigatedVm);
        Assert.Contains("NewChatViewModel", cap.NavigatedVm!.GetType().Name);
    }

    [Fact]
    public void AddConversationFromResult_AddsAndSelectsConversation()
    {
        var vm = CreateVm();
        int before = vm.Conversations.Count;
        // Access private method via reflection
        var method = typeof(ChatViewModel).GetMethod("AddConversationFromResult", BindingFlags.NonPublic | BindingFlags.Instance);
        var resultType = typeof(NewChatViewModel).GetNestedType("ChatCreationResult", BindingFlags.Public | BindingFlags.NonPublic);
        Assert.NotNull(method);
        Assert.NotNull(resultType);
        var resultObj = Activator.CreateInstance(resultType!);
        Assert.NotNull(resultObj);
        resultType!.GetProperty("Name")!.SetValue(resultObj, "Test Room");
        resultType!.GetProperty("IsPublic")!.SetValue(resultObj, true);
        resultType!.GetProperty("Description")!.SetValue(resultObj, "");
        resultType!.GetProperty("AllowInvites")!.SetValue(resultObj, false);
        resultType!.GetProperty("Participants")!.SetValue(resultObj, Array.Empty<string>());

        method!.Invoke(vm, new[] { resultObj });

        Assert.Equal(before + 1, vm.Conversations.Count);
        Assert.Same(vm.Conversations.First(), vm.SelectedConversation); // inserted at 0 and selected
        Assert.Equal("Conversation created", vm.SelectedConversation!.LastMessage);
    }

    [Fact]
    public void RequestNavigateToConversations_RaisesEvent()
    {
        var vm = CreateVm();
        bool raised = false;
        vm.ConversationNavigationRequested += (_, e) =>
        {
            if (e.NavigationType == ConversationNavigationType.BackToConversations && e.Conversation == null)
                raised = true;
        };
        vm.RequestNavigateToConversations();
        Assert.True(raised);
    }

    [Fact]
    public void HasSelectedConversation_False_WhenNull()
    {
        var vm = CreateVm();
        vm.SelectedConversation = null;
        Assert.False(vm.HasSelectedConversation);
    }
}
