using Avalonia.Controls;
using Southville8BEdgeUI.ViewModels;

namespace Southville8BEdgeUI.Views;

public partial class TermsAndConditionsView : UserControl
{
    public TermsAndConditionsView()
    {
        InitializeComponent();
    }

    public TermsAndConditionsView(TermsAndConditionsViewModel viewModel) : this()
    {
        DataContext = viewModel;
    }
}

