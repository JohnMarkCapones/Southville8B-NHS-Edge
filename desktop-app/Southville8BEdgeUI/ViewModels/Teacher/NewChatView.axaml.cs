using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class NewChatView : UserControl
{
    public NewChatView()
    {
        InitializeComponent();
        if (Design.IsDesignMode)
        {
            DataContext = new NewChatViewModel();
        }
    }

    private void InitializeComponent() => AvaloniaXamlLoader.Load(this);
}