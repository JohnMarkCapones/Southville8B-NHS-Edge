using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class ProfileView : UserControl
{
    public ProfileView()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}
