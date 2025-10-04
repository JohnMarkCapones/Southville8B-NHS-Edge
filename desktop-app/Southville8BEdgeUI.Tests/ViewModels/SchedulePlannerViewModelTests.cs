using System;
using System.Linq;
using System.Reflection;
using Avalonia.Media;
using Southville8BEdgeUI.ViewModels.Teacher;
using Xunit;

namespace Southville8BEdgeUI.Tests.ViewModels;

public class SchedulePlannerViewModelTests
{
    private SchedulePlannerViewModel CreateVm() => new();

    [Fact]
    public void Constructor_Initializes_Default_Data()
    {
        var vm = CreateVm();
        Assert.NotNull(vm.AvailableWeeks);
        Assert.True(vm.AvailableWeeks.Count >= 1);
        Assert.Equal(vm.AvailableWeeks.First(), vm.SelectedWeek);
        Assert.Equal(24, vm.WeeklyClassesCount);
        Assert.Equal(36, vm.WeeklyHours);
        Assert.Equal(8, vm.FreePeriodsCount);
        Assert.Equal(2, vm.ConflictsCount);
        Assert.NotNull(vm.TimeSlots);
        Assert.Equal(10, vm.TimeSlots.Count); // hours 8..17
        Assert.All(vm.TimeSlots, ts => Assert.False(string.IsNullOrWhiteSpace(ts.TimeRange)));
        Assert.NotNull(vm.UpcomingClasses);
        Assert.Equal(2, vm.UpcomingClasses.Count);
        Assert.NotNull(vm.Conflicts);
        Assert.Equal(2, vm.Conflicts.Count);
        Assert.True(vm.HasConflicts);
    }

    [Fact]
    public void TimeSlots_Have_All_Day_Columns()
    {
        var vm = CreateVm();
        foreach (var slot in vm.TimeSlots)
        {
            Assert.NotNull(slot.Monday);
            Assert.NotNull(slot.Tuesday);
            Assert.NotNull(slot.Wednesday);
            Assert.NotNull(slot.Thursday);
            Assert.NotNull(slot.Friday);
            Assert.NotNull(slot.Saturday);
            Assert.NotNull(slot.Sunday);
        }
    }

    [Fact]
    public void ResolveBrush_Returns_Fallback_When_Key_Missing()
    {
        // private static method invocation
        var method = typeof(SchedulePlannerViewModel).GetMethod("ResolveBrush", BindingFlags.NonPublic | BindingFlags.Static);
        Assert.NotNull(method);
        var fallback = new SolidColorBrush(Colors.Red);
        var result = method!.Invoke(null, new object?[] { "NonExistingResourceKey", fallback });
        Assert.Same(fallback, result);
    }

    [Fact]
    public void RefreshThemeColors_Assigns_Alternating_Pattern()
    {
        var vm = CreateVm();
        // Add more upcoming classes to better test pattern
        vm.UpcomingClasses.Add(new UpcomingClassViewModel { Subject = "Physics" });
        vm.UpcomingClasses.Add(new UpcomingClassViewModel { Subject = "Chemistry" });

        var refresh = typeof(SchedulePlannerViewModel).GetMethod("RefreshThemeColors", BindingFlags.NonPublic | BindingFlags.Instance);
        Assert.NotNull(refresh);
        refresh!.Invoke(vm, Array.Empty<object?>());

        // Pattern: even indices same as index 0, odd indices same as index 1
        if (vm.UpcomingClasses.Count >= 2)
        {
            var evenBrush = vm.UpcomingClasses[0].SubjectColor;
            var oddBrush = vm.UpcomingClasses[1].SubjectColor;
            for (int i = 0; i < vm.UpcomingClasses.Count; i++)
            {
                var expected = i % 2 == 0 ? evenBrush : oddBrush;
                Assert.Same(expected, vm.UpcomingClasses[i].SubjectColor);
            }
        }
    }

    [Fact]
    public void RefreshThemeColors_NoUpcomingClasses_DoesNotThrow()
    {
        var vm = CreateVm();
        vm.UpcomingClasses.Clear();
        var refresh = typeof(SchedulePlannerViewModel).GetMethod("RefreshThemeColors", BindingFlags.NonPublic | BindingFlags.Instance);
        refresh!.Invoke(vm, Array.Empty<object?>());
        Assert.Empty(vm.UpcomingClasses);
    }

    [Fact]
    public void Commands_Execute_Without_Exception()
    {
        var vm = CreateVm();
        vm.RefreshScheduleCommand.Execute(null);
        vm.ManageTemplatesCommand.Execute(null);
        vm.LoadTemplateCommand.Execute(null);
        vm.SaveTemplateCommand.Execute(null);
        var classVm = vm.UpcomingClasses.First();
        vm.EditClassCommand.Execute(classVm);
        vm.AddNotesCommand.Execute(classVm);
        // Conflict resolve command
        var conflict = vm.Conflicts.First();
        conflict.ResolveCommand.Execute(null);
    }

    [Fact]
    public void HasConflicts_Reflects_Initial_Conflicts_Count()
    {
        var vm = CreateVm();
        Assert.Equal(vm.Conflicts.Any(), vm.HasConflicts);
    }
}
