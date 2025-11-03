using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class ProfileViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly string _userId;

    [ObservableProperty] private bool _isLoading = true;
    [ObservableProperty] private string _title = "My Profile";
    [ObservableProperty] private string _firstName = string.Empty;
    [ObservableProperty] private string _lastName = string.Empty;
    [ObservableProperty] private string _middleName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _phoneNumber = string.Empty;
    [ObservableProperty] private string _address = string.Empty;
    [ObservableProperty] private string _bio = string.Empty;
    [ObservableProperty] private string _age = string.Empty;
    [ObservableProperty] private string _birthday = string.Empty;
    [ObservableProperty] private string _avatar = string.Empty;
    [ObservableProperty] private string _departmentName = "Not Assigned";
    [ObservableProperty] private string _subjectSpecialization = "Not Assigned";
    [ObservableProperty] private string _advisorySection = "Not Assigned";

    public string FullName
    {
        get
        {
            var parts = new[] { FirstName, MiddleName, LastName }.Where(p => !string.IsNullOrWhiteSpace(p));
            return string.Join(" ", parts);
        }
    }

    public string Initials
    {
        get
        {
            if (string.IsNullOrEmpty(FirstName) || string.IsNullOrEmpty(LastName))
                return "??";
            return $"{FirstName.FirstOrDefault()}{LastName.FirstOrDefault()}".ToUpper();
        }
    }

    public ProfileViewModel(IApiClient apiClient, string userId)
    {
        _apiClient = apiClient;
        _userId = userId;
        _ = LoadProfileAsync();
    }

    private async Task LoadProfileAsync()
    {
        try
        {
            IsLoading = true;
            var profile = await _apiClient.GetUserProfileAsync(_userId);
            
            if (profile == null)
            {
                System.Diagnostics.Debug.WriteLine("Profile is null");
                return;
            }
            
            Email = profile.Email ?? string.Empty;
            
            if (profile.Teacher != null)
            {
                FirstName = profile.Teacher.FirstName ?? string.Empty;
                LastName = profile.Teacher.LastName ?? string.Empty;
                MiddleName = profile.Teacher.MiddleName ?? string.Empty;
                
                // Notify UI that computed properties have changed
                OnPropertyChanged(nameof(FullName));
                OnPropertyChanged(nameof(Initials));
                
                // Map age and birthday
                Age = profile.Teacher.Age?.ToString() ?? string.Empty;
                Birthday = profile.Teacher.Birthday ?? string.Empty;
                
                // Fetch related entity names
                await LoadDepartmentNameAsync(profile.Teacher.DepartmentId);
                await LoadSubjectSpecializationAsync(profile.Teacher.SubjectSpecializationId);
                await LoadAdvisorySectionAsync(profile.Teacher.AdvisorySectionId);
                
                System.Diagnostics.Debug.WriteLine($"Teacher data loaded - Name: {FullName}, Age: {Age}, Department: {DepartmentName}, Subject: {SubjectSpecialization}");
            }
            
            if (profile.Profile != null)
            {
                PhoneNumber = profile.Profile.PhoneNumber ?? string.Empty;
                Address = profile.Profile.Address ?? string.Empty;
                Bio = profile.Profile.Bio ?? string.Empty;
                Avatar = profile.Profile.Avatar ?? string.Empty;
            }
            
            System.Diagnostics.Debug.WriteLine($"Profile loaded - Name: {FullName}, Email: {Email}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading profile: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
        }
        finally
        {
            IsLoading = false;
        }
    }
    
    private async Task LoadDepartmentNameAsync(string? departmentId)
    {
        if (string.IsNullOrEmpty(departmentId)) 
        {
            DepartmentName = "Not Assigned";
            return;
        }
        
        try
        {
            var department = await _apiClient.GetDepartmentAsync(departmentId);
            DepartmentName = department?.Name ?? "Not Assigned";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading department: {ex.Message}");
            DepartmentName = "Not Assigned";
        }
    }
    
    private async Task LoadSubjectSpecializationAsync(string? subjectId)
    {
        if (string.IsNullOrEmpty(subjectId)) 
        {
            SubjectSpecialization = "Not Assigned";
            return;
        }
        
        try
        {
            var subject = await _apiClient.GetSubjectAsync(subjectId);
            SubjectSpecialization = subject?.SubjectName ?? "Not Assigned";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading subject: {ex.Message}");
            SubjectSpecialization = "Not Assigned";
        }
    }
    
    private async Task LoadAdvisorySectionAsync(string? sectionId)
    {
        if (string.IsNullOrEmpty(sectionId)) 
        {
            AdvisorySection = "Not Assigned";
            return;
        }
        
        try
        {
            var section = await _apiClient.GetSectionAsync(sectionId);
            AdvisorySection = section?.Name ?? "Not Assigned";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading section: {ex.Message}");
            AdvisorySection = "Not Assigned";
        }
    }

    [RelayCommand]
    private async Task RefreshProfile()
    {
        // Invalidate cached profile before reloading to force a fresh fetch
        _apiClient.InvalidateCachePrefix($"users/{_userId}/profile");
        await LoadProfileAsync();
    }

    [RelayCommand] private void UploadPhoto() { /* TODO */ }
    [RelayCommand] private void EditProfile() { /* TODO */ }
    [RelayCommand] private void ChangePassword() { /* TODO */ }
    [RelayCommand] private void ToggleTwoFactor() { /* TODO */ }
    [RelayCommand] private void ShowLoginHistory() { /* TODO */ }
    [RelayCommand] private void SaveChanges() { /* TODO */ }
    [RelayCommand] private void ResetToDefault() { /* TODO */ }
}
