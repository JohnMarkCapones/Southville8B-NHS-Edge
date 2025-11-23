using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class CreateStudentViewModel : ViewModelBase
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
    [ObservableProperty] private string _studentId = string.Empty;
    [ObservableProperty] private string _lrnId = string.Empty;
    [ObservableProperty] private DateTimeOffset? _birthday;
    [ObservableProperty] private string _gradeLevel = string.Empty;
    [ObservableProperty] private int _enrollmentYear = DateTime.Now.Year;
    [ObservableProperty] private string _honorStatus = string.Empty;
    [ObservableProperty] private int? _age;
    [ObservableProperty] private SectionDto? _selectedSection;

    // UI properties
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);

    // Sections
    public ObservableCollection<SectionDto> AvailableSections { get; } = new();

    // Options
    public ObservableCollection<string> GradeLevelOptions { get; } = new()
    {
        "Grade 7", "Grade 8", "Grade 9", "Grade 10"
    };

    public ObservableCollection<string> HonorStatusOptions { get; } = new()
    {
        "None", "With Honors", "High Honors", "Highest Honors"
    };

    public CreateStudentViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _ = LoadSectionsAsync();
    }

    private async Task LoadSectionsAsync()
    {
        try
        {
            var response = await _apiClient.GetSectionsAsync(100);
            if (response?.Data != null)
            {
                AvailableSections.Clear();
                foreach (var section in response.Data)
                {
                    AvailableSections.Add(section);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading sections: {ex.Message}");
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

    [RelayCommand]
    private async Task SaveStudent()
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

        if (string.IsNullOrWhiteSpace(StudentId))
        {
            ErrorMessage = "Student ID is required.";
            return;
        }

        if (string.IsNullOrWhiteSpace(LrnId))
        {
            ErrorMessage = "LRN ID is required.";
            return;
        }

        if (!Birthday.HasValue)
        {
            ErrorMessage = "Birthday is required.";
            return;
        }

        if (string.IsNullOrWhiteSpace(GradeLevel))
        {
            ErrorMessage = "Grade level is required.";
            return;
        }

        if (EnrollmentYear <= 0)
        {
            ErrorMessage = "Enrollment year is required.";
            return;
        }

        try
        {
            IsLoading = true;

            // Create DTO
            var dto = new CreateStudentDto
            {
                FirstName = FirstName.Trim(),
                LastName = LastName.Trim(),
                MiddleName = string.IsNullOrWhiteSpace(MiddleName) ? null : MiddleName.Trim(),
                StudentId = StudentId.Trim(),
                LrnId = LrnId.Trim(),
                Birthday = Birthday.Value.ToString("yyyy-MM-dd"),
                GradeLevel = GradeLevel,
                EnrollmentYear = EnrollmentYear,
                HonorStatus = string.IsNullOrWhiteSpace(HonorStatus) ? null : HonorStatus,
                Age = Age,
                SectionId = SelectedSection?.Id
            };

            // Create student record
            System.Diagnostics.Debug.WriteLine("Creating student record");
            
            var response = await _apiClient.CreateStudentAsync(dto);

            // Log API response (non-sensitive information only)
            if (response != null)
            {
                System.Diagnostics.Debug.WriteLine($"API response received - Success: {response.Success}");
                if (!response.Success && response.Errors != null && response.Errors.Count > 0)
                {
                    System.Diagnostics.Debug.WriteLine($"API errors: {response.Errors.Count} error(s)");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("API response is null");
            }

            if (response?.Success == true)
            {
                // Show success notification using injected service
                System.Diagnostics.Debug.WriteLine("Student creation successful");
                
                _toastService?.Success(
                    $"Student '{FirstName} {LastName}' created successfully! You can create another student or click Cancel to go back.",
                    "Student Created",
                    expiration: TimeSpan.FromSeconds(5)
                );
                
                // Log activity
                await LogActivityAsync(
                    "student_registered",
                    $"Registered new student {FirstName} {LastName} (LRN: {LrnId})",
                    "student",
                    response.User?.Id
                );
                
                // Reset form for next student
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
                    errorMsg = response?.Message ?? "Failed to create student. Please try again.";
                }
                
                // Show error notification
                ErrorMessage = errorMsg;
                _toastService?.Error(errorMsg, "Creation Failed", expiration: TimeSpan.FromSeconds(5));
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
            _toastService?.Error(ex.Message, "Error", expiration: TimeSpan.FromSeconds(5));
            System.Diagnostics.Debug.WriteLine($"Student creation failed: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }

    private void ResetForm()
    {
        // Clear all form fields
        FirstName = string.Empty;
        LastName = string.Empty;
        MiddleName = string.Empty;
        StudentId = string.Empty;
        LrnId = string.Empty;
        Birthday = null;
        GradeLevel = string.Empty;
        EnrollmentYear = DateTime.Now.Year;
        HonorStatus = string.Empty;
        Age = null;
        SelectedSection = null;
        
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
            
            // Map action types to icons and colors
            var (icon, color) = actionType switch
            {
                "student_registered" => ("UserPlus", "purple"),
                _ => ("Info", "gray")
            };
            
            // Create activity data
            var activityData = new
            {
                user_id = currentUserId,
                action_type = actionType,
                description = description,
                entity_type = entityType,
                entity_id = entityId,
                icon = icon,
                color = color,
                metadata = new { source = "desktop_app", module = "create_student" }
            };
            
            // POST to API
            await _apiClient.PostAsync("desktop-admin-dashboard/activities", activityData);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the main operation
            System.Diagnostics.Debug.WriteLine($"Error logging activity: {ex.Message}");
        }
    }
}