using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class MyAnnouncementsView : UserControl
{
    public MyAnnouncementsView()
    {
        InitializeComponent();
        DataContext = new MyAnnouncementsViewModel();
    }
}