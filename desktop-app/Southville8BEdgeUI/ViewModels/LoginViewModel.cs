using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Diagnostics;

namespace Southville8BEdgeUI.ViewModels;

public partial class LoginViewModel : ViewModelBase
{
    [ObservableProperty]
    private string? _email;

    [ObservableProperty]
    private string? _password;

    [ObservableProperty]
    private bool _rememberMe;

    [ObservableProperty]
    private bool _showPassword; // controls password masking

    // This action can be set by the parent view model to handle navigation.
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [RelayCommand]
    private void Login()
    {
        // In a real application, you would validate the email and password.
        // Based on the user's role, you would navigate to the appropriate shell.
        // For this example, we will navigate to the Admin view upon any login attempt.
        if (!string.IsNullOrEmpty(Email) && !string.IsNullOrEmpty(Password))
        {
            if (Email == "admin" && Password == "admin")
            {
                NavigateTo?.Invoke(new AdminShellViewModel());
            }
            else if (Email == "teacher" && Password == "teacher")
            {
                NavigateTo?.Invoke(new TeacherShellViewModel());
            }
            else
            {
                // Handle invalid login attempt (e.g., show an error message)
                Debug.WriteLine("Invalid email or password.");
            }
        }
    }

    [RelayCommand]
    private void ForgotPassword()
    {
        // Logic for the forgot password flow
    }
}