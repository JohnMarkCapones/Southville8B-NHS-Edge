using CommunityToolkit.Mvvm.ComponentModel;

namespace Southville8BEdgeUI.ViewModels
{
    public partial class MainWindowViewModel : ViewModelBase
    {
        [ObservableProperty]
        private ViewModelBase _currentViewModel;

        public MainWindowViewModel()
        {
            // Start with the LoginViewModel
            var loginVm = new LoginViewModel();
            loginVm.NavigateTo = (viewModel) => CurrentViewModel = viewModel;
            _currentViewModel = loginVm;
        }
    }
}
