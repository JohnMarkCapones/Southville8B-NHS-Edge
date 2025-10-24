using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Threading;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.ViewModels;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ClassSchedulesViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;

    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; }

    // Collections
    [ObservableProperty] private ObservableCollection<ScheduleViewModel> _schedules = new();
    [ObservableProperty] private ObservableCollection<ScheduleViewModel> _filteredSchedules = new();
    
    // View mode (always table view now)
    [ObservableProperty] private bool _isTableView = true;

    // Filters
    [ObservableProperty] private SectionDto? _selectedSection;
    [ObservableProperty] private UserDto? _selectedTeacher;
    [ObservableProperty] private string? _selectedDay;
    [ObservableProperty] private string? _selectedSchoolYear = "2024-2025";
    [ObservableProperty] private string? _selectedSemester = "1st";
    [ObservableProperty] private string _searchText = "";

    // Dropdown data
    [ObservableProperty] private ObservableCollection<SectionDto> _sections = new();
    [ObservableProperty] private ObservableCollection<UserDto> _teachers = new();
    [ObservableProperty] private ObservableCollection<Subject> _subjects = new();
    [ObservableProperty] private ObservableCollection<RoomDto> _rooms = new();
    [ObservableProperty] private ObservableCollection<BuildingDto> _buildings = new();

    // For create/edit dialog
    [ObservableProperty] private ScheduleViewModel? _selectedSchedule;
    [ObservableProperty] private bool _isEditDialogOpen;
    [ObservableProperty] private bool _isCreateDialogOpen;
    [ObservableProperty] private bool _isAssignStudentsDialogOpen;

    // Statistics
    [ObservableProperty] private int _totalSchedules;
    [ObservableProperty] private int _activeSchedules;
    [ObservableProperty] private int _schedulesThisSemester;
    [ObservableProperty] private int _conflictCount;
    [ObservableProperty] private int _teacherCount;

    // Loading states
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isSaving;
    
    // Debug properties
    [ObservableProperty] private bool _isDataGridVisible;
    [ObservableProperty] private bool _isEmptyStateVisible;
    [ObservableProperty] private string _firstScheduleSubject = "Unknown";
    [ObservableProperty] private string _firstScheduleTeacher = "Unknown";

    // Form data for create/edit
    [ObservableProperty] private CreateScheduleDto _createScheduleData = new();
    [ObservableProperty] private UpdateScheduleDto _updateScheduleData = new();

    // Day options for dropdown
    public List<string> DayOptions { get; } = new() { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };

    // School year options
    public List<string> SchoolYears { get; } = new() { "2024-2025", "2025-2026", "2026-2027" };

    // Semester options
    public List<string> Semesters { get; } = new() { "1st", "2nd" };

    public ClassSchedulesViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        
        // Initialize collections
        Schedules = new ObservableCollection<ScheduleViewModel>();
        FilteredSchedules = new ObservableCollection<ScheduleViewModel>();
        Sections = new ObservableCollection<SectionDto>();
        Teachers = new ObservableCollection<UserDto>();
        Subjects = new ObservableCollection<Subject>();
        Rooms = new ObservableCollection<RoomDto>();
        Buildings = new ObservableCollection<BuildingDto>();

        // Load initial data
        _ = LoadInitialDataAsync();
    }

    private async Task LoadInitialDataAsync()
    {
        await Task.WhenAll(
            LoadSchedulesAsync(),
            LoadDropdownDataAsync()
        );
    }

    [RelayCommand]
    private async Task LoadSchedulesAsync()
    {
        try
        {
            IsLoading = true;
            
            // Debug logging
            _toastService.Info("Loading schedules...", "Debug");
            
            var response = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                sectionId: SelectedSection?.Id,
                teacherId: SelectedTeacher?.Id,
                dayOfWeek: SelectedDay,
                schoolYear: SelectedSchoolYear,
                semester: SelectedSemester
            );

            // Debug logging
            _toastService.Info($"API Response received: {response != null}", "Debug");
            
            if (response?.Data != null)
            {
                // Debug: Log the first schedule's raw data
                if (response.Data.Count > 0)
                {
                    var firstSchedule = response.Data[0];
                    System.Diagnostics.Debug.WriteLine($"First schedule raw data: {System.Text.Json.JsonSerializer.Serialize(firstSchedule)}");
                }
            }
            
            if (response?.Data != null)
            {
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    try
                    {
                        Schedules.Clear();
                        foreach (var schedule in response.Data)
                        {
                            try
                            {
                                if (schedule != null)
                                {
                                    var scheduleVm = new ScheduleViewModel(schedule);
                                    Schedules.Add(scheduleVm);
                                    
                                       // Debug logging for first few schedules
                                       if (Schedules.Count <= 3)
                                       {
                                           System.Diagnostics.Debug.WriteLine($"Schedule {Schedules.Count}: Subject='{scheduleVm.SubjectName}', Teacher='{scheduleVm.TeacherName}', Section='{scheduleVm.SectionName}'");
                                           System.Diagnostics.Debug.WriteLine($"  ScheduleDto: Subject={schedule?.Subject?.SubjectName ?? "NULL"}, Teacher={schedule?.Teacher?.FirstName ?? "NULL"} {schedule?.Teacher?.LastName ?? "NULL"}");
                                           System.Diagnostics.Debug.WriteLine($"  ScheduleDto: Section={schedule?.Section?.Name ?? "NULL"}, Room={schedule?.Room?.RoomNumber ?? "NULL"}");
                                           System.Diagnostics.Debug.WriteLine($"  ScheduleDto: DayOfWeek='{schedule?.DayOfWeek ?? "NULL"}', DisplayDay='{scheduleVm.DisplayDay}'");
                                           System.Diagnostics.Debug.WriteLine($"  ScheduleDto: StartTime='{schedule?.StartTime ?? "NULL"}', EndTime='{schedule?.EndTime ?? "NULL"}', TimeRange='{scheduleVm.TimeRange}'");
                                       }
                                }
                            }
                            catch (Exception ex)
                            {
                                _toastService.Error($"Error creating schedule view model: {ex.Message}", "Error");
                                System.Diagnostics.Debug.WriteLine($"ScheduleViewModel creation error: {ex}");
                            }
                        }
                        ApplyFilters();
                        UpdateStatistics();
                        
                        // Debug logging
                        _toastService.Info($"Loaded {Schedules.Count} schedules successfully", "Debug");
                        
                        // Test with hardcoded data if no real data
                        if (Schedules.Count == 0)
                        {
                            _toastService.Info("No real data, adding test data", "Debug");
                            var testSchedule = new ScheduleDto
                            {
                                Id = "test-1",
                                SubjectId = "test-subject",
                                TeacherId = "test-teacher",
                                SectionId = "test-section",
                                RoomId = "test-room",
                                DayOfWeek = "Monday",
                                StartTime = "08:00",
                                EndTime = "09:00",
                                SchoolYear = "2024-2025",
                                Semester = "1st",
                                Subject = new SubjectDto { SubjectName = "Test Subject", ColorHex = "#FF0000" },
                                Teacher = new TeacherDto { FirstName = "Test", LastName = "Teacher" },
                                Section = new SectionDto { Name = "Test Section" },
                                Room = new RoomDto { RoomNumber = "101" },
                                Building = new BuildingDto { BuildingName = "Test Building" }
                            };
                            Schedules.Add(new ScheduleViewModel(testSchedule));
                            ApplyFilters();
                            UpdateStatistics();
                        }
                    }
                    catch (Exception ex)
                    {
                        _toastService.Error($"Error updating UI with schedule data: {ex.Message}", "Error");
                        System.Diagnostics.Debug.WriteLine($"UI update error: {ex}");
                    }
                });
            }
            else
            {
                _toastService.Error("No schedule data received from API", "Error");
            }
        }
        catch (Exception ex)
        {
            _toastService.Error($"Failed to load schedules: {ex.Message}", "Error");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task LoadDropdownDataAsync()
    {
        try
        {
            var tasks = new[]
            {
                LoadSectionsAsync(),
                LoadTeachersAsync(),
                LoadSubjectsAsync(),
                LoadRoomsAsync(),
                LoadBuildingsAsync()
            };

            await Task.WhenAll(tasks);
        }
        catch (Exception ex)
        {
            _toastService.Error($"Failed to load dropdown data: {ex.Message}", "Error");
        }
    }

    private async Task LoadSectionsAsync()
    {
        var sections = await _apiClient.GetSectionsAsync();
        if (sections != null)
        {
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                Sections.Clear();
                foreach (var section in sections)
                {
                    Sections.Add(section);
                }
            });
        }
    }

    private async Task LoadTeachersAsync()
    {
        var teachers = await _apiClient.GetTeachersAsync();
        if (teachers != null)
        {
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                Teachers.Clear();
                foreach (var teacher in teachers)
                {
                    Teachers.Add(teacher);
                }
            });
        }
    }

    private async Task LoadSubjectsAsync()
    {
        var subjects = await _apiClient.GetSubjectsAsync();
        if (subjects != null)
        {
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                Subjects.Clear();
                foreach (var subject in subjects)
                {
                    Subjects.Add(subject);
                }
            });
        }
    }

    private async Task LoadRoomsAsync()
    {
        var rooms = await _apiClient.GetRoomsAsync();
        if (rooms != null)
        {
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                Rooms.Clear();
                foreach (var room in rooms)
                {
                    Rooms.Add(room);
                }
            });
        }
    }

    private async Task LoadBuildingsAsync()
    {
        var buildings = await _apiClient.GetBuildingsAsync();
        if (buildings != null)
        {
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                Buildings.Clear();
                foreach (var building in buildings)
                {
                    Buildings.Add(building);
                }
            });
        }
    }

    [RelayCommand]
    private void AddTestData()
    {
        try
        {
            _toastService.Info("Adding test data...", "Debug");
            
            var testSchedule = new ScheduleDto
            {
                Id = "test-1",
                SubjectId = "test-subject",
                TeacherId = "test-teacher",
                SectionId = "test-section",
                RoomId = "test-room",
                DayOfWeek = "Monday",
                StartTime = "08:00",
                EndTime = "09:00",
                SchoolYear = "2024-2025",
                Semester = "1st",
                Subject = new SubjectDto { SubjectName = "Test Subject", ColorHex = "#FF0000" },
                Teacher = new TeacherDto { FirstName = "Test", LastName = "Teacher" },
                Section = new SectionDto { Name = "Test Section" },
                Room = new RoomDto { RoomNumber = "101" },
                Building = new BuildingDto { BuildingName = "Test Building" }
            };
            
            var testScheduleVm = new ScheduleViewModel(testSchedule);
            Schedules.Add(testScheduleVm);
            
            // Debug: Test the test data
            System.Diagnostics.Debug.WriteLine($"Test data: Subject='{testScheduleVm.SubjectName}', Teacher='{testScheduleVm.TeacherName}', Section='{testScheduleVm.SectionName}'");
            
            ApplyFilters();
            UpdateStatistics();
            
            _toastService.Info($"Added test data. Total schedules: {Schedules.Count}", "Debug");
        }
        catch (Exception ex)
        {
            _toastService.Error($"Error adding test data: {ex.Message}", "Error");
        }
    }

    [RelayCommand]
    private async Task ApplyFiltersAsync()
    {
        await LoadSchedulesAsync();
    }

    [RelayCommand]
    private void OpenCreateDialog()
    {
        CreateScheduleData = new CreateScheduleDto
        {
            SchoolYear = SelectedSchoolYear ?? "2024-2025",
            Semester = SelectedSemester ?? "1st"
        };
        IsCreateDialogOpen = true;
    }

    [RelayCommand]
    private void OpenEditDialog(ScheduleViewModel schedule)
    {
        SelectedSchedule = schedule;
        UpdateScheduleData = new UpdateScheduleDto
        {
            SubjectId = schedule.Schedule.SubjectId,
            TeacherId = schedule.Schedule.TeacherId,
            SectionId = schedule.Schedule.SectionId,
            RoomId = schedule.Schedule.RoomId,
            BuildingId = schedule.Schedule.BuildingId,
            DayOfWeek = schedule.Schedule.DayOfWeek,
            StartTime = schedule.Schedule.StartTime,
            EndTime = schedule.Schedule.EndTime,
            SchoolYear = schedule.Schedule.SchoolYear,
            Semester = schedule.Schedule.Semester
        };
        IsEditDialogOpen = true;
    }

    [RelayCommand]
    private async Task SaveScheduleAsync()
    {
        try
        {
            IsSaving = true;

            if (IsCreateDialogOpen)
            {
                await CreateScheduleAsync();
            }
            else if (IsEditDialogOpen && SelectedSchedule != null)
            {
                await UpdateScheduleAsync();
            }
        }
        catch (Exception ex)
        {
            _toastService.Error($"Failed to save schedule: {ex.Message}", "Error");
        }
        finally
        {
            IsSaving = false;
        }
    }

    private async Task CreateScheduleAsync()
    {
        try
        {
            // Step 1: Check for conflicts FIRST (blocking)
            var conflictResult = await _apiClient.CheckScheduleConflictsAsync(CreateScheduleData);
            
            if (conflictResult?.HasConflicts == true)
            {
                // Show blocking dialog with conflict details
                var conflictMessages = string.Join("\n", 
                    conflictResult.Conflicts.Select(c => $"• {c.Type}: {c.Message}"));
                
                _toastService.Warning(
                    $"Cannot create schedule due to conflicts:\n{conflictMessages}", 
                    "Schedule Conflicts Detected");
                
                // Do NOT proceed with save
                return;
            }
            
            // Step 2: No conflicts - proceed with creation
            var result = await _apiClient.CreateScheduleAsync(CreateScheduleData);
            
            if (result != null)
            {
                _toastService.Success("Schedule created successfully", "Success");
                IsCreateDialogOpen = false;
                await LoadSchedulesAsync();
            }
            else
            {
                _toastService.Error("Failed to create schedule", "Error");
            }
        }
        catch (ApiException ex)
        {
            _toastService.Error(ex.Message, "Error Creating Schedule");
        }
    }

    private async Task UpdateScheduleAsync()
    {
        try
        {
            if (SelectedSchedule == null) return;

            // Check for conflicts first (similar to create)
            var tempCreateDto = new CreateScheduleDto
            {
                SubjectId = UpdateScheduleData.SubjectId ?? SelectedSchedule.Schedule.SubjectId,
                TeacherId = UpdateScheduleData.TeacherId ?? SelectedSchedule.Schedule.TeacherId,
                SectionId = UpdateScheduleData.SectionId ?? SelectedSchedule.Schedule.SectionId,
                RoomId = UpdateScheduleData.RoomId ?? SelectedSchedule.Schedule.RoomId,
                BuildingId = UpdateScheduleData.BuildingId ?? SelectedSchedule.Schedule.BuildingId,
                DayOfWeek = UpdateScheduleData.DayOfWeek ?? SelectedSchedule.Schedule.DayOfWeek,
                StartTime = UpdateScheduleData.StartTime ?? SelectedSchedule.Schedule.StartTime,
                EndTime = UpdateScheduleData.EndTime ?? SelectedSchedule.Schedule.EndTime,
                SchoolYear = UpdateScheduleData.SchoolYear ?? SelectedSchedule.Schedule.SchoolYear,
                Semester = UpdateScheduleData.Semester ?? SelectedSchedule.Schedule.Semester
            };

            var conflictResult = await _apiClient.CheckScheduleConflictsAsync(tempCreateDto);
            if (conflictResult?.HasConflicts == true)
            {
                var conflictMessages = string.Join("\n", 
                    conflictResult.Conflicts.Select(c => $"• {c.Type}: {c.Message}"));
                
                _toastService.Warning(
                    $"Cannot update schedule due to conflicts:\n{conflictMessages}", 
                    "Schedule Conflicts Detected");
                
                return;
            }

            var result = await _apiClient.UpdateScheduleAsync(SelectedSchedule.Schedule.Id, UpdateScheduleData);
            if (result != null)
            {
                _toastService.Success("Schedule updated successfully", "Success");
                IsEditDialogOpen = false;
                await LoadSchedulesAsync();
            }
            else
            {
                _toastService.Error("Failed to update schedule", "Error");
            }
        }
        catch (ApiException ex)
        {
            _toastService.Error(ex.Message, "Error Updating Schedule");
        }
    }

    [RelayCommand]
    private async Task DeleteScheduleAsync(ScheduleViewModel schedule)
    {
        try
        {
            var result = await _apiClient.DeleteScheduleAsync(schedule.Schedule.Id);
            if (result)
            {
                _toastService.Success("Schedule deleted successfully", "Success");
                await LoadSchedulesAsync();
            }
            else
            {
                _toastService.Error("Failed to delete schedule", "Error");
            }
        }
        catch (Exception ex)
        {
            _toastService.Error($"Failed to delete schedule: {ex.Message}", "Error");
        }
    }

    [RelayCommand]
    private void OpenAssignStudentsDialog(ScheduleViewModel schedule)
    {
        SelectedSchedule = schedule;
        IsAssignStudentsDialogOpen = true;
    }

    [RelayCommand]
    private void CancelCreateEdit()
    {
        IsCreateDialogOpen = false;
        IsEditDialogOpen = false;
        CreateScheduleData = new CreateScheduleDto();
        UpdateScheduleData = new UpdateScheduleDto();
    }

    [RelayCommand]
    private void CloseAssignStudents()
    {
        IsAssignStudentsDialogOpen = false;
    }

    [RelayCommand]
    private async Task CheckConflictsAsync()
    {
        if (IsCreateDialogOpen)
        {
            var conflictResult = await _apiClient.CheckScheduleConflictsAsync(CreateScheduleData);
            if (conflictResult?.HasConflicts == true)
            {
                var conflictMessages = string.Join("\n", conflictResult.Conflicts.Select(c => c.Message));
                _toastService.Warning($"The following conflicts were detected:\n{conflictMessages}", "Schedule Conflicts");
            }
            else
            {
                _toastService.Success("No schedule conflicts detected", "No Conflicts");
            }
        }
    }

    private void ApplyFilters()
    {
        try
        {
            var filtered = Schedules.AsEnumerable();

            if (!string.IsNullOrEmpty(SearchText))
            {
                filtered = filtered.Where(s => 
                    s?.SubjectName?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true ||
                    s?.TeacherName?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true ||
                    s?.SectionName?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true ||
                    s?.RoomNumber?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true
                );
            }

            FilteredSchedules.Clear();
            foreach (var schedule in filtered)
            {
                if (schedule != null)
                {
                    FilteredSchedules.Add(schedule);
                }
            }
            
            // Update debug visibility properties
            IsDataGridVisible = FilteredSchedules.Count > 0;
            IsEmptyStateVisible = FilteredSchedules.Count == 0;
            
            // Update debug properties for first schedule
            if (FilteredSchedules.Count > 0)
            {
                FirstScheduleSubject = FilteredSchedules[0]?.SubjectName ?? "Unknown";
                FirstScheduleTeacher = FilteredSchedules[0]?.TeacherName ?? "Unknown";
            }
            else
            {
                FirstScheduleSubject = "No schedules";
                FirstScheduleTeacher = "No schedules";
            }
            
            // Debug logging
            _toastService.Info($"Applied filters: {Schedules.Count} total, {FilteredSchedules.Count} filtered", "Debug");
               _toastService.Info($"Cards visible: {IsDataGridVisible}, Empty state visible: {IsEmptyStateVisible}", "Debug");
            _toastService.Info($"First schedule: {FirstScheduleSubject} - {FirstScheduleTeacher}", "Debug");
        }
        catch (Exception ex)
        {
            _toastService.Error($"Error applying filters: {ex.Message}", "Error");
            System.Diagnostics.Debug.WriteLine($"ApplyFilters error: {ex}");
        }
    }

    private void UpdateStatistics()
    {
        try
        {
            TotalSchedules = Schedules.Count;
            ActiveSchedules = Schedules.Count(s => s?.Schedule?.SchoolYear == SelectedSchoolYear);
            SchedulesThisSemester = Schedules.Count(s => s?.Schedule?.SchoolYear == SelectedSchoolYear && s?.Schedule?.Semester == SelectedSemester);
            ConflictCount = Schedules.Count(s => s?.HasConflict == true);
            TeacherCount = Schedules.Where(s => s?.Schedule?.TeacherId != null).Select(s => s.Schedule.TeacherId).Distinct().Count();
        }
        catch (Exception ex)
        {
            _toastService.Error($"Error updating statistics: {ex.Message}", "Error");
            System.Diagnostics.Debug.WriteLine($"UpdateStatistics error: {ex}");
        }
    }

    partial void OnSearchTextChanged(string value)
    {
        ApplyFilters();
    }

    partial void OnSelectedSectionChanged(SectionDto? value)
    {
        _ = ApplyFiltersAsync();
    }

    partial void OnSelectedTeacherChanged(UserDto? value)
    {
        _ = ApplyFiltersAsync();
    }

    partial void OnSelectedDayChanged(string? value)
    {
        _ = ApplyFiltersAsync();
    }

    partial void OnSelectedSchoolYearChanged(string? value)
    {
        _ = ApplyFiltersAsync();
    }

    partial void OnSelectedSemesterChanged(string? value)
    {
        _ = ApplyFiltersAsync();
    }
}
