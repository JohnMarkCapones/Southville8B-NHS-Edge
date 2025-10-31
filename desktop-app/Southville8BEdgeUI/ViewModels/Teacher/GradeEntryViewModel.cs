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
                if (!string.IsNullOrEmpty(SelectedGradingPeriod) && !string.IsNullOrEmpty(SelectedSchoolYear))
                {
                    System.Diagnostics.Debug.WriteLine($"PropertyChanged: {e.PropertyName} changed to {(e.PropertyName == nameof(SelectedGradingPeriod) ? SelectedGradingPeriod : SelectedSchoolYear)}");
                    await LoadStudentsAsync();
                }
            }
        };

        // Load initial data
        _ = LoadStudentsAsync();
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
        }
        
        StudentGrades.CollectionChanged += (_, args) =>
        {
            if (args.NewItems != null)
            {
                foreach (var item in args.NewItems.OfType<StudentGradeViewModel>())
                {
                    item.GradeColor = GradeColorProvider.GetFor((double)(item.Gwa ?? 0));
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
        HasUnsavedChanges = true;
        SaveAllGradesCommand.NotifyCanExecuteChanged();
    }

    private bool CanSaveAllGrades() => HasUnsavedChanges && StudentGrades != null && StudentGrades.Count > 0;

    [RelayCommand(CanExecute = nameof(CanSaveAllGrades))]
    private async void SaveAllGrades()
    {
        if (StudentGrades == null || StudentGrades.Count == 0)
        {
            System.Diagnostics.Debug.WriteLine("SaveAllGrades: No students to save");
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
                            HonorStatus = student.HonorStatus,
                            GwaId = student.GwaId ?? "",
                            IsDirty = false
                        };

                        studentGrade.PropertyChanged += (_, args) =>
                        {
                            if (args.PropertyName == nameof(StudentGradeViewModel.Gwa) ||
                                args.PropertyName == nameof(StudentGradeViewModel.Remarks) ||
                                args.PropertyName == nameof(StudentGradeViewModel.HonorStatus))
                            {
                                studentGrade.IsDirty = true;
                                MarkDirty();
                            }
                        };

                        if (StudentGrades != null)
                        {
                            StudentGrades.Add(studentGrade);
                        }
                    }
                    
                    // Force property change notification
                    OnPropertyChanged(nameof(StudentGrades));
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
    [ObservableProperty] private ObservableCollection<string> _honorStatusOptions = new() { 
        "None", "With Honors", "High Honors", "Highest Honors" 
    };
    [ObservableProperty] private bool _isDirty; // tracks if edited
    [ObservableProperty] private IBrush _gradeColor = Brushes.Transparent; // Themed grade color

    public StudentGradeViewModel(IApiClient apiClient, IToastService toastService, string gradingPeriod, string schoolYear)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        _gradingPeriod = gradingPeriod;
        _schoolYear = schoolYear;
    }

    partial void OnGwaChanged(decimal? value)
    {
        // Update grade color
        GradeColor = GradeColorProvider.GetFor((double)(value ?? 0));
    }

    [RelayCommand]
    private async Task SaveGrade()
    {
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
                    System.Diagnostics.Debug.WriteLine($"✅ Successfully created GWA entry for {StudentName}. New GwaId: {GwaId}");
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
                    System.Diagnostics.Debug.WriteLine($"✅ Successfully updated GWA entry for {StudentName}");
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
        try
        {
            if (string.IsNullOrEmpty(GwaId))
            {
                System.Diagnostics.Debug.WriteLine($"No GWA entry to delete for {StudentName}");
                return;
            }

            // Note: DeleteGwaAsync method doesn't exist in IApiClient yet
            // For now, we'll just clear the local data
            // TODO: Implement actual delete API call when endpoint is available
            
            GwaId = "";
            Gwa = null;
            Remarks = "";
            HonorStatus = "None";
            IsDirty = false;
            
            System.Diagnostics.Debug.WriteLine($"Cleared GWA entry for {StudentName}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting grade for {StudentName}: {ex.Message}");
        }
    }

    [RelayCommand] private void EditNotes() { }
}