using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherProfileViewModelTests
{
    private ProfileViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Sets_Default_Title()
    {
        var vm = CreateVm();
        Assert.Equal("My Profile", vm.Title);
    }

    [Fact]
    public void UploadPhotoCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.UploadPhotoCommand.Execute(null);
        Assert.True(true);
    }

    [Fact]
    public void EditProfileCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.EditProfileCommand.Execute(null);
        Assert.True(true);
    }

    [Fact]
    public void ChangePasswordCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.ChangePasswordCommand.Execute(null);
        Assert.True(true);
    }

    [Fact]
    public void ToggleTwoFactorCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.ToggleTwoFactorCommand.Execute(null);
        Assert.True(true);
    }

    [Fact]
    public void ShowLoginHistoryCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.ShowLoginHistoryCommand.Execute(null);
        Assert.True(true);
    }

    [Fact]
    public void SaveChangesCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.SaveChangesCommand.Execute(null);
        Assert.True(true);
    }

    [Fact]
    public void ResetToDefaultCommand_Executes_NoException()
    {
        var vm = CreateVm();
        vm.ResetToDefaultCommand.Execute(null);
        Assert.True(true);
    }
}
