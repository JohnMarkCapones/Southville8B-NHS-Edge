using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

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

    public GradeEntryViewModel()
    {
        InitializeData();
    }

    private void InitializeData()
    {
        Classes = new ObservableCollection<string> { "Grade 8A - Math", "Grade 8B - Science", "Grade 9A - Math" };
        SelectedClass = Classes[0];

        StudentGrades = new ObservableCollection<StudentGradeViewModel>
        {
            new() { StudentName = "John Smith", QuizGrade = "85", AssignmentGrade = "92", ExamGrade = "88", FinalGrade = 88.3 },
            new() { StudentName = "Maria Garcia", QuizGrade = "90", AssignmentGrade = "87", ExamGrade = "91", FinalGrade = 89.3 },
        };

        GradeDistribution = new ObservableCollection<GradeDistributionItemViewModel>
        {
            new() { Grade = "A", Count = 12, Percentage = 40, Color = "#10B981" },
            new() { Grade = "B", Count = 8, Percentage = 26.7, Color = "#3B82F6" },
            new() { Grade = "C", Count = 6, Percentage = 20, Color = "#F59E0B" },
            new() { Grade = "D", Count = 3, Percentage = 10, Color = "#EF4444" },
            new() { Grade = "F", Count = 1, Percentage = 3.3, Color = "#6B7280" }
        };

        RecentGradeEntries = new ObservableCollection<RecentGradeEntryViewModel>
        {
            new() { StudentName = "John Smith", AssignmentName = "Quiz #3", Grade = "85%", Timestamp = "2 mins ago", GradeColor = "#10B981" },
            new() { StudentName = "Maria Garcia", AssignmentName = "Assignment #2", Grade = "92%", Timestamp = "5 mins ago", GradeColor = "#10B981" }
        };
    }

    [RelayCommand] private void ExportGrades() { }
    [RelayCommand] private void SaveAllGrades() { }
}

public partial class StudentGradeViewModel : ViewModelBase
{
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _quizGrade = "";
    [ObservableProperty] private string _assignmentGrade = "";
    [ObservableProperty] private string _examGrade = "";
    [ObservableProperty] private double _finalGrade;

    public string GradeColor => FinalGrade >= 90 ? "#10B981" : FinalGrade >= 80 ? "#3B82F6" : FinalGrade >= 70 ? "#F59E0B" : "#EF4444";

    [RelayCommand] private void SaveGrade() { }
    [RelayCommand] private void EditNotes() { }
}

public partial class GradeDistributionItemViewModel : ViewModelBase
{
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private int _count;
    [ObservableProperty] private double _percentage;
    [ObservableProperty] private string _color = "";
}

public partial class RecentGradeEntryViewModel : ViewModelBase
{
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _assignmentName = "";
    [ObservableProperty] private string _grade = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private string _gradeColor = "";
}