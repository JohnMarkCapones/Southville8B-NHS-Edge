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

            // 🔍 DETAILED LOGGING - Log the DTO being sent to API
            System.Diagnostics.Debug.WriteLine("=== STUDENT CREATION DATA ===");
            System.Diagnostics.Debug.WriteLine($"First Name: '{dto.FirstName}'");
            System.Diagnostics.Debug.WriteLine($"Last Name: '{dto.LastName}'");
            System.Diagnostics.Debug.WriteLine($"Middle Name: '{dto.MiddleName ?? "NULL"}'");
            System.Diagnostics.Debug.WriteLine($"Student ID: '{dto.StudentId}'");
            System.Diagnostics.Debug.WriteLine($"LRN ID: '{dto.LrnId}'");
            System.Diagnostics.Debug.WriteLine($"Birthday: '{dto.Birthday}'");
            System.Diagnostics.Debug.WriteLine($"Grade Level: '{dto.GradeLevel}'");
            System.Diagnostics.Debug.WriteLine($"Enrollment Year: {dto.EnrollmentYear}");
            System.Diagnostics.Debug.WriteLine($"Honor Status: '{dto.HonorStatus ?? "NULL"}'");
            System.Diagnostics.Debug.WriteLine($"Age: {dto.Age ?? -1}");
            System.Diagnostics.Debug.WriteLine($"Section ID: '{dto.SectionId ?? "NULL"}'");
            
            // 🔍 LOG GENERATED CREDENTIALS
            var generatedEmail = $"{dto.LrnId}@student.local";
            var generatedPassword = Birthday.Value.ToString("yyyyMMdd");
            System.Diagnostics.Debug.WriteLine("=== GENERATED CREDENTIALS ===");
            System.Diagnostics.Debug.WriteLine($"Email: '{generatedEmail}'");
            System.Diagnostics.Debug.WriteLine($"Password: '{generatedPassword}'");
            
            // 🔍 LOG FULL DTO AS JSON
            var dtoJson = System.Text.Json.JsonSerializer.Serialize(dto, new System.Text.Json.JsonSerializerOptions 
            { 
                WriteIndented = true 
            });
            System.Diagnostics.Debug.WriteLine("=== FULL DTO JSON ===");
            System.Diagnostics.Debug.WriteLine(dtoJson);

            // Call API
            System.Diagnostics.Debug.WriteLine("=== CALLING API ===");
            System.Diagnostics.Debug.WriteLine($"API Endpoint: POST /api/v1/users/student");
            
            var response = await _apiClient.CreateStudentAsync(dto);

            // 🔍 LOG API RESPONSE
            System.Diagnostics.Debug.WriteLine("=== API RESPONSE ===");
            if (response != null)
            {
                System.Diagnostics.Debug.WriteLine($"Success: {response.Success}");
                System.Diagnostics.Debug.WriteLine($"Message: '{response.Message}'");
                System.Diagnostics.Debug.WriteLine($"User ID: '{response.UserId ?? "NULL"}'");
                
                if (response.Errors != null && response.Errors.Count > 0)
                {
                    System.Diagnostics.Debug.WriteLine($"Errors: [{string.Join(", ", response.Errors)}]");
                }
                
                if (response.User != null)
                {
                    System.Diagnostics.Debug.WriteLine($"Created User Email: '{response.User.Email}'");
                    System.Diagnostics.Debug.WriteLine($"Created User Role: '{response.User.Role}'");
                    System.Diagnostics.Debug.WriteLine($"Created User Status: '{response.User.Status}'");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("Response is NULL");
            }

            if (response?.Success == true)
            {
                // Show success toast notification
                System.Diagnostics.Debug.WriteLine("=== SHOWING SUCCESS TOAST ===");
                System.Diagnostics.Debug.WriteLine($"ToastService is null: {_toastService == null}");
                
                // TEMPORARY: Try direct notification as test
                try 
                {
                    var window = Avalonia.Application.Current?.ApplicationLifetime is 
                        Avalonia.Controls.ApplicationLifetimes.IClassicDesktopStyleApplicationLifetime desktop 
                        ? desktop.MainWindow : null;
                        
                    if (window != null)
                    {
                        var testManager = new Avalonia.Controls.Notifications.WindowNotificationManager(window)
                        {
                            Position = Avalonia.Controls.Notifications.NotificationPosition.TopRight,
                            MaxItems = 3
                        };
                        testManager.Show(new Avalonia.Controls.Notifications.Notification("TEST", "Direct test notification", Avalonia.Controls.Notifications.NotificationType.Success));
                        System.Diagnostics.Debug.WriteLine("=== DIRECT TEST NOTIFICATION SENT ===");
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Direct test failed: {ex.Message}");
                }
                
                _toastService?.Success(
                    $"Student '{FirstName} {LastName}' created successfully! You can create another student or click Cancel to go back.",
                    "Student Created",
                    expiration: TimeSpan.FromSeconds(5)
                );
                
                System.Diagnostics.Debug.WriteLine("=== TOAST CALLED ===");
                
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
                
                // Show both in-form error and toast
                ErrorMessage = errorMsg;
                _toastService?.Error(errorMsg, "Creation Failed", expiration: TimeSpan.FromSeconds(5));
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
            _toastService?.Error(ex.Message, "Error", expiration: TimeSpan.FromSeconds(5));
            System.Diagnostics.Debug.WriteLine($"Error creating student: {ex}");
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
}