using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class EventDashboardView : UserControl
{
    public EventDashboardView()
    {
        InitializeComponent();
        DataContext = new EventDashboardViewModel();
    }
}