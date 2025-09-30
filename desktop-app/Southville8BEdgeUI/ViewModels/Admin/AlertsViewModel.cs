using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Avalonia;
using Avalonia.Media;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class AlertsViewModel : ViewModelBase
{
    [ObservableProperty] private ObservableCollection<AlertItemViewModel> _alerts = new();

    // Form fields
    [ObservableProperty] private string _newType = "Weather";
    [ObservableProperty] private string _newTitle = "";
    [ObservableProperty] private string _newMessage = "";
    [ObservableProperty] private string _newExtraLink = "";
    [ObservableProperty] private string _newPriority = "High";

    // Target scope
    [ObservableProperty] private string _newTargetScope = "Whole School"; // Whole School | Grade Level | Section
    [ObservableProperty] private string _newGradeLevel = ""; // e.g., "8"
    [ObservableProperty] private string _newSection = "";    // e.g., "8-A"

    // Expiration
    [ObservableProperty] private DateTimeOffset? _newExpiresDate = DateTimeOffset.Now.Date;
    [ObservableProperty] private TimeSpan? _newExpiresTime = new(23, 59, 0);

    // Reference lists
    public string[] AlertTypes { get; } = new[] { "Weather", "Class Suspension", "Emergency", "System", "Announcement" };
    public string[] Priorities { get; } = new[] { "High", "Medium", "Low" };
    public string[] TargetScopes { get; } = new[] { "Whole School", "Grade Level", "Section" };

    // Computed
    public int ActiveCount => Alerts.Count(a => a.IsActive);
    public IEnumerable<AlertItemViewModel> ActiveAlerts => Alerts.Where(a => a.IsActive).OrderByDescending(a => a.Priority).ThenBy(a => a.ExpiresAt);

    public AlertsViewModel()
    {
        InitializeMockAlerts();
        UpdateComputed();
    }

    private void InitializeMockAlerts()
    {
        Alerts.Add(new AlertItemViewModel
        {
            Id = Guid.NewGuid().ToString("N"),
            Type = "Weather",
            Title = "Weather Alert: Early dismissal at 2:00 PM",
            Message = "Due to heavy rainfall, classes will be dismissed early at 2:00 PM.",
            ExtraLink = "https://facebook.com/southville8bnhis",
            CreatedAt = DateTime.Now.AddMinutes(-25),
            ExpiresAt = DateTime.Today.AddHours(23).AddMinutes(59),
            Priority = "High",
            TargetAudience = "all_school"
        });

        Alerts.Add(new AlertItemViewModel
        {
            Id = Guid.NewGuid().ToString("N"),
            Type = "Class Suspension",
            Title = "Grade 8: Morning classes suspended",
            Message = "Only morning classes for Grade 8 are suspended. Afternoon classes proceed as scheduled.",
            ExtraLink = "",
            CreatedAt = DateTime.Now.AddHours(-2),
            ExpiresAt = DateTime.Today.AddHours(12),
            Priority = "Medium",
            TargetAudience = "grade_8"
        });

        Alerts.Add(new AlertItemViewModel
        {
            Id = Guid.NewGuid().ToString("N"),
            Type = "Emergency",
            Title = "Drill: Earthquake drill at 10:30 AM",
            Message = "This is a scheduled drill. Please follow floor marshals and safety protocols.",
            ExtraLink = "",
            CreatedAt = DateTime.Now.AddHours(-3),
            ExpiresAt = DateTime.Now.AddMinutes(-10), // expired
            Priority = "Low",
            TargetAudience = "all_school"
        });
    }

    private static string ToTargetAudience(string scope, string grade, string section)
    {
        return scope switch
        {
            "Whole School" => "all_school",
            "Grade Level" => string.IsNullOrWhiteSpace(grade) ? "all_school" : $"grade_{grade.Trim()}",
            "Section" => string.IsNullOrWhiteSpace(section) ? "all_school" : $"section_{section.Trim().Replace(" ", "").Replace("-", "").ToLower()}",
            _ => "all_school"
        };
    }

    private static int PriorityRank(string priority) => priority switch
    {
        "High" => 3,
        "Medium" => 2,
        "Low" => 1,
        _ => 0
    };

    private void UpdateComputed()
    {
        OnPropertyChanged(nameof(ActiveAlerts));
        OnPropertyChanged(nameof(ActiveCount));
    }

    [RelayCommand]
    private void CreateAlert()
    {
        var expiresDate = NewExpiresDate?.Date ?? DateTimeOffset.Now.Date;
        var expiresTime = NewExpiresTime ?? new TimeSpan(23, 59, 0);
        var expiresAt = expiresDate.Add(expiresTime);

        var alert = new AlertItemViewModel
        {
            Id = Guid.NewGuid().ToString("N"),
            Type = string.IsNullOrWhiteSpace(NewType) ? "Announcement" : NewType.Trim(),
            Title = NewTitle?.Trim() ?? "",
            Message = NewMessage?.Trim() ?? "",
            ExtraLink = NewExtraLink?.Trim() ?? "",
            CreatedAt = DateTime.Now,
            ExpiresAt = expiresAt,
            Priority = string.IsNullOrWhiteSpace(NewPriority) ? "Low" : NewPriority.Trim(),
            TargetAudience = ToTargetAudience(NewTargetScope, NewGradeLevel, NewSection)
        };

        // Basic validation
        if (string.IsNullOrWhiteSpace(alert.Title) || string.IsNullOrWhiteSpace(alert.Message))
            return;

        Alerts.Insert(0, alert);
        UpdateComputed();
        ClearForm();
        // TODO: Persist to Supabase/MySQL via a repository/service
    }

    [RelayCommand]
    private void DeleteAlert(AlertItemViewModel alert)
    {
        Alerts.Remove(alert);
        UpdateComputed();
        // TODO: Delete from database
    }

    [RelayCommand]
    private void ExpireAlert(AlertItemViewModel alert)
    {
        alert.ExpiresAt = DateTime.Now;
        UpdateComputed();
        // TODO: Update database
    }

    [RelayCommand]
    private void PurgeExpired()
    {
        var expired = Alerts.Where(a => a.IsExpired).ToList();
        foreach (var a in expired)
            Alerts.Remove(a);
        UpdateComputed();
        // TODO: Batch-delete in database
    }

    [RelayCommand]
    private void ClearForm()
    {
        NewType = "Weather";
        NewTitle = "";
        NewMessage = "";
        NewExtraLink = "";
        NewPriority = "High";
        NewTargetScope = "Whole School";
        NewGradeLevel = "";
        NewSection = "";
        NewExpiresDate = DateTimeOffset.Now.Date;
        NewExpiresTime = new TimeSpan(23, 59, 0);
    }

    // Optional: call this from a timer to auto-refresh Active/Expired UI if desired
    [RelayCommand]
    private void RefreshComputed()
    {
        UpdateComputed();
    }
}

public partial class AlertItemViewModel : ViewModelBase
{
    [ObservableProperty] private string _id = "";
    [ObservableProperty] private string _type = "";
    [ObservableProperty] private string _title = "";
    [ObservableProperty] private string _message = "";
    [ObservableProperty] private string _extraLink = "";
    [ObservableProperty] private DateTime _createdAt;
    [ObservableProperty] private DateTime _expiresAt;
    [ObservableProperty] private string _priority = "Low";
    [ObservableProperty] private string _targetAudience = "all_school";

    public bool IsActive => DateTime.Now < ExpiresAt;
    public bool IsExpired => !IsActive;

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush PriorityBrush => Priority switch
    {
        "High" => Resolve("DangerBrush", "DangerBrush"),
        "Medium" => Resolve("WarningBrush", "WarningBrush"),
        _ => Resolve("SuccessBrush", "SuccessBrush")
    };

    public IBrush TypeBrush => Type switch
    {
        "Weather" => Resolve("InfoBrush", "AccentBrush"),
        "Class Suspension" => Resolve("PurpleBrush", "InfoBrush"),
        "Emergency" => Resolve("DangerBrush", "DangerBrush"),
        "System" => Resolve("TextSecondaryBrush", "TextMutedBrush"),
        "Announcement" => Resolve("SuccessBrush", "SuccessBrush"),
        _ => Resolve("TextSecondaryBrush", "TextMutedBrush")
    };

    public string AudienceText => TargetAudience switch
    {
        "all_school" => "Whole school",
        var v when v.StartsWith("grade_") => $"Grade {v.Replace("grade_", "")}",
        var v when v.StartsWith("section_") => $"Section {v.Replace("section_", "").ToUpper()}",
        _ => TargetAudience
    };

    public string TimeFrameText => $"{CreatedAt:MMM dd, hh:mm tt} → {ExpiresAt:MMM dd, hh:mm tt}";

    partial void OnPriorityChanged(string value)
    {
        OnPropertyChanged(nameof(PriorityBrush));
    }

    partial void OnTypeChanged(string value)
    {
        OnPropertyChanged(nameof(TypeBrush));
    }

    partial void OnExpiresAtChanged(DateTime value)
    {
        OnPropertyChanged(nameof(IsActive));
        OnPropertyChanged(nameof(IsExpired));
        OnPropertyChanged(nameof(TimeFrameText));
    }
}