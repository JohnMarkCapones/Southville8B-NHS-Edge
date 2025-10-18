using System;
using System.Collections.Generic;
using CommunityToolkit.Mvvm.ComponentModel;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels
{
    public partial class MainWindowViewModel : ViewModelBase
    {
        private readonly IAuthService _authService;
        private readonly IToastService _toastService;
        private readonly IRoleValidationService _roleValidationService;

        [ObservableProperty]
        private ViewModelBase _currentViewModel;

        public MainWindowViewModel(IAuthService authService, IToastService toastService, IRoleValidationService roleValidationService)
        {
            _authService = authService;
            _toastService = toastService;
            _roleValidationService = roleValidationService;

            // Start with the LoginViewModel
            var loginVm = new LoginViewModel(_authService, _toastService, _roleValidationService);
            loginVm.NavigateTo = (viewModel) => CurrentViewModel = viewModel;
            _currentViewModel = loginVm;
        }
    }
}
