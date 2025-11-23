using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateTeacherViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    
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
    [ObservableProperty] private string _phoneNumber = string.Empty;

    // Dynamic dropdown properties
    [ObservableProperty] private Department? _selectedDepartment;
    [ObservableProperty] private Subject? _selectedSubject;

    // UI properties
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;

  

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);

    // Dynamic collections
    public ObservableCollection<Department> Departments { get; } = new();
    public ObservableCollection<Subject> Subjects { get; } = new();

    public CreateTeacherViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _ = LoadDepartmentsAsync();
    }

    private async Task LoadDepartmentsAsync()
    {
        try
        {
            var response = await _apiClient.GetDepartmentsAsync(page: 1, limit: 100);
            if (response?.Data != null)
            {
                Departments.Clear();
                foreach (var dept in response.Data)
                {
                    Departments.Add(dept);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading departments: {ex.Message}");
        }
    }

    partial void OnSelectedDepartmentChanged(Department? value)
    {
        if (value != null)
        {
            _ = LoadSubjectsForDepartmentAsync(value.Id);
        }
        else
        {
            Subjects.Clear();
            SelectedSubject = null;
        }
    }

    private async Task LoadSubjectsForDepartmentAsync(string departmentId)
    {
        try
        {
            var response = await _apiClient.GetSubjectsByDepartmentAsync(departmentId, page: 1, limit: 100);
            if (response?.Data != null)
            {
                Subjects.Clear();
                foreach (var subject in response.Data)
                {
                    Subjects.Add(subject);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading subjects: {ex.Message}");
        }
    }

    partial void OnBirthdayChanged(DateTimeOffset? value)
    {
        if (value.HasValue)
        {
            var today = DateTime.Today;
            var birthDate = value.Value.DateTime;
            
            int age = today.Year - birthDate.Year;
            
            // Adjust if birthday hasn't occurred this year yet
            if (birthDate.Date > today.AddYears(-age))
            {
                age--;
            }
            
            Age = age;
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

    [RelayCommand]
    private async Task SaveTeacher()
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

        try
        {
            IsLoading = true;

            // Create DTO
            var dto = new CreateTeacherDto
            {
                FirstName = FirstName.Trim(),
                LastName = LastName.Trim(),
                MiddleName = string.IsNullOrWhiteSpace(MiddleName) ? null : MiddleName.Trim(),
                Email = Email.Trim(),
                FullName = $"{FirstName.Trim()} {LastName.Trim()}",
                Birthday = Birthday.Value.ToString("yyyy-MM-dd"),
                Age = Age,
                SubjectSpecializationId = SelectedSubject?.Id,
                DepartmentId = SelectedDepartment?.Id,
                PhoneNumber = string.IsNullOrWhiteSpace(PhoneNumber) ? null : PhoneNumber.Trim(),
                Role = "Teacher",
                UserType = "teacher"
            };

            // Call API
            var response = await _apiClient.CreateTeacherAsync(dto);

            if (response?.Success == true)
            {
                // Show success toast notification
                _toastService?.Success(
                    $"Teacher '{FirstName} {LastName}' created successfully! You can create another teacher or click Cancel to go back.",
                    "Teacher Created",
                    expiration: TimeSpan.FromSeconds(5)
                );
                
                // Log activity
                await LogActivityAsync(
                    "teacher_created",
                    $"Created new teacher {FirstName} {LastName} ({Email})",
                    "teacher",
                    response.User?.Id ?? response.UserId
                );
                
                // Reset form for next teacher
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
                    errorMsg = response?.Message ?? "Failed to create teacher. Please try again.";
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
            System.Diagnostics.Debug.WriteLine($"Error creating teacher: {ex}");
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
        SelectedDepartment = null;
        SelectedSubject = null;
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
                "teacher_created" => "user_created",
                _ => actionType
            };

            // Map action types to icons and colors for activity feed rendering
            var (icon, color) = actionType switch
            {
                "teacher_created" => ("PersonAdd", "blue"),
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
                metadata = new { source = "desktop_app", module = "create_teacher", role = "teacher" }
            };
            
            // POST to API
            var success = await _apiClient.PostAsync("desktop-admin-dashboard/activities", activityData);

            if (!success)
            {
                System.Diagnostics.Debug.WriteLine("Teacher activity log request returned a non-success status code.");
            }
        }
        catch (ApiException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error logging teacher activity: {ex.Message}");
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
}