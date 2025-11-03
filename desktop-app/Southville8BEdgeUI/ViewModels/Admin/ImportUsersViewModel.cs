using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using System.Linq;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using Southville8BEdgeUI.Models.Api;
using Southville8BEdgeUI.Services;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Platform.Storage;
using Avalonia.Platform;
using Avalonia.Controls.ApplicationLifetimes;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ImportUsersViewModel : ViewModelBase
{
    private readonly IApiClient _apiClient;
    private readonly IToastService _toastService;
    
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private string _selectedFileName = "No file selected";
    [ObservableProperty] private bool _hasFile;
    [ObservableProperty] private string _filePath = string.Empty;

    [ObservableProperty] private string _fileValidationMessage = string.Empty;
    [ObservableProperty] private bool _hasFileValidationError;

    public ObservableCollection<string> CsvColumns { get; } = new();
    public ObservableCollection<CsvStudentRowDto> ParsedStudents { get; } = new();
    public ObservableCollection<CsvTeacherRowDto> ParsedTeachers { get; } = new();

    [ObservableProperty] private string _detectedImportType = "Unknown"; // "Student" or "Teacher"
    [ObservableProperty] private string _summaryText = "No file loaded.";
    [ObservableProperty] private string _importStatusMessage = string.Empty;
    [ObservableProperty] private bool _isImporting;
    [ObservableProperty] private int _totalRows = 0;
    [ObservableProperty] private int _validRows = 0;
    [ObservableProperty] private int _invalidRows = 0;
    
    // Progress tracking
    [ObservableProperty] private int _importProgress = 0;
    [ObservableProperty] private string _progressText = "Ready to import";

    // Require file and valid data before enabling import
    public bool CanImport => HasFile &&
                              !HasFileValidationError &&
                              ((DetectedImportType == "Student" && ParsedStudents.Count > 0) ||
                               (DetectedImportType == "Teacher" && ParsedTeachers.Count > 0)) &&
                              !IsImporting;

    public bool HasImportCompleted => !IsImporting && !string.IsNullOrWhiteSpace(ImportStatusMessage);

    partial void OnHasFileChanged(bool value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnHasFileValidationErrorChanged(bool value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnIsImportingChanged(bool value) { OnPropertyChanged(nameof(CanImport)); OnPropertyChanged(nameof(HasImportCompleted)); }
    partial void OnImportStatusMessageChanged(string value) => OnPropertyChanged(nameof(HasImportCompleted));

    public ImportUsersViewModel(IApiClient apiClient, IToastService toastService)
    {
        _apiClient = apiClient;
        _toastService = toastService;
        ParsedStudents.CollectionChanged += (_, __) => OnPropertyChanged(nameof(CanImport));
        ParsedTeachers.CollectionChanged += (_, __) => OnPropertyChanged(nameof(CanImport));
    }

    [RelayCommand]
    private async Task LoadSample()
    {
        try
        {
            var sampleCsvPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "sample-students.csv");
            await CreateSampleCsv(sampleCsvPath);
            FilePath = sampleCsvPath;
            SelectedFileName = Path.GetFileName(sampleCsvPath);
            await LoadCsvFile();
        }
        catch (Exception ex)
        {
            FileValidationMessage = $"Error loading sample data: {ex.Message}";
            HasFileValidationError = true;
        }
    }

    [RelayCommand]
    private async Task BrowseFile()
    {
        try
        {
            // Get the main window to show the dialog
            var mainWindow = Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop
                ? desktop.MainWindow
                : null;

            if (mainWindow == null)
            {
                // Fallback: Create sample CSV for testing
                var sampleCsvPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "sample-students.csv");
                await CreateSampleCsv(sampleCsvPath);
                FilePath = sampleCsvPath;
                SelectedFileName = Path.GetFileName(sampleCsvPath);
                await LoadCsvFile();
                return;
            }

            // Create file picker options
            var options = new FilePickerOpenOptions
            {
                Title = "Select CSV File",
                AllowMultiple = false,
                FileTypeFilter = new List<FilePickerFileType>
                {
                    new FilePickerFileType("CSV Files") { Patterns = new[] { "*.csv" } },
                    new FilePickerFileType("All Files") { Patterns = new[] { "*.*" } }
                }
            };

            var files = await mainWindow.StorageProvider.OpenFilePickerAsync(options);
            
            if (files.Count > 0)
            {
                var file = files[0];
                FilePath = file.Path.LocalPath;
                SelectedFileName = file.Name;
                await LoadCsvFile();
            }
        }
        catch (Exception ex)
        {
            FileValidationMessage = $"Error selecting file: {ex.Message}";
            HasFileValidationError = true;
        }
    }

    private async Task CreateSampleCsv(string filePath)
    {
        var sampleData = @"full_name,role,status,first_name,last_name,middle_name,student_id,lrn_id,grade_level,enrollment,section,age,birthday,guardian_name,relationship,phone_number,email,address,is_primary
Liam Alexander Santos,Student,Active,Liam,Santos,Alexander,STU-1000,LRN-9000,Grade 8,2023,Sampaguita,13,2008-11-04,Emma Hernandez,Mother,6.39439E+11,emmahernandez@gmail.com,Unit 18 Pine Road Barangay 5 Pasay,FALSE
Isabella Daniel Garcia,Student,Active,Isabella,Garcia,Daniel,STU-1001,LRN-9001,Grade 8,2025,Galileo Galilei,15,2006-03-22,Charlotte Romero,Aunt,6.39317E+11,charlotteromero@gmail.com,Unit 23 Birch Court Barangay 1 Mandaluyong,FALSE
Lucas Mason Lopez,Student,Active,Lucas,Lopez,Mason,STU-1002,LRN-9002,Grade 10,2023,Rose,14,2008-03-11,Arianna Santos,Grandparent,6.39234E+11,ariannasantos@gmail.com,Lot 3 Elm Boulevard Barangay 7 Makati,FALSE";

        await File.WriteAllTextAsync(filePath, sampleData);
    }

    private async Task LoadCsvFile()
    {
        try
        {
            if (string.IsNullOrEmpty(FilePath) || !File.Exists(FilePath))
            {
                FileValidationMessage = "File not found.";
                HasFileValidationError = true;
                return;
            }

            // Check if file is accessible (not locked by another process)
            try
            {
                using (var fileStream = new FileStream(FilePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    // File is accessible, proceed to read
                }
            }
            catch (IOException ioEx)
            {
                FileValidationMessage = $"Cannot access the file. Please close it in Excel or any other application that may have it open, then try again.\n\nError: {ioEx.Message}";
                HasFileValidationError = true;
                return;
            }
            catch (UnauthorizedAccessException)
            {
                FileValidationMessage = "Access denied. Please check file permissions or close the file in other applications.";
                HasFileValidationError = true;
                return;
            }

            // Retry logic for reading the file (in case of transient locks)
            string? csvContent = null;
            int retries = 3;
            int delayMs = 500;

            for (int i = 0; i < retries; i++)
            {
                try
                {
                    csvContent = await File.ReadAllTextAsync(FilePath);
                    break; // Success, exit retry loop
                }
                catch (IOException) when (i < retries - 1)
                {
                    // Wait before retrying
                    await Task.Delay(delayMs);
                    delayMs *= 2; // Exponential backoff
                }
            }

            if (csvContent == null)
            {
                FileValidationMessage = "Failed to read file after multiple attempts. Please ensure the file is closed in all applications.";
                HasFileValidationError = true;
                return;
            }

            await ParseCsvContent(csvContent);
            
            HasFile = true;
            HasFileValidationError = false;
            FileValidationMessage = string.Empty;
            UpdateSummary();
        }
        catch (IOException ioEx)
        {
            FileValidationMessage = $"Cannot access the file. Please close it in Excel or any other application, then try again.\n\nDetails: {ioEx.Message}";
            HasFileValidationError = true;
        }
        catch (Exception ex)
        {
            FileValidationMessage = $"Error loading CSV file: {ex.Message}";
            HasFileValidationError = true;
        }
    }

    private async Task ParseCsvContent(string csvContent)
    {
        try
        {
            ParsedStudents.Clear();
            ParsedTeachers.Clear();
            CsvColumns.Clear();
            DetectedImportType = "Unknown";

            using var reader = new StringReader(csvContent);
            using var csv = new CsvReader(reader, new CsvConfiguration(System.Globalization.CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null
            });

            // Read headers
            await csv.ReadAsync();
            csv.ReadHeader();
            
            var headers = csv.HeaderRecord?.ToList() ?? new List<string>();
            foreach (var header in headers)
            {
                CsvColumns.Add(header);
            }

            // Auto-detect import type based on CSV columns
            bool hasStudentColumns = headers.Any(h => 
                h.Equals("lrn_id", StringComparison.OrdinalIgnoreCase) ||
                h.Equals("grade_level", StringComparison.OrdinalIgnoreCase) ||
                h.Equals("section", StringComparison.OrdinalIgnoreCase) ||
                h.Equals("guardian_name", StringComparison.OrdinalIgnoreCase) ||
                h.Equals("student_id", StringComparison.OrdinalIgnoreCase));

            bool hasTeacherColumns = headers.Any(h => 
                h.Equals("subject_specialization_id", StringComparison.OrdinalIgnoreCase) ||
                h.Equals("department_id", StringComparison.OrdinalIgnoreCase) ||
                h.Equals("advisory_section_id", StringComparison.OrdinalIgnoreCase));

            // Determine import type: Teacher takes precedence if both detected
            if (hasTeacherColumns && !hasStudentColumns)
            {
                DetectedImportType = "Teacher";
                await ParseTeacherCsv(csv, headers);
            }
            else if (hasStudentColumns)
            {
                DetectedImportType = "Student";
                await ParseStudentCsv(csv, headers);
            }
            else
            {
                FileValidationMessage = "Cannot detect CSV format. Ensure CSV has either student columns (lrn_id, grade_level, section) or teacher columns (subject_specialization_id, department_id).";
                HasFileValidationError = true;
                return;
            }

            UpdateSummary();
        }
        catch (Exception ex)
        {
            FileValidationMessage = $"Error parsing CSV: {ex.Message}";
            HasFileValidationError = true;
        }
    }

    private async Task ParseStudentCsv(CsvReader csv, List<string> headers)
    {
        var students = new List<CsvStudentRowDto>();
        var rowNumber = 1;

        while (await csv.ReadAsync())
        {
            rowNumber++;
            try
            {
                string? phoneNum = csv.GetField("phone_number");
                var student = new CsvStudentRowDto
                {
                    full_name = csv.GetField("full_name") ?? "",
                    role = csv.GetField("role") ?? "",
                    status = csv.GetField("status") ?? "",
                    first_name = csv.GetField("first_name") ?? "",
                    last_name = csv.GetField("last_name") ?? "",
                    middle_name = csv.GetField("middle_name"),
                    student_id = csv.GetField("student_id") ?? "",
                    lrn_id = csv.GetField("lrn_id") ?? "",
                    grade_level = csv.GetField("grade_level") ?? "",
                    enrollment = int.TryParse(csv.GetField("enrollment"), out var enrollment) ? enrollment : 0,
                    section = csv.GetField("section") ?? "",
                    age = int.TryParse(csv.GetField("age"), out var age) ? age : null,
                    birthday = DateTime.TryParse(csv.GetField("birthday"), out var birthday) ? birthday : DateTime.MinValue,
                    guardian_name = csv.GetField("guardian_name") ?? "",
                    relationship = csv.GetField("relationship") ?? "",
                    phone_number = ParsePhoneNumber(phoneNum ?? ""),
                    email = csv.GetField("email"),
                    address = csv.GetField("address"),
                    is_primary = bool.TryParse(csv.GetField("is_primary"), out var isPrimary) ? isPrimary : false
                };

                students.Add(student);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error parsing student row {rowNumber}: {ex.Message}");
            }
        }

        foreach (var student in students)
        {
            ParsedStudents.Add(student);
        }

        TotalRows = rowNumber - 1;
        ValidRows = ParsedStudents.Count;
        InvalidRows = TotalRows - ValidRows;
    }

    private async Task ParseTeacherCsv(CsvReader csv, List<string> headers)
    {
        var teachers = new List<CsvTeacherRowDto>();
        var rowNumber = 1;

        while (await csv.ReadAsync())
        {
            rowNumber++;
            try
            {
                var teacher = new CsvTeacherRowDto
                {
                    FirstName = csv.GetField("first_name") ?? "",
                    LastName = csv.GetField("last_name") ?? "",
                    MiddleName = csv.GetField("middle_name"),
                    Age = int.TryParse(csv.GetField("age"), out var age) ? age : null,
                    SubjectSpecializationId = csv.GetField("subject_specialization_id") ?? "",
                    DepartmentId = csv.GetField("department_id") ?? "",
                    AdvisorySectionId = csv.GetField("advisory_section_id"),
                    Email = csv.GetField("email")?.Trim(),
                    Birthday = csv.GetField("birthday") ?? ""
                };

                teachers.Add(teacher);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error parsing teacher row {rowNumber}: {ex.Message}");
            }
        }

        foreach (var teacher in teachers)
        {
            ParsedTeachers.Add(teacher);
        }

        TotalRows = rowNumber - 1;
        ValidRows = ParsedTeachers.Count;
        InvalidRows = TotalRows - ValidRows;
    }

    private string ParsePhoneNumber(string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        // Check if scientific notation (e.g., 6.39439E+11)
        if (value.Contains('E', StringComparison.OrdinalIgnoreCase))
        {
            if (double.TryParse(value, out var num))
            {
                return "+" + num.ToString("F0");
            }
        }

        // If already in proper format, return as-is
        if (value.StartsWith("+"))
        {
            return value;
        }

        // If starts with 63 (Philippines country code), add +
        if (value.StartsWith("63") && value.Length >= 12)
        {
            return "+" + value;
        }

        return value;
    }

    private void UpdateSummary()
    {
        var userType = DetectedImportType == "Student" ? "students" : 
                       DetectedImportType == "Teacher" ? "teachers" : "users";
        SummaryText = $"File: {SelectedFileName} | Type: {DetectedImportType} | Total rows: {TotalRows} | Valid: {ValidRows} | Invalid: {InvalidRows}";
    }

    [RelayCommand]
    private async Task Import()
    {
        if (!CanImport)
        {
            ImportStatusMessage = "Cannot import. Fix issues first.";
            return;
        }

        IsImporting = true;
        ImportStatusMessage = string.Empty;
        ImportProgress = 0;
        ProgressText = "Preparing import...";
        
        try
        {
            await Task.Delay(100);
            ImportProgress = 10;
            ProgressText = "Validating data...";
            
            await Task.Delay(100);
            ImportProgress = 20;
            ProgressText = "Sending to server...";
            
            await Task.Delay(100);
            ImportProgress = 30;

            BulkImportResultDto? result = null;

            if (DetectedImportType == "Student")
            {
                ProgressText = "Processing students...";
                var importDto = new ImportStudentsCsvDto
                {
                    Students = ParsedStudents.ToList()
                };
                result = await _apiClient.ImportStudentsCsvAsync(importDto);
            }
            else if (DetectedImportType == "Teacher")
            {
                ProgressText = "Processing teachers...";
                var importDto = new ImportTeachersCsvDto
                {
                    Teachers = ParsedTeachers.ToList()
                };
                result = await _apiClient.ImportTeachersCsvAsync(importDto);
            }
            else
            {
                throw new Exception("Unknown import type detected");
            }
            
            ImportProgress = 90;
            ProgressText = "Finalizing...";
            
            if (result != null)
            {
                ImportProgress = 100;
                ProgressText = "Import completed!";
                var userType = DetectedImportType == "Student" ? "students" : "teachers";
                ImportStatusMessage = $"Import completed. Success: {result.Success}, Failed: {result.Failed}";
                
                // Show toast notification based on results
                if (result.Success > 0 && result.Failed == 0)
                {
                    _toastService.Success($"Successfully imported {result.Success} {userType}!", "Import Complete");
                }
                else if (result.Success > 0 && result.Failed > 0)
                {
                    _toastService.Warning($"Imported {result.Success} {userType} with {result.Failed} errors", "Partial Success");
                }
                else
                {
                    _toastService.Error($"No {userType} were imported successfully", "Import Failed");
                }
                
                if (result.Errors.Count > 0)
                {
                    var errorDetails = string.Join("\n", result.Errors.Select(e => e.ToString()));
                    ImportStatusMessage += $"\n\nErrors:\n{errorDetails}";
                }
            }
            else
            {
                ImportProgress = 100;
                ProgressText = "Import failed";
                ImportStatusMessage = "Import failed: Unable to connect to server.";
                _toastService.Error("Unable to connect to server", "Import Failed");
            }
        }
        catch (Exception ex)
        {
            ImportProgress = 100;
            ProgressText = "Import failed";
            ImportStatusMessage = $"Import failed: {ex.Message}";
            _toastService.Error($"Import failed: {ex.Message}", "Import Error");
        }
        finally
        {
            IsImporting = false;
        }
    }

    [RelayCommand]
    private void ClearFile()
    {
        if (IsImporting) return;
        
        SelectedFileName = "No file selected";
        FilePath = string.Empty;
        HasFile = false;
        CsvColumns.Clear();
        ParsedStudents.Clear();
        ParsedTeachers.Clear();
        DetectedImportType = "Unknown";
        SummaryText = "No file loaded.";
        ImportStatusMessage = string.Empty;
        FileValidationMessage = string.Empty;
        HasFileValidationError = false;
        TotalRows = 0;
        ValidRows = 0;
        InvalidRows = 0;
        ImportProgress = 0;
        ProgressText = "Ready to import";
        OnPropertyChanged(nameof(CanImport));
    }

    [RelayCommand]
    private void Done()
    {
        if (IsImporting) return;
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void Cancel()
    {
        if (IsImporting) return;
        NavigateBack?.Invoke();
    }
}
