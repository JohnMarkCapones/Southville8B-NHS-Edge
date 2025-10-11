using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class AdminDashboardViewModelTests
{
    private AdminDashboardViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Populates_Collections()
    {
        var vm = CreateVm();
        Assert.NotNull(vm.WeeklyStats);
        Assert.NotNull(vm.UpcomingEvents);
        Assert.NotNull(vm.RecentActivities);
        Assert.NotNull(vm.SystemAlerts);
        Assert.NotNull(vm.PerformanceMetrics);
        Assert.NotNull(vm.GradeDistribution);

        Assert.Equal(7, vm.WeeklyStats.Count);
        Assert.Equal(5, vm.UpcomingEvents.Count);
        Assert.Equal(7, vm.RecentActivities.Count);
        Assert.Equal(4, vm.SystemAlerts.Count);
        Assert.Equal(4, vm.PerformanceMetrics.Count);
        Assert.Equal(5, vm.GradeDistribution.Count);
    }

    [Fact]
    public void ComputedProperties_AreCorrect()
    {
        var vm = CreateVm();
        Assert.Equal(vm.MonthlyRevenue - vm.OperatingCosts, vm.NetRevenue);
        // 18 / 36 * 100 = 50
        Assert.Equal(50, Math.Round(vm.RoomOccupancyRate));
        Assert.Equal("Excellent", vm.SystemStatus); // default uptime 99.8
    }

    [Fact]
    public void SystemStatus_Changes_WithUptime()
    {
        var vm = CreateVm();
        vm.SystemUptime = 97.0; // between 95 and 99.5
        Assert.Equal("Good", vm.SystemStatus);
        vm.SystemUptime = 90.0; // below 95
        Assert.Equal("Needs Attention", vm.SystemStatus);
        vm.SystemUptime = 99.9; // above 99.5
        Assert.Equal("Excellent", vm.SystemStatus);
    }

    [Fact]
    public void WeeklyStats_HaveFlagsAssignedCorrectly()
    {
        var vm = CreateVm();
        var stats = vm.WeeklyStats;
        Assert.Equal(7, stats.Count);
        Assert.Single(stats.Where(s => s.IsPeak));
        double average = stats.Average(s => s.StudentCount);
        foreach (var s in stats)
        {
            Assert.Equal(s.StudentCount >= average, s.IsAboveAverage);
        }
    }

    [Fact]
    public void DismissAlertCommand_RemovesAlert()
    {
        var vm = CreateVm();
        var alert = vm.SystemAlerts.First();
        var count = vm.SystemAlerts.Count;
        vm.DismissAlertCommand.Execute(alert);
        Assert.Equal(count - 1, vm.SystemAlerts.Count);
        Assert.DoesNotContain(alert, vm.SystemAlerts);
    }

    [Fact]
    public void PerformanceMetrics_ChangeTextFormatting()
    {
        var vm = CreateVm();
        foreach (var m in vm.PerformanceMetrics)
        {
            if (m.IsPositive)
                Assert.StartsWith("+", m.ChangeText);
            else
                Assert.DoesNotContain("+", m.ChangeText);
            Assert.EndsWith("%", m.ChangeText);
        }
    }

    [Fact]
    public void GradeDistribution_ColorBrush_NotNull()
    {
        var vm = CreateVm();
        foreach (var g in vm.GradeDistribution)
        {
            Assert.NotNull(g.ColorBrush);
        }
    }

    [Fact]
    public void CommandProperties_AreCreated()
    {
        var vm = CreateVm();
        Assert.NotNull(vm.RefreshDashboardCommand);
        Assert.NotNull(vm.ViewAllAlertsCommand);
        Assert.NotNull(vm.ViewDetailedReportsCommand);
        Assert.NotNull(vm.DismissAlertCommand);

        // Execute no-op commands to ensure they are invokable
        vm.RefreshDashboardCommand.Execute(null);
        vm.ViewAllAlertsCommand.Execute(null);
        vm.ViewDetailedReportsCommand.Execute(null);
    }
}
