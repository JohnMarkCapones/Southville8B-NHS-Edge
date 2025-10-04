using System;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class ProfileViewModelTests
{
    private ProfileViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Sets_Default_Profile_Values()
    {
        var vm = CreateVm();
        Assert.Equal("John Mark Capones", vm.FullName);
        Assert.Equal("john.capones@southville.edu.ph", vm.Email);
        Assert.Equal("+63 912 345 6789", vm.Phone);
        Assert.Equal("Administrator", vm.Position);
        Assert.Equal("IT Department", vm.Department);
        Assert.Equal(new DateTime(2020, 8, 15), vm.JoinDate);
        Assert.Equal("ADM-2020-001", vm.EmployeeId);
        Assert.Equal("123 Main Street, Southville City", vm.Address);
        Assert.False(vm.IsEditing);
    }

    [Fact]
    public void EditProfileCommand_Sets_IsEditing_True()
    {
        var vm = CreateVm();
        vm.EditProfileCommand.Execute(null);
        Assert.True(vm.IsEditing);
    }

    [Fact]
    public void SaveProfileCommand_Sets_IsEditing_False()
    {
        var vm = CreateVm();
        vm.EditProfileCommand.Execute(null);
        Assert.True(vm.IsEditing);
        vm.SaveProfileCommand.Execute(null);
        Assert.False(vm.IsEditing);
    }

    [Fact]
    public void CancelEditCommand_Sets_IsEditing_False()
    {
        var vm = CreateVm();
        vm.EditProfileCommand.Execute(null);
        Assert.True(vm.IsEditing);
        vm.CancelEditCommand.Execute(null);
        Assert.False(vm.IsEditing);
    }

    [Fact]
    public void ChangePasswordCommand_DoesNotThrow()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.ChangePasswordCommand.Execute(null));
        Assert.Null(ex);
    }

    [Fact]
    public void UploadPhotoCommand_DoesNotThrow()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.UploadPhotoCommand.Execute(null));
        Assert.Null(ex);
    }
}
