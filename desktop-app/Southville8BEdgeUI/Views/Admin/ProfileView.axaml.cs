using Avalonia;
using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class ProfileView : UserControl
{
    public ProfileView()
    {
        InitializeComponent();
        
        // Only create a design-time VM so runtime shell can inject one with navigation delegates
        if (Design.IsDesignMode)
        {
            DataContext = new ProfileViewModel();
        }
    }
}