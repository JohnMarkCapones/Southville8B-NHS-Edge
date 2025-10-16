using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels;

public partial class LoginViewModel : ViewModelBase
{
    private readonly IAuthService _authService;
    private readonly IToastService _toastService;
    private readonly IRoleValidationService _roleValidationService;

    [ObservableProperty]
    private string? _email;

    [ObservableProperty]
    private string? _password;

    [ObservableProperty]
    private bool _rememberMe;

    [ObservableProperty]
    private bool _showPassword; // controls password masking

    [ObservableProperty]
    private bool _isLoading;

    // This action can be set by the parent view model to handle navigation.
    public Action<ViewModelBase>? NavigateTo { get; set; }

    public LoginViewModel(IAuthService authService, IToastService toastService, IRoleValidationService roleValidationService)
    {
        _authService = authService;
        _toastService = toastService;
        _roleValidationService = roleValidationService;
    }

    [RelayCommand]
    private async Task Login()
    {
        System.Diagnostics.Debug.WriteLine($"=== LoginViewModel.Login ===");
        System.Diagnostics.Debug.WriteLine($"Email: {Email}");
        System.Diagnostics.Debug.WriteLine($"Password: [HIDDEN]");

        if (string.IsNullOrEmpty(Email) || string.IsNullOrEmpty(Password))
        {
            System.Diagnostics.Debug.WriteLine("Login failed: Missing email or password");
            _toastService.Warning("Please enter both email and password.");
            return;
        }

        try
        {
            IsLoading = true;
            System.Diagnostics.Debug.WriteLine("Starting login process...");

            var response = await _authService.LoginAsync(Email, Password);

            if (response?.Success == true && response.User != null)
            {
                var role = response.User.Role;
                
                // Check if role is allowed to access desktop app
                if (!_roleValidationService.IsRoleAllowed(role))
                {
                    // Block access for unauthorized roles (like students)
                    await _authService.LogoutAsync(); // Clear tokens
                    _toastService.Error(
                        _roleValidationService.GetAccessDeniedMessage(role),
                        expiration: TimeSpan.FromSeconds(5)
                    );
                    // Clear password for security
                    Password = string.Empty;
                    return;
                }

                _toastService.Success($"Welcome back, {response.User.Email}!");

                // Navigate based on user role
                var roleLower = role?.ToLowerInvariant();
                switch (roleLower)
                {
                    case "admin":
                        NavigateTo?.Invoke(new AdminShellViewModel());
                        break;
                    case "teacher":
                        NavigateTo?.Invoke(new TeacherShellViewModel());
                        break;
                    default:
                        _toastService.Warning($"Unknown role: {response.User.Role}");
                        break;
                }
            }
            else
            {
                var errorMessage = response?.Message ?? "Login failed. Please check your credentials.";
                _toastService.Error(errorMessage);
            }
        }
        catch (UnauthorizedException)
        {
            _toastService.Error("Invalid email or password. Please try again.");
        }
        catch (TooManyRequestsException)
        {
            _toastService.Warning("Too many login attempts. Please wait before trying again.");
        }
        catch (ServerException)
        {
            _toastService.Error("Server error occurred. Please try again later.");
        }
        catch (ApiException ex)
        {
            _toastService.Error($"Login failed: {ex.Message}");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Unexpected login error: {ex.Message}");
            _toastService.Error("An unexpected error occurred. Please try again.");
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void ForgotPassword()
    {
        // Logic for the forgot password flow
        _toastService.Info("Forgot password functionality not yet implemented.");
    }
}