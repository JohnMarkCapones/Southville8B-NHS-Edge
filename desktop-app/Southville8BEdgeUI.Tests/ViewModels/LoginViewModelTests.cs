using System;
using Southville8BEdgeUI.ViewModels;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class LoginViewModelTests
{
    private LoginViewModel CreateVm() => new();

    [Fact]
    public void Defaults_Are_Empty_And_Flags_False()
    {
        var vm = CreateVm();
        Assert.Null(vm.Email);
        Assert.Null(vm.Password);
        Assert.False(vm.RememberMe);
        Assert.False(vm.ShowPassword);
    }

    [Fact]
    public void LoginCommand_NoNavigation_When_Email_Or_Password_Missing()
    {
        var vm = CreateVm();
        ViewModelBase? navigated = null;
        vm.NavigateTo = v => navigated = v;
        vm.LoginCommand.Execute(null); // both null
        Assert.Null(navigated);
        vm.Email = "admin"; // password missing
        vm.LoginCommand.Execute(null);
        Assert.Null(navigated);
        vm.Email = null;
        vm.Password = "admin"; // email missing
        vm.LoginCommand.Execute(null);
        Assert.Null(navigated);
    }

    [Fact]
    public void LoginCommand_Navigates_To_AdminShell_On_AdminCredentials()
    {
        var vm = CreateVm();
        ViewModelBase? navigated = null;
        vm.NavigateTo = v => navigated = v;
        vm.Email = "admin";
        vm.Password = "admin";
        vm.LoginCommand.Execute(null);
        Assert.NotNull(navigated);
        Assert.IsType<AdminShellViewModel>(navigated);
    }

    [Fact]
    public void LoginCommand_Navigates_To_TeacherShell_On_TeacherCredentials()
    {
        var vm = CreateVm();
        ViewModelBase? navigated = null;
        vm.NavigateTo = v => navigated = v;
        vm.Email = "teacher";
        vm.Password = "teacher";
        vm.LoginCommand.Execute(null);
        Assert.NotNull(navigated);
        Assert.IsType<TeacherShellViewModel>(navigated);
    }

    [Fact]
    public void LoginCommand_InvalidCredentials_NoNavigation()
    {
        var vm = CreateVm();
        ViewModelBase? navigated = null;
        vm.NavigateTo = v => navigated = v;
        vm.Email = "wrong";
        vm.Password = "credentials";
        vm.LoginCommand.Execute(null);
        Assert.Null(navigated);
    }

    [Fact]
    public void ForgotPasswordCommand_Executes_Without_Exception()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.ForgotPasswordCommand.Execute(null));
        Assert.Null(ex);
    }

    [Fact]
    public void Property_Setters_Work()
    {
        var vm = CreateVm();
        vm.Email = "user";
        vm.Password = "pass";
        vm.RememberMe = true;
        vm.ShowPassword = true;
        Assert.Equal("user", vm.Email);
        Assert.Equal("pass", vm.Password);
        Assert.True(vm.RememberMe);
        Assert.True(vm.ShowPassword);
    }
}
