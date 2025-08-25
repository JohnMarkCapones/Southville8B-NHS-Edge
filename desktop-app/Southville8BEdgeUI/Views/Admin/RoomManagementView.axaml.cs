using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class RoomManagementView : UserControl
{
    public RoomManagementView()
    {
        InitializeComponent();
        DataContext = new RoomManagementViewModel();
    }
}