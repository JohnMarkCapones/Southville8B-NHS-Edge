using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Text;
using System.IO;
using System;
using System.Linq;
using Avalonia; // For Application.Current
using Avalonia.Media; // For IBrush
using Avalonia.Styling; // Theme variant

namespace Southville8BEdgeUI.ViewModels.Teacher;

internal static class GradeColorProvider
{
    public static IBrush Success { get; set; } = Brushes.Transparent;
    public static IBrush Info { get; set; } = Brushes.Transparent;
    public static IBrush Warning { get; set; } = Brushes.Transparent;
    public static IBrush Danger { get; set; } = Brushes.Transparent;
    public static IBrush Neutral { get; set; } = Brushes.Transparent;
    public static IBrush GetFor(double grade) => grade >= 90 ? Success : grade >= 80 ? Info : grade >= 70 ? Warning : Danger;
}

public partial class GradeEntryViewModel : ViewModelBase
{
    [ObservableProperty] private int _pendingGradesCount = 24;
    [ObservableProperty] private int _completedTodayCount = 8;
    [ObservableProperty] private double _classAverageGrade = 87.5;
    [ObservableProperty] private int _assignmentsDueCount = 5;
    [ObservableProperty] private string _selectedClass = "";
    [ObservableProperty] private ObservableCollection<string> _classes = new();
    [ObservableProperty] private ObservableCollection<StudentGradeViewModel> _studentGrades = new();
    [ObservableProperty] private ObservableCollection<GradeDistributionItemViewModel> _gradeDistribution = new();
    [ObservableProperty] private ObservableCollection<RecentGradeEntryViewModel> _recentGradeEntries = new();
    [ObservableProperty] private bool _hasUnsavedChanges; // tracks if any grade was edited locally

    public GradeEntryViewModel()
    {
        InitializeData();
        HookStudentGradesCollection();
    }

    private static IBrush ResolveBrush(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    private void InitializeData()
    {
        // Load themed brushes into provider before creating child view models
        GradeColorProvider.Success = ResolveBrush("SuccessBrush");
        GradeColorProvider.Info = ResolveBrush("InfoBrush");
        GradeColorProvider.Warning = ResolveBrush("WarningBrush");
        GradeColorProvider.Danger = ResolveBrush("DangerBrush");
        GradeColorProvider.Neutral = ResolveBrush("TextSecondaryBrush");

        Classes = new ObservableCollection<string> { "Grade 8A - Math", "Grade 8B - Science", "Grade 9A - Math" };
        SelectedClass = Classes[0];

        StudentGrades = new ObservableCollection<StudentGradeViewModel>
        {
            new() { StudentName = "John Smith", QuizGrade = "85", AssignmentGrade = "92", ExamGrade = "88", FinalGrade = 88.3 },
            new() { StudentName = "Maria Garcia", QuizGrade = "90", AssignmentGrade = "87", ExamGrade = "91", FinalGrade = 89.3 },
        };

        GradeDistribution = new ObservableCollection<GradeDistributionItemViewModel>
        {
            new() { Grade = "A", Count = 12, Percentage = 40, Color = GradeColorProvider.Success },
            new() { Grade = "B", Count = 8, Percentage = 26.7, Color = GradeColorProvider.Info },
            new() { Grade = "C", Count = 6, Percentage = 20, Color = GradeColorProvider.Warning },
            new() { Grade = "D", Count = 3, Percentage = 10, Color = GradeColorProvider.Danger },
            new() { Grade = "F", Count = 1, Percentage = 3.3, Color = GradeColorProvider.Neutral }
        };

        RecentGradeEntries = new ObservableCollection<RecentGradeEntryViewModel>
        {
            new() { StudentName = "John Smith", AssignmentName = "Quiz #3", Grade = "85%", Timestamp = "2 mins ago", GradeColor = GradeColorProvider.Info },
            new() { StudentName = "Maria Garcia", AssignmentName = "Assignment #2", Grade = "92%", Timestamp = "5 mins ago", GradeColor = GradeColorProvider.Success }
        };
    }

    private void HookStudentGradesCollection()
    {
        foreach (var sg in StudentGrades)
        {
            sg.PropertyChanged += (_, args) =>
            {
                if (args.PropertyName == nameof(StudentGradeViewModel.FinalGrade))
                {
                    sg.GradeColor = GradeColorProvider.GetFor(sg.FinalGrade);
                }
                MarkDirty();
            };
            // Initialize color
            sg.GradeColor = GradeColorProvider.GetFor(sg.FinalGrade);
        }
        StudentGrades.CollectionChanged += (_, args) =>
        {
            if (args.NewItems != null)
            {
                foreach (var item in args.NewItems.OfType<StudentGradeViewModel>())
                {
                    item.GradeColor = GradeColorProvider.GetFor(item.FinalGrade);
                    item.PropertyChanged += (_, ev) =>
                    {
                        if (ev.PropertyName == nameof(StudentGradeViewModel.FinalGrade))
                            item.GradeColor = GradeColorProvider.GetFor(item.FinalGrade);
                        MarkDirty();
                    };
                }
            }
            MarkDirty();
            ExportGradesCommand.NotifyCanExecuteChanged();
            SaveAllGradesCommand.NotifyCanExecuteChanged();
        };
    }

    private void MarkDirty()
    {
        HasUnsavedChanges = true;
        SaveAllGradesCommand.NotifyCanExecuteChanged();
    }

    private bool CanExportGrades() => StudentGrades?.Count > 0;
    private bool CanSaveAllGrades() => HasUnsavedChanges && StudentGrades?.Count > 0;

    [RelayCommand(CanExecute = nameof(CanExportGrades))]
    private void ExportGrades()
    {
        // Simple CSV export to temp folder (placeholder implementation)
        var sb = new StringBuilder();
        sb.AppendLine("Student,Quiz,Assignment,Exam,Final");
        foreach (var s in StudentGrades)
        {
            sb.AppendLine($"{Escape(s.StudentName)},{Escape(s.QuizGrade)},{Escape(s.AssignmentGrade)},{Escape(s.ExamGrade)},{s.FinalGrade:F2}");
        }
        try
        {
            var fileName = $"grades_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            var path = Path.Combine(Path.GetTempPath(), fileName);
            File.WriteAllText(path, sb.ToString());
            // TODO: surface success toast via a service / messenger
        }
        catch
        {
            // TODO: surface error toast
        }
    }

    [RelayCommand(CanExecute = nameof(CanSaveAllGrades))]
    private void SaveAllGrades()
    {
        // Placeholder: simulate persistence
        HasUnsavedChanges = false;
        SaveAllGradesCommand.NotifyCanExecuteChanged();
        // TODO: persist to backend / repository and raise notifications
    }

    private static string Escape(string? value) => string.IsNullOrEmpty(value) ? "" : value.Contains(',') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
}

public partial class StudentGradeViewModel : ViewModelBase
{
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _quizGrade = "";
    [ObservableProperty] private string _assignmentGrade = "";
    [ObservableProperty] private string _examGrade = "";
    [ObservableProperty] private double _finalGrade;
    [ObservableProperty] private IBrush _gradeColor = Brushes.Transparent; // Themed grade color

    [RelayCommand] private void SaveGrade() { }
    [RelayCommand] private void EditNotes() { }
}

public partial class GradeDistributionItemViewModel : ViewModelBase
{
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private int _count;
    [ObservableProperty] private double _percentage;
    [ObservableProperty] private IBrush _color = Brushes.Transparent; // Themed color
}

public partial class RecentGradeEntryViewModel : ViewModelBase
{
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _assignmentName = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private IBrush _gradeColor = Brushes.Transparent; // Themed color
}