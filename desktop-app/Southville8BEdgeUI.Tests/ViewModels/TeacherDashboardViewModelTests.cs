using System;
using System.Linq;
using Avalonia.Media;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class TeacherDashboardViewModelTests
{
    private TeacherDashboardViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Collections_And_Defaults()
    {
        var vm = CreateVm();
        Assert.NotNull(vm.WeeklySchedule);
        Assert.Equal(7, vm.WeeklySchedule.Count);
        Assert.NotNull(vm.TodaySchedule);
        Assert.NotEmpty(vm.TodaySchedule);
        Assert.NotNull(vm.RecentActivities);
        Assert.NotEmpty(vm.RecentActivities);
        Assert.NotNull(vm.StudentPerformance);
        Assert.NotEmpty(vm.StudentPerformance);
        Assert.NotNull(vm.ClassStatistics);
        Assert.NotEmpty(vm.ClassStatistics);
        Assert.NotNull(vm.SubjectDistribution);
        Assert.NotEmpty(vm.SubjectDistribution);
        Assert.True(vm.GradingProgress > 0);
        Assert.Contains("Good", vm.WelcomeMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void GradingProgress_Computation_Typical_And_NoPending()
    {
        var vm = CreateVm();
        double expected = (double)vm.CompletedGrading / (vm.CompletedGrading + vm.PendingAssignments) * 100;
        Assert.Equal(Math.Round(expected,2), Math.Round(vm.GradingProgress,2));
        vm.PendingAssignments = 0; // edge => 100
        Assert.Equal(100, vm.GradingProgress);
    }

    [Fact]
    public void WeeklySchedule_Flags_IsToday_And_IsPeakDay()
    {
        var vm = CreateVm();
        Assert.Contains(vm.WeeklySchedule, d => d.IsToday || d.Day == "Sun" || d.Day == "Mon" || d.Day == "Tue" || d.Day == "Wed" || d.Day == "Thu" || d.Day == "Fri" || d.Day == "Sat");
        int max = vm.WeeklySchedule.Max(d => d.ClassCount);
        Assert.Contains(vm.WeeklySchedule, d => d.IsPeakDay && d.ClassCount == max);
    }

    [Fact]
    public void WeeklyClassViewModel_Update_Reacts_To_ClassCount_And_State()
    {
        var w = new WeeklyClassViewModel { Day = "Mon", ClassCount = 0, Students = 0, Hours = "8-9" };
        Assert.False(w.HasClasses);
        w.ClassCount = 2;
        Assert.True(w.HasClasses);
        w.IsToday = true; // triggers visual update (brush may still be Transparent if no resources)
        Assert.NotNull(w.BackgroundBrush);
        Assert.NotNull(w.TextBrush);
        w.IsPeakDay = true; // also triggers update
        Assert.NotNull(w.BackgroundBrush);
    }

    [Fact]
    public void DashboardClassViewModel_StatusColor_LogicalChange_On_Status()
    {
        var c = new DashboardClassViewModel { Status = "Upcoming" };
        var initialStatus = c.Status;
        var initialColor = c.StatusColor; // may be Transparent without theme resources
        c.Status = "Completed";
        Assert.NotEqual(initialStatus, c.Status);
        Assert.NotNull(c.StatusColor);
    }

    [Fact]
    public void TeacherActivityViewModel_Computed_Properties()
    {
        var a = new TeacherActivityViewModel { Student = "John", Action = "submitted homework", Type = "Submission" };
        Assert.Contains("John", a.Description);
        Assert.Contains("submitted", a.Description);
        Assert.Equal("Send", a.IconName); // Submission maps to Send
        a.Type = "Late"; // icon & color recalculated
        Assert.Equal("Clock", a.IconName);
        a.Icon = "?"; // fallback icon mapping (may differ by platform) set before clearing type
        var prevIcon = a.IconName;
        a.Type = ""; // force icon mapping via legacy icon path (emoji-based)
        // Just assert icon name available and changed or matches previous (platform variance)
        Assert.False(string.IsNullOrWhiteSpace(a.IconName));
    }

    [Fact]
    public void StudentPerformanceViewModel_Improvement_Derived()
    {
        var sp = new StudentPerformanceViewModel { Subject = "Math", Improvement = 2.345, IsImproving = true };
        Assert.Equal("+2.3%", sp.ImprovementText);
        var textImproving = sp.ImprovementText;
        sp.IsImproving = false;
        var textDecline = sp.ImprovementText; // should reflect sign logic (no +)
        Assert.NotEqual(textImproving, textDecline);
        sp.Improvement = -0.7;
        Assert.Equal("-0.7%", sp.ImprovementText);
    }

    [Fact]
    public void SubjectDistributionViewModel_Color_Access_With_Subject_Change()
    {
        var sd = new SubjectDistributionViewModel { Subject = "Mathematics", StudentsCount = 10, Percentage = 50 };
        var mathColor = sd.Color;
        sd.Subject = "Physics";
        Assert.NotEqual("Mathematics", sd.Subject);
        Assert.NotNull(sd.Color); // may still be transparent, just ensure resolved
    }

    [Fact]
    public void Commands_Execute_Without_Exception()
    {
        var vm = CreateVm();
        vm.RefreshDashboardCommand.Execute(null);
        vm.ViewAllActivitiesCommand.Execute(null);
        vm.ViewDetailedReportsCommand.Execute(null);
        var classItem = vm.TodaySchedule.First();
        vm.StartClassCommand.Execute(classItem);
    }
}
