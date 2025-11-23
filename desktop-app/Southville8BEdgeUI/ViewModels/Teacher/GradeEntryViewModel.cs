using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.IO;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Diagnostics;
using System.Text.RegularExpressions;
using Avalonia; // For Application.Current
using Avalonia.Media; // For IBrush
using Avalonia.Styling; // Theme variant
using Avalonia.Threading; // For Dispatcher.UIThread
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

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
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    private readonly SemaphoreSlim _loadingSemaphore = new SemaphoreSlim(1, 1);
    private int _semaphoreReleased = 0;

    // Rate limiting for refresh
    private DateTime _lastRefreshTime = DateTime.MinValue;
    private const int RefreshCooldownSeconds = 5; // 5 second cooldown
    
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isRefreshing = false;
    [ObservableProperty] private string _selectedGradingPeriod = "";
    [ObservableProperty] private string _selectedSchoolYear = "";
    [ObservableProperty] private ObservableCollection<string> _gradingPeriods = new();
    [ObservableProperty] private ObservableCollection<string> _schoolYears = new();
    [ObservableProperty] private string _sectionName = "";
    [ObservableProperty] private string _gradeLevel = "";
    [ObservableProperty] private ObservableCollection<StudentGradeViewModel> _studentGrades = new();
    [ObservableProperty] private string _currentAcademicYear = string.Empty;
    private string _currentAcademicYearId = string.Empty;
    private string _currentAcademicPeriodId = string.Empty;
    [ObservableProperty] private string _currentGradingPeriod = string.Empty;
    [ObservableProperty] private string _currentGradingPeriodLabel = string.Empty;
    [ObservableProperty] private string _currentTermLabel = "Determining active term...";
    [ObservableProperty] private bool _isCurrentTermEditable;
    [ObservableProperty] private string _termRestrictionMessage = "Grades are locked until the active academic year is determined.";

    public string DebugInfo => $"StudentGrades: Count={StudentGrades.Count}, HashCode={StudentGrades.GetHashCode()}";
    [ObservableProperty] private bool _hasUnsavedChanges;

    public GradeEntryViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        InitializeData();
        HookStudentGradesCollection();

        // Subscribe to theme changes to keep colors in sync with dynamic theme
        if (Application.Current is { } app)
        {
            app.ActualThemeVariantChanged += (_, __) => RefreshThemeColors();
        }
    }

    private static IBrush ResolveBrush(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    private void RefreshThemeColors()
    {
        // Re-resolve brushes from current theme
        GradeColorProvider.Success = ResolveBrush("SuccessBrush");
        GradeColorProvider.Info = ResolveBrush("InfoBrush");
        GradeColorProvider.Warning = ResolveBrush("WarningBrush");
        GradeColorProvider.Danger = ResolveBrush("DangerBrush");
        GradeColorProvider.Neutral = ResolveBrush("TextSecondaryBrush");

        // Update existing collections
        if (StudentGrades != null)
        {
            foreach (var sg in StudentGrades)
            {
                sg.GradeColor = GradeColorProvider.GetFor((double)(sg.Gwa ?? 0));
            }
        }
    }

    private void InitializeData()
    {
        // Initialize theme colors first
        RefreshThemeColors();

        // Initialize grading periods and school years
        GradingPeriods = new ObservableCollection<string>
        {
            "Q1",
            "Q2", 
            "Q3",
            "Q4"
        };

        SchoolYears = new ObservableCollection<string>
        {
            "2024-2025",
            "2025-2026",
            "2026-2027"
        };

        // Set default selections
        if (GradingPeriods.Count > 0)
        {
            SelectedGradingPeriod = GradingPeriods[0];
        }
        
        if (SchoolYears.Count > 0)
        {
            SelectedSchoolYear = SchoolYears[0];
        }

        // Load students when selections change
        PropertyChanged += async (_, e) =>
        {
            if (e.PropertyName == nameof(SelectedGradingPeriod) || e.PropertyName == nameof(SelectedSchoolYear))
            {
                UpdateTermEditingState();
                if (!string.IsNullOrEmpty(SelectedGradingPeriod) && !string.IsNullOrEmpty(SelectedSchoolYear))
                {
                    System.Diagnostics.Debug.WriteLine($"PropertyChanged: {e.PropertyName} changed to {(e.PropertyName == nameof(SelectedGradingPeriod) ? SelectedGradingPeriod : SelectedSchoolYear)}");
                    await LoadStudentsAsync();
                }
            }
        };

        // Load initial data
        _ = LoadStudentsAsync();
        _ = LoadAcademicContextAsync();
        UpdateTermEditingState();
    }

    private async Task LoadAcademicContextAsync()
    {
        try
        {
            var overview = await _apiClient.GetAcademicDashboardOverviewAsync();
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                if (overview?.ActiveYear != null)
                {
                    _currentAcademicYearId = overview.ActiveYear.Id;
                    var displayName = overview.ActiveYear.GetDisplayName();
                    if (!string.IsNullOrWhiteSpace(displayName))
                    {
                        CurrentAcademicYear = displayName;
                        EnsureOptionExists(SchoolYears, displayName);
                        SelectedSchoolYear = displayName;
                    }
                }

                if (overview?.CurrentPeriod != null)
                {
                    _currentAcademicPeriodId = overview.CurrentPeriod.Id;
                }

                var periodCode = NormalizePeriodCode(overview?.CurrentPeriod);
                if (!string.IsNullOrWhiteSpace(periodCode))
                {
                    CurrentGradingPeriod = periodCode;
                    EnsureOptionExists(GradingPeriods, periodCode);
                    SelectedGradingPeriod = periodCode;
                }
                else
                {
                    CurrentGradingPeriod = string.Empty;
                }

                CurrentGradingPeriodLabel = ResolvePeriodLabel(overview?.CurrentPeriod, periodCode);
                CurrentTermLabel = BuildCurrentTermLabel();
                UpdateTermEditingState();
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"LoadAcademicContextAsync: ERROR - {ex.Message}");
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                if (string.IsNullOrWhiteSpace(CurrentTermLabel))
                {
                    CurrentTermLabel = "Active term unavailable";
                }
                TermRestrictionMessage = "Unable to determine the active academic year. Grades are read-only until it is configured.";
                UpdateTermEditingState();
            });
        }
    }

    private static void EnsureOptionExists(ObservableCollection<string> collection, string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        if (!collection.Any(item => string.Equals(item, value, StringComparison.OrdinalIgnoreCase)))
        {
            collection.Insert(0, value);
        }
    }

    private static string? NormalizePeriodCode(AcademicPeriodDto? period)
    {
        if (period == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(period.PeriodName))
        {
            var name = period.PeriodName.Trim().ToLowerInvariant();
            if (name.Contains("first") || name.Contains("1") || name.Contains("q1")) return "Q1";
            if (name.Contains("second") || name.Contains("2") || name.Contains("q2")) return "Q2";
            if (name.Contains("third") || name.Contains("3") || name.Contains("q3")) return "Q3";
            if (name.Contains("fourth") || name.Contains("4") || name.Contains("q4")) return "Q4";
        }

        if (period.PeriodOrder.HasValue && period.PeriodOrder.Value >= 1 && period.PeriodOrder.Value <= 4)
        {
            return $"Q{period.PeriodOrder.Value}";
        }

        return null;
    }

    private static string ResolvePeriodLabel(AcademicPeriodDto? period, string? fallbackCode)
    {
        if (!string.IsNullOrWhiteSpace(period?.PeriodName))
        {
            return period!.PeriodName!;
        }

        return string.IsNullOrWhiteSpace(fallbackCode) ? string.Empty : fallbackCode;
    }

    private string BuildCurrentTermLabel()
    {
        var periodLabel = string.IsNullOrWhiteSpace(CurrentGradingPeriodLabel)
            ? CurrentGradingPeriod
            : CurrentGradingPeriodLabel;

        if (string.IsNullOrWhiteSpace(CurrentAcademicYear) && string.IsNullOrWhiteSpace(periodLabel))
        {
            return "Active term unavailable";
        }

        if (string.IsNullOrWhiteSpace(CurrentAcademicYear))
        {
            return periodLabel;
        }

        if (string.IsNullOrWhiteSpace(periodLabel))
        {
            return CurrentAcademicYear;
        }

        return $"{CurrentAcademicYear} • {periodLabel}";
    }

    private void UpdateTermEditingState()
    {
        var hasContext = !string.IsNullOrWhiteSpace(CurrentAcademicYear) && !string.IsNullOrWhiteSpace(CurrentGradingPeriod);
        var matchesYear = hasContext && string.Equals(SelectedSchoolYear, CurrentAcademicYear, StringComparison.OrdinalIgnoreCase);
        var matchesPeriod = hasContext && string.Equals(SelectedGradingPeriod, CurrentGradingPeriod, StringComparison.OrdinalIgnoreCase);
        IsCurrentTermEditable = hasContext && matchesYear && matchesPeriod;

        if (!hasContext)
        {
            TermRestrictionMessage = "Active academic year or grading period is not configured. Grades are read-only until an administrator sets them.";
        }
        else if (!IsCurrentTermEditable)
        {
            var label = string.IsNullOrWhiteSpace(CurrentGradingPeriodLabel) ? CurrentGradingPeriod : CurrentGradingPeriodLabel;
            TermRestrictionMessage = $"Grades can only be entered for {CurrentAcademicYear} • {label}.";
        }
        else
        {
            TermRestrictionMessage = string.Empty;
        }

        if (StudentGrades != null)
        {
            foreach (var sg in StudentGrades)
            {
                sg.IsTermEditable = IsCurrentTermEditable;
            }
        }

        SaveAllGradesCommand.NotifyCanExecuteChanged();
    }

    private void HookStudentGradesCollection()
    {
        if (StudentGrades == null)
        {
            return;
        }

        foreach (var sg in StudentGrades)
        {
            sg.PropertyChanged += (_, args) =>
            {
                if (args.PropertyName == nameof(StudentGradeViewModel.Gwa))
                {
                    sg.GradeColor = GradeColorProvider.GetFor((double)(sg.Gwa ?? 0));
                }
                MarkDirty();
            };
            sg.GradeColor = GradeColorProvider.GetFor((double)(sg.Gwa ?? 0));
            sg.IsTermEditable = IsCurrentTermEditable;
        }
        
        StudentGrades.CollectionChanged += (_, args) =>
        {
            if (args.NewItems != null)
            {
                foreach (var item in args.NewItems.OfType<StudentGradeViewModel>())
                {
                    item.GradeColor = GradeColorProvider.GetFor((double)(item.Gwa ?? 0));
                    item.IsTermEditable = IsCurrentTermEditable;
                    item.PropertyChanged += (_, ev) =>
                    {
                        if (ev.PropertyName == nameof(StudentGradeViewModel.Gwa))
                            item.GradeColor = GradeColorProvider.GetFor((double)(item.Gwa ?? 0));
                        MarkDirty();
                    };
                }
            }
            MarkDirty();
            SaveAllGradesCommand.NotifyCanExecuteChanged();
        };
    }

    private void MarkDirty()
    {
        if (IsLoading || !IsCurrentTermEditable)
        {
            return;
        }
        HasUnsavedChanges = true;
        SaveAllGradesCommand.NotifyCanExecuteChanged();
    }

    private bool CanSaveAllGrades() => IsCurrentTermEditable && HasUnsavedChanges && StudentGrades != null && StudentGrades.Count > 0;

    [RelayCommand(CanExecute = nameof(CanSaveAllGrades))]
    private async Task SaveAllGrades()
    {
        if (StudentGrades == null || StudentGrades.Count == 0)
        {
            System.Diagnostics.Debug.WriteLine("SaveAllGrades: No students to save");
            return;
        }

        if (!IsCurrentTermEditable)
        {
            System.Diagnostics.Debug.WriteLine("SaveAllGrades: Term is locked, skipping save");
            return;
        }

        IsLoading = true;
        try
        {
            foreach (var student in StudentGrades.Where(s => s.IsDirty))
            {
                // Validate GWA range before sending to API
                if (student.Gwa.HasValue && (student.Gwa.Value < 50 || student.Gwa.Value > 100))
                {
                    // Skip this student and show error
                    continue;
                }

                if (string.IsNullOrEmpty(student.GwaId))
                {
                    // Create new entry
                    var createDto = new CreateGwaDto
                    {
                        StudentId = student.StudentId,
                        AcademicYearId = _currentAcademicYearId,
                        AcademicPeriodId = _currentAcademicPeriodId,
                        Gwa = student.Gwa ?? 0,
                        GradingPeriod = SelectedGradingPeriod,
                        SchoolYear = SelectedSchoolYear,
                        Remarks = student.Remarks,
                        HonorStatus = student.HonorStatus
                    };

                    var result = await _apiClient.CreateGwaEntryAsync(createDto);
                    if (result != null)
                    {
                        student.GwaId = result.GwaId ?? "";
                        student.IsDirty = false;
                    }
                }
                else
                {
                    // Update existing entry
                    var updateDto = new UpdateGwaDto
                    {
                        Gwa = student.Gwa,
                        Remarks = student.Remarks,
                        HonorStatus = student.HonorStatus
                    };

                    var result = await _apiClient.UpdateGwaEntryAsync(student.GwaId, updateDto);
                    if (result != null)
                    {
                        student.IsDirty = false;
                    }
                }
            }

            HasUnsavedChanges = false;
            SaveAllGradesCommand.NotifyCanExecuteChanged();
            _toastService.Success("All changes saved successfully", "Success");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error saving grades: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task LogActivityAsync(string actionType, string description, string? entityType = null, string? entityId = null)
    {
        try
        {
            // Get current user ID
            var currentUserId = _apiClient.GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
                return;
            
            // Map action types to icons and colors
            var (icon, color) = actionType switch
            {
                "grade_created" => ("CheckmarkCircle", "green"),
                "grade_updated" => ("Edit", "blue"),
                "grade_deleted" => ("Delete", "red"),
                _ => ("Info", "gray")
            };
            
            // Create activity data
            var activityData = new
            {
                user_id = currentUserId,
                action_type = actionType,
                description = description,
                entity_type = entityType,
                entity_id = entityId,
                icon = icon,
                color = color,
                metadata = new { source = "desktop_app", module = "grade_entry", grading_period = SelectedGradingPeriod, school_year = SelectedSchoolYear }
            };
            
            // POST to teacher activity API
            await _apiClient.PostAsync("teacher-activity/activities", activityData);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the main operation
            System.Diagnostics.Debug.WriteLine($"Error logging teacher activity: {ex.Message}");
        }
    }

    private async Task LoadStudentsAsync()
    {
        // Use semaphore to prevent race conditions
        if (!await _loadingSemaphore.WaitAsync(0))
        {
            System.Diagnostics.Debug.WriteLine("LoadStudentsAsync: Already loading, skipping...");
            return;
        }

        try
        {
            if (string.IsNullOrEmpty(SelectedGradingPeriod) || string.IsNullOrEmpty(SelectedSchoolYear))
            {
                System.Diagnostics.Debug.WriteLine("LoadStudentsAsync: Period or year not selected");
                return;
            }

            IsLoading = true;
            System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: Fetching students for {SelectedGradingPeriod} {SelectedSchoolYear}");
            
            var response = await _apiClient.GetAdvisoryStudentsWithGwaAsync(SelectedGradingPeriod, SelectedSchoolYear);
            
            System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: Response is null? {response == null}");
            
            if (response != null)
            {
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: Got {response.Students?.Count ?? 0} students");
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: Section={response.SectionName}, Grade={response.GradeLevel}");
                
                // Capture response data before UI thread dispatch
                var studentsToAdd = response.Students?.ToList() ?? new List<StudentGwaDto>();
                var sectionName = response.SectionName;
                var gradeLevel = response.GradeLevel;
                
                // UPDATE UI ON UI THREAD - ConfigureAwait(true) to ensure we return to UI thread
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    SectionName = sectionName;
                    GradeLevel = gradeLevel;
                    
                    if (StudentGrades != null)
                    {
                        StudentGrades.Clear();
                    }
                    
                    foreach (var student in studentsToAdd)
                    {
                        var studentGrade = new StudentGradeViewModel(_apiClient, _toastService, SelectedGradingPeriod, SelectedSchoolYear)
                        {
                            StudentId = student.StudentId,
                            StudentName = student.StudentName,
                            StudentNumber = student.StudentNumber,
                            Gwa = student.Gwa,
                            Remarks = student.Remarks ?? "",
                            // HonorStatus will be automatically calculated when Gwa is set
                            GwaId = student.GwaId ?? "",
                            IsDirty = false,
                            AcademicYearId = _currentAcademicYearId,
                            AcademicPeriodId = _currentAcademicPeriodId
                        };
                        
                        // Recalculate honor status from GWA (in case it was set differently in database)
                        if (studentGrade.Gwa.HasValue)
                        {
                            studentGrade.HonorStatus = StudentGradeViewModel.CalculateHonorStatus(studentGrade.Gwa);
                        }

                        studentGrade.PropertyChanged += (_, args) =>
                        {
                            // HonorStatus is auto-calculated, so it doesn't trigger dirty state
                            if (args.PropertyName == nameof(StudentGradeViewModel.Gwa) ||
                                args.PropertyName == nameof(StudentGradeViewModel.Remarks))
                            {
                                studentGrade.IsDirty = true;
                                MarkDirty();
                            }
                        };

                        studentGrade.IsTermEditable = IsCurrentTermEditable;

                        if (StudentGrades != null)
                        {
                            StudentGrades.Add(studentGrade);
                        }
                    }
                    
                    // Force property change notification
                    OnPropertyChanged(nameof(StudentGrades));
                    HasUnsavedChanges = false;
                    SaveAllGradesCommand.NotifyCanExecuteChanged();
                    UpdateTermEditingState();
                }, DispatcherPriority.Normal); // Explicitly set priority
                
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: After UI update - StudentGrades.Count = {StudentGrades.Count}");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: Response was null for {SelectedGradingPeriod} {SelectedSchoolYear}");
                
                // Clear on null response
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    StudentGrades.Clear();
                    SectionName = "";
                    GradeLevel = "";
                    HasUnsavedChanges = false;
                    SaveAllGradesCommand.NotifyCanExecuteChanged();
                    UpdateTermEditingState();
                }, DispatcherPriority.Normal);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: ERROR - {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: Stack trace: {ex.StackTrace}");
        }
        finally
        {
            IsLoading = false;
            if (Interlocked.CompareExchange(ref _semaphoreReleased, 1, 0) == 0)
            {
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: FINALLY - About to release semaphore");
                _loadingSemaphore.Release();
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: FINALLY - Semaphore released");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"LoadStudentsAsync: FINALLY - Semaphore already released, skipping");
            }
            _semaphoreReleased = 0; // Reset for next call
        }
    }

    [RelayCommand]
    private async Task RefreshGrades()
    {
        // Check rate limit
        var timeSinceLastRefresh = DateTime.Now - _lastRefreshTime;
        if (timeSinceLastRefresh.TotalSeconds < RefreshCooldownSeconds)
        {
            var remainingSeconds = RefreshCooldownSeconds - (int)timeSinceLastRefresh.TotalSeconds;
            Debug.WriteLine($"Refresh rate limited. Please wait {remainingSeconds} seconds.");
            return;
        }

        IsRefreshing = true;
        _lastRefreshTime = DateTime.Now;

        try
        {
            // Reload students/grades for current filters
            await LoadStudentsAsync();
            
            Debug.WriteLine("Grades refreshed successfully");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error refreshing grades: {ex.Message}");
        }
        finally
        {
            IsRefreshing = false;
        }
    }
}

public partial class StudentGradeViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    private readonly string _gradingPeriod;
    private readonly string _schoolYear;

    [ObservableProperty] private string _studentId = "";
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _studentNumber = "";
    [ObservableProperty] private string _gwaId = ""; // empty if new entry
    [ObservableProperty] private decimal? _gwa;
    [ObservableProperty] private string _remarks = "";
    [ObservableProperty] private string _honorStatus = "None";
    [ObservableProperty] private bool _isDirty; // tracks if edited
    [ObservableProperty] private IBrush _gradeColor = Brushes.Transparent; // Themed grade color
    [ObservableProperty] private bool _isTermEditable = false;

    // New properties for UI binding and validation
    [ObservableProperty] private string _gwaInput = "";
    [ObservableProperty] private string _gwaErrorMessage = "";
    [ObservableProperty] private bool _isEditing = false; // Controls read-only state
    private bool _isUpdatingFromInput = false;

    [ObservableProperty] private string _academicYearId = "";
    [ObservableProperty] private string _academicPeriodId = "";

    public StudentGradeViewModel(IApiClient apiClient, IToastService toastService, string gradingPeriod, string schoolYear)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _gradingPeriod = gradingPeriod;
        _schoolYear = schoolYear;
    }

    partial void OnIsTermEditableChanged(bool value)
    {
        if (!value && IsEditing)
        {
            IsEditing = false;
        }
    }

    partial void OnGwaChanged(decimal? value)
    {
        // Sync Input if it's different (to avoid loops)
        if (!_isUpdatingFromInput)
        {
            if (value.HasValue)
            {
                var formatted = value.Value.ToString("0.00");
                if (GwaInput != formatted && GwaInput != value.Value.ToString())
                {
                    GwaInput = formatted;
                }
            }
            else
            {
                // Only clear input if it's not already empty (to avoid unnecessary updates)
                if (!string.IsNullOrEmpty(GwaInput))
                {
                    GwaInput = "";
                }
            }
        }

        // Update grade color
        GradeColor = GradeColorProvider.GetFor((double)(value ?? 0));
        
        // Automatically calculate honor status based on GWA
        HonorStatus = CalculateHonorStatus(value);
    }

    partial void OnGwaInputChanged(string value)
    {
        GwaErrorMessage = "";
        _isUpdatingFromInput = true;
        
        try
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                Gwa = null;
                return;
            }

            if (decimal.TryParse(value, out var result))
            {
                if (result < 50 || result > 100)
                {
                    GwaErrorMessage = "Grade must be 50-100";
                    // We set Gwa to null so it's not considered a valid grade for saving/honor status
                    // But the input remains for the user to fix
                    Gwa = null; 
                }
                else
                {
                    Gwa = result;
                }
            }
            else
            {
                GwaErrorMessage = "Invalid number";
                Gwa = null;
            }
        }
        finally
        {
            _isUpdatingFromInput = false;
        }
    }

    /// <summary>
    /// Calculates honor status based on GWA score ranges
    /// </summary>
    public static string CalculateHonorStatus(decimal? gwa)
    {
        if (!gwa.HasValue || gwa.Value < 0) return "None";
        
        var score = gwa.Value;
        
        if (score >= 97) return "Excellent / Outstanding";
        if (score >= 95) return "Very Good";
        if (score >= 90) return "Good / Above Average";
        if (score >= 80) return "Satisfactory / Average";
        if (score >= 75) return "Fair / Below Average";
        return "Failing / Needs Improvement";
    }

    [RelayCommand]
    private async Task SaveGrade()
    {
        if (!IsTermEditable)
        {
            System.Diagnostics.Debug.WriteLine($"SaveGrade blocked for {StudentName} - term is locked.");
            return;
        }
        System.Diagnostics.Debug.WriteLine($"=== SaveGrade() called for {StudentName} ===");
        System.Diagnostics.Debug.WriteLine($"StudentId: {StudentId}");
        System.Diagnostics.Debug.WriteLine($"Gwa: {Gwa}");
        System.Diagnostics.Debug.WriteLine($"GwaId: {GwaId}");
        System.Diagnostics.Debug.WriteLine($"Remarks: {Remarks}");
        System.Diagnostics.Debug.WriteLine($"HonorStatus: {HonorStatus}");
        System.Diagnostics.Debug.WriteLine($"IsDirty: {IsDirty}");
        System.Diagnostics.Debug.WriteLine($"GradingPeriod: {_gradingPeriod}");
        System.Diagnostics.Debug.WriteLine($"SchoolYear: {_schoolYear}");
        
        try
        {
            // Validate GWA range
            if (!Gwa.HasValue || Gwa.Value < 50 || Gwa.Value > 100)
            {
                System.Diagnostics.Debug.WriteLine($"❌ Invalid GWA value: {Gwa}. Must be between 50-100.");
                return;
            }

            System.Diagnostics.Debug.WriteLine($"✅ GWA validation passed: {Gwa}");

            if (string.IsNullOrEmpty(GwaId))
            {
                System.Diagnostics.Debug.WriteLine($"📝 Creating NEW GWA entry for {StudentName}");
                
                // Create new entry
                var createDto = new CreateGwaDto
                {
                    StudentId = StudentId,
                    AcademicYearId = AcademicYearId,
                    AcademicPeriodId = AcademicPeriodId,
                    Gwa = Gwa.Value,
                    GradingPeriod = _gradingPeriod,
                    SchoolYear = _schoolYear,
                    Remarks = Remarks,
                    HonorStatus = HonorStatus
                };

                System.Diagnostics.Debug.WriteLine($"📤 Sending CREATE request to API...");
                var result = await _apiClient.CreateGwaEntryAsync(createDto);
                
                if (result != null)
                {
                    GwaId = result.GwaId ?? "";
                    IsDirty = false;
                    IsEditing = false; // Exit edit mode on save
                    System.Diagnostics.Debug.WriteLine($"✅ Successfully created GWA entry for {StudentName}. New GwaId: {GwaId}");
                    
                    _toastService.Success($"Grade created for {StudentName}", "Success");

                    // Log activity
                    await LogActivityAsync(
                        "grade_created",
                        $"Entered final GWA for {StudentName} ({Gwa:F2})",
                        "grade",
                        GwaId
                    );
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"❌ Failed to create GWA entry for {StudentName} - API returned null");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"📝 Updating EXISTING GWA entry for {StudentName} (ID: {GwaId})");
                
                // Update existing entry
                var updateDto = new UpdateGwaDto
                {
                    Gwa = Gwa,
                    Remarks = Remarks,
                    HonorStatus = HonorStatus
                };

                System.Diagnostics.Debug.WriteLine($"📤 Sending PATCH request to API...");
                var result = await _apiClient.UpdateGwaEntryAsync(GwaId, updateDto);
                
                if (result != null)
                {
                    IsDirty = false;
                    IsEditing = false; // Exit edit mode on save
                    System.Diagnostics.Debug.WriteLine($"✅ Successfully updated GWA entry for {StudentName}");
                    
                    _toastService.Success($"Grade updated for {StudentName}", "Success");

                    // Log activity
                    await LogActivityAsync(
                        "grade_updated",
                        $"Updated GWA for {StudentName} to {Gwa:F2}",
                        "grade",
                        GwaId
                    );
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"❌ Failed to update GWA entry for {StudentName} - API returned null");
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"💥 Error saving grade for {StudentName}: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"💥 Stack trace: {ex.StackTrace}");
        }
        
        System.Diagnostics.Debug.WriteLine($"=== SaveGrade() completed for {StudentName} ===");
    }

    [RelayCommand]
    private async Task DeleteGrade()
    {
        if (!IsTermEditable)
        {
            System.Diagnostics.Debug.WriteLine($"DeleteGrade blocked for {StudentName} - term is locked.");
            return;
        }
        try
        {
            if (string.IsNullOrEmpty(GwaId))
            {
                System.Diagnostics.Debug.WriteLine($"No GWA entry to delete for {StudentName}");
                return;
            }

            var deletedGwaId = GwaId;
            var deletedGwa = Gwa;
            
            // Note: DeleteGwaAsync method doesn't exist in IApiClient yet
            // For now, we'll just clear the local data
            // TODO: Implement actual delete API call when endpoint is available
            
            GwaId = "";
            Gwa = null;
            Remarks = "";
            HonorStatus = CalculateHonorStatus(null);
            IsDirty = false;
            
            System.Diagnostics.Debug.WriteLine($"Cleared GWA entry for {StudentName}");
            
            // Log activity
            await LogActivityAsync(
                "grade_deleted",
                $"Deleted GWA entry for {StudentName} ({deletedGwa:F2})",
                "grade",
                deletedGwaId
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting grade for {StudentName}: {ex.Message}");
        }
    }

    private async Task LogActivityAsync(string actionType, string description, string? entityType = null, string? entityId = null)
    {
        try
        {
            // Get current user ID
            var currentUserId = _apiClient.GetCurrentUserId();
            if (string.IsNullOrEmpty(currentUserId))
                return;
            
            // Map action types to icons and colors
            var (icon, color) = actionType switch
            {
                "grade_created" => ("CheckmarkCircle", "green"),
                "grade_updated" => ("Edit", "blue"),
                "grade_deleted" => ("Delete", "red"),
                _ => ("Info", "gray")
            };
            
            // Create activity data
            var activityData = new
            {
                user_id = currentUserId,
                action_type = actionType,
                description = description,
                entity_type = entityType,
                entity_id = entityId,
                icon = icon,
                color = color,
                metadata = new { source = "desktop_app", module = "grade_entry", student_name = StudentName, grading_period = _gradingPeriod, school_year = _schoolYear }
            };
            
            // POST to teacher activity API
            await _apiClient.PostAsync("teacher-activity/activities", activityData);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the main operation
            System.Diagnostics.Debug.WriteLine($"Error logging teacher activity: {ex.Message}");
        }
    }

    [RelayCommand] private void EditNotes() { }

    [RelayCommand]
    private void EditGrade()
    {
        if (!IsTermEditable)
        {
            System.Diagnostics.Debug.WriteLine($"EditGrade blocked for {StudentName} - term is locked.");
            return;
        }
        IsEditing = true;
    }

    [RelayCommand]
    private void CancelEdit()
    {
        // Revert changes if needed, for now just exit edit mode
        // Ideally we should revert to original values, but for simplicity:
        IsEditing = false;
        // If Gwa was changed, it stays changed in UI until refreshed or manually reverted
        // A full revert implementation would require storing original values
    }
}