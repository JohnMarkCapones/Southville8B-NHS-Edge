using Avalonia;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Threading;
using Avalonia.VisualTree;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class TeacherDashboardView : UserControl
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
        public const string MainStackPanel = "MainStackPanel";
        public const string KpiGrid = "KpiGrid";
        public static readonly string[] KpiCards = { "KpiCard1", "KpiCard2", "KpiCard3", "KpiCard4", "KpiCard5" };
        public static readonly string[] TwoColumnGrids = { "TwoColumnGrid1", "TwoColumnGrid2", "TwoColumnGrid3" };
    }

    #endregion

    #region Fields

    // Performance: Cache all control references at initialization
    private readonly ElementCache _elementCache = new();
    private readonly ResponsiveLayoutManager _layoutManager;
    private readonly ThrottledUpdater _throttledUpdater;

    // State tracking
    private ResponsiveState _currentState = ResponsiveState.Unknown;
    private double _lastProcessedWidth;

    #endregion

    #region Constructor & Initialization

    public TeacherDashboardView()
    {
        InitializeComponent();

        _layoutManager = new ResponsiveLayoutManager();
        _throttledUpdater = new ThrottledUpdater(TimeSpan.FromMilliseconds(100));

        // Defer heavy initialization
        Dispatcher.UIThread.InvokeAsync(() =>
        {
            InitializeResponsiveSystem();
        }, DispatcherPriority.Background);
    }

    private void InitializeResponsiveSystem()
    {
        CacheAllElements();
        AttachEventHandlers();

        // Initial layout if visible
        if (Bounds.Width > 0)
        {
            ApplyResponsiveLayout(Bounds.Width);
        }
    }

    private void CacheAllElements()
    {
        // Cache named elements once at startup
        _elementCache.CacheNamedElements(this, ElementIdentifiers.KpiCards);
        _elementCache.CacheNamedElements(this, ElementIdentifiers.TwoColumnGrids);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainStackPanel);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.KpiGrid);

        // Cache typed elements efficiently
        _elementCache.CacheTypedElements(this);
    }

    private void AttachEventHandlers()
    {
        this.SizeChanged += OnSizeChanged;
        this.AttachedToVisualTree += OnAttachedToVisualTree;
        this.DetachedFromVisualTree += OnDetachedFromVisualTree;
    }

    #endregion

    #region Event Handlers

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        // Use throttling to prevent excessive updates
        _throttledUpdater.Schedule(() => ApplyResponsiveLayout(e.NewSize.Width));
    }

    private void OnAttachedToVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        if (Bounds.Width > 0)
        {
            ApplyResponsiveLayout(Bounds.Width);
        }
    }

    private void OnDetachedFromVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        _throttledUpdater.Cancel();
    }

    #endregion

    #region Responsive Layout Logic

    private void ApplyResponsiveLayout(double width)
    {
        var newState = DetermineResponsiveState(width);

        // Skip if no significant change
        if (!ShouldUpdateLayout(newState, width))
            return;

        _currentState = newState;
        _lastProcessedWidth = width;

        // Batch DOM updates for performance
        using var deferral = BatchUpdate();
        {
            UpdateElementClasses(newState);
            UpdateGridLayouts(newState);
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

        // Update all cached elements efficiently
        _elementCache.ApplyToAll(element =>
        {
            // Clear previous responsive classes
            element.Classes.Remove(ResponsiveClasses.Mobile);
            element.Classes.Remove(ResponsiveClasses.Tablet);

            // Apply new class if not desktop
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
        if (_elementCache.TryGetElement(ElementIdentifiers.KpiGrid, out Grid? kpiGrid) && kpiGrid != null)
        {
            UpdateKpiGrid(kpiGrid, config);
        }

        // Update Two-Column Grids
        foreach (var gridName in ElementIdentifiers.TwoColumnGrids)
        {
            if (_elementCache.TryGetElement(gridName, out Grid? grid) && grid != null)
            {
                UpdateTwoColumnGrid(grid, config);
            }
        }
    }

    private void UpdateKpiGrid(Grid grid, LayoutConfiguration config)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        // Add definitions
        for (int i = 0; i < config.KpiColumns; i++)
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (int i = 0; i < config.KpiRows; i++)
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        // Position cards
        for (int i = 0; i < ElementIdentifiers.KpiCards.Length; i++)
        {
            if (_elementCache.TryGetElement(ElementIdentifiers.KpiCards[i], out Border? card) && card != null)
            {
                var position = config.KpiCardPositions[i];
                Grid.SetColumn(card, position.Column);
                Grid.SetRow(card, position.Row);
                card.Margin = config.KpiCardMargins[i];
            }
        }
    }

    private void UpdateTwoColumnGrid(Grid grid, LayoutConfiguration config)
    {
        if (config.StackTwoColumnGrids)
        {
            ConvertToStackedLayout(grid);
        }
        else
        {
            RestoreTwoColumnLayout(grid);
        }
    }

    private void ConvertToStackedLayout(Grid grid)
    {
        var children = grid.Children.ToList();

        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        grid.RowDefinitions.Clear();
        for (int i = 0; i < children.Count; i++)
        {
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            Grid.SetColumn(children[i], 0);
            Grid.SetRow(children[i], i);
            children[i].Margin = new Thickness(0, i > 0 ? 8 : 0, 0, 0);
        }
    }

    private void RestoreTwoColumnLayout(Grid grid)
    {
        var children = grid.Children.ToList();

        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        grid.RowDefinitions.Clear();
        grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        for (int i = 0; i < children.Count && i < 2; i++)
        {
            Grid.SetColumn(children[i], i);
            Grid.SetRow(children[i], 0);
            children[i].Margin = new Thickness(i == 0 ? 0 : 12, 0, i == 0 ? 12 : 0, 0);
        }
    }

    #endregion

    #region Utilities

    private IDisposable BatchUpdate()
    {
        // Placeholder for batch update logic
        // In a real implementation, this would defer layout updates
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
            // Cache all responsive elements in a single traversal
            foreach (var control in parent.GetVisualDescendants().OfType<Control>())
            {
                if (control is TextBlock or Button or ProgressBar or Border)
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
            // Process in batch for better performance
            var elements = _allElements.ToArray(); // Avoid collection modification issues
            foreach (var element in elements)
            {
                if (element != null) // Null safety
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
            KpiRows = 5,
            KpiCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(0, 1),
                new GridPosition(0, 2),
                new GridPosition(0, 3),
                new GridPosition(0, 4)
            },
            KpiCardMargins = new[]
            {
                new Thickness(0, 0, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 0)
            },
            StackTwoColumnGrids = true
        };

        private LayoutConfiguration CreateTabletConfig() => new()
        {
            KpiColumns = 2,
            KpiRows = 3,
            KpiCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(1, 0),
                new GridPosition(0, 1),
                new GridPosition(1, 1),
                new GridPosition(0, 2)
            },
            KpiCardMargins = new[]
            {
                new Thickness(0, 0, 8, 8),
                new Thickness(8, 0, 0, 8),
                new Thickness(0, 8, 8, 8),
                new Thickness(8, 8, 0, 8),
                new Thickness(0, 8, 0, 0)
            },
            StackTwoColumnGrids = false
        };

        private LayoutConfiguration CreateDesktopConfig() => new()
        {
            KpiColumns = 5,
            KpiRows = 1,
            KpiCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(1, 0),
                new GridPosition(2, 0),
                new GridPosition(3, 0),
                new GridPosition(4, 0)
            },
            KpiCardMargins = new[]
            {
                new Thickness(0, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 0, 0)
            },
            StackTwoColumnGrids = false
        };
    }

    private class LayoutConfiguration
    {
        public int KpiColumns { get; init; }
        public int KpiRows { get; init; }
        public GridPosition[] KpiCardPositions { get; init; } = Array.Empty<GridPosition>();
        public Thickness[] KpiCardMargins { get; init; } = Array.Empty<Thickness>();
        public bool StackTwoColumnGrids { get; init; }
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