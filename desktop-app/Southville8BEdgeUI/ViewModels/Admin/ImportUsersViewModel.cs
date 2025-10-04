using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ImportUsersViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private string _selectedFileName = "No file selected";
    [ObservableProperty] private bool _hasFile;

    [ObservableProperty] private string _fileValidationMessage = string.Empty;
    [ObservableProperty] private bool _hasFileValidationError;

    public ObservableCollection<string> CsvColumns { get; } = new();

    [ObservableProperty] private string _fullNameColumn = string.Empty;
    [ObservableProperty] private string _usernameColumn = string.Empty;
    [ObservableProperty] private string _emailColumn = string.Empty;
    [ObservableProperty] private string _roleColumn = string.Empty;
    [ObservableProperty] private string _statusColumn = string.Empty;
    [ObservableProperty] private string _gradeColumn = string.Empty;
    [ObservableProperty] private string _phoneColumn = string.Empty;
    [ObservableProperty] private string _passwordColumn = string.Empty;
    [ObservableProperty] private string _requireResetColumn = string.Empty;

    public ObservableCollection<string> PreviewRows { get; } = new();

    [ObservableProperty] private string _summaryText = "No file loaded.";
    [ObservableProperty] private string _importStatusMessage = string.Empty;
    [ObservableProperty] private bool _isImporting;

    // Require core mappings before enabling import (adjust as business rules evolve)
    public bool CanImport => HasFile &&
                              !HasFileValidationError &&
                              CsvColumns.Count > 0 &&
                              !string.IsNullOrWhiteSpace(FullNameColumn) &&
                              !string.IsNullOrWhiteSpace(UsernameColumn) &&
                              !string.IsNullOrWhiteSpace(EmailColumn) &&
                              !IsImporting;

    public bool HasImportCompleted => !IsImporting && !string.IsNullOrWhiteSpace(ImportStatusMessage);

    partial void OnHasFileChanged(bool value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnHasFileValidationErrorChanged(bool value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnFullNameColumnChanged(string value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnUsernameColumnChanged(string value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnEmailColumnChanged(string value) { OnPropertyChanged(nameof(CanImport)); }
    partial void OnIsImportingChanged(bool value) { OnPropertyChanged(nameof(CanImport)); OnPropertyChanged(nameof(HasImportCompleted)); }
    partial void OnImportStatusMessageChanged(string value) => OnPropertyChanged(nameof(HasImportCompleted));

    // Subscribe to column changes so CanImport updates when columns are added/removed
    public ImportUsersViewModel()
    {
        CsvColumns.CollectionChanged += (_, __) => OnPropertyChanged(nameof(CanImport));
    }

    [RelayCommand]
    private void BrowseFile()
    {
        // TODO: Implement file picker (platform-specific integration).
        SelectedFileName = "sample-users.csv";
        HasFile = true;
        LoadSampleColumns();
        LoadSamplePreview();
        UpdateSummary();
    }

    [RelayCommand]
    private void ClearFile()
    {
        if (IsImporting) return;
        SelectedFileName = "No file selected";
        HasFile = false;
        CsvColumns.Clear();
        PreviewRows.Clear();
        SummaryText = "No file loaded.";
        ImportStatusMessage = string.Empty;
        FileValidationMessage = string.Empty;
        HasFileValidationError = false;
        // Reset mappings so stale selections don't persist
        FullNameColumn = UsernameColumn = EmailColumn = RoleColumn = StatusColumn =
            GradeColumn = PhoneColumn = PasswordColumn = RequireResetColumn = string.Empty;
        OnPropertyChanged(nameof(CanImport));
    }

    private void LoadSampleColumns()
    {
        CsvColumns.Clear();
        CsvColumns.Add("FullName");
        CsvColumns.Add("Username");
        CsvColumns.Add("Email");
        CsvColumns.Add("Role");
        CsvColumns.Add("Status");
        CsvColumns.Add("Grade");
        CsvColumns.Add("Phone");
        CsvColumns.Add("Password");
        CsvColumns.Add("RequireReset");
        FullNameColumn = "FullName";
        UsernameColumn = "Username";
        EmailColumn = "Email";
        RoleColumn = "Role";
        StatusColumn = "Status";
        GradeColumn = "Grade";
        PhoneColumn = "Phone";
        PasswordColumn = "Password";
        RequireResetColumn = "RequireReset";
    }

    private void LoadSamplePreview()
    {
        PreviewRows.Clear();
        PreviewRows.Add("John Smith,john.smith@example.com,Teacher,Active,Grade 8,09123456789,Temp123!,true");
        PreviewRows.Add("Maria Garcia,maria.garcia@example.com,Student,Active,Grade 9,09129876543,Temp123!,false");
        PreviewRows.Add("Robert Wilson,robert.wilson@example.com,Student,Inactive,Grade 8,09127775555,Temp123!,false");
    }

    private void UpdateSummary()
    {
        SummaryText = $"File: {SelectedFileName} | Columns detected: {CsvColumns.Count} | Preview rows: {PreviewRows.Count}";
    }

    private Task PerformImportAsync()
    {
        // Placeholder for real import; simulate latency
        return Task.Delay(500);
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
        try
        {
            await PerformImportAsync();
            ImportStatusMessage = "Import completed successfully.";
        }
        catch (Exception ex)
        {
            ImportStatusMessage = $"Import failed: {ex.Message}";
        }
        finally
        {
            IsImporting = false;
        }
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
