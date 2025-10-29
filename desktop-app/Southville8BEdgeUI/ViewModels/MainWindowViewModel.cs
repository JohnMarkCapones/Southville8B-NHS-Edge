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
        private readonly IDialogService _dialogService;

        [ObservableProperty]
        private ViewModelBase _currentViewModel;

        partial void OnCurrentViewModelChanged(ViewModelBase value)
        {
            System.Diagnostics.Debug.WriteLine($"=== MAIN WINDOW NAVIGATION ===");
            System.Diagnostics.Debug.WriteLine($"CurrentViewModel changed to: {value?.GetType().Name ?? "null"}");
        }

        public MainWindowViewModel(IAuthService authService, IToastService toastService, IRoleValidationService roleValidationService, IDialogService dialogService)
        {
            _authService = authService;
            _toastService = toastService;
            _dialogService = dialogService;
            _roleValidationService = roleValidationService;

            // Start with the LoginViewModel
            var loginVm = new LoginViewModel(_authService, _toastService, _roleValidationService, _dialogService);
            loginVm.NavigateTo = (viewModel) => CurrentViewModel = viewModel;
            _currentViewModel = loginVm;
        }
    }
}
