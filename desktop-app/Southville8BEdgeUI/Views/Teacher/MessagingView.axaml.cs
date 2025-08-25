using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class MessagingView : UserControl
{
    public MessagingView()
    {
        InitializeComponent();
        DataContext = new MessagingViewModel();
    }
}