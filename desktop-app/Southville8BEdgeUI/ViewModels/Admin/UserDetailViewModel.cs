using System;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class UserDetailViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    private readonly string _userId;
    
    public Action? NavigateBack { get; set; }
    
    [ObservableProperty] private bool _isLoading = true;
    [ObservableProperty] private string _errorMessage = "";
    
    // Basic User Info
    [ObservableProperty] private string _fullName = "";
    [ObservableProperty] private string _email = "";
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsStudent))]
    [NotifyPropertyChangedFor(nameof(IsTeacher))]
    [NotifyPropertyChangedFor(nameof(IsAdmin))]
    private string _role = "";
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private string? _createdAt;
    [ObservableProperty] private string? _updatedAt;
    [ObservableProperty] private string? _lastLogin;
    
    // Role-specific fields (nullable, shown conditionally)
    [ObservableProperty] private string? _studentId;
    [ObservableProperty] private string? _lrnId;
    [ObservableProperty] private string? _gradeLevel;
    [ObservableProperty] private string? _sectionName;
    [ObservableProperty] private int? _age;
    [ObservableProperty] private string? _birthday;
    [ObservableProperty] private int? _enrollmentYear;
    [ObservableProperty] private string? _honorStatus;
    [ObservableProperty] private int? _rank;
    
    [ObservableProperty] private string? _phoneNumber;
    [ObservableProperty] private string? _department;
    [ObservableProperty] private string? _subjectSpecialization;
    [ObservableProperty] private string? _advisorySection;
    
    [ObservableProperty] private string? _roleDescription;
    
    // Computed properties
    public bool IsStudent => Role == "Student";
    public bool IsTeacher => Role == "Teacher";
    public bool IsAdmin => Role == "Admin";
    
    public UserDetailViewModel(IApiClient apiClient, IToastService toastService, string userId)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _userId = userId;
    }
    
    public async Task LoadUserAsync()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = "";
            
            var response = await _apiClient.GetAsync<UserDetailResponse>($"/api/v1/users/{_userId}");
            
            if (response == null)
            {
                ErrorMessage = "Failed to load user details: No response from server";
                IsLoading = false;
                return;
            }
            
            // Map response to properties
            FullName = response.FullName ?? "";
            Email = response.Email ?? "";
            Role = response.Role?.Name ?? "";
            Status = response.Status ?? "";
            CreatedAt = response.CreatedAt;
            UpdatedAt = response.UpdatedAt;
            LastLogin = response.LastLogin;
            
            // Map role-specific data
            if (response.Student != null)
            {
                StudentId = response.Student.StudentId;
                LrnId = response.Student.LrnId;
                GradeLevel = response.Student.GradeLevel;
                SectionName = response.Student.Section?.Name;
                Age = response.Student.Age;
                Birthday = response.Student.Birthday;
                EnrollmentYear = response.Student.EnrollmentYear;
                HonorStatus = response.Student.HonorStatus;
                Rank = response.Student.Rank;
            }
            else if (response.Teacher != null)
            {
                // Note: Teachers table doesn't have phone_number column
                Department = response.Teacher.Department?.DepartmentName;
                SubjectSpecialization = response.Teacher.SubjectSpecialization?.SubjectName;
                AdvisorySection = response.Teacher.AdvisorySection?.Name;
                Age = response.Teacher.Age;
                Birthday = response.Teacher.Birthday;
            }
            else if (response.Admin != null)
            {
                PhoneNumber = response.Admin.PhoneNumber;
                RoleDescription = response.Admin.RoleDescription;
            }
            
            IsLoading = false;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Failed to load user details: {ex.Message}";
            IsLoading = false;
            _toastService.Error("Failed to load user details");
        }
    }
    
    [RelayCommand]
    private void GoBack()
    {
        NavigateBack?.Invoke();
    }
}
