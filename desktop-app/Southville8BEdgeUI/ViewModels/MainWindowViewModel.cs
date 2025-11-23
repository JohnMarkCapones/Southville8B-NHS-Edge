using System;
using System.Collections.Generic;
using System.Linq;
using CommunityToolkit.Mvvm.ComponentModel;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI.Services;
using System.IdentityModel.Tokens.Jwt;

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

        // Fire-and-forget initialization for remember-me and auto-login
        InitializeAsync(loginVm);
        }

    private async void InitializeAsync(LoginViewModel loginVm)
    {
        try
        {
            var tokenStorage = ServiceLocator.Services.GetRequiredService<ITokenStorageService>();
            var preference = await tokenStorage.GetLoginPreferenceAsync();
            var rememberMe = preference.rememberMe;
            var savedEmail = preference.email;

            if (!string.IsNullOrWhiteSpace(savedEmail))
                loginVm.Email = savedEmail!;

            loginVm.RememberMe = rememberMe;

            if (!rememberMe)
                return;

            // If user opted to be remembered, try silent authentication
            var isAuthenticated = await _authService.IsAuthenticatedAsync();
            if (!isAuthenticated)
                return;

            var accessToken = await tokenStorage.GetAccessTokenAsync();
            if (string.IsNullOrEmpty(accessToken))
                return;

            var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
            apiClient.SetAccessToken(accessToken);

            // Decode JWT token to extract role and email for routing
            string? userRole = null;
            string? userEmail = savedEmail;
            string? userId = null;
            
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(accessToken);
                
                // Extract role
                userRole = jsonToken.Claims.FirstOrDefault(x => x.Type == "role" || x.Type == "user_role")?.Value;
                
                // Extract email
                if (string.IsNullOrWhiteSpace(userEmail))
                {
                    userEmail = jsonToken.Claims.FirstOrDefault(x => x.Type == "email" || x.Type == "user_email")?.Value;
                }
                
                // Extract user ID
                userId = jsonToken.Claims.FirstOrDefault(x => x.Type == "sub" || x.Type == "user_id")?.Value;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to decode JWT token: {ex.Message}");
                return; // Cannot proceed without role
            }

            if (string.IsNullOrWhiteSpace(userRole))
            {
                System.Diagnostics.Debug.WriteLine("No role found in token");
                return; // cannot route without role
            }

            var sseService = ServiceLocator.Services.GetRequiredService<ISseService>();
            var tokenSvc = tokenStorage;

            var userDto = new Models.Api.UserDto
            {
                Id = userId ?? string.Empty,
                Email = userEmail ?? string.Empty,
                FullName = userEmail ?? string.Empty,
                Role = userRole
            };

            switch (userRole?.ToLowerInvariant())
            {
                case "admin":
                    CurrentViewModel = new AdminShellViewModel(sseService, apiClient, tokenSvc, userDto, accessToken, true, vm => CurrentViewModel = vm);
                    break;
                case "teacher":
                    var toast = _toastService;
                    var dialog = _dialogService;
                    CurrentViewModel = new TeacherShellViewModel(sseService, apiClient, tokenSvc, toast, dialog, userDto, accessToken, true, true, vm => CurrentViewModel = vm);
                    break;
                default:
                    // Unknown role; stay on login
                    break;
            }
        }
        catch
        {
            // Non-fatal: if anything fails, remain on login screen
        }
    }
    }
}
