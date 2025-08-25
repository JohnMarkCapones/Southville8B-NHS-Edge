using System;
using System.Collections.ObjectModel;
using System.Linq;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class UserManagementViewModel : ViewModelBase
{
    [ObservableProperty]
    private int _totalUsers = 342;

    [ObservableProperty]
    private int _students = 285;

    [ObservableProperty]
    private int _teachers = 45;

    [ObservableProperty]
    private int _admins = 12;

    [ObservableProperty]
    private int _activeUsers = 320;

    [ObservableProperty]
    private ObservableCollection<UserViewModel> _users;

    [ObservableProperty]
    private ObservableCollection<UserViewModel> _filteredUsers;

    [ObservableProperty]
    private string _searchText = "";

    [ObservableProperty]
    private string? _selectedRole;

    [ObservableProperty]
    private string? _selectedStatus;

    [ObservableProperty]
    private string? _selectedGrade;

    public ObservableCollection<string> RoleOptions { get; } = new() { "All Roles", "Student", "Teacher", "Admin", "Staff" };
    public ObservableCollection<string> StatusOptions { get; } = new() { "All Status", "Active", "Inactive", "Suspended", "Pending" };
    public ObservableCollection<string> GradeOptions { get; } = new() { "All Grades", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Faculty", "N/A" };

    public double StudentPercentage => TotalUsers > 0 ? (double)Students / TotalUsers * 100 : 0;
    public double TeacherPercentage => TotalUsers > 0 ? (double)Teachers / TotalUsers * 100 : 0;
    public double AdminPercentage => TotalUsers > 0 ? (double)Admins / TotalUsers * 100 : 0;
    public double ActivePercentage => TotalUsers > 0 ? (double)ActiveUsers / TotalUsers * 100 : 0;
    public bool HasFilteredUsers => FilteredUsers?.Any() == true;

    public UserManagementViewModel()
    {
        // Sample Data for Demonstration
        Users = new ObservableCollection<UserViewModel>
        {
            new UserViewModel 
            { 
                FullName = "John Michael Smith", 
                Username = "j.smith2024", 
                Email = "john.smith@southville8b.edu", 
                Role = "Student", 
                Status = "Active", 
                Grade = "Grade 10",
                StudentId = "2024-001", 
                LastLogin = DateTime.Now.AddMinutes(-30),
                DateCreated = new DateTime(2024, 1, 15),
                PhoneNumber = "+63 912 345 6789"
            },
            new UserViewModel 
            { 
                FullName = "Maria Elena Rodriguez", 
                Username = "m.rodriguez", 
                Email = "maria.rodriguez@southville8b.edu", 
                Role = "Teacher", 
                Status = "Active", 
                Grade = "Faculty",
                EmployeeId = "T-2020-015", 
                LastLogin = DateTime.Now.AddHours(-2),
                DateCreated = new DateTime(2020, 8, 20),
                PhoneNumber = "+63 917 234 5678",
                Department = "Mathematics"
            },
            new UserViewModel 
            { 
                FullName = "Sarah Kim Chen", 
                Username = "s.chen2025", 
                Email = "sarah.chen@southville8b.edu", 
                Role = "Student", 
                Status = "Active", 
                Grade = "Grade 9",
                StudentId = "2025-045", 
                LastLogin = DateTime.Now.AddMinutes(-15),
                DateCreated = new DateTime(2024, 2, 10),
                PhoneNumber = "+63 908 123 4567"
            },
            new UserViewModel 
            { 
                FullName = "Robert James Wilson", 
                Username = "r.wilson", 
                Email = "robert.wilson@southville8b.edu", 
                Role = "Admin", 
                Status = "Active", 
                Grade = "N/A",
                EmployeeId = "A-2019-003", 
                LastLogin = DateTime.Now.AddMinutes(-5),
                DateCreated = new DateTime(2019, 6, 1),
                PhoneNumber = "+63 915 987 6543",
                Department = "IT Administration"
            },
            new UserViewModel 
            { 
                FullName = "Emma Grace Thompson", 
                Username = "e.thompson2023", 
                Email = "emma.thompson@southville8b.edu", 
                Role = "Student", 
                Status = "Inactive", 
                Grade = "Grade 12",
                StudentId = "2023-089", 
                LastLogin = DateTime.Now.AddDays(-7),
                DateCreated = new DateTime(2023, 1, 8),
                PhoneNumber = "+63 919 876 5432"
            },
            new UserViewModel 
            { 
                FullName = "Dr. Michael David Brown", 
                Username = "m.brown", 
                Email = "michael.brown@southville8b.edu", 
                Role = "Teacher", 
                Status = "Active", 
                Grade = "Faculty",
                EmployeeId = "T-2018-007", 
                LastLogin = DateTime.Now.AddHours(-1),
                DateCreated = new DateTime(2018, 9, 15),
                PhoneNumber = "+63 916 765 4321",
                Department = "Science"
            },
            new UserViewModel 
            { 
                FullName = "Ashley Marie Davis", 
                Username = "a.davis2024", 
                Email = "ashley.davis@southville8b.edu", 
                Role = "Student", 
                Status = "Active", 
                Grade = "Grade 11",
                StudentId = "2024-067", 
                LastLogin = DateTime.Now.AddMinutes(-45),
                DateCreated = new DateTime(2024, 1, 20),
                PhoneNumber = "+63 920 654 3210"
            },
            new UserViewModel 
            { 
                FullName = "Lisa Anne Garcia", 
                Username = "l.garcia", 
                Email = "lisa.garcia@southville8b.edu", 
                Role = "Staff", 
                Status = "Active", 
                Grade = "N/A",
                EmployeeId = "S-2021-012", 
                LastLogin = DateTime.Now.AddMinutes(-90),
                DateCreated = new DateTime(2021, 3, 10),
                PhoneNumber = "+63 918 543 2109",
                Department = "Library"
            },
            new UserViewModel 
            { 
                FullName = "James Alexander Miller", 
                Username = "j.miller2025", 
                Email = "james.miller@southville8b.edu", 
                Role = "Student", 
                Status = "Suspended", 
                Grade = "Grade 8",
                StudentId = "2025-123", 
                LastLogin = DateTime.Now.AddDays(-3),
                DateCreated = new DateTime(2024, 8, 25),
                PhoneNumber = "+63 913 432 1098"
            },
            new UserViewModel 
            { 
                FullName = "Jennifer Rose Taylor", 
                Username = "j.taylor", 
                Email = "jennifer.taylor@southville8b.edu", 
                Role = "Teacher", 
                Status = "Active", 
                Grade = "Faculty",
                EmployeeId = "T-2022-025", 
                LastLogin = DateTime.Now.AddMinutes(-20),
                DateCreated = new DateTime(2022, 1, 12),
                PhoneNumber = "+63 921 321 0987",
                Department = "English"
            },
            new UserViewModel 
            { 
                FullName = "Kevin Paul Anderson", 
                Username = "k.anderson2024", 
                Email = "kevin.anderson@southville8b.edu", 
                Role = "Student", 
                Status = "Pending", 
                Grade = "Grade 9",
                StudentId = "2024-156", 
                LastLogin = null,
                DateCreated = DateTime.Now.AddDays(-2),
                PhoneNumber = "+63 922 210 9876"
            },
            new UserViewModel 
            { 
                FullName = "Catherine Joy Martinez", 
                Username = "c.martinez", 
                Email = "catherine.martinez@southville8b.edu", 
                Role = "Admin", 
                Status = "Active", 
                Grade = "N/A",
                EmployeeId = "A-2020-008", 
                LastLogin = DateTime.Now.AddMinutes(-10),
                DateCreated = new DateTime(2020, 11, 5),
                PhoneNumber = "+63 923 109 8765",
                Department = "Academic Affairs"
            }
        };

        FilteredUsers = new ObservableCollection<UserViewModel>(Users);
        UpdateStatistics();
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
            filtered = filtered.Where(u => u.FullName.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         u.Username.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         u.Email.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         u.StudentId.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                         u.EmployeeId.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(SelectedRole) && SelectedRole != "All Roles")
        {
            filtered = filtered.Where(u => u.Role == SelectedRole);
        }

        if (!string.IsNullOrWhiteSpace(SelectedStatus) && SelectedStatus != "All Status")
        {
            filtered = filtered.Where(u => u.Status == SelectedStatus);
        }

        if (!string.IsNullOrWhiteSpace(SelectedGrade) && SelectedGrade != "All Grades")
        {
            filtered = filtered.Where(u => u.Grade == SelectedGrade);
        }

        FilteredUsers.Clear();
        foreach (var user in filtered)
        {
            FilteredUsers.Add(user);
        }
        OnPropertyChanged(nameof(HasFilteredUsers));
    }

    private void UpdateStatistics()
    {
        TotalUsers = Users.Count;
        Students = Users.Count(u => u.Role == "Student");
        Teachers = Users.Count(u => u.Role == "Teacher");
        Admins = Users.Count(u => u.Role == "Admin");
        ActiveUsers = Users.Count(u => u.Status == "Active");
        
        OnPropertyChanged(nameof(StudentPercentage));
        OnPropertyChanged(nameof(TeacherPercentage));
        OnPropertyChanged(nameof(AdminPercentage));
        OnPropertyChanged(nameof(ActivePercentage));
    }

    [RelayCommand]
    private void CreateUser()
    {
        // TODO: Open create user dialog
    }

    [RelayCommand]
    private void ImportUsers()
    {
        // TODO: Open import users dialog
    }

    [RelayCommand]
    private void ViewUserDetails(UserViewModel user)
    {
        // TODO: Show user details dialog
    }

    [RelayCommand]
    private void EditUser(UserViewModel user)
    {
        // TODO: Open edit user dialog
    }

    [RelayCommand]
    private void ToggleUserStatus(UserViewModel user)
    {
        if (user.IsActive)
        {
            user.Status = "Inactive";
        }
        else if (user.IsInactive)
        {
            user.Status = "Active";
        }
        
        UpdateStatistics();
        ApplyFilters();
    }

    [RelayCommand]
    private void ResetPassword(UserViewModel user)
    {
        // TODO: Implement password reset functionality
    }

    [RelayCommand]
    private void DeleteUser(UserViewModel user)
    {
        Users.Remove(user);
        UpdateStatistics();
        ApplyFilters();
    }
}

public partial class UserViewModel : ViewModelBase
{
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

    public string StatusColor => Status switch
    {
        "Active" => "#10B981",
        "Inactive" => "#6B7280",
        "Suspended" => "#EF4444",
        "Pending" => "#F59E0B",
        _ => "#6B7280"
    };

    public string RoleColor => Role switch
    {
        "Student" => "#3B82F6",
        "Teacher" => "#8B5CF6",
        "Admin" => "#EF4444",
        "Staff" => "#10B981",
        _ => "#6B7280"
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
        OnPropertyChanged(nameof(StatusColor));
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
        OnPropertyChanged(nameof(RoleColor));
        OnPropertyChanged(nameof(DisplayId));
    }

    partial void OnLastLoginChanged(DateTime? value)
    {
        OnPropertyChanged(nameof(LastLoginText));
    }

    partial void OnStudentIdChanged(string value)
    {
        OnPropertyChanged(nameof(DisplayId));
    }

    partial void OnEmployeeIdChanged(string value)
    {
        OnPropertyChanged(nameof(DisplayId));
    }
}