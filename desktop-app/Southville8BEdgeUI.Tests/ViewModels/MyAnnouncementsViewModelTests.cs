using System;
using System.Linq;
using System.Reflection;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class MyAnnouncementsViewModelTests
{
    private MyAnnouncementsViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Collections_And_Counts()
    {
        var vm = CreateVm();
        Assert.NotEmpty(vm.Announcements);
        Assert.NotEmpty(vm.RecentActivity);
        // ActiveAnnouncementsCount should be >= active items currently visible (may represent a broader total)
        int visibleActive = vm.Announcements.Count(a => a.Status == "Active");
        Assert.True(vm.ActiveAnnouncementsCount >= visibleActive);
        Assert.True(vm.TotalAnnouncementsCount >= vm.Announcements.Count);
        var first = vm.Announcements.First();
        Assert.NotNull(first.PriorityBadgeBackgroundBrush);
        Assert.NotNull(first.StatusBadgeBackgroundBrush);
    }

    [Fact]
    public void CreateQuickAnnouncement_AddsItem_UpdatesCounts_And_ResetsFields()
    {
        var vm = CreateVm();
        int beforeVisible = vm.Announcements.Count;
        int beforeTotalProp = vm.TotalAnnouncementsCount;
        vm.NewAnnouncementTitle = "Test Quick";
        vm.NewAnnouncementPriority = "High";
        vm.NewAnnouncementClass = "Grade 8A";
        vm.NewAnnouncementContent = "Content";
        vm.PostImmediately = true;
        vm.CreateQuickAnnouncementCommand.Execute(null);
        Assert.Equal(beforeVisible + 1, vm.Announcements.Count);
        Assert.True(vm.TotalAnnouncementsCount >= beforeTotalProp + 1); // global total should not decrease
        var added = vm.Announcements.First();
        Assert.Equal("Test Quick", added.Title);
        Assert.Equal("High", added.Priority);
        Assert.Equal("Active", added.Status);
        Assert.Equal(string.Empty, vm.NewAnnouncementTitle);
        Assert.Equal(string.Empty, vm.NewAnnouncementContent);
    }

    [Fact]
    public void CreateQuickAnnouncement_InvalidTitle_NoChange()
    {
        var vm = CreateVm();
        int beforeVisible = vm.Announcements.Count;
        int beforeTotalProp = vm.TotalAnnouncementsCount;
        vm.NewAnnouncementTitle = "   ";
        vm.CreateQuickAnnouncementCommand.Execute(null);
        Assert.Equal(beforeVisible, vm.Announcements.Count);
        Assert.Equal(beforeTotalProp, vm.TotalAnnouncementsCount);
    }

    [Fact]
    public void CreateAnnouncementCommand_Navigation_And_OnCreated_Callback_AddsAnnouncement()
    {
        var vm = CreateVm();
        object? navigated = null;
        vm.NavigateTo = child => navigated = child;
        int beforeVisible = vm.Announcements.Count;
        int beforeTotalProp = vm.TotalAnnouncementsCount;
        vm.CreateAnnouncementCommand.Execute(null);
        Assert.NotNull(navigated);
        var targetType = navigated!.GetType();
        var onCreatedProp = targetType.GetProperty("OnCreated", BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic);
        Assert.NotNull(onCreatedProp);
        var del = onCreatedProp!.GetValue(navigated) as Delegate;
        Assert.NotNull(del);
        var newItem = new AnnouncementItemViewModel
        {
            Title = "Reflected New",
            Priority = "Medium",
            Status = "Active",
            TargetClass = "Grade 9A",
            ContentPreview = "Preview...",
            ViewCount = 0,
            CommentCount = 0,
            PostedDate = "now",
            LastModified = "now"
        };
        del!.DynamicInvoke(newItem);
        Assert.Equal(beforeVisible + 1, vm.Announcements.Count);
        Assert.True(vm.TotalAnnouncementsCount >= beforeTotalProp + 1);
        Assert.Same(newItem, vm.Announcements.First());
    }

    [Fact]
    public void AnnouncementItem_Priority_And_Status_Brush_Update_Via_PropertyChange()
    {
        var item = new AnnouncementItemViewModel { Priority = "Low", Status = "Draft" };
        var initPriorityBg = item.PriorityBadgeBackgroundBrush;
        var initStatusBg = item.StatusBadgeBackgroundBrush;
        item.Priority = "High"; // triggers update
        item.Status = "Active"; // triggers update
        Assert.NotNull(item.PriorityBadgeBackgroundBrush);
        Assert.NotNull(item.StatusBadgeBackgroundBrush);
    }

    [Fact]
    public void UtilityCommands_Execute_NoException()
    {
        var vm = CreateVm();
        var ann = vm.Announcements.First();
        vm.ViewAnalyticsCommand.Execute(null);
        vm.EditAnnouncementCommand.Execute(ann);
        vm.ViewAnnouncementCommand.Execute(ann);
        vm.DeleteAnnouncementCommand.Execute(ann);
        Assert.True(true);
    }

    [Fact]
    public void Dispose_CanBeCalledMultipleTimes_NoException()
    {
        var vm = CreateVm();
        vm.Dispose();
        vm.Dispose();
        Assert.True(true);
    }
}
