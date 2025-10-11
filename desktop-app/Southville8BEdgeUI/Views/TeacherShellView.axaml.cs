using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.VisualTree;
using System;
using System.Windows.Input;

namespace Southville8BEdgeUI.Views;

public partial class TeacherShellView : UserControl
{
    private WindowBase? _window;

    public TeacherShellView()
    {
        InitializeComponent();
        AttachedToVisualTree += OnAttachedToVisualTree;
        DetachedFromVisualTree += OnDetachedFromVisualTree;
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    private void OnAttachedToVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        _window = this.GetVisualRoot() as WindowBase;
        if (_window is not null)
        {
            _window.Deactivated += OnWindowDeactivated;
        }
    }

    private void OnDetachedFromVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        if (_window is not null)
        {
            _window.Deactivated -= OnWindowDeactivated;
            _window = null;
        }
    }

    private void OnWindowDeactivated(object? sender, EventArgs e)
    {
        CloseUserDropdown();
    }

    private void CloseUserDropdown()
    {
        var dc = DataContext;
        if (dc is null) return;

        var prop = dc.GetType().GetProperty("IsUserDropdownVisible");
        if (prop?.CanWrite == true)
        {
            prop.SetValue(dc, false);
        }

        var cmdProp = dc.GetType().GetProperty("CloseUserDropdownCommand");
        if (cmdProp?.GetValue(dc) is ICommand cmd && cmd.CanExecute(null))
        {
            cmd.Execute(null);
        }
    }
}