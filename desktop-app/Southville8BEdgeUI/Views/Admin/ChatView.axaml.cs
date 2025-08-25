using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class ChatView : UserControl
{
    public ChatView()
    {
        InitializeComponent();
        DataContext = new ChatViewModel();
    }
}