using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
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
    private readonly IDialogService _dialogService;
    private bool _isInitialLoad = true;
    
    // Search debounce cancellation token
    private CancellationTokenSource? _searchCancellationTokenSource;
  
    // Navigation callback supplied by shell
public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; }

    [ObservableProperty] private int _totalUsers = 0;
    [ObservableProperty] private int _students = 0;
    [ObservableProperty] private int _teachers = 0;
    [ObservableProperty] private int _admins = 0;
    [ObservableProperty] private int _activeUsers = 0;

    [ObservableProperty] private ObservableCollection<UserViewModel> _users = new();

    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string? _selectedRole;
    [ObservableProperty] private string? _selectedStatus;
 [ObservableProperty] private string? _selectedGrade;

    // Loading state
    [ObservableProperty] private bool _isLoading = false;

    // Pagination properties
    [ObservableProperty] private int _currentPage = 1;
[ObservableProperty] private int _pageSize = 25;
    [ObservableProperty] private int _totalPages = 1;
    [ObservableProperty] private int _totalItems = 0;

    // Page size options
    public ObservableCollection<int> PageSizeOptions { get; } = new() { 10, 25, 50, 100 };

    // Computed properties
    public bool CanGoToPreviousPage => CurrentPage > 1;
    public bool CanGoToNextPage => CurrentPage < TotalPages;
    public string PageInfo => $"Page {CurrentPage} of {TotalPages}";
public string ResultsInfo => $"Showing {((CurrentPage - 1) * PageSize) + 1}-{Math.Min(CurrentPage * PageSize, TotalItems)} of {TotalItems} users";

    public ObservableCollection<string> RoleOptions { get; } = new() { "All Roles", "Student", "Teacher", "Admin", "Staff" };
    public ObservableCollection<string> StatusOptions { get; } = new() { "All Status", "Active", "Inactive", "Suspended", "Pending" };
    public ObservableCollection<string> GradeOptions { get; } = new() { "All Grades", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Faculty", "N/A" };

    public double StudentPercentage => TotalUsers > 0 ? (double)Students / TotalUsers * 100 : 0;
    public double TeacherPercentage => TotalUsers > 0 ? (double)Teachers / TotalUsers * 100 : 0;
    public double AdminPercentage => TotalUsers > 0 ? (double)Admins / TotalUsers * 100 : 0;
    public double ActivePercentage => TotalUsers > 0 ? (double)ActiveUsers / TotalUsers * 100 : 0;
    public bool HasUsers => Users?.Any() == true;

    public UserManagementViewModel(IApiClient apiClient, IToastService toastService, IDialogService dialogService)
    {
        _apiClient = apiClient;
   _toastService = toastService;
        _dialogService = dialogService;
        
   // Initialize collections
    Users = new ObservableCollection<UserViewModel>();
        
      // Only load on first creation
   if (_isInitialLoad)
        {
  _ = LoadKpiMetricsAsync();
            _ = LoadUsersAsync();
            _isInitialLoad = false;
        }
    }

    [RelayCommand]
    public async Task RefreshUsers()
    {
    await LoadUsersAsync();
        await LoadKpiMetricsAsync();
    }

    [RelayCommand(CanExecute = nameof(CanGoToPreviousPage))]
    private async Task GoToFirstPage()
    {
      CurrentPage = 1;
        await LoadUsersAsync();
    }

    [RelayCommand(CanExecute = nameof(CanGoToPreviousPage))]
    private async Task GoToPreviousPage()
    {
  if (CurrentPage > 1)
{
        CurrentPage--;
          await LoadUsersAsync();
   }
    }

    [RelayCommand(CanExecute = nameof(CanGoToNextPage))]
  private async Task GoToNextPage()
    {
    if (CurrentPage < TotalPages)
{
            CurrentPage++;
        await LoadUsersAsync();
        }
    }

    [RelayCommand(CanExecute = nameof(CanGoToNextPage))]
  private async Task GoToLastPage()
    {
        CurrentPage = TotalPages;
        await LoadUsersAsync();
    }

    public void ShowLoadingState()
    {
   IsLoading = true;
    }

    partial void OnPageSizeChanged(int value)
    {
      CurrentPage = 1; // Reset to first page when page size changes
  _ = LoadUsersAsync();
    }

    // ? NEW: Debounced search - waits 300ms after user stops typing
    partial void OnSearchTextChanged(string value)
    {
        // Cancel previous search
   _searchCancellationTokenSource?.Cancel();
   _searchCancellationTokenSource = new CancellationTokenSource();
     
        // Reset to page 1 when search changes
        CurrentPage = 1;
        
        // Debounce: wait 300ms before searching
        var token = _searchCancellationTokenSource.Token;
        Task.Run(async () =>
  {
        try
   {
            await Task.Delay(300, token);
  
  // ? FIX: Marshal back to UI thread before calling LoadUsersAsync
            if (!token.IsCancellationRequested)
  {
    await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(async () =>
  {
         await LoadUsersAsync();
   });
       }
        }
    catch (TaskCanceledException)
        {
    // Expected when search is canceled, ignore
        }
    }, token);
    }

    // ? UPDATED: Reset to page 1 and reload on filter changes
    partial void OnSelectedRoleChanged(string? value)
    {
    CurrentPage = 1;
        _ = LoadUsersAsync();
    }

    partial void OnSelectedStatusChanged(string? value)
    {
CurrentPage = 1;
        _ = LoadUsersAsync();
    }

    partial void OnSelectedGradeChanged(string? value)
    {
        CurrentPage = 1;
        _ = LoadUsersAsync();
    }

    private async Task LoadUsersAsync()
    {
   try
 {
            IsLoading = true;
            System.Diagnostics.Debug.WriteLine("=== Loading Users ===");
       System.Diagnostics.Debug.WriteLine($"Search: '{SearchText}'");
            System.Diagnostics.Debug.WriteLine($"Role: {SelectedRole}");
   System.Diagnostics.Debug.WriteLine($"Status: {SelectedStatus}");
 System.Diagnostics.Debug.WriteLine($"Page: {CurrentPage}, Limit: {PageSize}");
 
      // ? UPDATED: Pass search parameter to API
   var response = await _apiClient.GetUsersAsync(
     role: SelectedRole,
       status: SelectedStatus,
     search: string.IsNullOrWhiteSpace(SearchText) ? null : SearchText,  // ? ADD SEARCH
                page: CurrentPage,
                limit: PageSize
            );
      
            System.Diagnostics.Debug.WriteLine($"API Response: {response != null}");
            System.Diagnostics.Debug.WriteLine($"Users in response: {response?.Users?.Count ?? 0}");
     
   if (response?.Users != null)
            {
            // Update pagination info
         TotalItems = response.Pagination?.Total ?? 0;
     TotalPages = response.Pagination?.TotalPages ?? 1;
          
     // Debug: Log first user raw data
  if (response.Users.Count > 0)
       {
      var firstUser = response.Users[0];
         System.Diagnostics.Debug.WriteLine($"First user: ID={firstUser.Id}, Email={firstUser.Email}, FullName={firstUser.FullName}, Role={firstUser.Role}");
        System.Diagnostics.Debug.WriteLine($"First user StudentId={firstUser.StudentId}, GradeLevel={firstUser.GradeLevel}");
    }
            
     Users.Clear();
         foreach (var userDto in response.Users)
        {
  // Debug logging to see what we're receiving
       System.Diagnostics.Debug.WriteLine($"User DTO: ID={userDto.Id}, FullName='{userDto.FullName}', Email='{userDto.Email}', Role='{userDto.Role}', GradeLevel='{userDto.GradeLevel}'");
     
   var userVm = MapUserDtoToViewModel(userDto);
    Users.Add(userVm);
     
      // Debug logging to see what we're displaying
              System.Diagnostics.Debug.WriteLine($"User VM: FullName='{userVm.FullName}', Grade='{userVm.Grade}'");
   }
      
    System.Diagnostics.Debug.WriteLine($"Users loaded into collection: {Users.Count}");
      
      // Update statistics based on loaded users
       UpdateStatisticsFromUsers();
     
         // Notify command state changes
        GoToFirstPageCommand.NotifyCanExecuteChanged();
          GoToPreviousPageCommand.NotifyCanExecuteChanged();
                GoToNextPageCommand.NotifyCanExecuteChanged();
 GoToLastPageCommand.NotifyCanExecuteChanged();
    
              OnPropertyChanged(nameof(PageInfo));
      OnPropertyChanged(nameof(ResultsInfo));
         OnPropertyChanged(nameof(HasUsers));
     
     System.Diagnostics.Debug.WriteLine($"Total users: {Users.Count}");
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
            UpdateStatisticsFromUsers();
        }
        finally
        {
            IsLoading = false;
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
        // Use the same approach as UserDetailViewModel - trust the backend API
        string displayName = dto.FullName ?? "";
      
        // If FullName is empty or looks like an ID, try to construct from email
        if (string.IsNullOrEmpty(displayName) || 
            displayName.StartsWith("LRN-") || 
   displayName.StartsWith("Lrn-") ||
    displayName.All(c => char.IsDigit(c) || c == '-' || c == '_'))
   {
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
                else if (emailParts.Length > 0)
         {
     // Single word email - capitalize first letter
        displayName = char.ToUpper(emailParts[0]) + emailParts.Substring(1).ToLower();
          }
      }
        
     // If still no name, create a descriptive fallback
       if (string.IsNullOrEmpty(displayName))
   {
            var roleName = dto.Role ?? "User";
        var id = !string.IsNullOrEmpty(dto.StudentId) ? dto.StudentId : 
         !string.IsNullOrEmpty(dto.EmployeeId) ? dto.EmployeeId : 
   dto.Id;
          
     displayName = $"{roleName} ({id})";
     }
        }

        // Generate username - prefer LRN/Employee ID over email
        string username = "";
      if (!string.IsNullOrEmpty(dto.StudentId))
 {
            username = dto.StudentId;
     }
        else if (!string.IsNullOrEmpty(dto.EmployeeId))
        {
  username = dto.EmployeeId;
      }
        else
        {
            username = GenerateUsernameFromEmail(dto.Email);
        }
 
    return new UserViewModel
        {
   Id = dto.Id,
  FullName = displayName,
  Username = username,
            Email = dto.Email,
            Role = dto.Role ?? "Unknown",
Status = dto.Status,
       Grade = dto.GradeLevel ?? (dto.Role == "Teacher" ? "Faculty" : "N/A"),
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

    [RelayCommand] 
    private async Task CreateUser()
    {
        var vm = new CreateUserViewModel(_apiClient, _toastService) 
        { 
            NavigateBack = async () => 
            {
                await LoadUsersAsync();
                await LoadKpiMetricsAsync();
                NavigateTo?.Invoke(this);
            },
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
    
    [RelayCommand] 
    private void EditUser(UserViewModel user)
    {
        var vm = new EditUserViewModel(_apiClient, _toastService, user.Id, user.Role)
        {
            NavigateBack = () => NavigateTo?.Invoke(this)
        };
        NavigateTo?.Invoke(vm);
    }

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
                UpdateStatisticsFromUsers();
                
                // Log activity
                await LogActivityAsync(
                    "user_status_updated",
                    $"{(newStatus == "Active" ? "Activated" : "Deactivated")} user {user.FullName}",
                    "user",
                    user.Id
                );
                
                // Reload to get fresh data from server
                await LoadUsersAsync();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating user status: {ex.Message}");
        }
    }    [RelayCommand]
    private void ResetPassword(UserViewModel user)
    {
        _ = ResetPasswordAsync(user);
    }

    private async Task ResetPasswordAsync(UserViewModel user)
    {
   try
        {
            // Show confirmation dialog
     var confirmed = await _dialogService.ShowConfirmAsync(
      "Reset Password",
      $"Are you sure you want to reset the password for {user.FullName}?\n\n" +
      "For students and teachers, the password will be reset to their birthday (YYYYMMDD format).\n" +
        "For admins, a secure random password will be generated.",
                "Reset",
"Cancel"
    );

          if (!confirmed)
          return;

IsLoading = true;
      
       var response = await _apiClient.ResetPasswordAsync(user.Id);
            
   if (response != null)
            {
        // Show success message
     if (!string.IsNullOrEmpty(response.TemporaryPassword))
  {
  // Admin password - show the temporary password
       await _dialogService.ShowInfoAsync(
                   "Password Reset Successful",
             new Dictionary<string, string>
     {
 { "User", user.FullName },
           { "Temporary Password", response.TemporaryPassword },
                { "Note", "Please save this password and share it securely with the user." }
              }
            );
      }
          else
     {
         // Student/Teacher - birthday-based password
  _toastService.Success(
     $"Password reset successfully for {user.FullName}",
    "Success"
  );
  }
        }
  else
     {
      _toastService.Error(
           "Failed to reset password. The user may not exist in the system.",
       "Error"
     );
      }
        }
        catch (NotFoundException ex)
     {
        System.Diagnostics.Debug.WriteLine($"User not found: {ex.Message}");
            _toastService.Error(
       $"User not found. Please verify the user exists in the system.",
       "User Not Found"
    );
        }
        catch (Exception ex)
      {
    System.Diagnostics.Debug.WriteLine($"Error resetting password: {ex.Message}");
     _toastService.Error(
 $"An error occurred: {ex.Message}",
      "Error"
     );
        }
        finally
        {
      IsLoading = false;
        }
    }

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
                // Log activity
                await LogActivityAsync(
                    "user_deleted",
                    $"Deleted user {user.FullName}",
                    "user",
                    user.Id
                );
                
                // Reload to get fresh data from server
                await LoadUsersAsync();
                await LoadKpiMetricsAsync();
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

// Extension for UserManagementViewModel to add activity logging
partial class UserManagementViewModel
{
    private async Task LogActivityAsync(string actionType, string description, string? entityType = null, string? entityId = null)
    {
        try
        {
            // Get current user ID from API client
            var currentUserId = _apiClient.GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
            {
                System.Diagnostics.Debug.WriteLine("Cannot log activity: No current user ID");
                return;
            }

            // Map action types to icons and colors
            var (icon, color) = actionType switch
            {
                "user_created" => ("UserPlus", "blue"),
                "user_status_updated" => ("CheckCircle", "green"),
                "password_reset" => ("Key", "orange"),
                "user_deleted" => ("Delete", "red"),
                "user_updated" => ("Edit", "blue"),
                _ => ("Info", "gray")
            };

            var activityData = new
            {
                user_id = currentUserId,
                action_type = actionType,
                description = description,
                entity_type = entityType,
                entity_id = entityId,
                icon = icon,
                color = color,
                metadata = new { source = "desktop_app", module = "user_management" }
            };

            await _apiClient.PostAsync("admin-activities", activityData);
            System.Diagnostics.Debug.WriteLine($"Activity logged: {actionType} - {description}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error logging activity: {ex.Message}");
            // Don't throw - activity logging failure shouldn't break user operations
        }
    }
}