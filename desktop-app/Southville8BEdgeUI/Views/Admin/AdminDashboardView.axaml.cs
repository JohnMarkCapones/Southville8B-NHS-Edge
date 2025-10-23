using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;
using System.Linq;

namespace Southville8BEdgeUI.Views.Admin;

public partial class AdminDashboardView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;

    // Collections to store elements that need responsive behavior
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveProgressBars = new();
    private readonly List<Control> _responsiveIcons = new();

    public AdminDashboardView()
    {
        InitializeComponent();

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
            SystemStatusText,
            TotalStudentsValue,
            StudentsSubtext,
            ActiveTeachersValue,
            TeachersSubtext,
            TotalSectionsValue,
            SectionsSubtext,
            RoomUtilizationValue,
            SystemUptimeValue,
            UptimeSubtext,
            MonthlyRevenueValue,
            OperatingCostsValue,
            NetRevenueValue,
            BudgetUtilizationText,
            AvailableRoomsText,
            OccupiedRoomsText,
            MaintenanceRoomsText,
            OverallUtilizationText
        });

        // Add card elements
        _responsiveCardElements.AddRange(new Control[]
        {
            KpiCard1, KpiCard2, KpiCard3, KpiCard4, KpiCard5
        });

        // Add button elements
        _responsiveButtonElements.AddRange(new Control[]
        {
            RefreshButton,
            ReportsButton,
            ViewAllAlertsButton,
            RoomsButton,
            EventsButton,
            UsersButton,
            ChatButton,
            LibraryButton,
            ReportsActionButton,
            ViewAllEventsButton
        });

        // Add progress bar elements
        _responsiveProgressBars.AddRange(new Control[]
        {
            RoomProgressBar,
            BudgetProgressBar,
            OverallProgressBar
        });

        // Add icon elements
        _responsiveIcons.AddRange(new Control[]
        {
            StudentsIcon,
            TeachersIcon,
            SectionsIcon,
            RoomIcon,
            UptimeIcon
        });
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
        UpdateElementClasses(_responsiveProgressBars, sizeClass);
        UpdateElementClasses(_responsiveIcons, sizeClass);

        // Update layout-specific elements
        UpdateLayoutClasses(sizeClass, width);
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

    private void UpdateLayoutClasses(string sizeClass, double width)
    {
        // Update grid layouts based on screen size
        switch (sizeClass)
        {
            case "mobile":
                // Stack KPI cards vertically on mobile
                SetupMobileKpiGrid();
                // Stack two-column grids vertically
                StackTwoColumnGrids();
                break;

            case "tablet":
                // 2x3 grid for tablets
                SetupTabletKpiGrid();
                RestoreTwoColumnGrids();
                break;

            default:
                // 5-column grid for desktop
                SetupDesktopKpiGrid();
                RestoreTwoColumnGrids();
                break;
        }
    }

    private void SetupMobileKpiGrid()
    {
        KpiGrid.ColumnDefinitions.Clear();
        KpiGrid.RowDefinitions.Clear();

        KpiGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (int i = 0; i < 5; i++)
        {
            KpiGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }

        Grid.SetColumn(KpiCard1, 0); Grid.SetRow(KpiCard1, 0);
        Grid.SetColumn(KpiCard2, 0); Grid.SetRow(KpiCard2, 1);
        Grid.SetColumn(KpiCard3, 0); Grid.SetRow(KpiCard3, 2);
        Grid.SetColumn(KpiCard4, 0); Grid.SetRow(KpiCard4, 3);
        Grid.SetColumn(KpiCard5, 0); Grid.SetRow(KpiCard5, 4);
    }

    private void SetupTabletKpiGrid()
    {
        KpiGrid.ColumnDefinitions.Clear();
        KpiGrid.RowDefinitions.Clear();

        KpiGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        KpiGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        KpiGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        KpiGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        KpiGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(KpiCard1, 0); Grid.SetRow(KpiCard1, 0);
        Grid.SetColumn(KpiCard2, 1); Grid.SetRow(KpiCard2, 0);
        Grid.SetColumn(KpiCard3, 2); Grid.SetRow(KpiCard3, 0);
        Grid.SetColumn(KpiCard4, 0); Grid.SetRow(KpiCard4, 1);
        Grid.SetColumn(KpiCard5, 1); Grid.SetRow(KpiCard5, 1);
    }

    private void SetupDesktopKpiGrid()
    {
        KpiGrid.ColumnDefinitions.Clear();
        KpiGrid.RowDefinitions.Clear();

        for (int i = 0; i < 5; i++)
        {
            KpiGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        }
        KpiGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(KpiCard1, 0); Grid.SetRow(KpiCard1, 0);
        Grid.SetColumn(KpiCard2, 1); Grid.SetRow(KpiCard2, 0);
        Grid.SetColumn(KpiCard3, 2); Grid.SetRow(KpiCard3, 0);
        Grid.SetColumn(KpiCard4, 3); Grid.SetRow(KpiCard4, 0);
        Grid.SetColumn(KpiCard5, 4); Grid.SetRow(KpiCard5, 0);
    }

    private void StackTwoColumnGrids()
    {
        // Convert two-column grids to single column for mobile
        ConvertToSingleColumn(TwoColumnGrid1);
        ConvertToSingleColumn(TwoColumnGrid2);
        ConvertToSingleColumn(TwoColumnGrid3);
        ConvertToSingleColumn(TwoColumnGrid4);
    }

    private void ConvertToSingleColumn(Grid grid)
    {
        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        // Update grid positions for mobile stacking - Fix the ToList() issue
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

    private void RestoreTwoColumnGrids()
    {
        // Restore two-column layout for tablet and desktop
        RestoreTwoColumnGrid(TwoColumnGrid1, "2*", "*");
        RestoreTwoColumnGrid(TwoColumnGrid2, "*", "*");
        RestoreTwoColumnGrid(TwoColumnGrid3, "*", "*");
        RestoreTwoColumnGrid(TwoColumnGrid4, "2*", "*");
    }

    private void RestoreTwoColumnGrid(Grid grid, string col1, string col2)
    {
        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Parse(col1)));
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Parse(col2)));

        // Clear row definitions for two-column layout
        grid.RowDefinitions.Clear();
        grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        // Restore original grid positions - Fix the ToList() issue
        var children = grid.Children.Cast<Control>().ToList();
        for (int i = 0; i < children.Count; i++)
        {
            Grid.SetColumn(children[i], i % 2);
            Grid.SetRow(children[i], 0);
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
}