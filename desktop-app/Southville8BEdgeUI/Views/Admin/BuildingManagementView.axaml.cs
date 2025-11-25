using Avalonia;
using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class BuildingManagementView : UserControl
{
    public BuildingManagementView()
    {
        InitializeComponent();
        
        if (Design.IsDesignMode)
        {
            DataContext = new BuildingManagementViewModel(null!); // design-time preview only
        }
    }
}