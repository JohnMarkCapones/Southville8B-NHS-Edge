using CommunityToolkit.Mvvm.ComponentModel;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ELibraryManagementViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _title = "E-Library Management";

    public ELibraryManagementViewModel()
    {
        // Initialize e-library management
    }
}