using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.Styling;
using Avalonia.VisualTree;
using System.Linq;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class ProfileView : UserControl
{
    public ProfileView()
    {
        InitializeComponent();
        this.AttachedToVisualTree += (_, __) => ApplyResponsiveClasses(this.Bounds.Width);
        this.SizeChanged += OnSizeChanged;
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    private const double TabletBreakpoint = 900;
    private const double MobileBreakpoint = 640;

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        ApplyResponsiveClasses(e.NewSize.Width);
    }

    private void ApplyResponsiveClasses(double width)
    {
        var isMobile = width <= MobileBreakpoint;
        var isTablet = width > MobileBreakpoint && width <= TabletBreakpoint;

        foreach (var v in this.GetVisualDescendants().OfType<StyledElement>())
        {
            v.Classes.Remove("mobile");
            v.Classes.Remove("tablet");
            if (isMobile)
            {
                v.Classes.Add("mobile");
            }
            else if (isTablet)
            {
                v.Classes.Add("tablet");
            }
        }
    }
}
