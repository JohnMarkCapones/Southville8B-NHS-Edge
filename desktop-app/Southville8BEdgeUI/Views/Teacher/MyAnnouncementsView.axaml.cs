using Avalonia;
using Avalonia.Controls;
using Avalonia.Threading;
using Avalonia.VisualTree;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Collections.Specialized;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class MyAnnouncementsView : UserControl
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
        public const string StatsGrid = "StatsGrid";
        public const string ContentGrid = "ContentGrid";
        public const string AnnouncementsListCard = "AnnouncementsListCard";
        public const string QuickCreateCard = "QuickCreateCard";
        public const string AnnouncementsListScrollViewer = "AnnouncementsListScrollViewer";
        public const string AnnouncementListItems = "AnnouncementListItems";
        public const string FilterSelector = "FilterSelector";
        public static readonly string[] StatsCards = { "StatsCard1", "StatsCard2", "StatsCard3", "StatsCard4" };
        public static readonly string[] ActionButtons = { "NewAnnouncementButton", "AnalyticsButton" };
    }

    #endregion

    #region Fields

    private readonly ElementCache _elementCache = new();
    private readonly ResponsiveLayoutManager _layoutManager;
    private readonly ThrottledUpdater _throttledUpdater;
    private DispatcherTimer? _periodicTimer;
    private bool _usePeriodicTimer;
    private INotifyCollectionChanged? _announcementsCollection;
    private NotifyCollectionChangedEventHandler? _collectionChangedHandler;

    private ResponsiveState _currentState = ResponsiveState.Unknown;
    private double _lastProcessedWidth;

    // Cache for dynamic elements to avoid repeated searches
    private readonly List<TextBlock> _responsiveTextBlocks = new();
    private readonly List<Border> _responsiveBorders = new();
    private readonly List<Button> _responsiveButtons = new();

    #endregion

    #region Constructor & Initialization

    public MyAnnouncementsView()
    {
        InitializeComponent();
        DataContext = new MyAnnouncementsViewModel();

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
        _elementCache.CacheNamedElement(this, ElementIdentifiers.StatsGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.ContentGrid);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.AnnouncementsListCard);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.QuickCreateCard);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.AnnouncementsListScrollViewer);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.AnnouncementListItems);
        _elementCache.CacheNamedElement(this, ElementIdentifiers.FilterSelector);

        // Cache stats cards and action buttons
        _elementCache.CacheNamedElements(this, ElementIdentifiers.StatsCards);
        _elementCache.CacheNamedElements(this, ElementIdentifiers.ActionButtons);

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
        // Reduced frequency and add collection change handling if available
        _periodicTimer ??= new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(2) // Reduced from 1 second
        };
        _periodicTimer.Tick -= OnPeriodicTick;
        _periodicTimer.Tick += OnPeriodicTick;

        // Try to subscribe to collection changes for more efficient updates
        if (DataContext is MyAnnouncementsViewModel vm &&
            vm.Announcements is INotifyCollectionChanged collection)
        {
            _announcementsCollection = collection;
            _collectionChangedHandler = (_, __) =>
            {
                if (_currentState != ResponsiveState.Unknown)
                    _throttledUpdater.Schedule(() => UpdateDynamicElements(_currentState));
            };
            _announcementsCollection.CollectionChanged += _collectionChangedHandler;
            _usePeriodicTimer = false;
            return; // Don't start periodic timer if we have collection change notifications
        }

        _usePeriodicTimer = true;
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
        if (_usePeriodicTimer)
            _periodicTimer?.Start();
    }

    private void OnDetachedFromVisualTree(object? sender, VisualTreeAttachmentEventArgs e)
    {
        _throttledUpdater.Cancel();
        if (_usePeriodicTimer)
            _periodicTimer?.Stop();
        if (_announcementsCollection is not null && _collectionChangedHandler is not null)
            _announcementsCollection.CollectionChanged -= _collectionChangedHandler;
        _announcementsCollection = null;
        _collectionChangedHandler = null;
    }

    #endregion

    #region Responsive Layout Logic

    private void ApplyResponsiveLayout(double width)
    {
        var newState = DetermineResponsiveState(width);

        if (!ShouldUpdateLayout(newState, width))
            return;

        _currentState = newState;
        _lastProcessedWidth = width;

        using var deferral = BatchUpdate();
        {
            UpdateElementClasses(newState);
            UpdateGridLayouts(newState);
            UpdateScrollLayout(newState);
            UpdateDynamicElements(newState);
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private ResponsiveState DetermineResponsiveState(double width)
    {
        if (width <= Breakpoints.Mobile) return ResponsiveState.Mobile;
        if (width <= Breakpoints.Tablet) return ResponsiveState.Tablet;
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

        // Update Stats Grid
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.StatsGrid, out Grid? statsGrid) && statsGrid != null)
        {
            UpdateStatsGrid(statsGrid, config);
        }

        // Update Header Grid
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.HeaderGrid, out Grid? headerGrid) && headerGrid != null)
        {
            UpdateHeaderGrid(headerGrid, config);
        }

        // Update Main Content Grid
        if (_elementCache.TryGetElement<Grid>(ElementIdentifiers.ContentGrid, out Grid? contentGrid) && contentGrid != null)
        {
            UpdateContentGrid(contentGrid, config);
        }
    }

    private void UpdateStatsGrid(Grid grid, LayoutConfiguration config)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        // Add column definitions
        for (int i = 0; i < config.StatsColumns; i++)
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        // Add row definitions
        for (int i = 0; i < config.StatsRows; i++)
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        // Position stats cards
        for (int i = 0; i < ElementIdentifiers.StatsCards.Length; i++)
        {
            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.StatsCards[i], out Border? card) && card != null)
            {
                var position = config.StatsCardPositions[i];
                Grid.SetColumn(card, position.Column);
                Grid.SetRow(card, position.Row);
                card.Margin = config.StatsCardMargins[i];
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
                actionPanel.Orientation = Avalonia.Layout.Orientation.Vertical;
                actionPanel.Spacing = 8;
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
                actionPanel.Orientation = Avalonia.Layout.Orientation.Horizontal;
                actionPanel.Spacing = 12;
            }
        }
    }

    private void UpdateContentGrid(Grid grid, LayoutConfiguration config)
    {
        grid.ColumnDefinitions.Clear();
        grid.RowDefinitions.Clear();

        if (config.StackMainContent)
        {
            // Mobile: Stack announcements list and quick create vertically
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.AnnouncementsListCard, out Border? listCard) && listCard != null)
            {
                Grid.SetColumn(listCard, 0);
                Grid.SetRow(listCard, 0);
                listCard.Margin = new Thickness(0, 0, 0, 12);
            }

            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.QuickCreateCard, out Border? createCard) && createCard != null)
            {
                Grid.SetColumn(createCard, 0);
                Grid.SetRow(createCard, 1);
                createCard.Margin = new Thickness(0, 12, 0, 0);
            }
        }
        else
        {
            // Desktop/Tablet: Side-by-side layout
            grid.ColumnDefinitions.Add(new ColumnDefinition(new GridLength(2, GridUnitType.Star)));
            grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Star));

            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.AnnouncementsListCard, out Border? listCard) && listCard != null)
            {
                Grid.SetColumn(listCard, 0);
                Grid.SetRow(listCard, 0);
                listCard.Margin = new Thickness(0, 0, 12, 0);
            }

            if (_elementCache.TryGetElement<Border>(ElementIdentifiers.QuickCreateCard, out Border? createCard) && createCard != null)
            {
                Grid.SetColumn(createCard, 1);
                Grid.SetRow(createCard, 0);
                createCard.Margin = new Thickness(12, 0, 0, 0);
            }
        }
    }

    private void UpdateScrollLayout(ResponsiveState state)
    {
        if (!_elementCache.TryGetElement<ScrollViewer>(ElementIdentifiers.AnnouncementsListScrollViewer, out ScrollViewer? scrollViewer) || scrollViewer == null)
            return;

        var config = _layoutManager.GetConfiguration(state);

        if (config.UseHorizontalScrolling)
        {
            // Mobile: Enable horizontal scrolling for announcement cards
            scrollViewer.HorizontalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;
            scrollViewer.VerticalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Disabled;
            
            // Switch to horizontal layout
            if (_elementCache.TryGetElement<ItemsControl>(ElementIdentifiers.AnnouncementListItems, out var items) && items != null)
            {
                // Horizontal flow using WrapPanel
                items.ItemsPanel = new Avalonia.Controls.Templates.FuncTemplate<Avalonia.Controls.Panel?>(() =>
                {
                    return new Avalonia.Controls.WrapPanel { Orientation = Avalonia.Layout.Orientation.Horizontal };
                });
            }
        }
        else
        {
            // Desktop/Tablet: Standard layout
            scrollViewer.HorizontalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Disabled;
            scrollViewer.VerticalScrollBarVisibility = Avalonia.Controls.Primitives.ScrollBarVisibility.Auto;

            // Restore vertical layout
            if (_elementCache.TryGetElement<ItemsControl>(ElementIdentifiers.AnnouncementListItems, out var items) && items != null)
            {
                // Vertical flow using StackPanel
                items.ItemsPanel = new Avalonia.Controls.Templates.FuncTemplate<Avalonia.Controls.Panel?>(() =>
                {
                    return new Avalonia.Controls.StackPanel { Orientation = Avalonia.Layout.Orientation.Vertical };
                });
            }
        }
    }

    private void UpdateDynamicElements(ResponsiveState state)
    {
        // Clear cached elements to get fresh references
        _responsiveTextBlocks.Clear();
        _responsiveBorders.Clear();
        _responsiveButtons.Clear();

        // Find and cache all dynamic elements
        FindDynamicElements();

        // Apply responsive styles directly
        ApplyDynamicElementStyles(state);
    }

    private void FindDynamicElements()
    {
        // Search through the entire visual tree for responsive elements
        foreach (var element in this.GetVisualDescendants())
        {
            if (element is TextBlock textBlock)
            {
                _responsiveTextBlocks.Add(textBlock);
            }

            if (element is Border border)
            {
                _responsiveBorders.Add(border);
            }

            if (element is Button button)
            {
                _responsiveButtons.Add(button);
            }
        }
    }

    private void ApplyDynamicElementStyles(ResponsiveState state)
    {
        // Apply responsive font sizes
        double baseFontSize = GetBaseFontSize(state);
        double headerFontSize = GetHeaderFontSize(state);
        double valueSize = GetValueFontSize(state);
        double cardPadding = GetCardPadding(state);
        double buttonPadding = GetButtonPadding(state);

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
                textBlock.FontSize = valueSize;
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

        // Update card padding
        foreach (var border in _responsiveBorders)
        {
            if (border.Classes.Contains("card") || border.Classes.Contains("announcement-card"))
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

        // Update button padding
        foreach (var button in _responsiveButtons)
        {
            if (button.Classes.Contains("action-btn"))
            {
                button.Padding = new Thickness(buttonPadding, buttonPadding * 0.67);

                // Remove existing responsive classes
                button.Classes.Remove(ResponsiveClasses.Mobile);
                button.Classes.Remove(ResponsiveClasses.Tablet);

                // Add appropriate responsive class
                if (state != ResponsiveState.Desktop)
                {
                    button.Classes.Add(GetClassName(state));
                }
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

    private double GetButtonPadding(ResponsiveState state) => state switch
    {
        ResponsiveState.Mobile => 10,
        ResponsiveState.Tablet => 12,
        _ => 12
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

        public void ApplyToAll(UserControl parent, Action<Control> action)
        {
            // Apply to all visual descendants for dynamic responsive behavior
            foreach (var element in parent.GetVisualDescendants().OfType<Control>())
            {
                action(element);
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
            StatsColumns = 1,
            StatsRows = 4,
            StatsCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(0, 1),
                new GridPosition(0, 2),
                new GridPosition(0, 3)
            },
            StatsCardMargins = new[]
            {
                new Thickness(0, 0, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 8),
                new Thickness(0, 8, 0, 0)
            },
            StackMainContent = true,
            StackHeaderContent = true,
            UseHorizontalScrolling = true
        };

        private LayoutConfiguration CreateTabletConfig() => new()
        {
            StatsColumns = 2,
            StatsRows = 2,
            StatsCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(1, 0),
                new GridPosition(0, 1),
                new GridPosition(1, 1)
            },
            StatsCardMargins = new[]
            {
                new Thickness(0, 0, 8, 8),
                new Thickness(8, 0, 0, 8),
                new Thickness(0, 8, 8, 0),
                new Thickness(8, 8, 0, 0)
            },
            StackMainContent = false,
            StackHeaderContent = false,
            UseHorizontalScrolling = false
        };

        private LayoutConfiguration CreateDesktopConfig() => new()
        {
            StatsColumns = 4,
            StatsRows = 1,
            StatsCardPositions = new[]
            {
                new GridPosition(0, 0),
                new GridPosition(1, 0),
                new GridPosition(2, 0),
                new GridPosition(3, 0)
            },
            StatsCardMargins = new[]
            {
                new Thickness(0, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 12, 0),
                new Thickness(12, 0, 0, 0)
            },
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