using System.ComponentModel;
using Southville8BEdgeUI.ViewModels;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class MainWindowViewModelTests
{
    [Fact]
    public void Constructor_Sets_LoginViewModel_As_Current()
    {
        var vm = new MainWindowViewModel();
        Assert.NotNull(vm.CurrentViewModel);
        Assert.IsType<LoginViewModel>(vm.CurrentViewModel);
    }

    [Fact]
    public void Login_Admin_Updates_CurrentViewModel_To_AdminShell()
    {
        var vm = new MainWindowViewModel();
        var login = Assert.IsType<LoginViewModel>(vm.CurrentViewModel);
        login.Email = "admin";
        login.Password = "admin";
        login.LoginCommand.Execute(null);
        Assert.IsType<AdminShellViewModel>(vm.CurrentViewModel);
    }

    [Fact]
    public void Login_Teacher_Updates_CurrentViewModel_To_TeacherShell()
    {
        var vm = new MainWindowViewModel();
        var login = Assert.IsType<LoginViewModel>(vm.CurrentViewModel);
        login.Email = "teacher";
        login.Password = "teacher";
        login.LoginCommand.Execute(null);
        Assert.IsType<TeacherShellViewModel>(vm.CurrentViewModel);
    }

    [Fact]
    public void Invalid_Login_Does_Not_Navigate()
    {
        var vm = new MainWindowViewModel();
        var login = Assert.IsType<LoginViewModel>(vm.CurrentViewModel);
        login.Email = "wrong";
        login.Password = "creds";
        login.LoginCommand.Execute(null);
        Assert.IsType<LoginViewModel>(vm.CurrentViewModel);
    }

    [Fact]
    public void CurrentViewModel_Raises_PropertyChanged()
    {
        var vm = new MainWindowViewModel();
        string? changed = null;
        ((INotifyPropertyChanged)vm).PropertyChanged += (_, e) => changed = e.PropertyName;
        var login = Assert.IsType<LoginViewModel>(vm.CurrentViewModel);
        login.Email = "admin";
        login.Password = "admin";
        login.LoginCommand.Execute(null);
        Assert.Equal(nameof(MainWindowViewModel.CurrentViewModel), changed);
    }
}
