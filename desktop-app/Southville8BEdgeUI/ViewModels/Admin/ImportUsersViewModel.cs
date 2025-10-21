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
                              ParsedStudents.Count > 0 &&
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

            var csvContent = await File.ReadAllTextAsync(FilePath);
            await ParseCsvContent(csvContent);
            
            HasFile = true;
            HasFileValidationError = false;
            FileValidationMessage = string.Empty;
            UpdateSummary();
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
            CsvColumns.Clear();

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

            // Read data rows
            var students = new List<CsvStudentRowDto>();
            var rowNumber = 1;

            while (await csv.ReadAsync())
            {
                rowNumber++;
                try
                {
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
                        phone_number = ParsePhoneNumber(csv.GetField("phone_number") ?? ""),
                        email = csv.GetField("email"),
                        address = csv.GetField("address"),
                        is_primary = bool.TryParse(csv.GetField("is_primary"), out var isPrimary) ? isPrimary : false
                    };

                    students.Add(student);
                }
                catch (Exception ex)
                {
                    // Log error for this row but continue processing
                    System.Diagnostics.Debug.WriteLine($"Error parsing row {rowNumber}: {ex.Message}");
                }
            }

            // Add valid students to collection
            foreach (var student in students)
            {
                ParsedStudents.Add(student);
            }

            TotalRows = rowNumber - 1; // Subtract header row
            ValidRows = ParsedStudents.Count;
            InvalidRows = TotalRows - ValidRows;
        }
        catch (Exception ex)
        {
            FileValidationMessage = $"Error parsing CSV: {ex.Message}";
            HasFileValidationError = true;
        }
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
        SummaryText = $"File: {SelectedFileName} | Total rows: {TotalRows} | Valid: {ValidRows} | Invalid: {InvalidRows}";
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
            // Simulate progress steps
            await Task.Delay(100);
            ImportProgress = 10;
            ProgressText = "Validating data...";
            
            await Task.Delay(100);
            ImportProgress = 20;
            ProgressText = "Sending to server...";
            
            var importDto = new ImportStudentsCsvDto
            {
                Students = ParsedStudents.ToList()
            };

            await Task.Delay(100);
            ImportProgress = 30;
            ProgressText = "Processing students...";

            var result = await _apiClient.ImportStudentsCsvAsync(importDto);
            
            ImportProgress = 90;
            ProgressText = "Finalizing...";
            
            if (result != null)
            {
                ImportProgress = 100;
                ProgressText = "Import completed!";
                ImportStatusMessage = $"Import completed. Success: {result.Success}, Failed: {result.Failed}";
                
                // Show toast notification based on results
                if (result.Success > 0 && result.Failed == 0)
                {
                    _toastService.Success($"Successfully imported {result.Success} students!", "Import Complete");
                }
                else if (result.Success > 0 && result.Failed > 0)
                {
                    _toastService.Warning($"Imported {result.Success} students with {result.Failed} errors", "Partial Success");
                }
                else
                {
                    _toastService.Error("No students were imported successfully", "Import Failed");
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
