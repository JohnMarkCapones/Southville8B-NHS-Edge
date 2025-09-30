using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace Southville8BEdgeUI.Views.Admin;

public partial class ImportUsersView : UserControl
{
    public ImportUsersView()
    {
        InitializeComponent();
    }

    private void InitializeComponent() => AvaloniaXamlLoader.Load(this);
}