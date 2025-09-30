using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System;

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

    public bool CanImport => HasFile && !HasFileValidationError && CsvColumns.Count > 0;

    partial void OnHasFileChanged(bool value) => OnPropertyChanged(nameof(CanImport));
    partial void OnHasFileValidationErrorChanged(bool value) => OnPropertyChanged(nameof(CanImport));

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
        SelectedFileName = "No file selected";
        HasFile = false;
        CsvColumns.Clear();
        PreviewRows.Clear();
        SummaryText = "No file loaded.";
        ImportStatusMessage = string.Empty;
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

    [RelayCommand]
    private void Import()
    {
        if (!CanImport)
        {
            ImportStatusMessage = "Cannot import. Fix issues first.";
            return;
        }
        // TODO: Real import logic
        ImportStatusMessage = "Import completed (sample placeholder).";
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }
}
