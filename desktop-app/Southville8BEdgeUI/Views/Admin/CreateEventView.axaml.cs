using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace Southville8BEdgeUI.Views.Admin;

public partial class CreateEventView : UserControl
{
    public CreateEventView()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}