using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Security.Cryptography;
using System.Text;
using System;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateUserViewModel : ViewModelBase
{
    // Navigation callback to return to previous screen
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private string _fullName = string.Empty;
    [ObservableProperty] private string _username = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _phone = string.Empty;

    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private string _confirmPassword = string.Empty;
    [ObservableProperty] private string _generatedPassword = string.Empty;

    [ObservableProperty] private bool _requirePasswordReset = true;

    public ObservableCollection<string> Roles { get; } = new() { "Student", "Teacher", "Administrator" };
    public ObservableCollection<string> Statuses { get; } = new() { "Active", "Inactive" };
    public ObservableCollection<string> GradesOrDepartments { get; } = new() { "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Science", "Mathematics", "Admin" };

    [ObservableProperty] private string _selectedRole = "Student";
    [ObservableProperty] private string _selectedStatus = "Active";
    [ObservableProperty] private string _selectedGradeOrDepartment = "Grade 7";

    [ObservableProperty] private string _validationMessage = string.Empty;
    [ObservableProperty] private bool _hasValidationError;

    public bool CanSave => !HasValidationError && !string.IsNullOrWhiteSpace(FullName) &&
                           !string.IsNullOrWhiteSpace(Username) &&
                           !string.IsNullOrWhiteSpace(Email) &&
                           PasswordsMatch && PasswordStrengthOk;

    public bool PasswordsMatch => Password == ConfirmPassword && !string.IsNullOrEmpty(Password);
    public bool PasswordStrengthOk => Password.Length >= 8;

    partial void OnPasswordChanged(string value)
    {
        Validate();
        OnPropertyChanged(nameof(PasswordsMatch));
        OnPropertyChanged(nameof(PasswordStrengthOk));
        OnPropertyChanged(nameof(CanSave));
    }

    partial void OnConfirmPasswordChanged(string value)
    {
        Validate();
        OnPropertyChanged(nameof(PasswordsMatch));
        OnPropertyChanged(nameof(CanSave));
    }

    partial void OnFullNameChanged(string value) => OnPropertyChanged(nameof(CanSave));
    partial void OnUsernameChanged(string value) => OnPropertyChanged(nameof(CanSave));
    partial void OnEmailChanged(string value) => OnPropertyChanged(nameof(CanSave));

    private void Validate()
    {
        if (!PasswordsMatch)
        {
            ValidationMessage = "Passwords do not match.";
            HasValidationError = true;
        }
        else if (!PasswordStrengthOk)
        {
            ValidationMessage = "Password must be at least 8 characters.";
            HasValidationError = true;
        }
        else
        {
            ValidationMessage = string.Empty;
            HasValidationError = false;
        }

        OnPropertyChanged(nameof(CanSave));
    }

    [RelayCommand]
    private void GeneratePassword()
    {
        GeneratedPassword = GenerateSecurePassword();
        Password = GeneratedPassword;
        ConfirmPassword = GeneratedPassword;
    }

    private static string GenerateSecurePassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%^&*";
        var bytes = RandomNumberGenerator.GetBytes(16);
        var sb = new StringBuilder();
        foreach (var b in bytes)
        {
            sb.Append(chars[b % chars.Length]);
        }
        return sb.ToString();
    }

    [RelayCommand]
    private void SaveUser()
    {
        Validate();
        if (HasValidationError) return;
        // TODO: Persist user creation logic.
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }
}
