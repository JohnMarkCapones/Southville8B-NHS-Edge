using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class CreateEventView : UserControl
{
    public CreateEventView()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        
        if (DataContext is CreateEventViewModel viewModel)
        {
            var topLevel = TopLevel.GetTopLevel(this);
            if (topLevel != null)
            {
                viewModel.SetTopLevel(topLevel);
            }
        }
    }
}