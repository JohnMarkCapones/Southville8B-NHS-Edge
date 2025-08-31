using Avalonia.Controls;
using Avalonia;
using Avalonia.Layout;
using System;
using System.Collections.Generic;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class AlertsView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;
    
    // Responsive class name constants for consistency
    private const string MobileClass = "mobile";
    private const string TabletClass = "tablet";
    private const string DesktopClass = "desktop";
    
    // Collections to store elements that need responsive behavior
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveInputElements = new();
    
    // Element identification constants for optimized performance
    private const string TextElementSuffix = "Text";
    private const string ButtonElementSuffix = "Button";
    private const string InputElementSuffix = "Input";
    private const string AlertCardClass = "alert-card";

    // Cache for performance optimization
    private string _lastSizeClass = "";

    public AlertsView()
    {
        InitializeComponent();
        // DataContext is supplied by DataTemplates when navigated via AdminShellViewModel
        
        // Store references to elements that need responsive behavior
        InitializeResponsiveElements();
        
        // Set up size change handler
        this.SizeChanged += OnSizeChanged;
    }

    private void InitializeResponsiveElements()
    {
        // Use reflection to automatically discover elements by naming convention
        var fields = this.GetType().GetFields(System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
        foreach (var field in fields)
        {
            var value = field.GetValue(this) as Control;
            if (value == null || string.IsNullOrEmpty(field.Name))
                continue;

            if (field.Name.EndsWith(TextElementSuffix))
                _responsiveTextElements.Add(value);
            else if (field.Name.EndsWith(ButtonElementSuffix))
                _responsiveButtonElements.Add(value);
            else if (field.Name.EndsWith(InputElementSuffix))
                _responsiveInputElements.Add(value);
            else if (field.Name.EndsWith("Card"))
                _responsiveCardElements.Add(value);
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
        
        // Performance optimization: Skip update if size class hasn't changed
        if (sizeClass == _lastSizeClass)
            return;
            
        _lastSizeClass = sizeClass;
        
        // Update all responsive elements
        UpdateMainContainerClasses(sizeClass);
        UpdateElementClasses(_responsiveTextElements, sizeClass);
        UpdateElementClasses(_responsiveCardElements, sizeClass);
        UpdateElementClasses(_responsiveButtonElements, sizeClass);
        UpdateElementClasses(_responsiveInputElements, sizeClass);
        
        // Update layout-specific elements based on screen size
        ApplyLayoutStrategy(sizeClass, width);
        
        // Update alert card elements dynamically
        UpdateAlertCardElements(sizeClass);
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

    private void UpdateMainContainerClasses(string sizeClass)
    {
        // Clear existing responsive classes using constants
        MainGrid.Classes.Remove("main-content");
        MainGrid.Classes.Remove("main-content-tablet");
        MainGrid.Classes.Remove("main-content-mobile");
        
        // Add appropriate class
        switch (sizeClass)
        {
            case MobileClass:
                MainGrid.Classes.Add("main-content-mobile");
                break;
            case TabletClass:
                MainGrid.Classes.Add("main-content-tablet");
                break;
            default:
                MainGrid.Classes.Add("main-content");
                break;
        }
    }

    private void UpdateElementClasses(List<Control> elements, string sizeClass)
    {
        foreach (var element in elements)
        {
            // Remove existing responsive classes using constants
            element.Classes.Remove(MobileClass);
            element.Classes.Remove(TabletClass);
            
            // Add appropriate responsive class
            if (sizeClass != DesktopClass)
            {
                element.Classes.Add(sizeClass);
            }
        }
    }

    private void ApplyLayoutStrategy(string sizeClass, double width)
    {
        // Create a layout configuration based on the screen size
        var layoutConfig = CreateLayoutConfig(sizeClass);
        
        // Apply the layout configuration
        ApplyMainGridLayout(layoutConfig);
        ApplyHeaderLayout(layoutConfig);
    }

    private LayoutConfiguration CreateLayoutConfig(string sizeClass)
    {
        return sizeClass switch
        {
            MobileClass => new LayoutConfiguration
            {
                MainGridColumns = 1,
                MainGridRows = 3,
                CreateCardPosition = (0, 1),
                AlertsCardPosition = (0, 2),
                HeaderPadding = new Thickness(12),
                CardMargin = new Thickness(12),
                CardSpacing = 12,
                HeaderButtonsOrientation = Orientation.Vertical,
                HeaderButtonsSpacing = 8
            },
            
            TabletClass => new LayoutConfiguration
            {
                MainGridColumns = 1,
                MainGridRows = 3,
                CreateCardPosition = (0, 1),
                AlertsCardPosition = (0, 2),
                HeaderPadding = new Thickness(16),
                CardMargin = new Thickness(16),
                CardSpacing = 16,
                HeaderButtonsOrientation = Orientation.Horizontal,
                HeaderButtonsSpacing = 8
            },
            
            _ => new LayoutConfiguration // Desktop
            {
                MainGridColumns = 2,
                MainGridRows = 2,
                CreateCardPosition = (0, 1),
                AlertsCardPosition = (1, 1),
                HeaderPadding = new Thickness(20, 16, 20, 16),
                CardMargin = new Thickness(20, 20, 12, 20),
                CardSpacing = 20,
                HeaderButtonsOrientation = Orientation.Horizontal,
                HeaderButtonsSpacing = 8
            }
        };
    }

    private void ApplyMainGridLayout(LayoutConfiguration config)
    {
        MainGrid.ColumnDefinitions.Clear();
        MainGrid.RowDefinitions.Clear();
        
        // Add row definitions
        MainGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto)); // Header
        
        for (int i = 1; i < config.MainGridRows; i++)
        {
            MainGrid.RowDefinitions.Add(new RowDefinition(GridLength.Star));
        }
        
        // Add column definitions
        for (int i = 0; i < config.MainGridColumns; i++)
        {
            if (config.MainGridColumns == 1)
            {
                MainGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            }
            else
            {
                MainGrid.ColumnDefinitions.Add(new ColumnDefinition(i == 0 ? new GridLength(400) : GridLength.Star));
            }
        }
        
        // Position cards
        Grid.SetColumn(CreateAlertCard, config.CreateCardPosition.Column);
        Grid.SetRow(CreateAlertCard, config.CreateCardPosition.Row);
        
        Grid.SetColumn(ActiveAlertsCard, config.AlertsCardPosition.Column);
        Grid.SetRow(ActiveAlertsCard, config.AlertsCardPosition.Row);
        
        // Update margins
        HeaderCard.Padding = config.HeaderPadding;
        CreateAlertCard.Margin = config.CardMargin;
        
        if (config.MainGridColumns == 1)
        {
            ActiveAlertsCard.Margin = config.CardMargin;
        }
        else
        {
            ActiveAlertsCard.Margin = new Thickness(12, 20, 20, 20);
        }
    }

    private void ApplyHeaderLayout(LayoutConfiguration config)
    {
        HeaderButtonsStack.Orientation = config.HeaderButtonsOrientation;
        HeaderButtonsStack.Spacing = config.HeaderButtonsSpacing;
        
        if (config.HeaderButtonsOrientation == Orientation.Vertical)
        {
            HeaderButtonsStack.HorizontalAlignment = HorizontalAlignment.Stretch;
        }
        else
        {
            HeaderButtonsStack.HorizontalAlignment = HorizontalAlignment.Right;
        }
    }

    private void UpdateAlertCardElements(string sizeClass)
    {
        // Optimized: Only update if there are actual alert cards rendered
        if (ActiveAlertsCard?.IsVisible == true)
        {
            UpdateAlertCardsRecursively(ActiveAlertsCard, sizeClass);
        }
    }

    private void UpdateAlertCardsRecursively(Control control, string sizeClass)
    {
        // Improved pattern matching with null safety and performance optimization
        // Fast path for alert cards
        if (control is Border alertCard && alertCard.Classes.Contains(AlertCardClass))
        {
            UpdateElementResponsiveClasses(alertCard, sizeClass);
        }
        // Optimized text block check using direct string comparison
        else if (control is TextBlock textBlock && textBlock.Name != null && textBlock.Name.EndsWith(TextElementSuffix))
        {
            UpdateElementResponsiveClasses(textBlock, sizeClass);
        }
        // Optimized button check using direct string comparison
        else if (control is Button button && button.Name != null && button.Name.EndsWith(ButtonElementSuffix))
        {
            UpdateElementResponsiveClasses(button, sizeClass);
        }
        // Check for input elements
        else if (control.Name != null && control.Name.EndsWith(InputElementSuffix))
        {
            UpdateElementResponsiveClasses(control, sizeClass);
        }

        // Recursively update children with type-specific handling
        if (control is Panel panel)
        {
            foreach (Control child in panel.Children)
            {
                UpdateAlertCardsRecursively(child, sizeClass);
            }
        }
        else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
        {
            UpdateAlertCardsRecursively(contentChild, sizeClass);
        }
        // Note: ItemsControl children are handled through the template
    }
    
    private void UpdateElementResponsiveClasses(Control element, string sizeClass)
    {
        // Remove existing responsive classes using constants
        element.Classes.Remove(MobileClass);
        element.Classes.Remove(TabletClass);
        
        // Add appropriate responsive class
        if (sizeClass != DesktopClass)
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
        public int MainGridColumns { get; set; }
        public int MainGridRows { get; set; }
        public (int Column, int Row) CreateCardPosition { get; set; }
        public (int Column, int Row) AlertsCardPosition { get; set; }
        public Thickness HeaderPadding { get; set; }
        public Thickness CardMargin { get; set; }
        public double CardSpacing { get; set; }
        public Orientation HeaderButtonsOrientation { get; set; }
        public double HeaderButtonsSpacing { get; set; }
    }
}