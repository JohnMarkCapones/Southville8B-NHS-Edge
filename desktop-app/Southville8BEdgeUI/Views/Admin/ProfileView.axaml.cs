using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;  // Changed from Southville8BEdgeUI.Views

public partial class ProfileView : UserControl
{
    public ProfileView()
    {
        InitializeComponent();
        DataContext = new ProfileViewModel();
    }
}