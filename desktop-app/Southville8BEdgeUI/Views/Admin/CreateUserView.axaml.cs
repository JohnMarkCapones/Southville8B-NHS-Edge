using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Input;
using Avalonia.LogicalTree;
using Avalonia.VisualTree;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class CreateUserView : UserControl
{
    public CreateUserView()
    {
        InitializeComponent();
        this.Loaded += OnLoaded;
    }

    private void OnLoaded(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        // Set initial selection to first card
        if (DataContext is CreateUserViewModel viewModel)
        {
            var itemsControl = this.FindDescendantOfType<ItemsControl>();
            if (itemsControl != null)
            {
                // Use GetLogicalChildren from LogicalExtensions
                var firstPresenter = itemsControl.GetLogicalChildren().OfType<ContentPresenter>().FirstOrDefault();
                if (firstPresenter != null)
                {
                    var cardBorder = firstPresenter.FindDescendantOfType<Border>();
                    if (cardBorder != null && cardBorder.Classes != null)
                    {
                        cardBorder.Classes.Add("selected");
                    }
                }
            }
        }
    }

    private void OnRoleCardTapped(object? sender, TappedEventArgs e)
    {
        if (sender is Border border && 
            border.DataContext is RoleOption roleOption && 
            DataContext is CreateUserViewModel viewModel)
        {
            // Remove selected class from all role cards
            var itemsControl = border.FindAncestorOfType<ItemsControl>();
            if (itemsControl != null)
            {
                // Use GetLogicalChildren from LogicalExtensions
                foreach (var item in itemsControl.GetLogicalChildren())
                {
                    if (item is ContentPresenter presenter)
                    {
                        var cardBorder = presenter.FindDescendantOfType<Border>();
                        if (cardBorder != null && cardBorder.Classes != null)
                        {
                            cardBorder.Classes.Remove("selected");
                        }
                    }
                }
            }

            // Add selected class to clicked card
            border.Classes.Add("selected");
            
            // Update selected role
            viewModel.SelectedRole = roleOption.Value;
        }
    }
}