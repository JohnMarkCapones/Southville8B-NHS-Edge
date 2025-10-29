<!-- d1ed4245-7c59-4721-98b5-96b80146cc1f 3c2e127c-4100-4268-980f-480c1e00e208 -->
# Replace Recent Activity with Students Needing Attention

## Overview

Replace the hardcoded "Recent Student Activity" section (showing mock student activities) with a "Students Needing Attention" section that displays real students with low GWA scores from the `students_gwa` table who require teacher follow-up.

## Current Implementation

**View:** `desktop-app/Southville8BEdgeUI/Views/Teacher/TeacherDashboardView.axaml`

- Lines 503-540: "Recent Student Activity" section displaying `RecentActivities` collection

**ViewModel:** `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

- Line 46: `RecentActivities` observable collection
- Lines 146-157: `InitializeRecentActivities()` with hardcoded mock data
- Line 81: Called in constructor
- Lines 695-744: `TeacherActivityViewModel` class

## Proposed Replacement

### Students Needing Attention Section

Shows:

- Student name and student number
- Current GWA score (color-coded: red for low, yellow for concerning)
- Grading period and honor status
- Section name
- Status indicator (e.g., "Low GWA", "At Risk")

**Criteria for "Needing Attention":**

- GWA < 75 (failing)
- GWA between 75-79 (at risk)
- No honor status or declining performance

## Changes Required

### 1. Remove Mock Recent Activities

**File:** `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

**Remove:**

- Lines 146-157: Delete `InitializeRecentActivities()` method
- Line 81: Remove call to `InitializeRecentActivities()` in constructor
- Line 46: Remove `RecentActivities` observable property
- Lines 695-744: Remove `TeacherActivityViewModel` class

### 2. Add Students Needing Attention Properties

**File:** `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

**Add near line 46 (replace RecentActivities):**

```csharp
// Students Needing Attention
[ObservableProperty] private ObservableCollection<StudentAtRiskViewModel> _studentsNeedingAttention = default!;
```

**Add in constructor (replace InitializeRecentActivities):**

```csharp
StudentsNeedingAttention = new ObservableCollection<StudentAtRiskViewModel>();
```

### 3. Add LoadStudentsNeedingAttentionAsync Method

**File:** `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

**Add after `LoadMySectionsAsync()`:**

```csharp
private async Task LoadStudentsNeedingAttentionAsync(string? userId = null)
{
    var effectiveUserId = userId ?? _userId;
    
    if (_apiClient == null || string.IsNullOrEmpty(effectiveUserId))
    {
        System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] Cannot load students needing attention: API client or user ID is null");
        return;
    }

    try
    {
        System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] Loading students needing attention for user: {effectiveUserId}");
        
        // Fetch sections where this teacher is assigned
        var sectionsResponse = await _apiClient.GetAsync<SectionListResponse>("sections?limit=100");
        
        if (sectionsResponse?.Data != null)
        {
            // Filter sections where teacher_id matches current user
            var teacherSections = sectionsResponse.Data
                .Where(s => !string.IsNullOrEmpty(s.TeacherId) && s.TeacherId == effectiveUserId)
                .Select(s => s.Id)
                .ToList();
            
            if (!teacherSections.Any())
            {
                System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] No sections found for teacher");
                return;
            }
            
            System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] Found {teacherSections.Count} sections");
            
            // Fetch all students with GWA from teacher's sections
            var studentsAtRisk = new List<StudentAtRiskViewModel>();
            
            foreach (var sectionId in teacherSections)
            {
                // Fetch students in this section
                var studentsResponse = await _apiClient.GetAsync<StudentListResponse>($"students?sectionId={sectionId}&limit=1000");
                
                if (studentsResponse?.Data != null)
                {
                    foreach (var student in studentsResponse.Data)
                    {
                        // Fetch GWA records for this student
                        var gwaResponse = await _apiClient.GetAsync<StudentGwaListResponse>($"gwa?studentId={student.Id}&limit=10");
                        
                        if (gwaResponse?.Data != null && gwaResponse.Data.Any())
                        {
                            // Get most recent GWA
                            var latestGwa = gwaResponse.Data.OrderByDescending(g => g.CreatedAt).FirstOrDefault();
                            
                            if (latestGwa != null && latestGwa.Gwa < 80) // Students with GWA below 80 need attention
                            {
                                var statusText = latestGwa.Gwa < 75 ? "Failing" : "At Risk";
                                var statusColor = latestGwa.Gwa < 75 ? "DangerBrush" : "WarningBrush";
                                
                                studentsAtRisk.Add(new StudentAtRiskViewModel
                                {
                                    StudentId = student.Id,
                                    StudentName = $"{student.FirstName} {student.LastName}",
                                    StudentNumber = student.StudentId ?? "N/A",
                                    Gwa = latestGwa.Gwa,
                                    GradingPeriod = latestGwa.GradingPeriod ?? "N/A",
                                    HonorStatus = latestGwa.HonorStatus ?? "None",
                                    SectionName = student.Section?.Name ?? "Unknown",
                                    StatusText = statusText,
                                    StatusColorKey = statusColor
                                });
                            }
                        }
                    }
                }
            }
            
            // Sort by GWA (lowest first) and take top 6
            var topAtRisk = studentsAtRisk
                .OrderBy(s => s.Gwa)
                .Take(6)
                .ToList();
            
            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                StudentsNeedingAttention.Clear();
                foreach (var student in topAtRisk)
                {
                    StudentsNeedingAttention.Add(student);
                }
                
                System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ✅ Loaded {StudentsNeedingAttention.Count} students needing attention");
            });
        }
        else
        {
            System.Diagnostics.Debug.WriteLine("[TeacherDashboardViewModel] ❌ No sections data returned");
        }
    }
    catch (Exception ex)
    {
        System.Diagnostics.Debug.WriteLine($"[TeacherDashboardViewModel] ❌ Error loading students needing attention: {ex.Message}");
    }
}
```

### 4. Add StudentAtRiskViewModel Class

**File:** `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

**Add at the end of the file (replace TeacherActivityViewModel):**

```csharp
public partial class StudentAtRiskViewModel : ViewModelBase
{
    [ObservableProperty] private string _studentId = "";
    [ObservableProperty] private string _studentName = "";
    [ObservableProperty] private string _studentNumber = "";
    [ObservableProperty] private decimal _gwa;
    [ObservableProperty] private string _gradingPeriod = "";
    [ObservableProperty] private string _honorStatus = "";
    [ObservableProperty] private string _sectionName = "";
    [ObservableProperty] private string _statusText = "";
    [ObservableProperty] private string _statusColorKey = "";
    
    public string GwaText => $"{Gwa:F2}";
    
    public IBrush StatusColor
    {
        get
        {
            if (Application.Current is { } app && app.Resources.TryGetResource(StatusColorKey, app.ActualThemeVariant, out var value) && value is IBrush b)
                return b;
            return Brushes.Transparent;
        }
    }
    
    public IBrush GwaColor => Gwa < 75 ? Resolve("DangerBrush") : Gwa < 80 ? Resolve("WarningBrush") : Resolve("SuccessBrush");
    
    private static IBrush Resolve(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var value) && value is IBrush b)
            return b;
        return Brushes.Transparent;
    }
}
```

### 5. Call LoadStudentsNeedingAttentionAsync in ReloadKpisAsync

**File:** `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

**Update `ReloadKpisAsync()` method (add after LoadMySectionsAsync call):**

```csharp
// Load my sections overview
_ = LoadMySectionsAsync(userId ?? _userId);

// Load students needing attention
_ = LoadStudentsNeedingAttentionAsync(userId ?? _userId);  // ADD THIS LINE
```

### 6. Update XAML View

**File:** `desktop-app/Southville8BEdgeUI/Views/Teacher/TeacherDashboardView.axaml`

**Replace lines 503-540** (Recent Activity section):

```xml
<!-- Students Needing Attention -->
<Border Grid.Column="1" Classes="card" Margin="12,0,0,0">
    <StackPanel Spacing="16">
        <Grid ColumnDefinitions="*,Auto">
            <TextBlock Grid.Column="0" Text="Students Needing Attention" Classes="section-header"/>
            <StackPanel Grid.Column="1" Orientation="Horizontal" Spacing="8">
                <TextBlock Text="{Binding StudentsNeedingAttention.Count}" 
                          FontSize="12" 
                          FontWeight="SemiBold" 
                          Foreground="{DynamicResource DangerBrush}"
                          VerticalAlignment="Center"/>
                <TextBlock Text="at risk" 
                          FontSize="12" 
                          Foreground="{DynamicResource TextMutedBrush}"
                          VerticalAlignment="Center"/>
            </StackPanel>
        </Grid>
        <ScrollViewer MaxHeight="300" VerticalScrollBarVisibility="Auto">
            <ItemsControl ItemsSource="{Binding StudentsNeedingAttention}">
                <ItemsControl.ItemTemplate>
                    <DataTemplate DataType="vm:StudentAtRiskViewModel">
                        <Border Background="{DynamicResource PageBackgroundBrush}" 
                                CornerRadius="8" 
                                Padding="12" 
                                Margin="0,0,0,8">
                            <Grid ColumnDefinitions="Auto,*,Auto">
                                <Border Grid.Column="0" 
                                        Background="{Binding StatusColor}" 
                                        Width="4" 
                                        Height="50" 
                                        CornerRadius="2" 
                                        VerticalAlignment="Center"
                                        Margin="0,0,12,0"/>
                                <StackPanel Grid.Column="1" VerticalAlignment="Center">
                                    <TextBlock Text="{Binding StudentName}" 
                                             FontWeight="SemiBold" 
                                             FontSize="13"/>
                                    <TextBlock Text="{Binding StudentNumber}" 
                                             FontSize="11" 
                                             Foreground="{DynamicResource TextMutedBrush}"/>
                                    <StackPanel Orientation="Horizontal" Spacing="8" Margin="0,4,0,0">
                                        <TextBlock Text="{Binding SectionName}" 
                                                 FontSize="10" 
                                                 Foreground="{DynamicResource InfoBrush}"/>
                                        <TextBlock Text="•" 
                                                 FontSize="10" 
                                                 Foreground="{DynamicResource TextMutedBrush}"/>
                                        <TextBlock Text="{Binding GradingPeriod}" 
                                                 FontSize="10" 
                                                 Foreground="{DynamicResource TextMutedBrush}"/>
                                    </StackPanel>
                                </StackPanel>
                                <StackPanel Grid.Column="2" 
                                          HorizontalAlignment="Right" 
                                          VerticalAlignment="Center"
                                          Spacing="4">
                                    <TextBlock Text="{Binding GwaText}" 
                                             FontSize="16" 
                                             FontWeight="Bold" 
                                             Foreground="{Binding GwaColor}"
                                             HorizontalAlignment="Right"/>
                                    <Border Classes="badge" 
                                            Background="{Binding StatusColor}"
                                            Padding="6,2"
                                            HorizontalAlignment="Right">
                                        <TextBlock Text="{Binding StatusText}" 
                                                 FontSize="10" 
                                                 FontWeight="SemiBold"
                                                 Foreground="{DynamicResource AccentTextOnAccentBrush}"/>
                                    </Border>
                                </StackPanel>
                            </Grid>
                        </Border>
                    </DataTemplate>
                </ItemsControl.ItemTemplate>
            </ItemsControl>
        </ScrollViewer>
    </StackPanel>
</Border>
```

## Expected Result

- ✅ "Recent Student Activity" section replaced with "Students Needing Attention"
- ✅ Shows real students with low GWA (< 80) from database
- ✅ Color-coded by risk level (red for failing < 75, yellow for at risk < 80)
- ✅ Displays student name, number, GWA, section, grading period
- ✅ Shows count of students at risk in header
- ✅ Sorted by lowest GWA first (most urgent)
- ✅ Limited to top 6 students
- ✅ No more hardcoded activity mock data

## Files Modified

1. `desktop-app/Southville8BEdgeUI/ViewModels/Teacher/TeacherDashboardViewModel.cs`

   - Remove `RecentActivities` property and `InitializeRecentActivities()` method
   - Remove `TeacherActivityViewModel` class
   - Add `StudentsNeedingAttention` property
   - Add `LoadStudentsNeedingAttentionAsync()` method
   - Add `StudentAtRiskViewModel` class
   - Update `ReloadKpisAsync()` to call `LoadStudentsNeedingAttentionAsync()`
   - Update constructor to initialize `StudentsNeedingAttention`

2. `desktop-app/Southville8BEdgeUI/Views/Teacher/TeacherDashboardView.axaml`

   - Replace "Recent Student Activity" section with "Students Needing Attention"
   - Update ItemsControl binding from `RecentActivities` to `StudentsNeedingAttention`
   - Update DataTemplate from `TeacherActivityViewModel` to `StudentAtRiskViewModel`
   - Add at-risk count indicator in header

## Future Enhancement

- Add attendance tracking (absences count)
- Add missing submissions count
- Add click action to view student details
- Add filter by section
- Add "Contact Student" or "Schedule Meeting" quick actions

### To-dos

- [ ] Remove StudentPerformance property and InitializeStudentPerformance() method from TeacherDashboardViewModel
- [ ] Add MyAnnouncements observable collection and AnnouncementSummaryViewModel class
- [ ] Add LoadMyAnnouncementsAsync() and GetTimeAgo() methods to fetch real announcement data
- [ ] Update constructor to initialize and load announcements instead of student performance
- [ ] Replace Subject Performance XAML section with My Announcements section in TeacherDashboardView.axaml
- [ ] Test the dashboard to verify announcements load correctly and display real data