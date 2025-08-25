using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class GradeEntryView : UserControl
{
    public GradeEntryView()
    {
        InitializeComponent();
        DataContext = new GradeEntryViewModel();
    }
}