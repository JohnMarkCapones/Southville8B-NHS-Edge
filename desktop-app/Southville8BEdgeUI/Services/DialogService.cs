using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Media;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public sealed class DialogService : IDialogService
{
    private static IBrush GetBrush(StyledElement scope, string key, string fallbackHex)
    {
        if (scope.TryFindResource(key, out var val) && val is IBrush b)
            return b;
        return new SolidColorBrush(Color.Parse(fallbackHex));
    }

    public Task<bool> ConfirmDeleteAsync(string title, string message)
    {
        var tcs = new TaskCompletionSource<bool>();
        var dlg = new Window
        {
            CanResize = false,
            SystemDecorations = SystemDecorations.BorderOnly,
            SizeToContent = SizeToContent.WidthAndHeight,
            MinWidth = 360,
            MaxWidth = 560
        };

        var surfaceBrush = GetBrush(dlg, "SurfaceBrush", "#FFFFFF");
        var borderBrush = GetBrush(dlg, "AppBorderBrush", "#E5E7EB");
        var textPrimary = GetBrush(dlg, "TextPrimaryBrush", "#111827");
        var textSecondary = GetBrush(dlg, "TextSecondaryBrush", "#6B7280");
        var dangerBrush = GetBrush(dlg, "DangerBrush", "#EF4444");

        var confirmBtn = new Button
        {
            Content = "Delete",
            MinWidth = 92,
            Padding = new Thickness(12, 8),
            Background = dangerBrush,
            Foreground = Brushes.White,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            IsDefault = true,
            Margin = new Thickness(8, 0, 0, 0)
        };

        var cancelBtn = new Button
        {
            Content = "Cancel",
            MinWidth = 92,
            Padding = new Thickness(12, 8),
            Background = Brushes.Transparent,
            Foreground = textPrimary,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(8),
            IsCancel = true
        };

        var iconCircle = new Border
        {
            Width = 28,
            Height = 28,
            CornerRadius = new CornerRadius(14),
            Background = dangerBrush,
            Child = new TextBlock
            {
                Text = "!",
                Foreground = Brushes.White,
                FontWeight = FontWeight.Bold,
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center,
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
            }
        };

        var titleText = new TextBlock
        {
            Text = title,
            Foreground = textPrimary,
            FontSize = 16,
            FontWeight = FontWeight.SemiBold,
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
        };

        var header = new StackPanel
        {
            Orientation = Avalonia.Layout.Orientation.Horizontal,
            Spacing = 12,
            Children = { iconCircle, titleText }
        };

        var body = new TextBlock
        {
            Text = message,
            Foreground = textSecondary,
            TextWrapping = TextWrapping.Wrap
        };

        var buttons = new StackPanel
        {
            Orientation = Avalonia.Layout.Orientation.Horizontal,
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
            Children = { cancelBtn, confirmBtn }
        };

        dlg.Content = new Border
        {
            Background = surfaceBrush,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(12),
            BoxShadow = new BoxShadows(new BoxShadow { Blur = 12, Spread = 0, OffsetX = 0, OffsetY = 4, Color = Color.Parse("#20000000") }),
            Padding = new Thickness(16),
            Child = new StackPanel
            {
                Spacing = 12,
                Children = { header, body, buttons }
            }
        };

        cancelBtn.Click += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(false); dlg.Close(); };
        confirmBtn.Click += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(true); dlg.Close(); };
        dlg.Closed += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(false); };

        var owner = (Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime)?.MainWindow;
        dlg.WindowStartupLocation = owner is not null ? WindowStartupLocation.CenterOwner : WindowStartupLocation.CenterScreen;

        if (owner is not null)
            _ = dlg.ShowDialog(owner);
        else
            dlg.Show();

        return tcs.Task;
    }
}
