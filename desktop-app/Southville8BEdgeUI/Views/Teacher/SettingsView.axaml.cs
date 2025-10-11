using Avalonia;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Threading;
using Avalonia.VisualTree;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class SettingsView : UserControl
{
    private static class Breakpoints
    {
        public const double Mobile = 768;
        public const double Tablet = 1024;
        public const double ChangeThreshold = 0.05; // 5%
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
        public const string ContentGrid = "ContentGrid";
        public const string LeftPanel = "LeftPanel";
        public const string RightPanel = "RightPanel";
    }

    private readonly ElementCache _elementCache = new();
    private readonly ResponsiveLayoutManager _layoutManager = new();
    private readonly ThrottledUpdater _throttledUpdater = new(TimeSpan.FromMilliseconds(100));
    private DispatcherTimer? _periodicTimer;

    private ResponsiveState _currentState = ResponsiveState.Unknown;
    private double _lastProcessedWidth;

    public SettingsView()
    {
        InitializeComponent();

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

        SchedulePeriodicUpdates();
    }

    private void CacheAllElements()
    {
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainScrollViewer);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.MainStackPanel);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.HeaderGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.ContentGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.LeftPanel);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.RightPanel);

        _elementCache.CacheTypedElements(this);
    }

    private void AttachEventHandlers()
    {
        SizeChanged += OnSizeChanged;
        AttachedToVisualTree += OnAttachedToVisualTree;
        DetachedFromVisualTree += OnDetachedFromVisualTree;
    }

    private void SchedulePeriodicUpdates()
    {
        _periodicTimer ??= new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
        _periodicTimer.Tick -= OnPeriodicTick;
        _periodicTimer.Tick += OnPeriodicTick;
        _periodicTimer.Start();
    }

    private void OnPeriodicTick(object? sender, EventArgs e)
    {
        if (_currentState != ResponsiveState.Unknown)
        {
            // Re-apply classes to account for dynamically created controls, if any
            UpdateElementClasses(_currentState);
        }
    }

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

    private void ApplyResponsiveLayout(double width)
    {
        var newState = DetermineResponsiveState(width);
        if (!ShouldUpdateLayout(newState, width))
            return;

        _currentState = newState;
        _lastProcessedWidth = width;

        UpdateElementClasses(newState);
        UpdateGridLayouts(newState);
    }

    private ResponsiveState DetermineResponsiveState(double width)
    {
        if (width < Breakpoints.Mobile) return ResponsiveState.Mobile;
        if (width < Breakpoints.Tablet) return ResponsiveState.Tablet;
        return ResponsiveState.Desktop;
    }

    private bool ShouldUpdateLayout(ResponsiveState newState, double width)
    {
        if (newState != _currentState) return true;
        double threshold = Math.Max(width * Breakpoints.ChangeThreshold, Breakpoints.MinThreshold);
        return Math.Abs(width - _lastProcessedWidth) > threshold;
    }

    private void UpdateElementClasses(ResponsiveState state)
    {
        var className = state switch
        {
            ResponsiveState.Mobile => ResponsiveClasses.Mobile,
            ResponsiveState.Tablet => ResponsiveClasses.Tablet,
            _ => ResponsiveClasses.Desktop
        };

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

    private void UpdateGridLayouts(ResponsiveState state)
    {
        var config = _layoutManager.GetConfiguration(state);

        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.HeaderGrid, out var header))
        {
            var headerGrid = header!; // safe due to TryGetElement
            headerGrid.ColumnDefinitions.Clear();
            headerGrid.RowDefinitions.Clear();

            if (config.StackHeaderContent)
            {
                // Columns: Icon + Title, Rows: header, actions
                headerGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
                headerGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
                headerGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
                headerGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

                if (headerGrid.Children.Count > 0)
                {
                    // Icon
                    Grid.SetColumn(headerGrid.Children[0]!, 0);
                    Grid.SetRow(headerGrid.Children[0]!, 0);
                }
                if (headerGrid.Children.Count > 1)
                {
                    // Title
                    Grid.SetColumn(headerGrid.Children[1]!, 1);
                    Grid.SetRow(headerGrid.Children[1]!, 0);
                }
                if (headerGrid.Children.Count > 2 && headerGrid.Children[2] is Control actions)
                {
                    Grid.SetColumn(actions, 0);
                    Grid.SetColumnSpan(actions, 2);
                    Grid.SetRow(actions, 1);
                    actions.Margin = new Thickness(0, 12, 0, 0);
                    actions.HorizontalAlignment = HorizontalAlignment.Stretch;
                }
            }
            else
            {
                headerGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
                headerGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
                headerGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
                headerGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

                if (headerGrid.Children.Count > 0)
                {
                    Grid.SetColumn(headerGrid.Children[0]!, 0);
                    Grid.SetRow(headerGrid.Children[0]!, 0);
                }
                if (headerGrid.Children.Count > 1)
                {
                    Grid.SetColumn(headerGrid.Children[1]!, 1);
                    Grid.SetRow(headerGrid.Children[1]!, 0);
                }
                if (headerGrid.Children.Count > 2 && headerGrid.Children[2] is Control actions)
                {
                    Grid.SetColumn(actions, 2);
                    Grid.SetRow(actions, 0);
                    Grid.SetColumnSpan(actions, 1);
                    actions.Margin = new Thickness(0);
                    actions.HorizontalAlignment = HorizontalAlignment.Right;
                }
            }
        }

        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.ContentGrid, out var content))
        {
            var contentGrid = content!; // safe due to TryGetElement
            contentGrid.ColumnDefinitions.Clear();
            contentGrid.RowDefinitions.Clear();

            if (config.StackMainContent)
            {
                contentGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
                contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
                contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

                if (_elementCache.TryGetElement<StackPanel>(ElementIdentifiers.LeftPanel, out var left))
                {
                    var l = left!; // safe due to TryGetElement
                    Grid.SetColumn(l, 0);
                    Grid.SetRow(l, 0);
                }
                if (_elementCache.TryGetElement<StackPanel>(ElementIdentifiers.RightPanel, out var right))
                {
                    var r = right!; // safe due to TryGetElement
                    Grid.SetColumn(r, 0);
                    Grid.SetRow(r, 1);
                    r.Margin = new Thickness(0, 12, 0, 0);
                }
            }
            else
            {
                contentGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
                contentGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
                contentGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

                if (_elementCache.TryGetElement<StackPanel>(ElementIdentifiers.LeftPanel, out var left))
                {
                    var l = left!;
                    Grid.SetColumn(l, 0);
                    Grid.SetRow(l, 0);
                }
                if (_elementCache.TryGetElement<StackPanel>(ElementIdentifiers.RightPanel, out var right))
                {
                    var r = right!;
                    Grid.SetColumn(r, 1);
                    Grid.SetRow(r, 0);
                    r.Margin = new Thickness(12, 0, 0, 0);
                }
            }
        }
    }

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
                _namedElements[name] = control;
        }

        public void CacheNamedElements(UserControl parent, string[] names)
        {
            foreach (var n in names) CacheNamedElement(parent, n);
        }

        public void CacheTypedElements(UserControl parent)
        {
            // Not used here; dynamic traversal is done in ApplyToAll
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

        public void ApplyToAll(UserControl parent, Action<Control> action)
        {
            foreach (var c in parent.GetVisualDescendants().OfType<Control>())
                action(c);
        }
    }

    private class ResponsiveLayoutManager
    {
        private readonly Dictionary<ResponsiveState, LayoutConfiguration> _configs;

        public ResponsiveLayoutManager()
        {
            _configs = new()
            {
                [ResponsiveState.Mobile] = new LayoutConfiguration
                {
                    StackHeaderContent = true,
                    StackMainContent = true
                },
                [ResponsiveState.Tablet] = new LayoutConfiguration
                {
                    StackHeaderContent = false,
                    StackMainContent = false
                },
                [ResponsiveState.Desktop] = new LayoutConfiguration
                {
                    StackHeaderContent = false,
                    StackMainContent = false
                }
            };
        }

        public LayoutConfiguration GetConfiguration(ResponsiveState state)
            => _configs[state];
    }

    private class LayoutConfiguration
    {
        public bool StackMainContent { get; init; }
        public bool StackHeaderContent { get; init; }
    }

    private class ThrottledUpdater
    {
        private readonly DispatcherTimer _timer;
        private Action? _pendingAction;

        public ThrottledUpdater(TimeSpan delay)
        {
            _timer = new DispatcherTimer { Interval = delay };
            _timer.Tick += OnTick;
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

        private void OnTick(object? sender, EventArgs e)
        {
            _timer.Stop();
            _pendingAction?.Invoke();
            _pendingAction = null;
        }
    }
}
