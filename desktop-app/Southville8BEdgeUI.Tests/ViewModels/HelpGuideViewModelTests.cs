using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class HelpGuideViewModelTests
{
    private HelpGuideViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Categories_And_DefaultSelection()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.HelpCategories);
        Assert.NotNull(vm.SelectedCategory);
        Assert.Same(vm.HelpCategories.First(), vm.SelectedCategory);
        // Each category should have at least one article
        Assert.All(vm.HelpCategories, c => Assert.NotEmpty(c.Articles));
    }

    [Fact]
    public void SelectCategoryCommand_Changes_SelectedCategory()
    {
        var vm = CreateVm();
        var second = vm.HelpCategories.Skip(1).First();
        Assert.NotSame(second, vm.SelectedCategory);
        vm.SelectCategoryCommand.Execute(second);
        Assert.Same(second, vm.SelectedCategory);
    }

    [Fact]
    public void SearchHelpCommand_DoesNotThrow_AndRetainsData()
    {
        var vm = CreateVm();
        int beforeCount = vm.HelpCategories.Count;
        vm.SearchText = "Settings"; // currently no filtering logic
        vm.SearchHelpCommand.Execute(null);
        Assert.Equal(beforeCount, vm.HelpCategories.Count); // unchanged
        Assert.NotNull(vm.SelectedCategory); // selection persists
    }

    [Fact]
    public void ContactSupportCommand_DoesNotThrow()
    {
        var vm = CreateVm();
        var ex = Record.Exception(() => vm.ContactSupportCommand.Execute(null));
        Assert.Null(ex);
    }
}
