using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class NotificationsView : UserControl
{
    public NotificationsView()
    {
        InitializeComponent();
        DataContext = new NotificationsViewModel();
    }
}