using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class SchedulePlannerView : UserControl
{
    public SchedulePlannerView()
    {
        InitializeComponent();
        DataContext = new SchedulePlannerViewModel();
    }
}