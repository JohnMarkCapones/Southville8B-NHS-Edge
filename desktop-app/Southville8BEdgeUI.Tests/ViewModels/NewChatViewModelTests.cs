using System;
using System.IO;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class NewChatViewModelTests
{
    private NewChatViewModel CreateVm() => new();

    [Fact]
    public void Constructor_SeedsUsers_AndFilters()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.AllUsers);
        // Initially nothing selected so filtered should include all (sorted)
        Assert.Equal(vm.AllUsers.Count, vm.FilteredAvailableUsers.Count);
        // Validation state: needs name and participant
        Assert.Equal("Chat name is required.", vm.BasicValidationMessage);
        Assert.Equal("At least one participant is required.", vm.ParticipantsValidationMessage);
        Assert.False(vm.CanCreate);
    }

    [Fact]
    public void Search_Filters_AvailableUsers()
    {
        var vm = CreateVm();
        var firstNameFragment = vm.AllUsers.First().Name.Split(' ')[0][..2];
        vm.ParticipantSearch = firstNameFragment; // triggers filter
        Assert.All(vm.FilteredAvailableUsers, u => Assert.Contains(firstNameFragment, u.Name, StringComparison.OrdinalIgnoreCase));
        vm.ParticipantSearch = "zzz_unlikely";
        Assert.Empty(vm.FilteredAvailableUsers);
    }

    [Fact]
    public void AddSelectedParticipant_AddsAndRefreshes()
    {
        var vm = CreateVm();
        var user = vm.FilteredAvailableUsers.First();
        vm.SelectedAvailableUser = user;
        Assert.True(vm.HasSelectedAvailableUser);
        vm.AddSelectedParticipantCommand.Execute(null);
        Assert.Contains(user, vm.SelectedParticipants);
        Assert.DoesNotContain(user, vm.FilteredAvailableUsers);
        Assert.Null(vm.SelectedAvailableUser);
        // Still cannot create because no name yet
        Assert.False(vm.CanCreate);
    }

    [Fact]
    public void RemoveParticipant_ReturnsUserToAvailable()
    {
        var vm = CreateVm();
        var user = vm.AllUsers.First();
        vm.SelectedAvailableUser = user;
        vm.AddSelectedParticipantCommand.Execute(null);
        Assert.Contains(user, vm.SelectedParticipants);
        vm.RemoveParticipantCommand.Execute(user);
        Assert.DoesNotContain(user, vm.SelectedParticipants);
        Assert.Contains(user, vm.FilteredAvailableUsers);
    }

    [Fact]
    public void ImageValidation_InvalidPath_ShowsMessage_ThenRemoveClears()
    {
        var vm = CreateVm();
        vm.ChatImagePath = Path.Combine("Z:", "unlikely", Guid.NewGuid()+".png"); // invalid path or non-existent
        Assert.Equal("Image file not found.", vm.ImageValidationMessage);
        Assert.True(vm.IsImageValidationVisible);
        vm.RemoveImageCommand.Execute(null);
        Assert.Null(vm.ImageValidationMessage);
        Assert.False(vm.IsImageValidationVisible);
    }

    [Fact]
    public void CanCreate_True_When_Name_Participant_And_NoErrors()
    {
        var vm = CreateVm();
        // Add participant
        vm.SelectedAvailableUser = vm.FilteredAvailableUsers.First();
        vm.AddSelectedParticipantCommand.Execute(null);
        // Set name
        vm.ChatName = "Team Chat";
        Assert.Null(vm.BasicValidationMessage);
        Assert.Null(vm.ParticipantsValidationMessage);
        Assert.True(vm.CanCreate);
    }

    [Fact]
    public void CreateChat_WithInvalid_DoesNotInvokeCallbacks()
    {
        var vm = CreateVm();
        bool created = false; bool navigated = false;
        vm.OnCreated = _ => created = true;
        vm.NavigateBack = () => navigated = true;
        // Missing name + participant
        vm.CreateChatCommand.Execute(null);
        Assert.False(created);
        Assert.False(navigated);
    }

    [Fact]
    public void CreateChat_Valid_InvokesCallbacks_WithCorrectData()
    {
        var vm = CreateVm();
        bool created = false; bool navigated = false;
        NewChatViewModel.ChatCreationResult? result = null;
        vm.OnCreated = r => { created = true; result = r; };
        vm.NavigateBack = () => navigated = true;
        // Prepare valid state
        var p = vm.AllUsers.First();
        vm.SelectedAvailableUser = p;
        vm.AddSelectedParticipantCommand.Execute(null);
        vm.ChatName = "Review Group";
        vm.Description = "Discuss review topics";
        vm.IsPublic = false;
        vm.AllowInvites = false;
        vm.CreateChatCommand.Execute(null);
        Assert.True(created);
        Assert.True(navigated);
        Assert.NotNull(result);
        Assert.Equal("Review Group", result!.Name);
        Assert.Equal("Discuss review topics", result.Description);
        Assert.False(result.IsPublic);
        Assert.False(result.AllowInvites);
        Assert.Single(result.Participants);
        Assert.Equal(p.Name, result.Participants.First());
    }

    [Fact]
    public void CancelCommand_InvokesNavigateBack()
    {
        var vm = CreateVm();
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        vm.CancelCommand.Execute(null);
        Assert.True(navigated);
    }

    [Fact]
    public void RemoveImage_ClearsPath_AndValidation()
    {
        var vm = CreateVm();
        vm.ChatImagePath = "C:/nope.png"; // invalid => sets validation
        Assert.NotNull(vm.ImageValidationMessage);
        vm.RemoveImageCommand.Execute(null);
        Assert.Equal(string.Empty, vm.ChatImagePath);
        Assert.Null(vm.ImageValidationMessage);
    }
}
