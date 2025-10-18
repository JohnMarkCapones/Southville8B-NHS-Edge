using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class BuildingWizardView : UserControl
{
    public BuildingWizardView()
    {
        InitializeComponent();
        
        if (Design.IsDesignMode)
        {
            DataContext = new BuildingWizardViewModel(null!); // design-time preview only
        }
    }
}
