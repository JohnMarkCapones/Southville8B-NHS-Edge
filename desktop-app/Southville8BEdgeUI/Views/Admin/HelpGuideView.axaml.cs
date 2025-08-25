using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class HelpGuideView : UserControl
{
    public HelpGuideView()
    {
        InitializeComponent();
        DataContext = new HelpGuideViewModel();
    }
}