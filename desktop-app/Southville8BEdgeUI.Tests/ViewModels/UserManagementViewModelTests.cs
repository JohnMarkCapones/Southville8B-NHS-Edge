using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class UserManagementViewModelTests
{
    private UserManagementViewModel CreateVm() => new();

    [Fact]
    public void Constructor_SeedsUsers_And_Statistics()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.Users);
        Assert.Equal(vm.Users.Count, vm.FilteredUsers.Count);
        Assert.True(vm.HasFilteredUsers);
        Assert.Equal(vm.Users.Count(u => u.Role == "Student"), vm.Students);
        Assert.Equal(vm.Users.Count(u => u.Role == "Teacher"), vm.Teachers);
        Assert.Equal(vm.Users.Count(u => u.Role == "Admin"), vm.Admins);
        Assert.Equal(vm.Users.Count(u => u.Status == "Active"), vm.ActiveUsers);
        Assert.InRange(vm.StudentPercentage, 0, 100);
    }

    [Fact]
    public void SearchText_Filters_By_Name_Username_Email_Ids()
    {
        var vm = CreateVm();
        var fragment = vm.Users.First(u => !string.IsNullOrWhiteSpace(u.Username)).Username.Substring(0,2);
        vm.SearchText = fragment;
        Assert.All(vm.FilteredUsers, u => Assert.True(
            (u.FullName?.Contains(fragment, StringComparison.OrdinalIgnoreCase) ?? false) ||
            (u.Username?.Contains(fragment, StringComparison.OrdinalIgnoreCase) ?? false) ||
            (u.Email?.Contains(fragment, StringComparison.OrdinalIgnoreCase) ?? false) ||
            (u.StudentId?.Contains(fragment, StringComparison.OrdinalIgnoreCase) ?? false) ||
            (u.EmployeeId?.Contains(fragment, StringComparison.OrdinalIgnoreCase) ?? false)
        ));
        vm.SearchText = "__no_match__";
        Assert.Empty(vm.FilteredUsers);
        Assert.False(vm.HasFilteredUsers);
    }

    [Fact]
    public void Role_Status_Grade_Filters_Combine()
    {
        var vm = CreateVm();
        vm.SelectedRole = "Student";
        Assert.All(vm.FilteredUsers, u => Assert.Equal("Student", u.Role));
        vm.SelectedStatus = "Active";
        Assert.All(vm.FilteredUsers, u =>
        {
            Assert.Equal("Student", u.Role);
            Assert.Equal("Active", u.Status);
        });
        var anyGrade = vm.FilteredUsers.First(u => u.Grade.StartsWith("Grade"));
        vm.SelectedGrade = anyGrade.Grade;
        Assert.All(vm.FilteredUsers, u =>
        {
            Assert.Equal("Student", u.Role);
            Assert.Equal("Active", u.Status);
            Assert.Equal(anyGrade.Grade, u.Grade);
        });
    }

    [Fact]
    public void ClearFilters_Restores_All()
    {
        var vm = CreateVm();
        vm.SelectedRole = "Student";
        Assert.NotEqual(vm.Users.Count, vm.FilteredUsers.Count);
        vm.SelectedRole = "All Roles";
        vm.SelectedStatus = "All Status";
        vm.SelectedGrade = "All Grades";
        vm.SearchText = string.Empty; // triggers
        Assert.Equal(vm.Users.Count, vm.FilteredUsers.Count);
    }

    [Fact]
    public void CreateUserCommand_Navigates_To_CreateUserViewModel()
    {
        var vm = CreateVm();
        object? nav = null;
        vm.NavigateTo = child => nav = child;
        vm.CreateUserCommand.Execute(null);
        Assert.NotNull(nav);
        Assert.Contains("CreateUserViewModel", nav!.GetType().Name);
    }

    [Fact]
    public void ImportUsersCommand_Navigates_To_ImportUsersViewModel()
    {
        var vm = CreateVm();
        object? nav = null;
        vm.NavigateTo = child => nav = child;
        vm.ImportUsersCommand.Execute(null);
        Assert.NotNull(nav);
        Assert.Contains("ImportUsersViewModel", nav!.GetType().Name);
    }

    [Fact]
    public void ToggleUserStatus_Active_To_Inactive_UpdatesStats_And_Filters()
    {
        var vm = CreateVm();
        var target = vm.Users.First(u => u.Status == "Active");
        int beforeActive = vm.ActiveUsers;
        vm.ToggleUserStatusCommand.Execute(target);
        Assert.Equal("Inactive", target.Status);
        Assert.Equal(beforeActive - 1, vm.ActiveUsers);
    }

    [Fact]
    public void ToggleUserStatus_Inactive_To_Active_UpdatesStats()
    {
        var vm = CreateVm();
        var target = vm.Users.First(u => u.Status == "Inactive");
        int beforeActive = vm.ActiveUsers;
        vm.ToggleUserStatusCommand.Execute(target);
        Assert.Equal("Active", target.Status);
        Assert.Equal(beforeActive + 1, vm.ActiveUsers);
    }

    [Fact]
    public void DeleteUser_RemovesUser_And_UpdatesStatistics()
    {
        var vm = CreateVm();
        var toDelete = vm.Users.First();
        bool wasActive = toDelete.Status == "Active";
        int beforeTotal = vm.TotalUsers;
        int beforeActive = vm.ActiveUsers;
        vm.DeleteUserCommand.Execute(toDelete);
        Assert.DoesNotContain(toDelete, vm.Users);
        Assert.Equal(beforeTotal - 1, vm.TotalUsers);
        if (wasActive) Assert.Equal(beforeActive - 1, vm.ActiveUsers);
    }

    [Fact]
    public void UserViewModel_Role_Status_ComputedProperties_Update()
    {
        var u = new UserViewModel { Role = "Student", Status = "Active", StudentId = "S1" };
        Assert.True(u.IsStudent);
        Assert.Equal("S1", u.DisplayId);
        string activeAction = u.StatusActionText; // Deactivate
        u.Status = "Inactive";
        Assert.True(u.IsInactive);
        Assert.Equal("Activate", u.StatusActionText);
        u.Role = "Teacher";
        Assert.True(u.IsTeacher);
        u.StudentId = "S2"; // should not alter DisplayId now (teacher uses EmployeeId)
        u.EmployeeId = "E1";
        Assert.Equal("E1", u.DisplayId);
    }

    [Fact]
    public void UserViewModel_LastLoginText_FormatsOrShowsNever()
    {
        var u = new UserViewModel { LastLogin = null };
        Assert.Equal("Never", u.LastLoginText);
        var dt = new DateTime(2024,1,2,13,15,0);
        u.LastLogin = dt;
        Assert.Contains("Jan 02, 2024", u.LastLoginText);
    }
}
