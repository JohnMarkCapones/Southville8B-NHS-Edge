using Avalonia;
using Avalonia.Controls;
using Avalonia.Threading;
using Avalonia.VisualTree;
using Southville8BEdgeUI.ViewModels.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Input; // added for ICommand

namespace Southville8BEdgeUI.Views.Teacher;

public partial class SchedulePlannerView : UserControl
{
    // Forward commands for template bindings
    public ICommand? EditClassCommand => (DataContext as Southville8BEdgeUI.ViewModels.Teacher.SchedulePlannerViewModel)?.EditClassCommand;
    public ICommand? AddNotesCommand => (DataContext as Southville8BEdgeUI.ViewModels.Teacher.SchedulePlannerViewModel)?.AddNotesCommand;

    #region Constants & Configuration

    private static class Breakpoints
    {
        public const double Mobile = 768;
        public const double Tablet = 1024;
        public const double ChangeThreshold = 0.05; // 5% width change
        public const double MinThreshold = 10;
    }

    private static class ResponsiveClasses
    {
        public const string Mobile = "mobile";
        public const string Tablet = "tablet";
        public const string Desktop = "desktop";
    }

    private static class ElementIdentifiers
    {
        public const string MainScrollViewer = "MainScrollViewer";
        public const string MainStackPanel = "MainStackPanel";
        public const string HeaderGrid = "HeaderGrid";
        public const string KpiGrid = "KpiGrid";
        public const string ContentGrid = "ContentGrid";
        public const string ScheduleGrid = "ScheduleGrid";
        public const string TimeColumn = "TimeColumn";
        public const string DayColumnsGrid = "DayColumnsGrid";
        public const string SidePanel = "SidePanel";
        public const string UpcomingClassesList = "UpcomingClassesList";
        public const string ConflictsList = "ConflictsList";
        public const string QuickAddPanel = "QuickAddPanel";
        public const string QuickAddForm = "QuickAddForm";
        public static readonly string[] KpiCards = { "KpiCard1", "KpiCard2", "KpiCard3", "KpiCard4" };
        public static readonly string[] ActionButtons = { "AddClassButton", "ExportButton", "RefreshButton", "TemplatesButton" };
        public static readonly string[] DayNames = { "Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
    }

    #endregion

    #region Fields

    private readonly ElementCache _elementCache = new();
    private readonly ResponsiveLayoutManager _layoutManager;
    private readonly ThrottledUpdater _throttledUpdater;
    private DispatcherTimer? _periodicTimer;

    private ResponsiveState _currentState = ResponsiveState.Unknown;
    private double _lastProcessedWidth;
    private double _lastSidebarWidth;

    // Cache for time column and day header elements to avoid repeated searches
    private readonly List<TextBlock> _timeColumnTextBlocks = new();
    private readonly List<Border> _timeColumnBorders = new();
    private readonly List<TextBlock> _dayHeaderTextBlocks = new();
    private readonly List<Border> _dayHeaderBorders = new();

    #endregion

    #region Constructor & Initialization

    public SchedulePlannerView()
    {
        InitializeComponent();
        // Only supply a design-time DataContext so runtime shell can inject its own VM (with NavigateTo set)
        if (Design.IsDesignMode)
        {
            DataContext = new SchedulePlannerViewModel();
        }

        _layoutManager = new ResponsiveLayoutManager();
        _throttledUpdater = new ThrottledUpdater(TimeSpan.FromMilliseconds(100));

        Dispatcher.UIThread.InvokeAsync(() =>
        {
            InitializeResponsiveSystem();
        }, DispatcherPriority.Background);
    }

    private void InitializeResponsiveSystem()
    {
        CacheAllElements();
        AttachEventHandlers();

        if (Bounds.Width > 0)
        {
            ApplyResponsiveLayout(Bounds.Width);
        }

        // Schedule periodic updates for dynamic content
        SchedulePeriodicUpdates();
    }

    private void CacheAllElements()
    {
        // Cache main structural elements
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainScrollViewer);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainStackPanel);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.HeaderGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.KpiGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.ContentGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.ScheduleGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.SidePanel);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.QuickAddPanel);

        // Cache KPI cards and action buttons
        _elementCache.CacheNamedElements(this, ElementIdentifiers.KpiCards);
        _elementCache.CacheNamedElements(this, ElementIdentifiers.ActionButtons);

        // Cache typed elements for responsive styling
        _elementCache.CacheTypedElements(this);
    }

    private void AttachEventHandlers()
    {
        this.SizeChanged += OnSizeChanged;
        this.AttachedToVisualTree += OnAttachedToVisualTree;
        this.DetachedFromVisualTree += OnDetachedFromVisualTree;
        
        // Listen for parent layout changes (sidebar open/close)
        this.LayoutUpdated += OnLayoutUpdated;
    }

    private void OnLayoutUpdated(object? sender, EventArgs e)
    {
        var currentSidebarWidth = GetSidebarWidth();
        if (Math.Abs(currentSidebarWidth - _lastSidebarWidth) > 1)
        {
            _lastSidebarWidth = currentSidebarWidth;
            OnSidebarStateChanged();
        }
    }

    private void OnSidebarStateChanged()
    {
        // Force re-evaluation of responsive layout
        if (Bounds.Width > 0)
        {
            ApplyResponsiveLayout(Bounds.Width);
        }
    }

    private void SchedulePeriodicUpdates()
    {
        // Schedule updates to catch dynamically generated content
        _periodicTimer ??= new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1)
        };
        _periodicTimer.Tick -= OnPeriodicTick;
        _periodicTimer.Tick += OnPeriodicTick;
        _periodicTimer.Start();
    }

    private void OnPeriodicTick(object? sender, EventArgs e)
    {
        if (_currentState != ResponsiveState.Unknown)
            UpdateDynamicElements(_currentState);
    }

    #endregion

    #region Event Handlers

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        _throttledUpdater.Schedule(() => ApplyResponsiveLayout(e.NewSize.Width));
    }

    private void OnAttachedToVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        if (Bounds.Width > 0)
        {
            ApplyResponsiveLayout(Bounds.Width);
        }
        _periodicTimer?.Start();
    }

    private void OnDetachedFromVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        _throttledUpdater.Cancel();
        _periodicTimer?.Stop();
    }

    private void OnScheduleCellClicked(object? sender, Avalonia.Input.PointerPressedEventArgs e)
    {
        if (sender is Border border && border.DataContext is ScheduleSlotViewModel slot)
        {
            if (slot.IsOccupied && DataContext is SchedulePlannerViewModel viewModel)
            {
                viewModel.ShowScheduleDetailsCommand.Execute(slot);
            }
        }
    }

    #endregion

    #region Responsive Layout Logic

    private double GetSidebarWidth()
    {
        double totalSidebarWidth = 0;
        
        // Walk up the visual tree to find the parent shell/window
        var parent = this.Parent;
        while (parent != null)
        {
            // Look for common sidebar patterns
            if (parent is Grid parentGrid)
            {
                // Check all columns for fixed-width sidebars (both left and right)
                if (parentGrid.ColumnDefinitions.Count >= 2)
                {
                    // Check first column (left sidebar)
                    var firstColumn = parentGrid.ColumnDefinitions[0];
                    if (firstColumn.Width.IsAbsolute)
                    {
                        totalSidebarWidth += firstColumn.Width.Value;
                    }
                    
                    // Check last column (right sidebar)
                    var lastColumn = parentGrid.ColumnDefinitions[parentGrid.ColumnDefinitions.Count - 1];
                    if (lastColumn.Width.IsAbsolute)
                    {
                        totalSidebarWidth += lastColumn.Width.Value;
                    }
                }
            }
            
            parent = parent.Parent;
        }
        
        return totalSidebarWidth;
    }

    private void ApplyResponsiveLayout(double width)
    {
        // Subtract sidebar width from available width
        var sidebarWidth = GetSidebarWidth();
        var availableWidth = width - sidebarWidth;
        
        var newState = DetermineResponsiveState(availableWidth);

        if (!ShouldUpdateLayout(newState, availableWidth))
            return;

        _currentState = newState;
        _lastProcessedWidth = availableWidth;

        using var deferral = BatchUpdate();
        {
            UpdateElementClasses(newState);
            UpdateGridLayouts(newState);
            UpdateScheduleLayout(newState);
            UpdateDynamicElements(newState);
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private ResponsiveState DetermineResponsiveState(double width)
    {
        if (width < Breakpoints.Mobile) return ResponsiveState.Mobile;
        if (width < Breakpoints.Tablet) return ResponsiveState.Tablet;
        return ResponsiveState.Desktop;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private bool ShouldUpdateLayout(ResponsiveState newState, double width)
    {
        if (newState != _currentState)
            return true;

        double threshold = Math.Max(width * Breakpoints.ChangeThreshold, Breakpoints.MinThreshold);
        return Math.Abs(width - _lastProcessedWidth) > threshold;
    }

    private void UpdateElementClasses(ResponsiveState state)
    {
        var className = GetClassName(state);

        _elementCache.ApplyToAll(element =>
        {
            element.Classes.Remove(ResponsiveClasses.Mobile);
            element.Classes.Remove(ResponsiveClasses.Tablet);

            if (state != ResponsiveState.Desktop)
            {
                element.Classes.Add(className);
            }
        });
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private string GetClassName(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => ResponsiveClasses.Mobile,
        ResponsiveState.Tablet => ResponsiveClasses.Tablet,
        _ => ResponsiveClasses.Desktop
    };

    private void UpdateGridLayouts(ResponsiveState state)
    {
        var config = _layoutManager.GetConfiguration(state);

        // Update KPI Grid
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.KpiGrid, out Grid? kpiGrid) && kpiGrid != null)
        {
            UpdateKpiGrid(kpiGrid, config);
        }

        // Update main content layout
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.ContentGrid, out Grid? contentGrid) && contentGrid != null)
        {
            UpdateContentGrid(contentGrid, config);
        }

        // Update header layout
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.HeaderGrid, out Grid? headerGrid) && headerGrid != null)
        {
            UpdateHeaderGrid(headerGrid, config);
        }
    }

    private void UpdateKpiGrid(Grid grid, LayoutConfiguration config)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        // Add column definitions
        for (int i = 0; i < config.KpiColumns; i++)
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        // Add row definitions
        for (int i = 0; i < config.KpiRows; i++)
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        // Position KPI cards
        for (int i = 0; i < ElementIdentifiers.KpiCards.Length; i++)
        {
            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.KpiCards[i], out Border? card) && card != null)
            {
                var position = config.KpiCardPositions[i];
                Grid.SetColumn(card, position.Column);
                Grid.SetRow(card, position.Row);
                card.Margin = config.KpiCardMargins[i];
            }
        }
    }

    private void UpdateContentGrid(Grid grid, LayoutConfiguration config)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        if (config.StackMainContent)
        {
            // Mobile: Stack schedule and sidebar vertically
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Fix: ScheduleGrid is actually a Border containing the schedule
            if (_elementCache.TryGetElement<Control>(ElementIdentifiers.ScheduleGrid, out Control? scheduleContainer) && scheduleContainer != null)
            {
                Grid.SetColumn(scheduleContainer, 0);
                Grid.SetRow(scheduleContainer, 0);
            }

            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.SidePanel, out Border? sidePanel) && sidePanel != null)
            {
                Grid.SetColumn(sidePanel, 0);
                Grid.SetRow(sidePanel, 1);
                sidePanel.Margin = new Thickness(0, 16, 0, 0);
            }
        }
        else
        {
            // Desktop/Tablet: Side-by-side layout
            grid.ColumnDefinitions.Add(new ColumnDefinition(new GridLength(2, GridUnitType.Star)));
            grid.ColumnDefinitions.Add(new ColumnDefinition(new GridLength(1, GridUnitType.Star)));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Star));

            if (_elementCache.TryGetElement<Control>(ElementIdentifiers.ScheduleGrid, out Control? scheduleContainer) && scheduleContainer != null)
            {
                Grid.SetColumn(scheduleContainer, 0);
                Grid.SetRow(scheduleContainer, 0);
            }

            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.SidePanel, out Border? sidePanel) && sidePanel != null)
            {
                Grid.SetColumn(sidePanel, 1);
                Grid.SetRow(sidePanel, 0);
                sidePanel.Margin = new Thickness(16, 0, 0, 0);
            }
        }
    }

    private void UpdateHeaderGrid(Grid grid, LayoutConfiguration config)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        if (config.StackHeaderContent)
        {
            // Mobile: Stack header elements vertically
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Title section
            if (grid.Children.Count > 0 && grid.Children[0] is StackPanel titlePanel)
            {
                Grid.SetColumn(titlePanel, 0);
                Grid.SetRow(titlePanel, 0);
            }

            // Week selector
            if (grid.Children.Count > 1 && grid.Children[1] is StackPanel actionPanel)
            {
                Grid.SetColumn(actionPanel, 0);
                Grid.SetRow(actionPanel, 1);
                actionPanel.Margin = new Thickness(0, 8, 0, 0);
            }
        }
        else
        {
            // Desktop/Tablet: Horizontal layout
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Restore original positions
            if (grid.Children.Count > 0 && grid.Children[0] is StackPanel titlePanel)
            {
                Grid.SetColumn(titlePanel, 0);
                Grid.SetRow(titlePanel, 0);
            }

            if (grid.Children.Count > 1 && grid.Children[1] is StackPanel actionPanel)
            {
                Grid.SetColumn(actionPanel, 1);
                Grid.SetRow(actionPanel, 0);
                actionPanel.Margin = new Thickness(16, 0, 0, 0);
            }
        }
    }

    private void UpdateScheduleLayout(ResponsiveState state)
    {
        // Fix: Find the actual schedule container and its ScrollViewer
        if (!_elementCache.TryGetElement<Control>(ElementIdentifiers.ScheduleGrid, out Control? scheduleContainer) || scheduleContainer is null)
            return;

        var config = _layoutManager.GetConfiguration(state);

        // Look for ScrollViewer in the visual tree of the schedule container
        var scrollViewer = scheduleContainer.GetVisualDescendants().OfType<ScrollViewer>().FirstOrDefault();
        if (scrollViewer is null) return;

        if (config.UseHorizontalSchedule)
        {
            scrollViewer.HorizontalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
            scrollViewer.VerticalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
        }
        else
        {
            scrollViewer.HorizontalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Disabled;
            scrollViewer.VerticalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
        }
    }

    // Enhanced method to handle all dynamic element responsiveness
    private void UpdateDynamicElements(ResponsiveState state)
    {
        // Clear cached elements to get fresh references
        _timeColumnTextBlocks.Clear();
        _timeColumnBorders.Clear();
        _dayHeaderTextBlocks.Clear();
        _dayHeaderBorders.Clear();

        // Find and cache all dynamic elements
        FindDynamicElements();

        // Apply responsive styles directly
        ApplyDynamicElementStyles(state);
    }

    private void FindDynamicElements()
    {
        // Search through the entire visual tree for schedule elements
        foreach (var element in this.GetVisualDescendants())
        {
            // Find time column borders by name
            if (element is Border border && border.Name == ElementIdentifiers.TimeColumn)
            {
                _timeColumnBorders.Add(border);
            }

            // Find day header elements in the DayColumnsGrid
            if (element is Border dayBorder && dayBorder.Parent is Grid parentGrid &&
                parentGrid.Name == ElementIdentifiers.DayColumnsGrid)
            {
                _dayHeaderBorders.Add(dayBorder);
            }

            // Find text blocks within time columns, day headers, or with time-related content
            if (element is TextBlock textBlock)
            {
                // Check if it's within a time column border
                var parent = textBlock.Parent;
                while (parent != null)
                {
                    if (parent is Border parentBorder && parentBorder.Name == ElementIdentifiers.TimeColumn)
                    {
                        _timeColumnTextBlocks.Add(textBlock);
                        break;
                    }

                    // Check if it's within a day header border
                    if (parent is Border dayHeaderBorder && dayHeaderBorder.Parent is Grid dayGrid &&
                        dayGrid.Name == ElementIdentifiers.DayColumnsGrid)
                    {
                        _dayHeaderTextBlocks.Add(textBlock);
                        break;
                    }

                    parent = parent.Parent;
                }

                // Also check for text blocks that contain time-like content or day names
                if (textBlock.Text != null && (IsTimeText(textBlock.Text) || IsDayText(textBlock.Text)))
                {
                    if (IsDayText(textBlock.Text))
                    {
                        _dayHeaderTextBlocks.Add(textBlock);
                    }
                    else
                    {
                        _timeColumnTextBlocks.Add(textBlock);
                    }
                }
            }
        }
    }

    private bool IsTimeText(string text)
    {
        // Simple check for time format patterns
        return text.Contains(":") && (text.Contains("00") || text.Contains("30")) ||
               text.Contains(" - ") && text.Length <= 15;
    }

    private bool IsDayText(string text)
    {
        // Check if text is a day name
        return ElementIdentifiers.DayNames.Contains(text, StringComparer.OrdinalIgnoreCase);
    }

    private void ApplyDynamicElementStyles(ResponsiveState state)
    {
        // Apply font size and styling for time columns
        ApplyTimeColumnStyles(state);

        // Apply font size and styling for day headers
        ApplyDayHeaderStyles(state);
    }

    private void ApplyTimeColumnStyles(ResponsiveState state)
    {
        // Apply font size directly based on screen size
        double fontSize = GetTimeColumnFontSize(state);
        double padding = GetTimeColumnPadding(state);

        // Update text blocks
        foreach (var textBlock in _timeColumnTextBlocks)
        {
            textBlock.FontSize = fontSize;

            // Remove existing responsive classes
            textBlock.Classes.Remove(ResponsiveClasses.Mobile);
            textBlock.Classes.Remove(ResponsiveClasses.Tablet);

            // Add appropriate responsive class
            if (state != ResponsiveState.Desktop)
            {
                textBlock.Classes.Add(GetClassName(state));
            }
        }

        // Update borders
        foreach (var border in _timeColumnBorders)
        {
            border.Padding = new Thickness(padding);
            border.MinHeight = GetTimeColumnMinHeight(state);

            // Remove existing responsive classes
            border.Classes.Remove(ResponsiveClasses.Mobile);
            border.Classes.Remove(ResponsiveClasses.Tablet);

            // Add appropriate responsive class
            if (state != ResponsiveState.Desktop)
            {
                border.Classes.Add(GetClassName(state));
            }
        }
    }

    private void ApplyDayHeaderStyles(ResponsiveState state)
    {
        // Apply font size and styling for day headers
        double fontSize = GetDayHeaderFontSize(state);
        double padding = GetDayHeaderPadding(state);

        // Update day header text blocks
        foreach (var textBlock in _dayHeaderTextBlocks)
        {
            textBlock.FontSize = fontSize;
            textBlock.FontWeight = GetDayHeaderFontWeight(state);

            // Remove existing responsive classes
            textBlock.Classes.Remove(ResponsiveClasses.Mobile);
            textBlock.Classes.Remove(ResponsiveClasses.Tablet);

            // Add appropriate responsive class
            if (state != ResponsiveState.Desktop)
            {
                textBlock.Classes.Add(GetClassName(state));
            }
        }

        // Update day header borders
        foreach (var border in _dayHeaderBorders)
        {
            border.Padding = new Thickness(padding);

            // Remove existing responsive classes
            border.Classes.Remove(ResponsiveClasses.Mobile);
            border.Classes.Remove(ResponsiveClasses.Tablet);

            // Add appropriate responsive class
            if (state != ResponsiveState.Desktop)
            {
                border.Classes.Add(GetClassName(state));
            }
        }
    }

    private double GetTimeColumnFontSize(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 9,    // Smaller font for mobile
        ResponsiveState.Tablet => 10,   // Medium font for tablet
        _ => 12                         // Default font for desktop
    };

    private double GetTimeColumnPadding(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 6,     // Less padding for mobile
        ResponsiveState.Tablet => 8,     // Medium padding for tablet
        _ => 12                          // Default padding for desktop
    };

    private double GetTimeColumnMinHeight(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 40,    // Smaller height for mobile
        ResponsiveState.Tablet => 50,    // Medium height for tablet
        _ => 60                          // Default height for desktop
    };

    private double GetDayHeaderFontSize(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 11,    // Smaller font for mobile
        ResponsiveState.Tablet => 12,    // Medium font for tablet
        _ => 14                          // Default font for desktop
    };

    private double GetDayHeaderPadding(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 8,     // Less padding for mobile
        ResponsiveState.Tablet => 10,    // Medium padding for tablet
        _ => 12                          // Default padding for desktop
    };

    private Avalonia.Media.FontWeight GetDayHeaderFontWeight(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => Avalonia.Media.FontWeight.Medium,    // Medium weight for mobile
        ResponsiveState.Tablet => Avalonia.Media.FontWeight.SemiBold,  // Semi-bold for tablet
        _ => Avalonia.Media.FontWeight.Bold                            // Bold for desktop
    };

    #endregion

    #region Utilities

    private IDisposable BatchUpdate()
    {
        return new DisposableAction(() => { });
    }

    #endregion

    #region Nested Types

    private enum ResponsiveState
    {
        Unknown,
        Mobile,
        Tablet,
        Desktop
    }

    private class ElementCache
    {
        private readonly Dictionary<string, Control> _namedElements = new();
        private readonly List<Control> _allElements = new();

        public void CacheNamedElement(UserControl parent, string name)
        {
            if (parent.FindControl<Control>(name) is { } control)
            {
                _namedElements[name] = control;
                _allElements.Add(control);
            }
        }

        public void CacheNamedElements(UserControl parent, string[] names)
        {
            foreach (var name in names)
            {
                CacheNamedElement(parent, name);
            }
        }

        public void CacheTypedElements(UserControl parent)
        {
            foreach (var control in parent.GetVisualDescendants().OfType<Control>())
            {
                if (control is TextBlock or Button or ComboBox or Border or StackPanel or Grid)
                {
                    _allElements.Add(control);
                }
            }
        }

        public bool TryGetElement<T>(string name, out T? element) where T : Control
        {
            if (_namedElements.TryGetValue(name, out var control))
            {
                element = control as T;
                return element != null;
            }
            element = null;
            return false;
        }

        public void ApplyToAll(Action<Control> action)
        {
            var elements = _allElements.ToArray();
            foreach (var element in elements)
            {
                if (element != null)
                {
                    action(element);
                }
            }
        }
    }

    private class ResponsiveLayoutManager
    {
        private readonly Dictionary<ResponsiveState, LayoutConfiguration> _configurations;

        public ResponsiveLayoutManager()
        {
            _configurations = new Dictionary<ResponsiveState, LayoutConfiguration>
            {
                [ResponsiveState.Mobile] = CreateMobileConfig(),
                [ResponsiveState.Tablet] = CreateTabletConfig(),
                [ResponsiveState.Desktop] = CreateDesktopConfig()
            };
        }

        public LayoutConfiguration GetConfiguration(ResponsiveState state)
        {
            return _configurations.TryGetValue(state, out var config)
                ? config
                : _configurations[ResponsiveState.Desktop];
        }

        private LayoutConfiguration CreateMobileConfig() => new()
        {
            KpiColumns = 1,
            KpiRows = 4,
            KpiCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(0, 1),
                new GridPosition(0, 2),
                new GridPosition(0, 3)
            },
            KpiCardMargins = new[]
            {
                new Thickness(0, 0, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 0)
            },
            StackMainContent = true,
            StackHeaderContent = true,
            UseHorizontalSchedule = true
        };

        private LayoutConfiguration CreateTabletConfig() => new()
        {
            KpiColumns = 2,
            KpiRows = 2,
            KpiCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(1, 0),
                new GridPosition(0, 1),
                new GridPosition(1, 1)
            },
            KpiCardMargins = new[]
            {
                new Thickness(0, 0, 8, 8),
                new Thickness(8, 0, 0, 8),
                new Thickness(0, 8, 8, 0),
                new Thickness(8, 8, 0, 0)
            },
            StackMainContent = false,
            StackHeaderContent = false,
            UseHorizontalSchedule = false
        };

        private LayoutConfiguration CreateDesktopConfig() => new()
        {
            KpiColumns = 4,
            KpiRows = 1,
            KpiCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(1, 0),
                new GridPosition(2, 0),
                new GridPosition(3, 0)
            },
            KpiCardMargins = new[]
            {
                new Thickness(0, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 0, 0)
            },
            StackMainContent = false,
            StackHeaderContent = false,
            UseHorizontalSchedule = false
        };
    }

    private class LayoutConfiguration
    {
        public int KpiColumns { get; init; }
        public int KpiRows { get; init; }
        public GridPosition[] KpiCardPositions { get; init; } = Array.Empty<GridPosition>();
        public Thickness[] KpiCardMargins { get; init; } = Array.Empty<Thickness>();
        public bool StackMainContent { get; init; }
        public bool StackHeaderContent { get; init; }
        public bool UseHorizontalSchedule { get; init; }
    }

    private readonly struct GridPosition
    {
        public int Column { get; }
        public int Row { get; }

        public GridPosition(int column, int row)
        {
            Column = column;
            Row = row;
        }
    }

    private class ThrottledUpdater
    {
        private readonly DispatcherTimer _timer;
        private Action? _pendingAction;

        public ThrottledUpdater(TimeSpan delay)
        {
            _timer = new DispatcherTimer { Interval = delay };
            _timer.Tick += OnTimerTick;
        }

        public void Schedule(Action action)
        {
            _pendingAction = action;
            _timer.Stop();
            _timer.Start();
        }

        public void Cancel()
        {
            _timer.Stop();
            _pendingAction = null;
        }

        private void OnTimerTick(object? sender, EventArgs e)
        {
            _timer.Stop();
            _pendingAction?.Invoke();
            _pendingAction = null;
        }
    }

    private class DisposableAction : IDisposable
    {
        private readonly Action _action;

        public DisposableAction(Action action)
        {
            _action = action;
        }

        public void Dispose()
        {
            _action?.Invoke();
        }
    }

    #endregion
}