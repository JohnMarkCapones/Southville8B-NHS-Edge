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
    private bool _isInitialLoad = true;

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

    // For edit dialog
    [ObservableProperty] private ScheduleViewModel? _selectedSchedule;
    [ObservableProperty] private bool _isEditDialogOpen;
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

    // Form data for edit
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

        // Only load on first creation
        if (_isInitialLoad)
        {
            _ = LoadInitialDataAsync();
            _isInitialLoad = false;
        }
    }

    [RelayCommand]
    public async Task RefreshData()
    {
        await LoadInitialDataAsync();
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
            
            var response = await _apiClient.GetSchedulesAsync(
                page: 1,
                limit: 100,
                sectionId: SelectedSection?.Id,
                teacherId: SelectedTeacher?.Id,
                dayOfWeek: SelectedDay,
                schoolYear: SelectedSchoolYear,
                semester: SelectedSemester
            );
            
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
                                }
                            }
                            catch (Exception ex)
                            {
                                _toastService.Error($"Error creating schedule view model: {ex.Message}", "Error");
                            }
                        }
                        ApplyFilters();
                        UpdateStatistics();
                        
                        // Test with hardcoded data if no real data
                        if (Schedules.Count == 0)
                        {
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
    private async Task ApplyFiltersAsync()
    {
        await LoadSchedulesAsync();
    }

    [RelayCommand]
    private async Task ClearFilters()
    {
        // Reset all filter properties to defaults
        SearchText = "";
        SelectedSection = null;
        SelectedTeacher = null;
        SelectedDay = null;
        SelectedSchoolYear = "2024-2025";
        SelectedSemester = "1st";
        
        // Reload schedules without filters
        await LoadSchedulesAsync();
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

            if (IsEditDialogOpen && SelectedSchedule != null)
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
    private void CancelEdit()
    {
        IsEditDialogOpen = false;
        UpdateScheduleData = new UpdateScheduleDto();
    }

    [RelayCommand]
    private void CloseAssignStudents()
    {
        IsAssignStudentsDialogOpen = false;
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
