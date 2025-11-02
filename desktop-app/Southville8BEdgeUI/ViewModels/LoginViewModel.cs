using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels;

public partial class LoginViewModel : ViewModelBase
{
    private readonly IAuthService _authService;
    private readonly IToastService _toastService;
    private readonly IRoleValidationService _roleValidationService;
    private readonly IDialogService _dialogService;

    [ObservableProperty]
    private string _email = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    [ObservableProperty]
    private bool _rememberMe = false;

    [ObservableProperty]
    private bool _showPassword = false; // controls password masking

    [ObservableProperty]
    private bool _isLoading = false;

    [ObservableProperty]
    private string? _errorMessage;

    [ObservableProperty]
    private bool _hasError = false;

    // This action can be set by the parent view model to handle navigation.
    public Action<ViewModelBase>? NavigateTo { get; set; }

    public LoginViewModel(IAuthService authService, IToastService toastService, IRoleValidationService roleValidationService, IDialogService dialogService)
    {
        _authService = authService;
        _dialogService = dialogService;
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
            SetError("Please enter both email and password.");
            IsLoading = false; // Ensure loading state is reset
            return;
        }

        try
        {
            IsLoading = true;
            System.Diagnostics.Debug.WriteLine($"IsLoading set to: {IsLoading}");
            ClearError(); // Clear any previous errors
            System.Diagnostics.Debug.WriteLine("Starting login process...");

            var response = await _authService.LoginAsync(Email, Password, RememberMe);

            if (response?.Success == true && response.User != null)
            {
                var role = response.User.Role;
                
                // Check if role is allowed to access desktop app
                if (!_roleValidationService.IsRoleAllowed(role ?? ""))
                {
                    // Block access for unauthorized roles (like students)
                    await _authService.LogoutAsync(); // Clear tokens
                    _toastService.Error(
                        _roleValidationService.GetAccessDeniedMessage(role ?? "Unknown"),
                        expiration: TimeSpan.FromSeconds(5)
                    );
                    // Clear password for security
                    Password = string.Empty;
                    return;
                }

                _toastService.Success($"Welcome back, {response.User.Email}!");

                // Convert LoginUserDto to UserDto for shell ViewModels
                var userDto = ConvertLoginUserToUserDto(response.User);

                // Navigate based on user role
                var roleLower = role?.ToLowerInvariant() ?? "";
                switch (roleLower)
                {
                case "admin":
                    System.Diagnostics.Debug.WriteLine("=== CREATING ADMIN SHELL ===");
                    var sseService = ServiceLocator.Services.GetRequiredService<ISseService>();
                    var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
                    var tokenStorage = ServiceLocator.Services.GetRequiredService<ITokenStorageService>();
                    var accessToken = response.Session?.AccessToken ?? string.Empty;
                    
                    // Set the access token on the API client
                    apiClient.SetAccessToken(accessToken);
                    
                    var adminShell = new AdminShellViewModel(sseService, apiClient, tokenStorage, userDto, accessToken, true, NavigateTo);
                    System.Diagnostics.Debug.WriteLine($"AdminShellViewModel created: {adminShell != null}");
                    System.Diagnostics.Debug.WriteLine($"LoginViewModel.NavigateTo is null: {NavigateTo == null}");
                    System.Diagnostics.Debug.WriteLine($"About to invoke NavigateTo with AdminShellViewModel");
                    
                    NavigateTo?.Invoke(adminShell);
                    System.Diagnostics.Debug.WriteLine("Navigation to AdminShell completed");
                    break;
                case "teacher":
                    var teacherSseService = ServiceLocator.Services.GetRequiredService<ISseService>();
                    var teacherApiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
                    var teacherTokenStorage = ServiceLocator.Services.GetRequiredService<ITokenStorageService>();
                    var teacherAccessToken = response.Session?.AccessToken ?? string.Empty;
                    
                    // Set the access token on the API client
                    teacherApiClient.SetAccessToken(teacherAccessToken);
                    
                    var teacherShell = new TeacherShellViewModel(teacherSseService, teacherApiClient, teacherTokenStorage, _toastService, _dialogService, userDto, teacherAccessToken, true, true, NavigateTo);
                    NavigateTo?.Invoke(teacherShell);
                    break;
                    default:
                        _toastService.Warning($"Unknown role: {response.User.Role}");
                        break;
                }
            }
            else
            {
                var errorMessage = response?.Message ?? "Login failed. Please check your credentials.";
                SetError(errorMessage);
            }
        }
        catch (UnauthorizedException ex)
        {
            SetError(ex.Message);
        }
        catch (TooManyRequestsException ex)
        {
            SetError(ex.Message);
        }
        catch (ServerException ex)
        {
            SetError(ex.Message);
        }
        catch (BadRequestException ex)
        {
            // Provide more user-friendly error messages for common validation errors
            var errorMessage = ex.Message;
            if (errorMessage.Contains("valid email address"))
            {
                errorMessage = "Please enter a valid email address.";
            }
            else if (errorMessage.Contains("password"))
            {
                errorMessage = "Please check your password and try again.";
            }
            else if (errorMessage.Contains("required"))
            {
                errorMessage = "Please fill in all required fields.";
            }
            
            SetError(errorMessage);
        }
        catch (ApiException ex)
        {
            SetError(ex.Message);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Unexpected login error: {ex.Message}");
            SetError("An unexpected error occurred. Please try again.");
        }
        finally
        {
            IsLoading = false;
            System.Diagnostics.Debug.WriteLine($"IsLoading set to: {IsLoading}");
        }
    }

    [RelayCommand]
    private async Task ForgotPassword()
    {
        // First, ask user to select their role
        var roleChoice = await _dialogService.ShowChoiceDialogAsync(
            "Forgot Password",
            "Please select your role to proceed with password reset:",
            "I'm an Admin",
            "I'm a Teacher"
        );

        if (string.IsNullOrWhiteSpace(roleChoice))
        {
            return; // User cancelled
        }

        // If teacher, show contact admin instructions
        if (roleChoice == "I'm a Teacher")
        {
            await _dialogService.ShowInfoAsync(
                "Forgot Password",
                new Dictionary<string, string>
                {
                    { "Instructions", "To reset your password, please contact your system administrator." }
                }
            );
            return;
        }

        // If admin, proceed with email input
        var email = await _dialogService.ShowInputDialogAsync(
            "Forgot Password",
            "Enter your admin email address to receive a password reset link.",
            "admin@example.com",
            Email // Pre-fill with email from login form if available
        );

        if (string.IsNullOrWhiteSpace(email))
        {
            return; // User cancelled
        }

        // Validate email format
        if (!email.Contains("@") || !email.Contains("."))
        {
            _toastService.Error("Please enter a valid email address.", "Invalid Email");
            return;
        }

        try
        {
            IsLoading = true;
            ClearError();

            // Get API client from service locator
            var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
            
            var response = await apiClient.SendPasswordResetEmailAsync(email);

            if (response != null && !string.IsNullOrEmpty(response.Message))
            {
                await _dialogService.ShowInfoAsync(
                    "Password Reset",
                    new Dictionary<string, string>
                    {
                        { "Status", response.Message }
                    }
                );
            }
            else
            {
                _toastService.Error("Failed to send password reset email. Please try again.", "Error");
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error in forgot password: {ex.Message}");
            _toastService.Error("An error occurred while sending the password reset email.", "Error");
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void FillAdminCredentials()
    {
        Email = "superadmin@gmail.com";
        Password = "skadoosh";
        ClearError();
    }

    [RelayCommand]
    private void FillTeacherCredentials()
    {
        Email = "johnmarkcapones93@gmail.com";
        Password = "Skadoosh#123456789";
        ClearError();
    }

    private void SetError(string message)
    {
        ErrorMessage = message;
        HasError = true;
    }

    private void ClearError()
    {
        ErrorMessage = null;
        HasError = false;
    }

    private UserDto ConvertLoginUserToUserDto(LoginUserDto loginUser)
    {
        return new UserDto
        {
            Id = loginUser.Id,
            Email = loginUser.Email,
            FullName = loginUser.Email, // Login API doesn't provide full name, use email as fallback
            Role = new RoleDto { Name = loginUser.Role }, // Convert string role to RoleDto
            Status = "Active", // Assume active for login
            CreatedAt = loginUser.CreatedAt,
            EmailConfirmedAt = loginUser.EmailConfirmedAt,
            UserMetadata = loginUser.UserMetadata
        };
    }
}