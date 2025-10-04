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
            DataContext = new NewAnnouncementViewModel
            {
                Title = "Sample Announcement",
                TargetClass = "Grade 8A",
                Priority = "Normal",
                Content = "This is a sample announcement for design-time preview.",
                PostImmediately = true
            };
        }
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}