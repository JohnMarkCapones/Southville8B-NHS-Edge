using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class NewAnnouncementView : UserControl
{
    public NewAnnouncementView()
    {
        InitializeComponent();
        if (Design.IsDesignMode)
        {
            DataContext = new MyAnnouncementsViewModel();
        }
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}