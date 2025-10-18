using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class BuildingCardView : UserControl
{
    public BuildingCardView()
    {
        InitializeComponent();
        
        if (Design.IsDesignMode)
        {
            DataContext = new BuildingCardViewModel(null!); // design-time preview only
        }
    }
}
