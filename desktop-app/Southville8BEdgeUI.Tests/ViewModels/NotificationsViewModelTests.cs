using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class NotificationsViewModelTests
{
    private NotificationsViewModel CreateVm() => new();

    [Fact]
    public void Constructor_InitializesNotificationsAndUnreadCount()
    {
        var vm = CreateVm();
        Assert.Equal(3, vm.Notifications.Count); // seeded
        Assert.Equal(2, vm.UnreadCount); // two unread seeded
        Assert.All(vm.Notifications, n => Assert.False(string.IsNullOrWhiteSpace(n.Title)));
    }

    [Fact]
    public void MarkAsRead_DecrementsUnread_OnlyOnce()
    {
        var vm = CreateVm();
        var target = vm.Notifications.First(n => !n.IsRead);
        int before = vm.UnreadCount;
        vm.MarkAsReadCommand.Execute(target);
        Assert.True(target.IsRead);
        Assert.Equal(before - 1, vm.UnreadCount);
        // Call again should not change
        vm.MarkAsReadCommand.Execute(target);
        Assert.Equal(before - 1, vm.UnreadCount);
    }

    [Fact]
    public void MarkAllAsRead_SetsAllReadAndUnreadZero()
    {
        var vm = CreateVm();
        vm.MarkAllAsReadCommand.Execute(null);
        Assert.All(vm.Notifications, n => Assert.True(n.IsRead));
        Assert.Equal(0, vm.UnreadCount);
    }

    [Fact]
    public void DeleteNotification_Removes_And_AdjustsUnread()
    {
        var vm = CreateVm();
        var unread = vm.Notifications.First(n => !n.IsRead);
        var read = vm.Notifications.First(n => n.IsRead);
        int unreadBefore = vm.UnreadCount;
        vm.DeleteNotificationCommand.Execute(unread);
        Assert.DoesNotContain(unread, vm.Notifications);
        Assert.Equal(unreadBefore - 1, vm.UnreadCount);
        // Deleting an already read item should not change unread count
        var before2 = vm.UnreadCount;
        vm.DeleteNotificationCommand.Execute(read);
        Assert.Equal(before2, vm.UnreadCount);
    }

    [Fact]
    public void ClearAll_ClearsCollection_And_ResetsUnread()
    {
        var vm = CreateVm();
        vm.ClearAllCommand.Execute(null);
        Assert.Empty(vm.Notifications);
        Assert.Equal(0, vm.UnreadCount);
    }

    [Fact]
    public void NotificationItem_TimeAgo_Minutes_Hours_Days()
    {
        var now = DateTime.Now;
        var minutesItem = new NotificationItemViewModel { Timestamp = now.AddMinutes(-10) };
        Assert.Contains("minutes ago", minutesItem.TimeAgo);
        var hoursItem = new NotificationItemViewModel { Timestamp = now.AddHours(-5) };
        Assert.Contains("hours ago", hoursItem.TimeAgo);
        var daysItem = new NotificationItemViewModel { Timestamp = now.AddDays(-2) };
        Assert.Contains("days ago", daysItem.TimeAgo);
    }

    [Fact]
    public void NotificationItem_BackgroundColor_DependsOnIsRead()
    {
        var item = new NotificationItemViewModel { IsRead = false };
        Assert.Equal("#FFFFFF", item.BackgroundColor);
        item.IsRead = true;
        Assert.Equal("#F9FAFB", item.BackgroundColor);
    }
}
