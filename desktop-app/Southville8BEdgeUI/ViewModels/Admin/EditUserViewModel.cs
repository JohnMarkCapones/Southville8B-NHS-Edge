using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class EditUserViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    private readonly string _userId;
    private string _userRole = "";
    
    // Navigation callbacks
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    // Basic User Info
    [ObservableProperty] private string _fullName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;

    // Student-specific fields
    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _middleName = string.Empty;
    [ObservableProperty] private string _studentId = string.Empty;
    [ObservableProperty] private string _lrnId = string.Empty;
    [ObservableProperty] private DateTimeOffset? _birthday;
    [ObservableProperty] private string _gradeLevel = string.Empty;
    [ObservableProperty] private int? _enrollmentYear;
    [ObservableProperty] private string _honorStatus = string.Empty;
    [ObservableProperty] private int? _age;
    [ObservableProperty] private SectionDto? _selectedSection;

    // Teacher-specific fields
    [ObservableProperty] private Department? _selectedDepartment;
    [ObservableProperty] private Subject? _selectedSubject;
    [ObservableProperty] private SectionDto? _selectedAdvisorySection;

    // Admin-specific fields
    [ObservableProperty] private string _roleDescription = string.Empty;

    // UI properties
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private string _successMessage = string.Empty;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);
    public bool HasSuccess => !string.IsNullOrEmpty(SuccessMessage);
    public bool IsStudent => _userRole == "Student";
    public bool IsTeacher => _userRole == "Teacher";
    public bool IsAdmin => _userRole == "Admin";

    // Sections
    public ObservableCollection<SectionDto> AvailableSections { get; } = new();

    // Teacher collections
    public ObservableCollection<Department> Departments { get; } = new();
    public ObservableCollection<Subject> Subjects { get; } = new();

    // Options
    public ObservableCollection<string> GradeLevelOptions { get; } = new()
    {
        "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
    };

    public ObservableCollection<string> HonorStatusOptions { get; } = new()
    {
        "None", "With Honors", "High Honors", "Highest Honors"
    };

    public EditUserViewModel(IApiClient apiClient, IToastService toastService, string userId, string role)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _userId = userId;
        _userRole = role;
        _ = InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        // Load sections and departments first, then user data (so we can match selections)
        await Task.WhenAll(
            LoadSectionsAsync(),
            LoadDepartmentsAsync()
        );
        await LoadUserDataAsync();
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

    private async Task LoadUserDataAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = string.Empty;

            var response = await _apiClient.GetAsync<UserDetailResponse>($"/api/v1/users/{_userId}");

            if (response == null)
            {
                ErrorMessage = "Failed to load user details: No response from server";
                IsLoading = false;
                return;
            }

            // Map basic user info
            FullName = response.FullName ?? "";
            Email = response.Email ?? "";

            // Debug: Log the response structure
            System.Diagnostics.Debug.WriteLine($"[EditUserViewModel] Loading user {_userId}, Role: {_userRole}");
            System.Diagnostics.Debug.WriteLine($"[EditUserViewModel] Response has Teacher: {response.Teacher != null}");
            if (response.Teacher != null)
            {
                System.Diagnostics.Debug.WriteLine($"[EditUserViewModel] Teacher data - FirstName: '{response.Teacher.FirstName}', LastName: '{response.Teacher.LastName}', Birthday: '{response.Teacher.Birthday}', Age: {response.Teacher.Age}");
            }

            // Map role-specific data
            if (response.Student != null && IsStudent)
            {
                // Parse full name into first, last, middle
                ParseFullName(response.FullName ?? "");
                
                StudentId = response.Student.StudentId ?? "";
                LrnId = response.Student.LrnId ?? "";
                GradeLevel = response.Student.GradeLevel ?? "";
                EnrollmentYear = response.Student.EnrollmentYear;
                HonorStatus = response.Student.HonorStatus ?? "";
                Age = response.Student.Age;

                // Parse birthday - handle various formats and null
                if (!string.IsNullOrWhiteSpace(response.Student.Birthday))
                {
                    // Try parsing as date (YYYY-MM-DD format from PostgreSQL)
                    if (DateTime.TryParse(response.Student.Birthday, out var birthdayDate))
                    {
                        Birthday = new DateTimeOffset(birthdayDate);
                    }
                    else if (DateTime.TryParseExact(response.Student.Birthday, "yyyy-MM-dd", 
                        System.Globalization.CultureInfo.InvariantCulture, 
                        System.Globalization.DateTimeStyles.None, out var exactDate))
                    {
                        Birthday = new DateTimeOffset(exactDate);
                    }
                }
                else
                {
                    // Birthday is null or empty - set to null
                    Birthday = null;
                }

                // Set selected section
                if (response.Student.Section != null && !string.IsNullOrEmpty(response.Student.Section.Id))
                {
                    SelectedSection = AvailableSections.FirstOrDefault(s => s.Id == response.Student.Section.Id);
                }
            }
            else if (response.Teacher != null && IsTeacher)
            {
                // Parse full name into first, last, middle
                FirstName = response.Teacher.FirstName ?? "";
                LastName = response.Teacher.LastName ?? "";
                MiddleName = response.Teacher.MiddleName ?? "";
                Age = response.Teacher.Age;

                // Parse birthday - handle various formats and null
                if (!string.IsNullOrWhiteSpace(response.Teacher.Birthday))
                {
                    // Try parsing as date (YYYY-MM-DD format from PostgreSQL)
                    if (DateTime.TryParse(response.Teacher.Birthday, out var birthdayDate))
                    {
                        Birthday = new DateTimeOffset(birthdayDate);
                    }
                    else if (DateTime.TryParseExact(response.Teacher.Birthday, "yyyy-MM-dd", 
                        System.Globalization.CultureInfo.InvariantCulture, 
                        System.Globalization.DateTimeStyles.None, out var exactDate))
                    {
                        Birthday = new DateTimeOffset(exactDate);
                    }
                }
                else
                {
                    // Birthday is null or empty - set to null
                    Birthday = null;
                }

                // Handle department - use nested object if available, otherwise use raw ID
                string? departmentId = null;
                if (response.Teacher.Department != null && !string.IsNullOrEmpty(response.Teacher.Department.Id))
                {
                    departmentId = response.Teacher.Department.Id;
                }
                else if (!string.IsNullOrEmpty(response.Teacher.DepartmentId))
                {
                    departmentId = response.Teacher.DepartmentId;
                }

                if (!string.IsNullOrEmpty(departmentId))
                {
                    SelectedDepartment = Departments.FirstOrDefault(d => d.Id == departmentId);
                    if (SelectedDepartment != null)
                    {
                        await LoadSubjectsForDepartmentAsync(SelectedDepartment.Id);
                    }
                }

                // Handle subject specialization - use nested object if available, otherwise use raw ID
                string? subjectId = null;
                if (response.Teacher.SubjectSpecialization != null && !string.IsNullOrEmpty(response.Teacher.SubjectSpecialization.Id))
                {
                    subjectId = response.Teacher.SubjectSpecialization.Id;
                }
                else if (!string.IsNullOrEmpty(response.Teacher.SubjectSpecializationId))
                {
                    subjectId = response.Teacher.SubjectSpecializationId;
                }

                if (!string.IsNullOrEmpty(subjectId))
                {
                    SelectedSubject = Subjects.FirstOrDefault(s => s.Id == subjectId);
                }

                // Handle advisory section - use nested object if available, otherwise use raw ID
                string? advisorySectionId = null;
                if (response.Teacher.AdvisorySection != null && !string.IsNullOrEmpty(response.Teacher.AdvisorySection.Id))
                {
                    advisorySectionId = response.Teacher.AdvisorySection.Id;
                }
                else if (!string.IsNullOrEmpty(response.Teacher.AdvisorySectionId))
                {
                    advisorySectionId = response.Teacher.AdvisorySectionId;
                }

                if (!string.IsNullOrEmpty(advisorySectionId))
                {
                    SelectedAdvisorySection = AvailableSections.FirstOrDefault(s => s.Id == advisorySectionId);
                }
            }
            else if (response.Admin != null && IsAdmin)
            {
                // Parse full name into first, last, middle
                ParseFullName(response.FullName ?? "");
                RoleDescription = response.Admin.RoleDescription ?? "";
                
                // Note: Admin birthday/age might not be in AdminDetail, but we'll try to get it from user if available
                // For now, we'll leave birthday/age empty for admins unless it's in the response
            }

            IsLoading = false;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to load user details: {ex.Message}";
            IsLoading = false;
            _toastService.Error("Failed to load user details", "Error");
        }
    }

    private void ParseFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return;

        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        if (parts.Length >= 1)
            FirstName = parts[0];
        
        if (parts.Length >= 2)
            LastName = parts[parts.Length - 1];
        
        if (parts.Length > 2)
            MiddleName = string.Join(" ", parts.Skip(1).Take(parts.Length - 2));
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
    private async Task SaveUser()
    {
        // Clear previous messages
        ErrorMessage = string.Empty;
        SuccessMessage = string.Empty;

        try
        {
            IsLoading = true;

            if (IsStudent)
            {
                await SaveStudentAsync();
            }
            else if (IsTeacher)
            {
                await SaveTeacherAsync();
            }
            else if (IsAdmin)
            {
                await SaveAdminAsync();
            }
            else
            {
                ErrorMessage = "Unknown user role. Cannot save changes.";
                _toastService.Error("Unknown user role. Cannot save changes.", "Error");
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
            _toastService.Error(ex.Message, "Error");
            System.Diagnostics.Debug.WriteLine($"User update failed: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task SaveStudentAsync()
    {
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

        // Create update DTO (only include changed fields or all fields for now)
        var dto = new UpdateStudentDto
        {
            FirstName = FirstName.Trim(),
            LastName = LastName.Trim(),
            MiddleName = string.IsNullOrWhiteSpace(MiddleName) ? null : MiddleName.Trim(),
            StudentId = StudentId.Trim(),
            LrnId = LrnId.Trim(),
            Birthday = Birthday.HasValue ? Birthday.Value.ToString("yyyy-MM-dd") : null,
            GradeLevel = string.IsNullOrWhiteSpace(GradeLevel) ? null : GradeLevel,
            EnrollmentYear = EnrollmentYear,
            HonorStatus = string.IsNullOrWhiteSpace(HonorStatus) ? null : HonorStatus,
            Age = Age,
            SectionId = SelectedSection?.Id
        };

        // Update student record
        System.Diagnostics.Debug.WriteLine($"Updating student {_userId}");
        
        var success = await _apiClient.UpdateStudentAsync(_userId, dto);

        if (success)
        {
            System.Diagnostics.Debug.WriteLine("Student update successful");
            
            _toastService?.Success(
                $"Student '{FirstName} {LastName}' updated successfully!",
                "Student Updated",
                expiration: TimeSpan.FromSeconds(5)
            );
            
            SuccessMessage = "Student updated successfully!";
            
            // Navigate back after a short delay
            await Task.Delay(1000);
            NavigateBack?.Invoke();
        }
        else
        {
            ErrorMessage = "Failed to update student. Please try again.";
            _toastService?.Error("Failed to update student. Please try again.", "Update Failed", expiration: TimeSpan.FromSeconds(5));
        }
    }

    private async Task SaveTeacherAsync()
    {
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

        // Create update DTO
        var dto = new UpdateTeacherDto
        {
            FirstName = FirstName.Trim(),
            LastName = LastName.Trim(),
            MiddleName = string.IsNullOrWhiteSpace(MiddleName) ? null : MiddleName.Trim(),
            Birthday = Birthday.HasValue ? Birthday.Value.ToString("yyyy-MM-dd") : null,
            Age = Age,
            DepartmentId = SelectedDepartment?.Id,
            SubjectSpecializationId = SelectedSubject?.Id,
            AdvisorySectionId = SelectedAdvisorySection?.Id
        };

        // Update user basic info first
        var updateUserDto = new UpdateUserDto
        {
            FullName = $"{FirstName.Trim()} {MiddleName?.Trim()} {LastName.Trim()}".Trim(),
            Email = Email.Trim()
        };
        
        var userSuccess = await _apiClient.UpdateUserAsync(_userId, updateUserDto);
        if (!userSuccess)
        {
            ErrorMessage = "Failed to update user's basic information.";
            _toastService?.Error("Failed to update user's basic information.", "Update Failed");
            return;
        }

        // Update teacher record
        System.Diagnostics.Debug.WriteLine($"Updating teacher {_userId}");
        
        var success = await _apiClient.UpdateTeacherAsync(_userId, dto);

        if (success)
        {
            System.Diagnostics.Debug.WriteLine("Teacher update successful");
            
            _toastService?.Success(
                $"Teacher '{FirstName} {LastName}' updated successfully!",
                "Teacher Updated",
                expiration: TimeSpan.FromSeconds(5)
            );
            
            SuccessMessage = "Teacher updated successfully!";
            
            // Navigate back after a short delay
            await Task.Delay(1000);
            NavigateBack?.Invoke();
        }
        else
        {
            ErrorMessage = "Failed to update teacher. Please try again.";
            _toastService?.Error("Failed to update teacher. Please try again.", "Update Failed", expiration: TimeSpan.FromSeconds(5));
        }
    }

    private async Task SaveAdminAsync()
    {
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

        // Create update DTO
        var dto = new UpdateAdminDto
        {
            FirstName = FirstName.Trim(),
            LastName = LastName.Trim(),
            MiddleName = string.IsNullOrWhiteSpace(MiddleName) ? null : MiddleName.Trim(),
            Birthday = Birthday.HasValue ? Birthday.Value.ToString("yyyy-MM-dd") : null,
            Age = Age,
            RoleDescription = string.IsNullOrWhiteSpace(RoleDescription) ? null : RoleDescription.Trim()
        };

        // Update user basic info first
        var updateUserDto = new UpdateUserDto
        {
            FullName = $"{FirstName.Trim()} {MiddleName?.Trim()} {LastName.Trim()}".Trim(),
            Email = Email.Trim()
        };
        
        var userSuccess = await _apiClient.UpdateUserAsync(_userId, updateUserDto);
        if (!userSuccess)
        {
            ErrorMessage = "Failed to update user's basic information.";
            _toastService?.Error("Failed to update user's basic information.", "Update Failed");
            return;
        }

        // Update admin record
        System.Diagnostics.Debug.WriteLine($"Updating admin {_userId}");
        
        var success = await _apiClient.UpdateAdminAsync(_userId, dto);

        if (success)
        {
            System.Diagnostics.Debug.WriteLine("Admin update successful");
            
            _toastService?.Success(
                $"Admin '{FirstName} {LastName}' updated successfully!",
                "Admin Updated",
                expiration: TimeSpan.FromSeconds(5)
            );
            
            SuccessMessage = "Admin updated successfully!";
            
            // Navigate back after a short delay
            await Task.Delay(1000);
            NavigateBack?.Invoke();
        }
        else
        {
            ErrorMessage = "Failed to update admin. Please try again.";
            _toastService?.Error("Failed to update admin. Please try again.", "Update Failed", expiration: TimeSpan.FromSeconds(5));
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }
}

