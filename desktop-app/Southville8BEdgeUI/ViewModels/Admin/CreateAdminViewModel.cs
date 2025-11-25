using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateAdminViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    private static readonly Regex PhoneNumberRegex = new("^\\+?[1-9]\\d{1,14}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    
    // Navigation callbacks
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    // Form properties
    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _middleName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private DateTimeOffset? _birthday;
    [ObservableProperty] private int? _age;
    [ObservableProperty] private string _departmentId = string.Empty;
    [ObservableProperty] private string _phoneNumber = string.Empty;

    // UI properties
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);

    // Options
    public ObservableCollection<string> DepartmentOptions { get; } = new()
    {
        "Administration", "Academic Affairs", "Student Services", "IT", "Finance", "Human Resources"
    };

    public CreateAdminViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
    }

    [RelayCommand]
    private async Task SaveAdmin()
    {
        // Clear previous messages
        ErrorMessage = string.Empty;
        SuccessMessage = string.Empty;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(FirstName))
        {
            ErrorMessage = "First name is required.";
            return;
        }
        if (string.IsNullOrWhiteSpace(LastName))
        {
            ErrorMessage = "Last name is required.";
            return;
        }
        if (string.IsNullOrWhiteSpace(Email))
        {
            ErrorMessage = "Email is required.";
            return;
        }

        if (!Birthday.HasValue)
        {
            ErrorMessage = "Birthday is required.";
            return;
        }

        var trimmedFirstName = FirstName.Trim();
        var trimmedLastName = LastName.Trim();
        var trimmedMiddleName = string.IsNullOrWhiteSpace(MiddleName) ? null : MiddleName.Trim();
        var trimmedEmail = Email.Trim();

        var fullName = string.Join(" ", new[] { trimmedFirstName, trimmedMiddleName, trimmedLastName }
            .Where(part => !string.IsNullOrWhiteSpace(part)));

        if (fullName.Length < 2)
        {
            ErrorMessage = "Full name must be at least 2 characters.";
            return;
        }

        string? trimmedPhone = null;
        if (!string.IsNullOrWhiteSpace(PhoneNumber))
        {
            trimmedPhone = PhoneNumber.Trim();
            if (trimmedPhone.Length < 10 || trimmedPhone.Length > 15 || !PhoneNumberRegex.IsMatch(trimmedPhone))
            {
                ErrorMessage = "Phone number must use international format (e.g., +639171234567).";
                return;
            }
        }

        var roleDescription = string.IsNullOrWhiteSpace(DepartmentId) ? null : DepartmentId.Trim();

        try
        {
            IsLoading = true;

            // Create DTO
            var dto = new Models.Api.CreateAdminDto
            {
                Email = trimmedEmail,
                FullName = fullName,
                Birthday = Birthday.Value.ToString("yyyy-MM-dd"),
                Role = "Admin",
                UserType = "admin",
                RoleDescription = roleDescription,
                PhoneNumber = trimmedPhone
            };

            // Call API
            var response = await _apiClient.CreateAdminAsync(dto);

            if (response?.Success == true)
            {
                // Show success toast notification
                _toastService?.Success(
                    $"Admin '{FirstName} {LastName}' created successfully! You can create another admin or click Cancel to go back.",
                    "Admin Created",
                    expiration: TimeSpan.FromSeconds(5)
                );
                
                // Log activity
                await LogActivityAsync(
                    "admin_created",
                    $"Created new admin {FirstName} {LastName} ({Email})",
                    "admin",
                    response.User?.Id ?? response.UserId
                );
                
                // Reset form for next admin
                ResetForm();
            }
            else
            {
                // Handle API errors
                string errorMsg;
                if (response?.Errors != null && response.Errors.Count > 0)
                {
                    errorMsg = string.Join(", ", response.Errors);
                }
                else
                {
                    errorMsg = response?.Message ?? "Failed to create admin. Please try again.";
                }
                
                // Show both in-form error and toast
                ErrorMessage = errorMsg;
                _toastService?.Error(errorMsg, "Creation Failed", expiration: TimeSpan.FromSeconds(5));
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
            _toastService?.Error(ex.Message, "Error", expiration: TimeSpan.FromSeconds(5));
            System.Diagnostics.Debug.WriteLine($"Error creating admin: {ex}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void ResetForm()
    {
        // Clear all form fields
        FirstName = string.Empty;
        LastName = string.Empty;
        MiddleName = string.Empty;
        Email = string.Empty;
        Birthday = null;
        Age = null;
        DepartmentId = string.Empty;
        PhoneNumber = string.Empty;
        
        // Clear messages
        ErrorMessage = string.Empty;
        SuccessMessage = string.Empty;
    }

    private async Task LogActivityAsync(string actionType, string description, string? entityType = null, string? entityId = null)
    {
        try
        {
            // Get current user ID
            var currentUserId = _apiClient.GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
                return;
            
            // Map custom action types to backend-supported values
            var resolvedActionType = actionType switch
            {
                "admin_created" => "user_created",
                _ => actionType
            };

            // Map action types to icons and colors for activity feed rendering
            var (icon, color) = actionType switch
            {
                "admin_created" => ("ShieldPerson", "red"),
                _ => ("Info", "gray")
            };
            
            // Create activity data
            var activityData = new
            {
                user_id = currentUserId,
                action_type = resolvedActionType,
                description = description,
                entity_type = entityType,
                entity_id = entityId,
                icon = icon,
                color = color,
                metadata = new { source = "desktop_app", module = "create_admin", role = "admin" }
            };
            
            // POST to API
            var success = await _apiClient.PostAsync("desktop-admin-dashboard/activities", activityData);

            if (!success)
            {
                System.Diagnostics.Debug.WriteLine("Admin activity log request returned a non-success status code.");
            }
        }
        catch (ApiException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error logging admin activity: {ex.Message}");
        }
        catch (Exception ex)
        {
            // Log error but don't fail the main operation
            System.Diagnostics.Debug.WriteLine($"Error logging activity: {ex.Message}");
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }

    partial void OnBirthdayChanged(DateTimeOffset? value)
    {
        if (value.HasValue)
        {
            var today = DateTime.Today;
            var birthDate = value.Value.Date;

            var calculatedAge = today.Year - birthDate.Year;
            if (birthDate > today.AddYears(-calculatedAge))
            {
                calculatedAge--;
            }

            Age = Math.Max(calculatedAge, 0);
        }
        else
        {
            Age = null;
        }
    }

    partial void OnErrorMessageChanged(string value)
    {
        OnPropertyChanged(nameof(HasError));
    }

    partial void OnSuccessMessageChanged(string value)
    {
        OnPropertyChanged(nameof(HasSuccess));
    }
}