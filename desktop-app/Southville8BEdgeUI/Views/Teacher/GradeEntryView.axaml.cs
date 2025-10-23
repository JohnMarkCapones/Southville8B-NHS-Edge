using Avalonia;
using Avalonia.Controls;
using Avalonia.Threading;
using Avalonia.VisualTree;
using Southville8BEdgeUI.ViewModels.Teacher;
using Southville8BEdgeUI.Views.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class GradeEntryView : UserControl
{
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
        public const string FilterGrid = "FilterGrid";
        public const string GradeEntriesContainer = "GradeEntriesContainer";
        public static readonly string[] StatsCards = Array.Empty<string>(); // No stats cards in current XAML
        public static readonly string[] ActionButtons = Array.Empty<string>(); // No specific action buttons in current XAML
    }

    #endregion

    #region Fields

    private readonly ElementCache _elementCache = new();
    private readonly ResponsiveLayoutManager _layoutManager;
    private readonly ThrottledUpdater _throttledUpdater;
    private DispatcherTimer? _periodicTimer;

    private ResponsiveState _currentState = ResponsiveState.Unknown;
    private double _lastProcessedWidth;

    // Cache for dynamic elements to avoid repeated searches
    private readonly List<TextBlock> _responsiveTextBlocks = new();
    private readonly List<Border> _responsiveBorders = new();

    #endregion

    #region Constructor & Initialization

    public GradeEntryView()
    {
        InitializeComponent();

        // TEMPORARY FIX: Disable responsive layout to prevent ArgumentOutOfRangeException
        // The complex responsive system is causing index out of range errors
        // We'll implement a simpler responsive system later
        
        _layoutManager = new ResponsiveLayoutManager();
        _throttledUpdater = new ThrottledUpdater(TimeSpan.FromMilliseconds(100));

        // Disable the complex responsive system temporarily
        // Dispatcher.UIThread.InvokeAsync(() =>
        // {
        //     InitializeResponsiveSystem();
        // }, DispatcherPriority.Background);
        
        // Simple responsive behavior without complex element manipulation
        this.SizeChanged += OnSimpleSizeChanged;
    }
    
    private void OnSimpleSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        // Enhanced simple responsive behavior without complex element manipulation
        try
        {
            var width = e.NewSize.Width;
            System.Diagnostics.Debug.WriteLine($"OnSimpleSizeChanged: Width = {width}");
            
            // Remove all responsive classes first
            this.Classes.Remove("mobile");
            this.Classes.Remove("tablet");
            this.Classes.Remove("desktop");
            
            // Apply appropriate responsive class based on width
            if (width < 768)
            {
                // Mobile layout
                this.Classes.Add("mobile");
                System.Diagnostics.Debug.WriteLine("Applied mobile responsive class");
            }
            else if (width < 1024)
            {
                // Tablet layout
                this.Classes.Add("tablet");
                System.Diagnostics.Debug.WriteLine("Applied tablet responsive class");
            }
            else
            {
                // Desktop layout
                this.Classes.Add("desktop");
                System.Diagnostics.Debug.WriteLine("Applied desktop responsive class");
            }
            
            // Apply responsive classes to key elements if they exist
            ApplyResponsiveClassesToElements();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Simple responsive layout error: {ex.Message}");
        }
    }
    
    private void ApplyResponsiveClassesToElements()
    {
        try
        {
            // Apply responsive classes to main elements safely
            if (this.FindControl<StackPanel>("MainStackPanel") is StackPanel mainPanel)
            {
                mainPanel.Classes.Remove("mobile");
                mainPanel.Classes.Remove("tablet");
                mainPanel.Classes.Remove("desktop");
                mainPanel.Classes.Add(this.Classes.Contains("mobile") ? "mobile" : 
                                    this.Classes.Contains("tablet") ? "tablet" : "desktop");
            }
            
            if (this.FindControl<Grid>("HeaderGrid") is Grid headerGrid)
            {
                headerGrid.Classes.Remove("mobile");
                headerGrid.Classes.Remove("tablet");
                headerGrid.Classes.Remove("desktop");
                headerGrid.Classes.Add(this.Classes.Contains("mobile") ? "mobile" : 
                                     this.Classes.Contains("tablet") ? "tablet" : "desktop");
            }
            
            if (this.FindControl<Grid>("FilterGrid") is Grid filterGrid)
            {
                filterGrid.Classes.Remove("mobile");
                filterGrid.Classes.Remove("tablet");
                filterGrid.Classes.Remove("desktop");
                filterGrid.Classes.Add(this.Classes.Contains("mobile") ? "mobile" : 
                                     this.Classes.Contains("tablet") ? "tablet" : "desktop");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ApplyResponsiveClassesToElements error: {ex.Message}");
        }
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
        // Cache main structural elements that actually exist in XAML
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainScrollViewer);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainStackPanel);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.HeaderGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.FilterGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.GradeEntriesContainer);

        // Cache typed elements for responsive styling
        _elementCache.CacheTypedElements(this);
    }

    private void AttachEventHandlers()
    {
        this.SizeChanged += OnSizeChanged;
        this.AttachedToVisualTree += OnAttachedToVisualTree;
        this.DetachedFromVisualTree += OnDetachedFromVisualTree;
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
        try
        {
            System.Diagnostics.Debug.WriteLine($"OnSizeChanged: Width = {e.NewSize.Width}, Height = {e.NewSize.Height}");
            _throttledUpdater.Schedule(() => ApplyResponsiveLayout(e.NewSize.Width));
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OnSizeChanged ERROR: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"OnSizeChanged StackTrace: {ex.StackTrace}");
        }
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

    #endregion

    #region Responsive Layout Logic

    private void ApplyResponsiveLayout(double width)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Width = {width}");
            
            var newState = DetermineResponsiveState(width);

            if (!ShouldUpdateLayout(newState, width))
            {
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Skipping update - same state or width change too small");
                return;
            }

            System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Updating to state = {newState}");
            
            _currentState = newState;
            _lastProcessedWidth = width;

        using var deferral = BatchUpdate();
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Starting UpdateElementClasses");
                UpdateElementClasses(newState);
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: UpdateElementClasses completed");
                
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Starting UpdateGridLayouts");
                UpdateGridLayouts(newState);
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: UpdateGridLayouts completed");
                
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Starting UpdateTableLayout");
                UpdateTableLayout(newState);
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: UpdateTableLayout completed");
                
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Starting UpdateDynamicElements");
                UpdateDynamicElements(newState);
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: UpdateDynamicElements completed");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout BatchUpdate ERROR: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout BatchUpdate StackTrace: {ex.StackTrace}");
            }
        }
        
        System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout: Completed successfully");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout ERROR: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"ApplyResponsiveLayout StackTrace: {ex.StackTrace}");
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

        // FIXED: Use the corrected ApplyToAll method signature
        _elementCache.ApplyToAll(this, element =>
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

        // Update Header Grid
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.HeaderGrid, out Grid? headerGrid) && headerGrid != null)
        {
            UpdateHeaderGrid(headerGrid, config);
        }

        // Update Filter Grid
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.FilterGrid, out Grid? filterGrid) && filterGrid != null)
        {
            ApplyFilterGridLayout(filterGrid, state);
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

            // Title section
            if (grid.Children.Count > 0 && grid.Children[0] is StackPanel titlePanel)
            {
                Grid.SetColumn(titlePanel, 0);
                Grid.SetRow(titlePanel, 0);
            }

            // Action buttons
            if (grid.Children.Count > 1 && grid.Children[1] is StackPanel actionPanel)
            {
                Grid.SetColumn(actionPanel, 0);
                Grid.SetRow(actionPanel, 1);
                actionPanel.Margin = new Thickness(0, 12, 0, 0);
                actionPanel.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch;
            }
        }
        else
        {
            // Desktop/Tablet: Horizontal layout
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
                actionPanel.Margin = new Thickness(0);
                actionPanel.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right;
            }
        }
    }

    private void UpdateTableLayout(ResponsiveState state)
    {
        if (!_elementCache.TryGetElement<ScrollViewer>(ElementIdentifiers.GradeEntriesContainer, out ScrollViewer? scrollViewer) || scrollViewer == null)
            return;

        var config = _layoutManager.GetConfiguration(state);

        if (config.UseHorizontalScrolling)
        {
            // Mobile: Enable horizontal scrolling for table
            scrollViewer.HorizontalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
            scrollViewer.VerticalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
        }
        else
        {
            // Desktop/Tablet: Standard layout
            scrollViewer.HorizontalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Disabled;
            scrollViewer.VerticalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
        }
    }

    private void UpdateDynamicElements(ResponsiveState state)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements: Starting with state = {state}");
            
            // Clear cached elements to get fresh references
            _responsiveTextBlocks.Clear();
            _responsiveBorders.Clear();
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements: Cleared cached elements");

            // Find and cache all dynamic elements
            FindDynamicElements();
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements: FindDynamicElements completed");

            // Apply responsive styles directly
            ApplyDynamicElementStyles(state);
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements: ApplyDynamicElementStyles completed");
            
            // Apply responsive grid layouts
            ApplyResponsiveGridLayouts(state);
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements: ApplyResponsiveGridLayouts completed");
            
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements: Completed successfully");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements ERROR: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"UpdateDynamicElements StackTrace: {ex.StackTrace}");
        }
    }

    private void FindDynamicElements()
    {
        try
        {
            // Search through the entire visual tree for responsive elements
            var descendants = this.GetVisualDescendants().ToList();
            foreach (var element in descendants)
            {
                if (element is TextBlock textBlock)
                {
                    _responsiveTextBlocks.Add(textBlock);
                }

                if (element is Border border)
                {
                    _responsiveBorders.Add(border);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"FindDynamicElements error: {ex.Message}");
        }
    }

    private void ApplyDynamicElementStyles(ResponsiveState state)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles: Starting with state = {state}");
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles: TextBlocks count = {_responsiveTextBlocks.Count}");
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles: Borders count = {_responsiveBorders.Count}");
            
            // Apply responsive font sizes
            double baseFontSize = GetBaseFontSize(state);
            double headerFontSize = GetHeaderFontSize(state);
            double cardPadding = GetCardPadding(state);

            // Update text blocks with appropriate font sizes
            foreach (var textBlock in _responsiveTextBlocks)
            {
                // Apply different font sizes based on content type
                if (IsHeaderText(textBlock))
                {
                    textBlock.FontSize = headerFontSize;
                }
                else if (IsValueText(textBlock))
                {
                    textBlock.FontSize = GetValueFontSize(state);
                }
                else
                {
                    textBlock.FontSize = baseFontSize;
                }

                // Remove existing responsive classes
                textBlock.Classes.Remove(ResponsiveClasses.Mobile);
                textBlock.Classes.Remove(ResponsiveClasses.Tablet);

                // Add appropriate responsive class
                if (state != ResponsiveState.Desktop)
                {
                    textBlock.Classes.Add(GetClassName(state));
                }
            }
            
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles: TextBlocks processing completed");

            // Update card padding
            foreach (var border in _responsiveBorders)
            {
                if (border.Classes.Contains("card"))
                {
                    border.Padding = new Thickness(cardPadding);

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
            
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles: Borders processing completed");
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles: Completed successfully");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles ERROR: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"ApplyDynamicElementStyles StackTrace: {ex.StackTrace}");
        }
    }

    private void ApplyResponsiveGridLayouts(ResponsiveState state)
    {
        try
        {
            // Find all responsive grids and apply appropriate layouts
            var descendants = this.GetVisualDescendants().ToList();
            foreach (var element in descendants)
            {
                if (element is Grid grid)
                {
                    ApplyGridResponsiveLayout(grid, state);
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ApplyResponsiveGridLayouts error: {ex.Message}");
        }
    }

    private void ApplyGridResponsiveLayout(Grid grid, ResponsiveState state)
    {
        if (grid.Classes.Contains("responsive-inputs"))
        {
            ApplyResponsiveInputsLayout(grid, state);
        }
        else if (grid.Classes.Contains("filter-grid"))
        {
            ApplyFilterGridLayout(grid, state);
        }
        else if (grid.Classes.Contains("header-grid"))
        {
            ApplyHeaderGridLayout(grid, state);
        }
    }

    private void ApplyResponsiveInputsLayout(Grid grid, ResponsiveState state)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        if (state == ResponsiveState.Mobile)
        {
            // Mobile: Single column, three rows
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Position children
            for (int i = 0; i < grid.Children.Count; i++)
            {
                var child = grid.Children[i];
                Grid.SetColumn(child, 0);
                Grid.SetRow(child, i);
            }
        }
        else
        {
            // Desktop/Tablet: Two columns, two rows
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Position children
            if (grid.Children.Count > 0)
            {
                Grid.SetColumn(grid.Children[0], 0);
                Grid.SetRow(grid.Children[0], 0);
            }
            if (grid.Children.Count > 1)
            {
                Grid.SetColumn(grid.Children[1], 1);
                Grid.SetRow(grid.Children[1], 0);
            }
            if (grid.Children.Count > 2)
            {
                Grid.SetColumn(grid.Children[2], 0);
                Grid.SetColumnSpan(grid.Children[2], 2);
                Grid.SetRow(grid.Children[2], 1);
            }
        }
    }

    private void ApplyFilterGridLayout(Grid grid, ResponsiveState state)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        if (state == ResponsiveState.Mobile)
        {
            // Mobile: Single column, five rows
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Position children
            for (int i = 0; i < grid.Children.Count; i++)
            {
                var child = grid.Children[i];
                Grid.SetColumn(child, 0);
                Grid.SetRow(child, i);
            }
        }
        else
        {
            // Desktop/Tablet: Six columns, single row
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Position children
            for (int i = 0; i < grid.Children.Count; i++)
            {
                var child = grid.Children[i];
                Grid.SetColumn(child, i);
                Grid.SetRow(child, 0);
            }
        }
    }

    private void ApplyHeaderGridLayout(Grid grid, ResponsiveState state)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        if (state == ResponsiveState.Mobile)
        {
            // Mobile: Single column, two rows
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Position children
            for (int i = 0; i < grid.Children.Count; i++)
            {
                var child = grid.Children[i];
                Grid.SetColumn(child, 0);
                Grid.SetRow(child, i);
            }
        }
        else
        {
            // Desktop/Tablet: Three columns, single row
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            // Position children
            for (int i = 0; i < grid.Children.Count; i++)
            {
                var child = grid.Children[i];
                Grid.SetColumn(child, i);
                Grid.SetRow(child, 0);
            }
        }
    }

    private bool IsHeaderText(TextBlock textBlock)
    {
        return textBlock.FontSize >= 18 || textBlock.FontWeight == Avalonia.Media.FontWeight.Bold;
    }

    private bool IsValueText(TextBlock textBlock)
    {
        return textBlock.FontSize >= 20 && textBlock.FontWeight == Avalonia.Media.FontWeight.Bold;
    }

    private double GetBaseFontSize(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 12,
        ResponsiveState.Tablet => 13,
        _ => 14
    };

    private double GetHeaderFontSize(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 20,
        ResponsiveState.Tablet => 24,
        _ => 28
    };

    private double GetValueFontSize(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 18,
        ResponsiveState.Tablet => 20,
        _ => 24
    };

    private double GetCardPadding(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 12,
        ResponsiveState.Tablet => 16,
        _ => 20
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

        public void CacheNamedElement(UserControl parent, string name)
        {
            if (parent.FindControl<Control>(name) is { } control)
            {
                _namedElements[name] = control;
            }
        }

        public void CacheNamedElements(UserControl parent, string[] names)
        {
            foreach (var name in names)
            {
                CacheNamedElement(parent, name);
            }
        }

        // FIXED: Complete the method implementation
        public void CacheTypedElements(UserControl parent)
        {
            // This method is intentionally left empty as we handle dynamic elements
            // through FindDynamicElements() method for better performance
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

        // FIXED: Complete the method implementation with proper signature
        public void ApplyToAll(UserControl parent, Action<Control> action)
        {
            try
            {
                // Apply to all visual descendants for dynamic responsive behavior
                var descendants = parent.GetVisualDescendants().OfType<Control>().ToList();
                foreach (var element in descendants)
                {
                    action(element);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ApplyToAll error: {ex.Message}");
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
            StatsColumns = 0,
            StatsRows = 0,
            StatsCardPositions = Array.Empty<GridPosition>(),
            StatsCardMargins = Array.Empty<Thickness>(),
            StackMainContent = true,
            StackHeaderContent = true,
            UseHorizontalScrolling = true
        };

        private LayoutConfiguration CreateTabletConfig() => new()
        {
            StatsColumns = 0,
            StatsRows = 0,
            StatsCardPositions = Array.Empty<GridPosition>(),
            StatsCardMargins = Array.Empty<Thickness>(),
            StackMainContent = false,
            StackHeaderContent = false,
            UseHorizontalScrolling = false
        };

        private LayoutConfiguration CreateDesktopConfig() => new()
        {
            StatsColumns = 0,
            StatsRows = 0,
            StatsCardPositions = Array.Empty<GridPosition>(),
            StatsCardMargins = Array.Empty<Thickness>(),
            StackMainContent = false,
            StackHeaderContent = false,
            UseHorizontalScrolling = false
        };
    }

    private class LayoutConfiguration
    {
        public int StatsColumns { get; init; }
        public int StatsRows { get; init; }
        public GridPosition[] StatsCardPositions { get; init; } = Array.Empty<GridPosition>();
        public Thickness[] StatsCardMargins { get; init; } = Array.Empty<Thickness>();
        public bool StackMainContent { get; init; }
        public bool StackHeaderContent { get; init; }
        public bool UseHorizontalScrolling { get; init; }
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