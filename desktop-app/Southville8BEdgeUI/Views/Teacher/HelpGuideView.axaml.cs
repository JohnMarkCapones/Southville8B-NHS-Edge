using Avalonia.Controls;
using Avalonia.Interactivity;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class HelpGuideView : UserControl
{
    public HelpGuideView()
    {
        InitializeComponent();
    }

    private void CategoryButton_Click(object? sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.DataContext is HelpCategoryViewModel category)
        {
            if (DataContext is HelpGuideViewModel vm)
            {
                vm.SelectedCategory = category;
            }
        }
    }
}

