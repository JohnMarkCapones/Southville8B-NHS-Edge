using System;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class ImportUsersViewModelTests
{
    private ImportUsersViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initial_State()
    {
        var vm = CreateVm();
        Assert.Equal("No file selected", vm.SelectedFileName);
        Assert.False(vm.HasFile);
        Assert.False(vm.CanImport);
        Assert.Equal("No file loaded.", vm.SummaryText);
        Assert.Equal(string.Empty, vm.ImportStatusMessage);
        Assert.False(vm.HasImportCompleted);
    }

    [Fact]
    public void BrowseFile_LoadsSampleData_And_EnablesImport()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        Assert.True(vm.HasFile);
        Assert.Equal("sample-users.csv", vm.SelectedFileName);
        Assert.Equal(9, vm.CsvColumns.Count);
        Assert.Equal(3, vm.PreviewRows.Count);
        Assert.Equal("FullName", vm.FullNameColumn);
        Assert.Contains("Columns detected: 9", vm.SummaryText);
        Assert.Contains("Preview rows: 3", vm.SummaryText);
        Assert.True(vm.CanImport);
    }

    [Fact]
    public void ClearFile_ResetsState()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        Assert.True(vm.CanImport);
        vm.ClearFileCommand.Execute(null);
        Assert.Equal("No file selected", vm.SelectedFileName);
        Assert.False(vm.HasFile);
        Assert.Empty(vm.CsvColumns);
        Assert.Empty(vm.PreviewRows);
        Assert.Equal("No file loaded.", vm.SummaryText);
        Assert.False(vm.CanImport);
        Assert.Equal(string.Empty, vm.FullNameColumn);
    }

    [Fact]
    public void CanImport_False_When_Missing_Mapped_Column()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        Assert.True(vm.CanImport);
        vm.FullNameColumn = string.Empty; // required column removed
        Assert.False(vm.CanImport);
    }

    [Fact]
    public async Task ImportCommand_Fails_When_CannotImport()
    {
        var vm = CreateVm();
        // No file -> cannot import
        await vm.ImportCommand.ExecuteAsync(null);
        Assert.Equal("Cannot import. Fix issues first.", vm.ImportStatusMessage);
        // HasImportCompleted is true because an attempt finished (even though not executed)
        Assert.True(vm.HasImportCompleted);
    }

    [Fact]
    public async Task ImportCommand_Succeeds_After_BrowseFile()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        Assert.True(vm.CanImport);
        await vm.ImportCommand.ExecuteAsync(null);
        Assert.Equal("Import completed successfully.", vm.ImportStatusMessage);
        Assert.True(vm.HasImportCompleted);
        Assert.False(vm.IsImporting);
    }

    [Fact]
    public async Task Done_Does_Not_Invoke_When_Importing()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        // Start import but call Done immediately while importing flag true
        var importTask = vm.ImportCommand.ExecuteAsync(null); // sets IsImporting true quickly
        vm.DoneCommand.Execute(null); // should be ignored
        Assert.False(navigated);
        await importTask; // finish
        vm.DoneCommand.Execute(null); // now should navigate
        Assert.True(navigated);
    }

    [Fact]
    public async Task Cancel_Does_Not_Invoke_When_Importing()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        bool navigated = false;
        vm.NavigateBack = () => navigated = true;
        var importTask = vm.ImportCommand.ExecuteAsync(null);
        vm.CancelCommand.Execute(null); // ignored while importing
        Assert.False(navigated);
        await importTask;
        vm.CancelCommand.Execute(null);
        Assert.True(navigated);
    }

    [Fact]
    public async Task HasImportCompleted_True_Only_After_Import_Finished()
    {
        var vm = CreateVm();
        vm.BrowseFileCommand.Execute(null);
        var importTask = vm.ImportCommand.ExecuteAsync(null);
        if (vm.IsImporting)
        {
            Assert.False(vm.HasImportCompleted);
        }
        await importTask;
        Assert.True(vm.HasImportCompleted);
    }
}
