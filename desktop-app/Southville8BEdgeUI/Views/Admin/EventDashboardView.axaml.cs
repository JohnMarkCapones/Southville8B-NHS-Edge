using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.VisualTree;
using Southville8BEdgeUI.Utils;
using Southville8BEdgeUI.ViewModels.Admin;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Views.Admin;

public partial class EventDashboardView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;
    
    // Collections to store elements that need responsive behavior
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveInputElements = new();

    public EventDashboardView()
    {
        InitializeComponent();
        DataContext = new EventDashboardViewModel();

        // Store references to elements that need responsive behavior
        InitializeResponsiveElements();

        // Set up size change handler
        this.SizeChanged += OnSizeChanged;
    }

    // Confirmation + toast on delete via services from AdminShellView
    private async void OnDeleteClicked(object? sender, RoutedEventArgs e)
    {
        if (sender is not Button btn) return;
        var eventItem = btn.DataContext as EventViewModel;
        if (eventItem is null) return;

        var shell = this.GetVisualAncestors().OfType<AdminShellView>().FirstOrDefault();
        if (shell is null) return;

        var confirmed = await shell.Dialogs.ConfirmDeleteAsync(
            $"Delete \"{eventItem.Title}\"?",
            "This action cannot be undone. Do you want to continue?");

        if (!confirmed) return;

        if (DataContext is EventDashboardViewModel vm && vm.DeleteEventCommand.CanExecute(eventItem))
        {
            vm.DeleteEventCommand.Execute(eventItem);
        }

        shell.Toasts.Success($"\"{eventItem.Title}\" was deleted.", title: "Event deleted");
    }

    private void InitializeResponsiveElements()
    {
        _responsiveTextElements.AddRange(new Control[]
        {
            MainHeaderText,
            SubtitleText,
            TotalEventsValue,
            ThisWeekEventsValue,
            UpcomingEventsValue,
            PastEventsValue,
            EmptyTitleText,
            EmptySubtitleText
        });

        _responsiveCardElements.AddRange(new Control[]
        {
            StatsCard1, StatsCard2, StatsCard3, StatsCard4, FilterCard, EmptyStateCard
    });

        _responsiveButtonElements.AddRange(new Control[]
        {
            FilterButton,
            CreateButton
        });

        _responsiveInputElements.AddRange(new Control[]
        {
            SearchInput,
            StatusFilter,
            TypeFilter,
            LocationFilter
        });
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateResponsiveClasses(e.NewSize.Width);
    }

    private void UpdateResponsiveClasses(double width)
    {
        string sizeClass = GetSizeClass(width);

        UpdateMainContainerClasses(sizeClass);
        UpdateElementClasses(_responsiveTextElements, sizeClass);
        UpdateElementClasses(_responsiveCardElements, sizeClass);
        UpdateElementClasses(_responsiveButtonElements, sizeClass);
        UpdateElementClasses(_responsiveInputElements, sizeClass);

        UpdateLayoutClasses(sizeClass, width);
        UpdateEventCardElements(sizeClass);
    }

    private string GetSizeClass(double width)
    {
        if (width < MobileBreakpoint) return "mobile";
        else if (width < TabletBreakpoint) return "tablet";
        else return "desktop";
    }

    private void UpdateMainContainerClasses(string sizeClass)
    {
        // Only manipulate the Classes collection; do not assign to it.
        MainStackPanel.Classes.Remove("main-content");
        MainStackPanel.Classes.Remove("main-content-tablet");
        MainStackPanel.Classes.Remove("main-content-mobile");

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
            // Do not assign to element.Classes; only Add/Remove.
            element.Classes.Remove("mobile");
            element.Classes.Remove("tablet");

            if (sizeClass != "desktop")
                element.Classes.Add(sizeClass);
        }
    }

    private void UpdateLayoutClasses(string sizeClass, double width)
    {
        switch (sizeClass)
        {
            case "mobile":
                SetupMobileStatsGrid();
                SetupMobileFilterGrid();
                SetupMobileHeaderLayout();
                break;

            case "tablet":
                SetupTabletStatsGrid();
                SetupTabletFilterGrid();
                SetupTabletHeaderLayout();
                break;

            default:
                SetupDesktopStatsGrid();
                SetupDesktopFilterGrid();
                SetupDesktopHeaderLayout();
                break;
        }
    }

    private void UpdateEventCardElements(string sizeClass)
    {
        var itemsControl = EventsGrid;
        if (itemsControl != null)
        {
            UpdateEventCardsRecursively(itemsControl, sizeClass);
        }
    }

    private void UpdateEventCardsRecursively(Control control, string sizeClass)
    {
        if (control.Name == "EventCard" && control is Border eventCard)
        {
            eventCard.Classes.Remove("mobile");
            eventCard.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                eventCard.Classes.Add(sizeClass);
        }

        if (control.Name?.EndsWith("Text") == true && control is TextBlock textBlock)
        {
            textBlock.Classes.Remove("mobile");
            textBlock.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                textBlock.Classes.Add(sizeClass);
        }

        if (control.Name?.EndsWith("Button") == true && control is Button button)
        {
            button.Classes.Remove("mobile");
            button.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                button.Classes.Add(sizeClass);
        }

        if (control.Name == "StatusIndicator" && control is Border border)
        {
            border.Classes.Remove("mobile");
            border.Classes.Remove("tablet");
            if (sizeClass != "desktop")
                border.Classes.Add(sizeClass);
        }

        if (control is Panel panel)
        {
            foreach (Control child in panel.Children)
                UpdateEventCardsRecursively(child, sizeClass);
        }
        else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
        {
            UpdateEventCardsRecursively(contentChild, sizeClass);
        }
        // ItemsControl children are created by template; handled via recursion on visual tree above.
    }

    private void SetupMobileHeaderLayout()
    {
        HeaderGrid.ColumnDefinitions.Clear();
        HeaderGrid.RowDefinitions.Clear();

        HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(HeaderButtons, 0);
        Grid.SetRow(HeaderButtons, 1);
        Grid.SetColumnSpan(HeaderButtons, 1);

        HeaderButtons.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch;
        HeaderButtons.Margin = new Thickness(0, 12, 0, 0);
    }

    private void SetupTabletHeaderLayout() => SetupDesktopHeaderLayout();

    private void SetupDesktopHeaderLayout()
    {
        HeaderGrid.ColumnDefinitions.Clear();
        HeaderGrid.RowDefinitions.Clear();

        HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        HeaderGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        HeaderGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(HeaderButtons, 1);
        Grid.SetRow(HeaderButtons, 0);
        Grid.SetColumnSpan(HeaderButtons, 1);

        HeaderButtons.HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right;
        HeaderButtons.Margin = new Thickness(0);
    }

    private void SetupMobileStatsGrid()
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();

        StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (int i = 0; i < 4; i++)
            StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(StatsCard1, 0); Grid.SetRow(StatsCard1, 0);
        Grid.SetColumn(StatsCard2, 0); Grid.SetRow(StatsCard2, 1);
        Grid.SetColumn(StatsCard3, 0); Grid.SetRow(StatsCard3, 2);
        Grid.SetColumn(StatsCard4, 0); Grid.SetRow(StatsCard4, 3);

        StatsCard1.Margin = new Thickness(0, 0, 0, 8);
        StatsCard2.Margin = new Thickness(0, 8, 0, 8);
        StatsCard3.Margin = new Thickness(0, 8, 0, 8);
        StatsCard4.Margin = new Thickness(0, 8, 0, 0);
    }

    private void SetupTabletStatsGrid()
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();

        StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(StatsCard1, 0); Grid.SetRow(StatsCard1, 0);
        Grid.SetColumn(StatsCard2, 1); Grid.SetRow(StatsCard2, 0);
        Grid.SetColumn(StatsCard3, 0); Grid.SetRow(StatsCard3, 1);
        Grid.SetColumn(StatsCard4, 1); Grid.SetRow(StatsCard4, 1);

        StatsCard1.Margin = new Thickness(0, 0, 8, 8);
        StatsCard2.Margin = new Thickness(8, 0, 0, 8);
        StatsCard3.Margin = new Thickness(0, 8, 8, 0);
        StatsCard4.Margin = new Thickness(8, 8, 0, 0);
    }

    private void SetupDesktopStatsGrid()
    {
        StatsGrid.ColumnDefinitions.Clear();
        StatsGrid.RowDefinitions.Clear();

        for (int i = 0; i < 4; i++)
            StatsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        StatsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(StatsCard1, 0); Grid.SetRow(StatsCard1, 0);
        Grid.SetColumn(StatsCard2, 1); Grid.SetRow(StatsCard2, 0);
        Grid.SetColumn(StatsCard3, 2); Grid.SetRow(StatsCard3, 0);
        Grid.SetColumn(StatsCard4, 3); Grid.SetRow(StatsCard4, 0);

        StatsCard1.Margin = new Thickness(0, 0, 12, 0);
        StatsCard2.Margin = new Thickness(12, 0);
        StatsCard3.Margin = new Thickness(12, 0);
        StatsCard4.Margin = new Thickness(12, 0, 0, 0);
    }

    private void SetupMobileFilterGrid()
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();

        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (int i = 0; i < 5; i++)
            FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(SearchInput, 0); Grid.SetRow(SearchInput, 0);
        Grid.SetColumn(StatusFilter, 0); Grid.SetRow(StatusFilter, 2);
        Grid.SetColumn(TypeFilter, 0); Grid.SetRow(TypeFilter, 3);
        Grid.SetColumn(LocationFilter, 0); Grid.SetRow(LocationFilter, 4);

        if (FilterGrid.Children.OfType<Border>().FirstOrDefault() is Border separator)
        {
            Grid.SetColumn(separator, 0);
            Grid.SetRow(separator, 1);
            separator.IsVisible = false;
        }

        SearchInput.Margin = new Thickness(0, 0, 0, 8);
        StatusFilter.Margin = new Thickness(0, 8, 0, 8);
        TypeFilter.Margin = new Thickness(0, 8, 0, 8);
        LocationFilter.Margin = new Thickness(0, 8, 0, 0);
    }

    private void SetupTabletFilterGrid()
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();

        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(SearchInput, 0); Grid.SetRow(SearchInput, 0); Grid.SetColumnSpan(SearchInput, 3);
        Grid.SetColumn(StatusFilter, 0); Grid.SetRow(StatusFilter, 1);
        Grid.SetColumn(TypeFilter, 1); Grid.SetRow(TypeFilter, 1);
        Grid.SetColumn(LocationFilter, 2); Grid.SetRow(LocationFilter, 1);

        if (FilterGrid.Children.OfType<Border>().FirstOrDefault() is Border separator)
            separator.IsVisible = false;

        SearchInput.Margin = new Thickness(0, 0, 0, 8);
        StatusFilter.Margin = new Thickness(0, 8, 8, 0);
        TypeFilter.Margin = new Thickness(8, 8);
        LocationFilter.Margin = new Thickness(8, 8, 0, 0);
    }

    private void SetupDesktopFilterGrid()
    {
        FilterGrid.ColumnDefinitions.Clear();
        FilterGrid.RowDefinitions.Clear();

        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
        FilterGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));

        FilterGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));

        Grid.SetColumn(SearchInput, 0); Grid.SetRow(SearchInput, 0);
        Grid.SetColumn(StatusFilter, 2); Grid.SetRow(StatusFilter, 0);
        Grid.SetColumn(TypeFilter, 3); Grid.SetRow(TypeFilter, 0);
        Grid.SetColumn(LocationFilter, 4); Grid.SetRow(LocationFilter, 0);

        if (FilterGrid.Children.OfType<Border>().FirstOrDefault() is Border separator)
        {
            Grid.SetColumn(separator, 1);
            Grid.SetRow(separator, 0);
            separator.IsVisible = true;
        }

        SearchInput.Margin = new Thickness(0);
        StatusFilter.Margin = new Thickness(12, 0);
        TypeFilter.Margin = new Thickness(12, 0);
        LocationFilter.Margin = new Thickness(12, 0);
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);

        if (Bounds.Width > 0)
        {
            UpdateResponsiveClasses(Bounds.Width);
        }
    }
}