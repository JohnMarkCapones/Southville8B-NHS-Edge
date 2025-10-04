using System;
using System.ComponentModel;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless.XUnit;
using Southville8BEdgeUI.ViewModels;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TitleBarViewModelTests
{
    private TitleBarViewModel CreateVm() => new();

    [AvaloniaFact]
    public void SetWindow_Initializes_Title_And_IsMaximized()
    {
        var vm = CreateVm();
        var win = new Window { Title = "Test", WindowState = WindowState.Normal };
        win.Show(); // ensure platform state changes are supported
        vm.SetWindow(win);
        Assert.Equal("Test", vm.Title);
        Assert.False(vm.IsMaximized);
        win.WindowState = WindowState.Maximized;
        Assert.True(vm.IsMaximized);
    }

    [AvaloniaFact]
    public void WindowState_Change_Raises_IsMaximized_PropertyChanged()
    {
        var vm = CreateVm();
        var win = new Window();
        win.Show();
        vm.SetWindow(win);
        string? changed = null;
        ((INotifyPropertyChanged)vm).PropertyChanged += (_, e) => changed = e.PropertyName;
        win.WindowState = WindowState.Maximized;
        Assert.Equal(nameof(TitleBarViewModel.IsMaximized), changed);
        Assert.True(vm.IsMaximized);
        win.WindowState = WindowState.Normal;
        Assert.False(vm.IsMaximized);
    }

    [AvaloniaFact]
    public void MaximizeRestoreCommand_Toggles_State()
    {
        var vm = CreateVm();
        var win = new Window();
        win.Show();
        vm.SetWindow(win);
        Assert.Equal(WindowState.Normal, win.WindowState);
        vm.MaximizeRestoreCommand.Execute(null);
        Assert.Equal(WindowState.Maximized, win.WindowState);
        vm.MaximizeRestoreCommand.Execute(null);
        Assert.Equal(WindowState.Normal, win.WindowState);
    }

    [AvaloniaFact]
    public async Task MinimizeCommand_Minimizes_Window()
    {
        var vm = CreateVm();
        var win = new Window();
        win.Show();
        vm.SetWindow(win);
        await vm.MinimizeCommand.ExecuteAsync(null);
        Assert.Equal(WindowState.Minimized, win.WindowState);
        Assert.Equal(1, win.Opacity); // opacity reset
    }

    [AvaloniaFact]
    public void CloseCommand_Closes_Window()
    {
        var vm = CreateVm();
        var win = new Window();
        win.Show();
        bool closed = false;
        win.Closed += (_, _) => closed = true;
        vm.SetWindow(win);
        vm.CloseCommand.Execute(null);
        Assert.True(closed);
    }

    [AvaloniaFact]
    public void SetWindow_Replaces_Previous_And_Unsubscribes()
    {
        var vm = CreateVm();
        var w1 = new Window();
        var w2 = new Window();
        w1.Show();
        w2.Show();
        vm.SetWindow(w1);
        vm.SetWindow(w2); // replace
        w1.WindowState = WindowState.Maximized; // should NOT update vm
        Assert.False(vm.IsMaximized);
        w2.WindowState = WindowState.Maximized; // now should update
        Assert.True(vm.IsMaximized);
    }
}
