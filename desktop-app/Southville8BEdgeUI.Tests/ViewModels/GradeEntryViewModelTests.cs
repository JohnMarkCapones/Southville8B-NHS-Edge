using System;
using System.IO;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class GradeEntryViewModelTests
{
    private GradeEntryViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Collections_And_CommandStates()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.Classes);
        Assert.False(string.IsNullOrWhiteSpace(vm.SelectedClass));
        Assert.NotEmpty(vm.StudentGrades);
        Assert.NotEmpty(vm.GradeDistribution);
        Assert.NotEmpty(vm.RecentGradeEntries);
        Assert.True(vm.ExportGradesCommand.CanExecute(null));
        Assert.False(vm.SaveAllGradesCommand.CanExecute(null));
        Assert.False(vm.HasUnsavedChanges);
    }

    [Fact]
    public void Editing_FinalGrade_MarksDirty_And_EnablesSave()
    {
        var vm = CreateVm();
        var sg = vm.StudentGrades.First();
        sg.FinalGrade += 1.0;
        Assert.True(vm.HasUnsavedChanges);
        Assert.True(vm.SaveAllGradesCommand.CanExecute(null));
    }

    [Fact]
    public void SaveAllGrades_ResetsDirtyFlag()
    {
        var vm = CreateVm();
        vm.StudentGrades.First().FinalGrade += 0.5; // mark dirty
        Assert.True(vm.HasUnsavedChanges);
        vm.SaveAllGradesCommand.Execute(null);
        Assert.False(vm.HasUnsavedChanges);
        Assert.False(vm.SaveAllGradesCommand.CanExecute(null));
    }

    [Fact]
    public void AddStudentGrade_Hooks_Events_And_MarksDirty()
    {
        var vm = CreateVm();
        int initialCount = vm.StudentGrades.Count;
        vm.StudentGrades.Add(new StudentGradeViewModel
        {
            StudentName = "New Student",
            QuizGrade = "80",
            AssignmentGrade = "85",
            ExamGrade = "90",
            FinalGrade = 88
        });
        Assert.Equal(initialCount + 1, vm.StudentGrades.Count);
        Assert.True(vm.HasUnsavedChanges);
        Assert.True(vm.ExportGradesCommand.CanExecute(null));
        Assert.True(vm.SaveAllGradesCommand.CanExecute(null));
    }

    [Fact]
    public void ExportGrades_Creates_Csv_File()
    {
        var vm = CreateVm();
        var temp = Path.GetTempPath();
        var existing = Directory.GetFiles(temp, "grades_export_*.csv").ToHashSet(StringComparer.OrdinalIgnoreCase);
        vm.ExportGradesCommand.Execute(null);
        var after = Directory.GetFiles(temp, "grades_export_*.csv");
        var newFile = after.FirstOrDefault(f => !existing.Contains(f));
        Assert.NotNull(newFile);
        var lines = File.ReadAllLines(newFile!);
        Assert.True(lines.Length >= vm.StudentGrades.Count + 1);
        Assert.Equal("Student,Quiz,Assignment,Exam,Final", lines[0]);
    }

    [Fact]
    public void StudentGradeViewModel_Commands_Execute_NoException()
    {
        var vm = CreateVm();
        var sg = vm.StudentGrades.First();
        sg.SaveGradeCommand.Execute(null);
        sg.EditNotesCommand.Execute(null);
    }
}
