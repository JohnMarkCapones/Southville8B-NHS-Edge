using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using Avalonia.Media;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class StudentManagementViewModelTests
{
    private StudentManagementViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Data_And_Filtered_Copy()
    {
        var vm = CreateVm();
        Assert.Equal(180, vm.TotalStudentsCount);
        Assert.Equal(172, vm.PresentTodayCount);
        Assert.Equal(8, vm.AbsentTodayCount);
        Assert.InRange(vm.AveragePerformance, 80, 100);
        Assert.InRange(vm.AttendanceRate, 90, 100);
        Assert.NotNull(vm.Classes);
        Assert.Contains("All Classes", vm.Classes);
        Assert.Equal("All Classes", vm.SelectedClass);
        Assert.NotNull(vm.Students);
        Assert.True(vm.Students.Count >= 3);
        Assert.NotNull(vm.FilteredStudents);
        Assert.Equal(vm.Students.Count, vm.FilteredStudents.Count);
    }

    [Fact]
    public void SearchText_Filters_Students_By_FullName()
    {
        var vm = CreateVm();
        vm.SearchText = "john"; // case-insensitive
        Assert.Single(vm.FilteredStudents);
        Assert.Contains(vm.FilteredStudents, s => s.FullName.Contains("John", StringComparison.OrdinalIgnoreCase));

        vm.SearchText = "zzz"; // no match
        Assert.Empty(vm.FilteredStudents);

        vm.SearchText = string.Empty; // reset
        Assert.Equal(vm.Students.Count, vm.FilteredStudents.Count);
    }

    [Fact]
    public void ViewStudentDetailsCommand_Sets_SelectedStudent()
    {
        var vm = CreateVm();
        var target = vm.Students.First();
        Assert.Null(vm.SelectedStudent);
        vm.ViewStudentDetailsCommand.Execute(target);
        Assert.Same(target, vm.SelectedStudent);
    }

    [Fact]
    public void Other_Commands_Execute_Without_Exception()
    {
        var vm = CreateVm();
        vm.GenerateReportCommand.Execute(null);
        vm.EditStudentCommand.Execute(vm.Students.First());
        vm.ContactParentCommand.Execute(vm.Students.First());
        vm.SendMessageCommand.Execute(null);
        vm.AddNoteCommand.Execute(null);
    }

    [Fact]
    public void StudentInfoViewModel_Initials_Computed_And_Updates_On_FullName_Change()
    {
        var s = new StudentInfoViewModel { FullName = "Maria Garcia" };
        Assert.Equal("MG", s.Initials);
        string? changedProp = null;
        ((INotifyPropertyChanged)s).PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(StudentInfoViewModel.Initials))
                changedProp = e.PropertyName;
        };
        s.FullName = "Maria Isabel Garcia"; // should recompute MIG
        Assert.Equal("MIG", s.Initials);
        Assert.Equal(nameof(StudentInfoViewModel.Initials), changedProp);
    }

    [Fact]
    public void StudentInfoViewModel_AttendanceStatus_Updates_Brushes()
    {
        var s = new StudentInfoViewModel { AttendanceStatus = "Present" };
        Assert.NotNull(s.AttendanceStatusBackgroundBrush);
        Assert.NotNull(s.AttendanceStatusTextBrush);
        s.AttendanceStatus = "Absent";
        Assert.NotNull(s.AttendanceStatusBackgroundBrush);
        Assert.NotNull(s.AttendanceStatusTextBrush);
        s.AttendanceStatus = "Late"; // custom / other path
        Assert.NotNull(s.AttendanceStatusBackgroundBrush);
        Assert.NotNull(s.AttendanceStatusTextBrush);
    }

    [Fact]
    public void StudentInfoViewModel_Private_ResolveBrush_Returns_Brush()
    {
        var method = typeof(StudentInfoViewModel).GetMethod("ResolveBrush", BindingFlags.NonPublic | BindingFlags.Static);
        Assert.NotNull(method);
        var brush = method!.Invoke(null, new object?[] { "NonExistingKey" });
        Assert.IsAssignableFrom<IBrush>(brush);
    }
}
