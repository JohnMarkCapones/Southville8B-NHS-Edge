using Avalonia.Controls;
using Avalonia;
using System;
using System.Collections.Generic;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class RoomManagementView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;
    
    // Collections to store elements that need responsive behavior
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveInputElements = new();
    
    // Cache the separator reference to avoid repeated LINQ queries
    private Border? _filterSeparator;

    // Element identification constants for optimized performance
    private const string TextElementSuffix = "Text";
    private const string ButtonElementSuffix = "Button";
    private const string SpecialElementName = "StatusIndicator";

    public RoomManagementView()
    {
        InitializeComponent();
        DataContext = new RoomManagementViewModel();
        
        // Store references to elements that need responsive behavior
        InitializeResponsiveElements();
        
        // Set up size change handler
        this.SizeChanged += OnSizeChanged;
    }

    private void InitializeResponsiveElements()
    {
        // Add all named text elements that need responsive font sizes
        _responsiveTextElements.AddRange(new Control[]
        {
            MainHeaderText,
            SubtitleText,
            AvailableRoomsValue,
            AvailablePercentageText,
            OccupiedRoomsValue,
            OccupiedPercentageText,
            MaintenanceRoomsValue,
            MaintenancePercentageText,
            UtilizationValue,
            EmptyTitleText,
            EmptySubtitleText
        });

        // Add card elements
        _responsiveCardElements.AddRange(new Control[]
        {
            StatsCard1, StatsCard2, StatsCard3, StatsCard4, FilterCard, EmptyStateCard
        });

        // Add button elements
        _responsiveButtonElements.AddRange(new Control[]
        {
            ViewCalendarButton,
            BookRoomButton
        });

        // Add input elements
        _responsiveInputElements.AddRange(new Control[]
        {
            SearchInput,
            FloorFilter,
            StatusFilter,
            TypeFilter
        });

        // Cache the filter separator by name for accurate identification
        _filterSeparator = FilterGrid.Children
            .OfType<Border>()
            .FirstOrDefault(b => b.Name == "FilterSeparator");
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateResponsiveClasses(e.NewSize.Width);
    }

    private void UpdateResponsiveClasses(double width)
    {
        // Determine the current breakpoint
        string sizeClass = GetSizeClass(width);
        
        // Update all responsive elements
        UpdateMainContainerClasses(sizeClass);
        UpdateElementClasses(_responsiveTextElements, sizeClass);
        UpdateElementClasses(_responsiveCardElements, sizeClass);
        UpdateElementClasses(_responsiveButtonElements, sizeClass);
        UpdateElementClasses(_responsiveInputElements, sizeClass);
        
        // Update layout-specific elements based on screen size
        ApplyLayoutStrategy(sizeClass, width);
        
        // Update room card elements dynamically
        UpdateRoomCardElements(sizeClass);
    }

    private string GetSizeClass(double width)
    {
        if (width < MobileBreakpoint)
            return "mobile";
        else if (width < TabletBreakpoint)
            return "tablet";
        else
            return "desktop";
    }

    private void UpdateMainContainerClasses(string sizeClass)
    {
        // Clear existing responsive classes
        MainStackPanel.Classes.Remove("main-content");
        MainStackPanel.Classes.Remove("main-content-tablet");
        MainStackPanel.Classes.Remove("main-content-mobile");
        
        // Add appropriate class
        switch (sizeClass)
        {
            case "mobile":
                MainStackPanel.Classes.Add("main-content-mobile");
                break;
            case "tablet":
                MainStackPanel.Classes.Add("main-content-tablet");
                break;
            default:
                MainStackPanel.Classes.Add("main-content");
                break;
        }
    }

    private void UpdateElementClasses(List<Control> elements, string sizeClass)
    {
        foreach (var element in elements)
        {
            // Remove existing responsive classes
            element.Classes.Remove("mobile");
            element.Classes.Remove("tablet");
            
            // Add appropriate responsive class
            if (sizeClass != "desktop")
            {
                element.Classes.Add(sizeClass);
            }
        }
    }

    // Use a more configuration-driven approach for layout strategies
    private void ApplyLayoutStrategy(string sizeClass, double width)
    {
        // Create a layout configuration based on the screen size
        var layoutConfig = CreateLayoutConfig(sizeClass);
        
        // Apply the layout configuration
        ApplyHeaderLayout(layoutConfig);
        ApplyStatsGridLayout(layoutConfig);
        ApplyFilterGridLayout(layoutConfig);
    }

    private LayoutConfiguration CreateLayoutConfig(string sizeClass)
    {
        return sizeClass switch
        {
            "mobile" => new LayoutConfiguration
            {
                HeaderColumns = 1,
                HeaderRows = 2,
                HeaderButtonsPosition = (0, 1),
                HeaderButtonsAlignment = Avalonia.Layout.HorizontalAlignment.Stretch,
                HeaderButtonsMargin = new Thickness(0, 12, 0, 0),
                
                StatsColumns = 1,
                StatsRows = 4,
                StatsCardPositions = new (int, int)[] 
                {
                    (0, 0), (0, 1), (0, 2), (0, 3)
                },
                // Use explicit array declaration with Thickness type
                StatsCardMargins = new Thickness[] 
                {
                    new(0, 0, 0, 8),
                    new(0, 8, 0, 8),
                    new(0, 8, 0, 8),
                    new(0, 8, 0, 0)
                },
                
                FilterColumns = 1,
                FilterRows = 5,
                FilterSeparatorVisible = false,
                FilterSeparatorPosition = (0, 1),
                FilterElementPositions = new (int, int, int)[]
                {
                    (0, 0, 1), // SearchInput
                    (0, 2, 1), // FloorFilter
                    (0, 3, 1), // StatusFilter
                    (0, 4, 1)  // TypeFilter
                },
                // Use explicit array declaration with Thickness type
                FilterElementMargins = new Thickness[]
                {
                    new(0, 0, 0, 8),
                    new(0, 8, 0, 8),
                    new(0, 8, 0, 8),
                    new(0, 8, 0, 0)
                }
            },
            
            "tablet" => new LayoutConfiguration
            {
                HeaderColumns = 2,
                HeaderRows = 1,
                HeaderButtonsPosition = (1, 0),
                HeaderButtonsAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                HeaderButtonsMargin = new Thickness(0),
                
                StatsColumns = 2,
                StatsRows = 2,
                StatsCardPositions = new (int, int)[] 
                {
                    (0, 0), (1, 0), (0, 1), (1, 1)
                },
                StatsCardMargins = new Thickness[] 
                {
                    new(0, 0, 8, 8),
                    new(8, 0, 0, 8),
                    new(0, 8, 8, 0),
                    new(8, 8, 0, 0)
                },
                
                FilterColumns = 3,
                FilterRows = 2,
                FilterSeparatorVisible = false,
                FilterSeparatorPosition = (0, 0),
                FilterElementPositions = new (int, int, int)[]
                {
                    (0, 0, 3), // SearchInput spans 3 columns
                    (0, 1, 1), // FloorFilter
                    (1, 1, 1), // StatusFilter
                    (2, 1, 1)  // TypeFilter
                },
                FilterElementMargins = new Thickness[]
                {
                    new(0, 0, 0, 8),
                    new(0, 8, 8, 0),
                    new(8, 8, 8, 8),
                    new(8, 8, 0, 0)
                }
            },
            
            _ => new LayoutConfiguration // Desktop
            {
                HeaderColumns = 2,
                HeaderRows = 1,
                HeaderButtonsPosition = (1, 0),
                HeaderButtonsAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                HeaderButtonsMargin = new Thickness(0),
                
                StatsColumns = 4,
                StatsRows = 1,
                StatsCardPositions = new (int, int)[] 
                {
                    (0, 0), (1, 0), (2, 0), (3, 0)
                },
                // Use explicit array declaration with Thickness type
                StatsCardMargins = new Thickness[] 
                {
                    new(0, 0, 12, 0),
                    new(12, 0, 12, 0),
                    new(12, 0, 12, 0),
                    new(12, 0, 0, 0)
                },
                
                FilterColumns = 5,
                FilterRows = 1,
                FilterSeparatorVisible = true,
                FilterSeparatorPosition = (1, 0),
                FilterElementPositions = new (int, int, int)[]
                {
                    (0, 0, 1), // SearchInput
                    (2, 0, 1), // FloorFilter
                    (3, 0, 1), // StatusFilter
                    (4, 0, 1)  // TypeFilter
                },
                // Use explicit array declaration with Thickness type
                FilterElementMargins = new Thickness[]
                {
                    new(0),
                    new(12, 0, 12, 0),
                    new(12, 0, 12, 0),
                    new(12, 0, 0, 0)
                }
            }
        };
    }

    private void ApplyHeaderLayout(LayoutConfiguration config)
    {
        HeaderGrid.ColumnDefinitions.Clear();
        HeaderGrid.RowDefinitions.Clear();
        
        for (int i = 0; i < config.HeaderColumns; i++)
        {
            HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(i == 0 ? GridLength.Star : GridLength.Auto));
        }
        
        for (int i = 0; i < config.HeaderRows; i++)
        {
            HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }
        
        Grid.SetColumn(HeaderButtons, config.HeaderButtonsPosition.Column);
        Grid.SetRow(HeaderButtons, config.HeaderButtonsPosition.Row);
        Grid.SetColumnSpan(HeaderButtons, 1);
        
        HeaderButtons.HorizontalAlignment = config.HeaderButtonsAlignment;
        HeaderButtons.Margin = config.HeaderButtonsMargin;
    }

    private void ApplyStatsGridLayout(LayoutConfiguration config)
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();
        
        for (int i = 0; i < config.StatsColumns; i++)
        {
            StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        }
        
        for (int i = 0; i < config.StatsRows; i++)
        {
            StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }
        
        var statsCards = new[] { StatsCard1, StatsCard2, StatsCard3, StatsCard4 };
        for (int i = 0; i < statsCards.Length; i++)
        {
            Grid.SetColumn(statsCards[i], config.StatsCardPositions[i].Column);
            Grid.SetRow(statsCards[i], config.StatsCardPositions[i].Row);
            statsCards[i].Margin = config.StatsCardMargins[i];
        }
    }

    private void ApplyFilterGridLayout(LayoutConfiguration config)
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();
        
        for (int i = 0; i < config.FilterColumns; i++)
        {
            FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(i == 0 ? GridLength.Star : GridLength.Auto));
        }
        
        for (int i = 0; i < config.FilterRows; i++)
        {
            FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }
        
        // Explicitly specify the type of the array to Control[]
        Control[] filterControls = new Control[] { SearchInput, FloorFilter, StatusFilter, TypeFilter };
        for (int i = 0; i < filterControls.Length; i++)
        {
            var (col, row, span) = config.FilterElementPositions[i];
            Grid.SetColumn(filterControls[i], col);
            Grid.SetRow(filterControls[i], row);
            Grid.SetColumnSpan(filterControls[i], span);
            filterControls[i].Margin = config.FilterElementMargins[i];
        }
        
        // Set separator position and visibility using the cached reference
        if (_filterSeparator != null)
        {
            Grid.SetColumn(_filterSeparator, config.FilterSeparatorPosition.Column);
            Grid.SetRow(_filterSeparator, config.FilterSeparatorPosition.Row);
            _filterSeparator.IsVisible = config.FilterSeparatorVisible;
        }
    }

    private void UpdateRoomCardElements(string sizeClass)
    {
        // Find all room cards and update their classes
        var itemsControl = RoomsGrid;
        if (itemsControl != null)
        {
            UpdateRoomCardsRecursively(itemsControl, sizeClass);
        }
    }

    private void UpdateRoomCardsRecursively(Control control, string sizeClass)
    {
        // Update room cards more efficiently
        var controlName = control.Name;
        
        // Fast path for room cards
        if (controlName == "RoomCard" && control is Border roomCard)
        {
            UpdateElementResponsiveClasses(roomCard, sizeClass);
        }
        // Optimized text block check using direct string comparison
        else if (controlName != null && control is TextBlock textBlock && 
                 controlName.EndsWith(TextElementSuffix))
        {
            UpdateElementResponsiveClasses(textBlock, sizeClass);
        }
        // Optimized button check using direct string comparison
        else if (controlName != null && control is Button button && 
                 controlName.EndsWith(ButtonElementSuffix))
        {
            UpdateElementResponsiveClasses(button, sizeClass);
        }
        // Fast path for special elements like status indicators
        else if (controlName != null && control is Border border && 
                 controlName == SpecialElementName)
        {
            UpdateElementResponsiveClasses(border, sizeClass);
        }

        // Recursively update children with type-specific handling
        if (control is Panel panel)
        {
            foreach (Control child in panel.Children)
            {
                UpdateRoomCardsRecursively(child, sizeClass);
            }
        }
        else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
        {
            UpdateRoomCardsRecursively(contentChild, sizeClass);
        }
        // Note: ItemsControl children are handled through the template - no need to process them here
    }
    
    private void UpdateElementResponsiveClasses(Control element, string sizeClass)
    {
        // Remove existing responsive classes
        element.Classes.Remove("mobile");
        element.Classes.Remove("tablet");
        
        // Add appropriate responsive class
        if (sizeClass != "desktop")
        {
            element.Classes.Add(sizeClass);
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
        public int HeaderColumns { get; set; }
        public int HeaderRows { get; set; }
        public (int Column, int Row) HeaderButtonsPosition { get; set; }
        public Avalonia.Layout.HorizontalAlignment HeaderButtonsAlignment { get; set; }
        public Thickness HeaderButtonsMargin { get; set; }
        
        public int StatsColumns { get; set; }
        public int StatsRows { get; set; }
        public (int Column, int Row)[] StatsCardPositions { get; set; } = Array.Empty<(int, int)>();
        public Thickness[] StatsCardMargins { get; set; } = Array.Empty<Thickness>();
        
        public int FilterColumns { get; set; }
        public int FilterRows { get; set; }
        public bool FilterSeparatorVisible { get; set; }
        public (int Column, int Row) FilterSeparatorPosition { get; set; }
        public (int Column, int Row, int ColumnSpan)[] FilterElementPositions { get; set; } = Array.Empty<(int, int, int)>();
        public Thickness[] FilterElementMargins { get; set; } = Array.Empty<Thickness>();
    }
}