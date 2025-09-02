using Avalonia;
using Avalonia.Controls;
using Avalonia.Layout;
using Southville8BEdgeUI.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class TeacherDashboardView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;
    
    // Percentage-based width change threshold for responsive updates (5% of current width)
    private const double SignificantWidthChangePercentage = 0.05;
    
    // Responsive class name constants for consistency
    private const string MobileClass = "mobile";
    private const string TabletClass = "tablet";
    private const string DesktopClass = "desktop";
    
    // Collections to store elements that need responsive behavior
    private readonly Dictionary<string, List<Control>> _responsiveElements = new()
    {
        {"text", new List<Control>()},
        {"card", new List<Control>()},
        {"button", new List<Control>()},
        {"progress", new List<Control>()},
        {"icon", new List<Control>()}
    };
    
    // Cache for targeted UI element updates
    private readonly List<Control> _cachedCardElements = new();
    
    // Element identification constants for optimized performance
    private const string TextElementSuffix = "Text";
    private const string ButtonElementSuffix = "Button";
    private const string CardElementClass = "card";
    private const string ProgressElementClass = "progress";
    
    // Cache for performance optimization
    private string _lastSizeClass = "";
    private double _lastWidth = 0;

    public TeacherDashboardView()
    {
        InitializeComponent();
        
        // Store references to elements that need responsive behavior
        InitializeResponsiveElements();
        
        // Set up size change handler
        this.SizeChanged += OnSizeChanged;
    }

    private void InitializeResponsiveElements()
    {
        // Safely add named elements that exist in XAML
        var textElements = new List<Control>();
        
        // Try to find text elements and add them if they exist
        if (this.FindControl<TextBlock>("MainHeaderText") is { } mainHeaderText)
            textElements.Add(mainHeaderText);
        if (this.FindControl<TextBlock>("SubtitleText") is { } subtitleText)
            textElements.Add(subtitleText);
        if (this.FindControl<TextBlock>("MyStudentsText") is { } myStudentsText)
            textElements.Add(myStudentsText);
        if (this.FindControl<TextBlock>("ActiveClassesText") is { } activeClassesText)
            textElements.Add(activeClassesText);
        if (this.FindControl<TextBlock>("PendingAssignmentsText") is { } pendingAssignmentsText)
            textElements.Add(pendingAssignmentsText);
        if (this.FindControl<TextBlock>("AverageGradeText") is { } averageGradeText)
            textElements.Add(averageGradeText);
        if (this.FindControl<TextBlock>("AttendanceRateText") is { } attendanceRateText)
            textElements.Add(attendanceRateText);
        if (this.FindControl<TextBlock>("TodayClassesText") is { } todayClassesText)
            textElements.Add(todayClassesText);
        
        _responsiveElements["text"].AddRange(textElements);

        // Add card elements safely
        var cardElements = new List<Control>();
        if (this.FindControl<Border>("KpiCard1") is { } kpiCard1)
            cardElements.Add(kpiCard1);
        if (this.FindControl<Border>("KpiCard2") is { } kpiCard2)
            cardElements.Add(kpiCard2);
        if (this.FindControl<Border>("KpiCard3") is { } kpiCard3)
            cardElements.Add(kpiCard3);
        if (this.FindControl<Border>("KpiCard4") is { } kpiCard4)
            cardElements.Add(kpiCard4);
        if (this.FindControl<Border>("KpiCard5") is { } kpiCard5)
            cardElements.Add(kpiCard5);
        
        _responsiveElements["card"].AddRange(cardElements);

        // Add button elements safely
        var buttonElements = new List<Control>();
        if (this.FindControl<Button>("RefreshButton") is { } refreshButton)
            buttonElements.Add(refreshButton);
        if (this.FindControl<Button>("DetailedReportsButton") is { } detailedReportsButton)
            buttonElements.Add(detailedReportsButton);
        if (this.FindControl<Button>("ScheduleButton") is { } scheduleButton)
            buttonElements.Add(scheduleButton);
        if (this.FindControl<Button>("GradesButton") is { } gradesButton)
            buttonElements.Add(gradesButton);
        if (this.FindControl<Button>("StudentsButton") is { } studentsButton)
            buttonElements.Add(studentsButton);
        if (this.FindControl<Button>("AnnounceButton") is { } announceButton)
            buttonElements.Add(announceButton);
        if (this.FindControl<Button>("MessagesButton") is { } messagesButton)
            buttonElements.Add(messagesButton);
        if (this.FindControl<Button>("ReportsButton") is { } reportsButton)
            buttonElements.Add(reportsButton);
        if (this.FindControl<Button>("ViewAllButton") is { } viewAllButton)
            buttonElements.Add(viewAllButton);

        _responsiveElements["button"].AddRange(buttonElements);

        // Add progress bar elements
        _responsiveElements["progress"].AddRange(FindControlsByType<ProgressBar>());
        
        // Cache specific card elements for targeted updates
        CacheCardElements();
    }

    private List<Control> FindControlsByType<T>() where T : Control
    {
        return FindControlsByTypeRecursively<T>(this).ToList();
    }

    private IEnumerable<Control> FindControlsByTypeRecursively<T>(Control parent) where T : Control
    {
        var controls = new List<Control>();
        
        if (parent is T t)
        {
            controls.Add(t);
        }
        
        if (parent is Panel panel)
        {
            foreach (var child in panel.Children)
            {
                if (child is Control control)
                {
                    controls.AddRange(FindControlsByTypeRecursively<T>(control));
                }
            }
        }
        else if (parent is ContentControl contentControl && contentControl.Content is Control content)
        {
            controls.AddRange(FindControlsByTypeRecursively<T>(content));
        }
        
        return controls;
    }

    private void CacheCardElements()
    {
        _cachedCardElements.Clear();
        
        // Iterate through card elements and cache their children
        foreach (var card in _responsiveElements["card"])
        {
            // Add the card itself
            _cachedCardElements.Add(card);
            
            // Find and cache children like text blocks, buttons, etc.
            CacheCardChildrenRecursively(card);
        }
    }

    private void CacheCardChildrenRecursively(Control parent)
    {
        // Only go two levels deep to avoid performance issues
        if (parent is Panel panel)
        {
            foreach (var child in panel.Children)
            {
                if (child is Control control)
                {
                    // Cache text elements with specific suffixes
                    if (control is TextBlock textBlock && control.Name?.EndsWith(TextElementSuffix) == true)
                    {
                        _cachedCardElements.Add(textBlock);
                    }
                    // Cache button elements with specific suffixes
                    else if (control is Button button && control.Name?.EndsWith(ButtonElementSuffix) == true)
                    {
                        _cachedCardElements.Add(button);
                    }
                    // Cache progress bars
                    else if (control is ProgressBar progressBar)
                    {
                        _cachedCardElements.Add(progressBar);
                    }
                    
                    // Go one level deeper for complex UI hierarchies
                    if (control is Panel childPanel)
                    {
                        foreach (var grandchild in childPanel.Children)
                        {
                            if (grandchild is Control grandchildControl)
                            {
                                if ((grandchildControl is TextBlock && grandchildControl.Name?.EndsWith(TextElementSuffix) == true) ||
                                    (grandchildControl is Button && grandchildControl.Name?.EndsWith(ButtonElementSuffix) == true) ||
                                    (grandchildControl is ProgressBar))
                                {
                                    _cachedCardElements.Add(grandchildControl);
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (parent is ContentControl contentControl && contentControl.Content is Control content)
        {
            if ((content is TextBlock && content.Name?.EndsWith(TextElementSuffix) == true) ||
                (content is Button && content.Name?.EndsWith(ButtonElementSuffix) == true) ||
                (content is ProgressBar))
            {
                _cachedCardElements.Add(content);
            }
            
            // Continue recursion if the content is a panel
            if (content is Panel contentPanel)
            {
                CacheCardChildrenRecursively(contentPanel);
            }
        }
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateResponsiveClasses(e.NewSize.Width);
    }

    private void UpdateResponsiveClasses(double width)
    {
        // Determine the current breakpoint
        string sizeClass = GetSizeClass(width);
        
        // Check if significant changes occurred that require updates
        bool sizeClassChanged = sizeClass != _lastSizeClass;
        
        // Calculate percentage-based threshold for more proportional responsiveness
        double widthChangeThreshold = Math.Max(width * SignificantWidthChangePercentage, 10); // Minimum 10px threshold
        bool significantWidthChange = Math.Abs(width - _lastWidth) > widthChangeThreshold;
        
        if (!sizeClassChanged && !significantWidthChange)
            return;
            
        _lastSizeClass = sizeClass;
        _lastWidth = width;
        
        // Only update element classes when size class changes
        if (sizeClassChanged)
        {
            // Update all responsive elements using dictionary
            foreach (var kvp in _responsiveElements)
            {
                UpdateElementClasses(kvp.Value, sizeClass);
            }
            
            // Update cached card elements for better performance
            UpdateCachedCardElements(sizeClass);
        }
        
        // Always update layout-specific elements based on actual width
        ApplyLayoutStrategy(sizeClass);
    }

    private string GetSizeClass(double width)
    {
        if (width < MobileBreakpoint)
            return MobileClass;
        else if (width < TabletBreakpoint)
            return TabletClass;
        else
            return DesktopClass;
    }

    private void UpdateElementClasses(List<Control> elements, string sizeClass)
    {
        foreach (var element in elements)
        {
            // Skip null elements for safety
            if (element == null) continue;
            
            // Remove existing responsive classes
            element.Classes.Remove(MobileClass);
            element.Classes.Remove(TabletClass);
            
            // Add appropriate responsive class
            if (sizeClass != DesktopClass)
            {
                element.Classes.Add(sizeClass);
            }
        }
    }

    // Optimized method using cached elements with smart cache refresh logic
    private void UpdateCachedCardElements(string sizeClass)
    {
        // Update cached elements directly instead of recursive search
        foreach (var element in _cachedCardElements)
        {
            // Skip null elements for safety
            if (element == null) continue;
            
            // Remove existing responsive classes
            element.Classes.Remove(MobileClass);
            element.Classes.Remove(TabletClass);
            
            // Add appropriate responsive class
            if (sizeClass != DesktopClass)
            {
                element.Classes.Add(sizeClass);
            }
        }
    }

    private void ApplyLayoutStrategy(string sizeClass)
    {
        // Create a layout configuration based on the screen size
        var layoutConfig = CreateLayoutConfig(sizeClass);
        
        // Apply the layout configuration
        ApplyKpiGridLayout(layoutConfig);
        ApplyColumnGridLayouts(layoutConfig);
    }

    private LayoutConfiguration CreateLayoutConfig(string sizeClass)
    {
        switch (sizeClass)
        {
            case MobileClass:
                return new LayoutConfiguration
                {
                    KpiGridColumns = 1,
                    KpiGridRows = 5,
                    KpiCardPositions = new[]
                    {
                        (0, 0), // Students
                        (0, 1), // Classes
                        (0, 2), // Grading
                        (0, 3), // Average
                        (0, 4)  // Attendance
                    },
                    KpiCardMargins = new[]
                    {
                        new Thickness(0, 0, 0, 8),
                        new Thickness(0, 8, 0, 8),
                        new Thickness(0, 8, 0, 8),
                        new Thickness(0, 8, 0, 8),
                        new Thickness(0, 8, 0, 0)
                    },
                    TwoColumnGridLayout = TwoColumnGridLayout.Stacked
                };
                
            case TabletClass:
                return new LayoutConfiguration
                {
                    KpiGridColumns = 2,
                    KpiGridRows = 3,
                    KpiCardPositions = new[]
                    {
                        (0, 0), // Students
                        (1, 0), // Classes
                        (0, 1), // Grading
                        (1, 1), // Average
                        (0, 2)  // Attendance
                    },
                    KpiCardMargins = new[]
                    {
                        new Thickness(0, 0, 8, 8),
                        new Thickness(8, 0, 0, 8),
                        new Thickness(0, 8, 8, 8),
                        new Thickness(8, 8, 0, 8),
                        new Thickness(0, 8, 0, 0)
                    },
                    TwoColumnGridLayout = TwoColumnGridLayout.TwoColumns
                };
                
            default: // Desktop
                return new LayoutConfiguration
                {
                    KpiGridColumns = 5,
                    KpiGridRows = 1,
                    KpiCardPositions = new[]
                    {
                        (0, 0), // Students
                        (1, 0), // Classes
                        (2, 0), // Grading
                        (3, 0), // Average
                        (4, 0)  // Attendance
                    },
                    KpiCardMargins = new[]
                    {
                        new Thickness(0, 0, 12, 0),
                        new Thickness(12, 0, 12, 0),
                        new Thickness(12, 0, 12, 0),
                        new Thickness(12, 0, 12, 0),
                        new Thickness(12, 0, 0, 0)
                    },
                    TwoColumnGridLayout = TwoColumnGridLayout.TwoColumns
                };
        }
    }

    private void ApplyKpiGridLayout(LayoutConfiguration config)
    {
        // Find KPI grid by name safely
        if (this.FindControl<Grid>("KpiGrid") is not Grid kpiGrid)
            return;

        kpiGrid.ColumnDefinitions.Clear();
        kpiGrid.RowDefinitions.Clear();
        
        // Create columns
        for (int i = 0; i < config.KpiGridColumns; i++)
        {
            kpiGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        }
        
        // Create rows
        for (int i = 0; i < config.KpiGridRows; i++)
        {
            kpiGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }
        
        // Position KPI cards safely
        var kpiCards = new Control?[] 
        {
            this.FindControl<Border>("KpiCard1"),
            this.FindControl<Border>("KpiCard2"),
            this.FindControl<Border>("KpiCard3"),
            this.FindControl<Border>("KpiCard4"),
            this.FindControl<Border>("KpiCard5")
        };
        
        for (int i = 0; i < kpiCards.Length && i < config.KpiCardPositions.Length; i++)
        {
            var kpiCard = kpiCards[i];
            if (kpiCard != null) // Null safety check
            {
                Grid.SetColumn(kpiCard, config.KpiCardPositions[i].Column);
                Grid.SetRow(kpiCard, config.KpiCardPositions[i].Row);
                kpiCard.Margin = config.KpiCardMargins[i];
            }
        }
    }

    private void ApplyColumnGridLayouts(LayoutConfiguration config)
    {
        // Handle all two-column grids
        ApplyLayoutToGrid(this.FindControl<Grid>("TwoColumnGrid1"), config.TwoColumnGridLayout, "2*", "*");
        ApplyLayoutToGrid(this.FindControl<Grid>("TwoColumnGrid2"), config.TwoColumnGridLayout, "*", "*");
        ApplyLayoutToGrid(this.FindControl<Grid>("TwoColumnGrid3"), config.TwoColumnGridLayout, "*", "*");
        ApplyLayoutToGrid(this.FindControl<Grid>("TwoColumnGrid4"), config.TwoColumnGridLayout, "2*", "*");
    }

    private void ApplyLayoutToGrid(Grid? grid, TwoColumnGridLayout layoutType, string col1Width, string col2Width)
    {
        if (grid == null) return;
        
        switch (layoutType)
        {
            case TwoColumnGridLayout.Stacked:
                ConvertToSingleColumn(grid);
                break;
            case TwoColumnGridLayout.TwoColumns:
                RestoreTwoColumnGrid(grid, col1Width, col2Width);
                break;
        }
    }

    private void ConvertToSingleColumn(Grid grid)
    {
        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        
        var children = grid.Children.Cast<Control>().ToList();
        
        // Add row definitions for stacking
        grid.RowDefinitions.Clear();
        for (int i = 0; i < children.Count; i++)
        {
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }
        
        // Update grid positions for mobile stacking
        for (int i = 0; i < children.Count; i++)
        {
            Grid.SetColumn(children[i], 0);
            Grid.SetRow(children[i], i);
        }
    }

    private void RestoreTwoColumnGrid(Grid grid, string col1Width, string col2Width)
    {
        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Parse(col1Width)));
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Parse(col2Width)));
        
        grid.RowDefinitions.Clear();
        grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        
        var children = grid.Children.Cast<Control>().ToList();
        
        // Restore original grid positions
        for (int i = 0; i < children.Count; i++)
        {
            Grid.SetColumn(children[i], i % 2);
            Grid.SetRow(children[i], 0);
            
            // Update margins for two-column layout
            if (i % 2 == 0) // Left column
            {
                children[i].Margin = new Thickness(0, 0, 12, 0);
            }
            else // Right column
            {
                children[i].Margin = new Thickness(12, 0, 0, 0);
            }
        }
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        
        // Initial responsive setup
        if (Bounds.Width > 0)
        {
            UpdateResponsiveClasses(Bounds.Width);
        }
    }
    
    // Configuration class for layout strategies
    private class LayoutConfiguration
    {
        public int KpiGridColumns { get; set; }
        public int KpiGridRows { get; set; }
        public (int Column, int Row)[] KpiCardPositions { get; set; } = Array.Empty<(int, int)>();
        public Thickness[] KpiCardMargins { get; set; } = Array.Empty<Thickness>();
        public TwoColumnGridLayout TwoColumnGridLayout { get; set; }
    }
    
    // Enum for two-column grid layout strategies
    private enum TwoColumnGridLayout
    {
        TwoColumns,
        Stacked
    }
}