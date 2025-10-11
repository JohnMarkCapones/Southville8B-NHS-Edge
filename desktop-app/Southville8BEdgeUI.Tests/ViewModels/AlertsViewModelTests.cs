using System;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class AlertsViewModelTests
{
    private AlertsViewModel CreateVm() => new();

    [Fact]
    public void Constructor_PopulatesMockAlerts_ComputedValuesCorrect()
    {
        var vm = CreateVm();
        Assert.Equal(3, vm.Alerts.Count);
        var active = vm.Alerts.Count(a => a.IsActive);
        Assert.Equal(active, vm.ActiveCount);
        // ActiveAlerts ordering matches descending string priority then by ExpiresAt
        var ordered = vm.ActiveAlerts.Select(a => a.Id).ToList();
        var expected = vm.ActiveAlerts.OrderByDescending(a => a.Priority).ThenBy(a => a.ExpiresAt).Select(a => a.Id).ToList();
        Assert.Equal(expected, ordered);
    }

    [Fact]
    public void CreateAlert_AddsAlert_WhenValid_AndClearsForm()
    {
        var vm = CreateVm();
        int before = vm.Alerts.Count;
        vm.NewTitle = "Test Alert";
        vm.NewMessage = "Something happened";
        vm.NewPriority = "High";
        vm.NewType = "System";
        vm.CreateAlertCommand.Execute(null);
        Assert.Equal(before + 1, vm.Alerts.Count);
        var newest = vm.Alerts.First();
        Assert.Equal("Test Alert", newest.Title);
        Assert.Equal("System", newest.Type);
        // Form cleared
        Assert.Equal("Weather", vm.NewType);
        Assert.Equal(string.Empty, vm.NewTitle);
        Assert.Equal(string.Empty, vm.NewMessage);
        Assert.Equal("High", vm.NewPriority); // default restored
    }

    [Fact]
    public void CreateAlert_DoesNotAdd_WhenInvalid()
    {
        var vm = CreateVm();
        int before = vm.Alerts.Count;
        vm.NewTitle = ""; // invalid
        vm.NewMessage = "Some message";
        vm.CreateAlertCommand.Execute(null);
        Assert.Equal(before, vm.Alerts.Count);
    }

    [Fact]
    public void CreateAlert_TargetAudience_Mapped_FromScope()
    {
        var vm = CreateVm();
        vm.NewTitle = "Grade Alert";
        vm.NewMessage = "Grade specific";
        vm.NewTargetScope = "Grade Level";
        vm.NewGradeLevel = "8";
        vm.CreateAlertCommand.Execute(null);
        Assert.StartsWith("grade_8", vm.Alerts.First().TargetAudience);

        vm.NewTitle = "Section Alert";
        vm.NewMessage = "Section specific";
        vm.NewTargetScope = "Section";
        vm.NewSection = "8-A";
        vm.CreateAlertCommand.Execute(null);
        Assert.StartsWith("section_8a", vm.Alerts.First().TargetAudience);
    }

    [Fact]
    public void DeleteAlert_RemovesAlert()
    {
        var vm = CreateVm();
        var alert = vm.Alerts.First();
        int before = vm.Alerts.Count;
        vm.DeleteAlertCommand.Execute(alert);
        Assert.Equal(before - 1, vm.Alerts.Count);
        Assert.DoesNotContain(alert, vm.Alerts);
    }

    [Fact]
    public void ExpireAlert_UpdatesActiveCount()
    {
        var vm = CreateVm();
        var activeAlert = vm.Alerts.First(a => a.IsActive);
        int beforeActive = vm.ActiveCount;
        vm.ExpireAlertCommand.Execute(activeAlert);
        Assert.True(activeAlert.IsExpired);
        vm.RefreshComputedCommand.Execute(null); // recompute
        Assert.Equal(beforeActive - 1, vm.ActiveCount);
    }

    [Fact]
    public void PurgeExpired_RemovesExpiredAlerts()
    {
        var vm = CreateVm();
        // Ensure at least one more expired by expiring an active one
        var activeAlert = vm.Alerts.First(a => a.IsActive);
        vm.ExpireAlertCommand.Execute(activeAlert);
        int before = vm.Alerts.Count;
        int expiredBefore = vm.Alerts.Count(a => a.IsExpired);
        vm.PurgeExpiredCommand.Execute(null);
        Assert.True(vm.Alerts.Count <= before - expiredBefore);
        Assert.Equal(0, vm.Alerts.Count(a => a.IsExpired));
    }

    [Fact]
    public void ClearForm_ResetsFields()
    {
        var vm = CreateVm();
        vm.NewType = "Emergency";
        vm.NewTitle = "T";
        vm.NewMessage = "M";
        vm.NewExtraLink = "L";
        vm.NewPriority = "Low";
        vm.NewTargetScope = "Section";
        vm.NewGradeLevel = "9";
        vm.NewSection = "9-A";
        vm.NewExpiresDate = DateTimeOffset.Now.Date.AddDays(1);
        vm.NewExpiresTime = new TimeSpan(8, 30, 0);
        vm.ClearFormCommand.Execute(null);
        Assert.Equal("Weather", vm.NewType);
        Assert.Equal(string.Empty, vm.NewTitle);
        Assert.Equal(string.Empty, vm.NewMessage);
        Assert.Equal(string.Empty, vm.NewExtraLink);
        Assert.Equal("High", vm.NewPriority);
        Assert.Equal("Whole School", vm.NewTargetScope);
        Assert.Equal(string.Empty, vm.NewGradeLevel);
        Assert.Equal(string.Empty, vm.NewSection);
        Assert.Equal(DateTimeOffset.Now.Date, vm.NewExpiresDate);
        Assert.Equal(new TimeSpan(23,59,0), vm.NewExpiresTime);
    }

    [Fact]
    public void ActiveAlerts_Reacts_After_RefreshComputed()
    {
        var vm = CreateVm();
        var activeAlert = vm.Alerts.First(a => a.IsActive);
        vm.ExpireAlertCommand.Execute(activeAlert); // expire via command
        vm.RefreshComputedCommand.Execute(null);
        Assert.False(activeAlert.IsActive);
        var expected = vm.Alerts.Count(a => a.IsActive);
        Assert.Equal(expected, vm.ActiveCount);
    }
}
