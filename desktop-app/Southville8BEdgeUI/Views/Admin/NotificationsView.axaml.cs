using Avalonia.Controls;
using System.Windows.Input;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class NotificationsView : UserControl
{
    // Forward commands for template bindings
    public ICommand? MarkAsReadCommand => (DataContext as NotificationsViewModel)?.MarkAsReadCommand;
    public ICommand? DeleteNotificationCommand => (DataContext as NotificationsViewModel)?.DeleteNotificationCommand;
    public ICommand? MarkAllAsReadCommand => (DataContext as NotificationsViewModel)?.MarkAllAsReadCommand;
    public ICommand? ClearAllCommand => (DataContext as NotificationsViewModel)?.ClearAllCommand;

    public NotificationsView()
    {
        InitializeComponent();
        DataContext = new NotificationsViewModel();
        DataContextChanged += (_, _) =>
        {
            // Force reevaluation of ElementName bindings if required (no-op)
        };
    }
}