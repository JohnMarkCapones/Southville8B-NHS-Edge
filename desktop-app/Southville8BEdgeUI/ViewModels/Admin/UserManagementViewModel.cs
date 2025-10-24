using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Media;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class UserManagementViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    
    // Navigation callback supplied by shell
    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; }

    [ObservableProperty] private int _totalUsers = 0;
    [ObservableProperty] private int _students = 0;
    [ObservableProperty] private int _teachers = 0;
    [ObservableProperty] private int _admins = 0;
    [ObservableProperty] private int _activeUsers = 0;

    [ObservableProperty] private ObservableCollection<UserViewModel> _users = new();
    [ObservableProperty] private ObservableCollection<UserViewModel> _filteredUsers = new();

    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string? _selectedRole;
    [ObservableProperty] private string? _selectedStatus;
    [ObservableProperty] private string? _selectedGrade;

    public ObservableCollection<string> RoleOptions { get; } = new() { "All Roles", "Student", "Teacher", "Admin", "Staff" };
    public ObservableCollection<string> StatusOptions { get; } = new() { "All Status", "Active", "Inactive", "Suspended", "Pending" };
    public ObservableCollection<string> GradeOptions { get; } = new() { "All Grades", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Faculty", "N/A" };

    public double StudentPercentage => TotalUsers > 0 ? (double)Students / TotalUsers * 100 : 0;
    public double TeacherPercentage => TotalUsers > 0 ? (double)Teachers / TotalUsers * 100 : 0;
    public double AdminPercentage => TotalUsers > 0 ? (double)Admins / TotalUsers * 100 : 0;
    public double ActivePercentage => TotalUsers > 0 ? (double)ActiveUsers / TotalUsers * 100 : 0;
    public bool HasFilteredUsers => FilteredUsers?.Any() == true;

    public UserManagementViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        
        // Initialize collections
        Users = new ObservableCollection<UserViewModel>();
        FilteredUsers = new ObservableCollection<UserViewModel>();
        
        // Load metrics and users from API
        _ = LoadKpiMetricsAsync();
        _ = LoadUsersAsync();
    }

    private async Task LoadUsersAsync()
    {
        try
        {
            System.Diagnostics.Debug.WriteLine("=== Loading Users ===");
            var response = await _apiClient.GetUsersAsync();
            System.Diagnostics.Debug.WriteLine($"API Response: {response != null}");
            System.Diagnostics.Debug.WriteLine($"Users in response: {response?.Users?.Count ?? 0}");
            
            if (response?.Users != null)
            {
                // Debug: Log first user raw data
                if (response.Users.Count > 0)
                {
                    var firstUser = response.Users[0];
                    System.Diagnostics.Debug.WriteLine($"First user: ID={firstUser.Id}, Email={firstUser.Email}, FullName={firstUser.FullName}, Role={firstUser.Role}");
                }
                
                Users.Clear();
                foreach (var userDto in response.Users)
                {
                    // Debug logging to see what we're receiving
                    System.Diagnostics.Debug.WriteLine($"User DTO: ID={userDto.Id}, FullName='{userDto.FullName}', Email='{userDto.Email}', Role='{userDto.Role?.Name}', GradeLevel='{userDto.GradeLevel}'");
                    
                    var userVm = MapUserDtoToViewModel(userDto);
                    Users.Add(userVm);
                    
                    // Debug logging to see what we're displaying
                    System.Diagnostics.Debug.WriteLine($"User VM: FullName='{userVm.FullName}', Grade='{userVm.Grade}'");
                }
                
                System.Diagnostics.Debug.WriteLine($"Users loaded into collection: {Users.Count}");
                
                // Update statistics based on loaded users
                // Note: Students and Teachers counts come from KPI API
                UpdateStatisticsFromUsers();
                ApplyFilters();
                
                System.Diagnostics.Debug.WriteLine($"Filtered users count: {FilteredUsers.Count}");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("No users in response or response is null");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading users: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            _toastService.Error($"Failed to load users: {ex.Message}", "Error");
            // Show empty state when API fails
            Users.Clear();
            FilteredUsers.Clear();
            UpdateStatisticsFromUsers();
        }
    }

    private async Task LoadKpiMetricsAsync()
    {
        try
        {
            var metrics = await _apiClient.GetAdminDashboardMetricsAsync();
            if (metrics != null)
            {
                // Update KPI values from API
                TotalUsers = metrics.TotalStudents + metrics.ActiveTeachers;
                Students = metrics.TotalStudents;
                Teachers = metrics.ActiveTeachers;
                // Note: ActiveUsers is calculated from user list status, not OnlineUsersCount
                // OnlineUsersCount represents real-time connections, not status="Active"
                
                // Trigger property change notifications for percentage calculations
                OnPropertyChanged(nameof(StudentPercentage));
                OnPropertyChanged(nameof(TeacherPercentage));
                
                System.Diagnostics.Debug.WriteLine($"KPI Metrics loaded: Students={Students}, Teachers={Teachers}");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading KPI metrics: {ex.Message}");
            // Keep existing default values as fallback
        }
    }

    private UserViewModel MapUserDtoToViewModel(UserDto dto)
    {
        // Create a better display name fallback
        string displayName = dto.FullName;
        
        // If full name is empty or looks like an ID/LRN, try to construct from other fields
        if (string.IsNullOrEmpty(displayName) || 
            displayName.StartsWith("LRN-") || 
            displayName.All(c => char.IsDigit(c) || c == '-' || c == '_'))
        {
            // Try to construct name from email or use a more descriptive fallback
            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailParts = dto.Email.Split('@')[0];
                if (emailParts.Contains('.'))
                {
                    // Convert email format like "john.doe" to "John Doe"
                    displayName = string.Join(" ", 
                        emailParts.Split('.')
                            .Select(part => char.ToUpper(part[0]) + part.Substring(1).ToLower()));
                }
                else
                {
                    displayName = char.ToUpper(emailParts[0]) + emailParts.Substring(1).ToLower();
                }
            }
            else
            {
                displayName = dto.Role?.Name == "Student" ? "Student User" : 
                             dto.Role?.Name == "Teacher" ? "Teacher User" : 
                             dto.Role?.Name == "Admin" ? "Admin User" : "User";
            }
        }
        
        return new UserViewModel
        {
            Id = dto.Id,
            FullName = displayName,
            Username = GenerateUsernameFromEmail(dto.Email),
            Email = dto.Email,
            Role = dto.Role?.Name ?? "Unknown",
            Status = dto.Status,
            Grade = dto.GradeLevel ?? (dto.Role?.Name == "Teacher" ? "Faculty" : "N/A"),
            StudentId = dto.StudentId ?? "",
            EmployeeId = dto.EmployeeId ?? "",
            PhoneNumber = dto.PhoneNumber ?? "",
            Department = dto.Department ?? "",
            LastLogin = !string.IsNullOrEmpty(dto.LastLogin) && DateTime.TryParse(dto.LastLogin, out var lastLogin) ? lastLogin : null,
            DateCreated = !string.IsNullOrEmpty(dto.CreatedAt) && DateTime.TryParse(dto.CreatedAt, out var createdAt) ? createdAt : DateTime.Now
        };
    }

    private string GenerateUsernameFromEmail(string email)
    {
        if (string.IsNullOrEmpty(email)) return "";
        
        var atIndex = email.IndexOf('@');
        if (atIndex > 0)
            return email.Substring(0, atIndex);
        
        return email;
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();
    partial void OnSelectedRoleChanged(string? value) => ApplyFilters();
    partial void OnSelectedStatusChanged(string? value) => ApplyFilters();
    partial void OnSelectedGradeChanged(string? value) => ApplyFilters();

    private void ApplyFilters()
    {
        var filtered = Users.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(SearchText))
        {
            filtered = filtered.Where(u =>
                (!string.IsNullOrWhiteSpace(u.FullName) && u.FullName.Contains(SearchText, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.Username) && u.Username.Contains(SearchText, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.Email) && u.Email.Contains(SearchText, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.StudentId) && u.StudentId.Contains(SearchText, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.EmployeeId) && u.EmployeeId.Contains(SearchText, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(SelectedRole) && SelectedRole != "All Roles")
            filtered = filtered.Where(u => u.Role == SelectedRole);

        if (!string.IsNullOrWhiteSpace(SelectedStatus) && SelectedStatus != "All Status")
            filtered = filtered.Where(u => u.Status == SelectedStatus);

        if (!string.IsNullOrWhiteSpace(SelectedGrade) && SelectedGrade != "All Grades")
            filtered = filtered.Where(u => u.Grade == SelectedGrade);

        FilteredUsers.Clear();
        foreach (var user in filtered)
            FilteredUsers.Add(user);

        OnPropertyChanged(nameof(HasFilteredUsers));
    }

    /// <summary>
    /// Update statistics from loaded user list (primarily for Admins count)
    /// Students and Teachers counts come from KPI API
    /// </summary>
    private void UpdateStatisticsFromUsers()
    {
        // Only update Admins from user list, as Students/Teachers come from KPI
        Admins = Users.Count(u => u.Role == "Admin");
        
        // Update TotalUsers to include all role counts
        TotalUsers = Students + Teachers + Admins;
        
        // ActiveUsers = users with status "Active" (from loaded user list)
        ActiveUsers = Users.Count(u => u.Status == "Active");
        System.Diagnostics.Debug.WriteLine($"Statistics updated: Total={TotalUsers}, Active={ActiveUsers}, Admins={Admins}");

        OnPropertyChanged(nameof(StudentPercentage));
        OnPropertyChanged(nameof(TeacherPercentage));
        OnPropertyChanged(nameof(AdminPercentage));
        OnPropertyChanged(nameof(ActivePercentage));
    }

    [RelayCommand] private void CreateUser()
    {
        var vm = new CreateUserViewModel(_apiClient, _toastService) 
        { 
            NavigateBack = () => NavigateTo?.Invoke(this),
            NavigateTo = NavigateTo
        };
        NavigateTo?.Invoke(vm);
    }

    [RelayCommand] private void ImportUsers()
    {
        var vm = new ImportUsersViewModel(_apiClient, _toastService) { NavigateBack = () => NavigateTo?.Invoke(this) };
        NavigateTo?.Invoke(vm);
    }

    [RelayCommand] 
    private void ViewUserDetails(UserViewModel user)
    {
        var vm = new UserDetailViewModel(_apiClient, _toastService, user.Id)
        {
            NavigateBack = () => NavigateTo?.Invoke(this)
        };
        _ = vm.LoadUserAsync(); // Start loading
        NavigateTo?.Invoke(vm);
    }
    [RelayCommand] private void EditUser(UserViewModel user) { }

    [RelayCommand] private void ToggleUserStatus(UserViewModel user)
    {
        _ = ToggleUserStatusAsync(user);
    }

    private async Task ToggleUserStatusAsync(UserViewModel user)
    {
        try
        {
            var newStatus = user.IsActive ? "Inactive" : "Active";
            var success = await _apiClient.UpdateUserStatusAsync(user.Id, newStatus);
            
            if (success)
            {
                user.Status = newStatus;
                UpdateStatisticsFromUsers();  // Changed from UpdateStatistics
                ApplyFilters();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating user status: {ex.Message}");
        }
    }

    [RelayCommand] private void ResetPassword(UserViewModel user) { }

    [RelayCommand] private void DeleteUser(UserViewModel user)
    {
        _ = DeleteUserAsync(user);
    }

    private async Task DeleteUserAsync(UserViewModel user)
    {
        try
        {
            var success = await _apiClient.DeleteUserAsync(user.Id);
            
            if (success)
            {
                Users.Remove(user);
                UpdateStatisticsFromUsers();  // Changed from UpdateStatistics
                ApplyFilters();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting user: {ex.Message}");
        }
    }
}

public partial class UserViewModel : ViewModelBase
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _fullName = "";
    [ObservableProperty] private string _username = "";
    [ObservableProperty] private string _email = "";
    [ObservableProperty] private string _role = "";
    [ObservableProperty] private string _status = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _studentId = "";
    [ObservableProperty] private string _employeeId = "";
    [ObservableProperty] private DateTime? _lastLogin;
    [ObservableProperty] private DateTime _dateCreated;
    [ObservableProperty] private string _phoneNumber = "";
    [ObservableProperty] private string _department = "";

    public bool IsStudent => Role == "Student";
    public bool IsTeacher => Role == "Teacher";
    public bool IsAdmin => Role == "Admin";
    public bool IsStaff => Role == "Staff";
    public bool IsActive => Status == "Active";
    public bool IsInactive => Status == "Inactive";
    public bool IsSuspended => Status == "Suspended";
    public bool IsPending => Status == "Pending";
    public bool CanEdit => !IsPending;
    public bool CanToggleStatus => !IsPending;

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush StatusBrush => Status switch
    {
        "Active" => Resolve("SuccessBrush", "TextSecondaryBrush"),
        "Inactive" => Resolve("TextSecondaryBrush", "TextMutedBrush"),
        "Suspended" => Resolve("DangerBrush", "TextSecondaryBrush"),
        "Pending" => Resolve("WarningBrush", "TextSecondaryBrush"),
        _ => Resolve("TextSecondaryBrush", "TextMutedBrush")
    };

    public IBrush RoleBrush => Role switch
    {
        "Student" => Resolve("InfoBrush", "AccentBrush"),
        "Teacher" => Resolve("PurpleBrush", "AccentBrush"),
        "Admin" => Resolve("DangerBrush", "AccentBrush"),
        "Staff" => Resolve("SuccessBrush", "AccentBrush"),
        _ => Resolve("TextSecondaryBrush", "AccentBrush")
    };

    public string DisplayId => IsStudent ? StudentId : EmployeeId;
    public string LastLoginText => LastLogin?.ToString("MMM dd, yyyy HH:mm") ?? "Never";
    public string StatusActionText => IsActive ? "Deactivate" : "Activate";

    partial void OnStatusChanged(string value)
    {
        OnPropertyChanged(nameof(IsActive));
        OnPropertyChanged(nameof(IsInactive));
        OnPropertyChanged(nameof(IsSuspended));
        OnPropertyChanged(nameof(IsPending));
        OnPropertyChanged(nameof(StatusBrush));
        OnPropertyChanged(nameof(CanEdit));
        OnPropertyChanged(nameof(CanToggleStatus));
        OnPropertyChanged(nameof(StatusActionText));
    }

    partial void OnRoleChanged(string value)
    {
        OnPropertyChanged(nameof(IsStudent));
        OnPropertyChanged(nameof(IsTeacher));
        OnPropertyChanged(nameof(IsAdmin));
        OnPropertyChanged(nameof(IsStaff));
        OnPropertyChanged(nameof(RoleBrush));
        OnPropertyChanged(nameof(DisplayId));
    }

    partial void OnLastLoginChanged(DateTime? value) => OnPropertyChanged(nameof(LastLoginText));
    partial void OnStudentIdChanged(string value) => OnPropertyChanged(nameof(DisplayId));
    partial void OnEmployeeIdChanged(string value) => OnPropertyChanged(nameof(DisplayId));
}